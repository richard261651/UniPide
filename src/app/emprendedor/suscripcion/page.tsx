'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BusinessItem } from '@/types';
import { formatPrice, formatShortDate } from '@/lib/utils';
import {
  CreditCard,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  Smartphone,
  ArrowRight,
  Loader2,
  Check,
  AlertTriangle,
  FileText,
  Zap,
  RefreshCw,
  Mail,
  Receipt,
} from 'lucide-react';
import PolicySignatureModal from '@/components/PolicySignatureModal';

const BANCOS_COLOMBIA = [
  'Bancolombia (con Nequi)',
  'Daviplata / Davivienda',
  'Banco de Bogotá',
  'BBVA Colombia',
  'Banco Itaú',
  'Scotiabank Colpatria',
  'Banco AV Villas',
  'Banco Popular',
  'Banco Caja Social',
  'Lulo Bank',
  'Nu Colombia',
];

export default function EmprendedorSuscripcionPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [tipoSuscripcion, setTipoSuscripcion] = useState<'PREPAGADO' | 'DEBITO_AUTOMATICO'>('PREPAGADO');
  const [metodoPago, setMetodoPago] = useState<'PSE' | 'NEQUI' | 'DAVIPLATA' | 'TARJETA'>('PSE');
  const [bancoSeleccionado, setBancoSeleccionado] = useState('Bancolombia (con Nequi)');
  const [celularInput, setCelularInput] = useState(user?.telefono || '');
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [signingPolicy, setSigningPolicy] = useState(false);

  useEffect(() => {
    async function loadBusinessData() {
      try {
        setLoading(true);
        if (!user?.businessSlug) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/businesses/slug/${user.businessSlug}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness(data.business);
          if (data.business?.tipoSuscripcion) {
            setTipoSuscripcion(data.business.tipoSuscripcion as any);
          }
        }
      } catch (err) {
        console.error('Error cargando negocio para suscripción:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBusinessData();
  }, [user]);

  const handleSignPolicy = async (data: { nombreFirmante: string; documentoFirmante: string }) => {
    if (!business) return;

    try {
      setSigningPolicy(true);
      setError('');

      const res = await fetch(`/api/businesses/${business.id}/policy-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Error al guardar firma digital');
      }

      setPolicyModalOpen(false);
      setBusiness(resData.business);
    } catch (err: any) {
      setError(err.message || 'Error registrando firma digital');
    } finally {
      setSigningPolicy(false);
    }
  };

  const handleWompiCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    if (!business.firmaPoliticaHigiene) {
      setPolicyModalOpen(true);
      return;
    }

    try {
      setPaying(true);
      setError('');

      // Invocar endpoint de verificación de pago Wompi y facturación digital
      const res = await fetch('/api/subscriptions/wompi-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          reference: `WMP-UNI-${Date.now().toString().slice(-6)}`,
          transactionId: `SIM-WMP-${Date.now()}`,
          tipoSuscripcion,
          metodoPago,
          banco: metodoPago === 'PSE' ? bancoSeleccionado : metodoPago,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error procesando verificación de Wompi');
      }

      setPaymentSuccess(data);

      // Recargar datos de negocio
      const bizRes = await fetch(`/api/businesses/slug/${user?.businessSlug}`);
      if (bizRes.ok) {
        const bizData = await bizRes.json();
        setBusiness(bizData.business);
      }
    } catch (err: any) {
      setError(err.message || 'Error conectando con Wompi Colombia');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-64 bg-white rounded-3xl animate-pulse border border-slate-200" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-base">Sin Emprendimiento Registrado</h3>
        <p className="text-xs text-slate-500">
          Debes tener un emprendimiento registrado en UniPide para gestionar tu suscripción.
        </p>
      </div>
    );
  }

  const esFundador = business.esFundador;
  const montoMes = esFundador ? 19900 : 29900;
  const fechaFinPromo = business.fechaFinPromocion ? new Date(business.fechaFinPromocion) : null;

  // Calcular días restantes de suscripción
  let diasRestantes: number | null = null;
  if (fechaFinPromo) {
    const diffMs = fechaFinPromo.getTime() - new Date().getTime();
    diasRestantes = Math.ceil(diffMs / (1000 * 3600 * 24));
  }

  const estaPorCaducar = diasRestantes !== null && diasRestantes <= 7 && diasRestantes >= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEEBE7] border border-[#FBC6BB] text-[#D85A30] text-xs font-extrabold rounded-full mb-2">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pasarela Wompi Colombia & Facturación</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Gestión de Suscripción Wompi
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Selecciona tu modalidad de cobro (Prepagado o Débito Automático), verifica tu pago con Wompi y recibe tu factura digital.
        </p>
      </div>

      {/* Alerta si la Suscripción está por Caducar */}
      {estaPorCaducar && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-3xl space-y-2 animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2 font-black text-sm text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>⚠️ Notificación de Vencimiento: ¡Tu suscripción caduca en {diasRestantes} días!</span>
          </div>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Tu tarifa promocional finaliza el <strong>{fechaFinPromo ? formatShortDate(fechaFinPromo) : ''}</strong>. Renueva ahora por PSE o Wompi para mantener tu posición de <strong>Fundador UniPide ⭐</strong> de primero en tu categoría.
          </p>
        </div>
      )}

      {/* Banner de Estado de Aprobación Admin si se Verificó el Pago pero Falta Aprobación Admin */}
      {business.pagoVerificado && business.estadoAprobacion === 'PENDIENTE' && (
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl border border-emerald-500/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>1. Pago Verificado por Wompi Colombia (Ref: {business.wompiReference || 'WMP-OK'})</span>
            </div>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Pendiente Aprobación Final Admin
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            ✅ Tu pago de suscripción de <strong>{formatPrice(montoMes)} COP</strong> ha sido procesado exitosamente y la Factura Digital ha sido enviada a tu correo. El Administrador ha sido notificado para dar la autorización final de publicación de tu tienda.
          </p>
        </div>
      )}

      {/* Tarjeta Resumen del Plan Actual */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D85A30]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {esFundador ? 'Plan Fundador UniPide ⭐' : 'Plan Emprendedor UniPide'}
              </h2>
              {esFundador && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Insignia Activa
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Negocio: <strong className="text-slate-200">{business.nombre}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-medium">Tarifa Mensual Actual</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#F56649]">{formatPrice(montoMes)}</span>
              <span className="text-xs text-slate-300">/mes</span>
            </div>
          </div>
        </div>

        {/* Detalles del Plan */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-medium block">Estado de Suscripción</span>
            <span className="font-extrabold text-emerald-400 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{business.suscripcionEstado || 'ACTIVA'}</span>
            </span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-medium block">Promoción Lanzamiento</span>
            <span className="font-bold text-white text-xs block">
              {esFundador
                ? `$19.900/mes hasta ${fechaFinPromo ? formatShortDate(fechaFinPromo) : '3 meses'}`
                : 'Tarifa Estándar $29.900'}
            </span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 font-medium block">Modalidad Actual</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{business.tipoSuscripcion === 'DEBITO_AUTOMATICO' ? 'Débito Automático' : 'Prepagado Manual'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Formulario de Pago con Pasarela Wompi Colombia */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D85A30]" />
            <span>Verificar Pago con Wompi Colombia (Bancolombia)</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pasarela oficial certificada para PSE, Nequi, Daviplata y Tarjetas de Crédito.
          </p>
        </div>

        {/* Estado de Firma de la Política Legal POL-EMP-001 */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border-2 border-[#D85A30]/30 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D85A30]" />
              <span className="font-extrabold text-[#1F222E] text-xs sm:text-sm">
                Política de Calidad e Higiene (POL-EMP-001 v1.0)
              </span>
            </div>

            {business.firmaPoliticaHigiene ? (
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Firmado Legalmente</span>
              </span>
            ) : (
              <span className="text-xs font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pendiente de Firma Obligatoria</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {business.firmaPoliticaHigiene
              ? `Firmado digitalmente por ${business.nombreFirmante} (${business.documentoFirmante}) el ${business.fechaFirmaPolitica ? formatShortDate(business.fechaFirmaPolitica) : 'Registro'}.`
              : 'Para procesar tu pago de suscripción y activar tu emprendimiento es obligatorio firmar digitalmente la Política POL-EMP-001.'}
          </p>

          {!business.firmaPoliticaHigiene && (
            <button
              type="button"
              onClick={() => setPolicyModalOpen(true)}
              className="px-4 py-2.5 bg-[#D85A30] hover:bg-[#F56649] text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Firmar Digitalmente POL-EMP-001 Ahora</span>
            </button>
          )}
        </div>

        {paymentSuccess && (
          <div className="p-5 bg-emerald-50 border-2 border-emerald-200 text-emerald-900 rounded-3xl space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-black text-sm text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{paymentSuccess.mensaje}</span>
            </div>
            <div className="text-xs text-emerald-800 space-y-1 font-medium bg-white/70 p-3 rounded-2xl border border-emerald-100">
              <p className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>Ref. Transacción Wompi: <strong>{paymentSuccess.wompiRef}</strong></span>
              </p>
              <p>Monto abonado: <strong>{formatPrice(paymentSuccess.monto)} COP</strong></p>
              <p>Modalidad de Cobro: <strong>{paymentSuccess.tipoSuscripcion === 'DEBITO_AUTOMATICO' ? 'Débito Automático' : 'Prepagado'}</strong></p>
              <p className="text-[#0F6E56] font-bold pt-1">
                📧 Factura Digital enviada a {user?.correo}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleWompiCheckout} className="space-y-6">
          {/* Selector 1: Prepagado vs Débito Automático */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Selecciona Modalidad de Suscripción
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoSuscripcion('PREPAGADO')}
                className={`p-4 rounded-2xl border-2 text-left text-xs transition space-y-1 ${
                  tipoSuscripcion === 'PREPAGADO'
                    ? 'border-[#D85A30] bg-[#FEEBE7]/40 text-[#D85A30] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-[#D85A30]" />
                    <span>Prepagado (Manual)</span>
                  </span>
                  {tipoSuscripcion === 'PREPAGADO' && <Check className="w-4 h-4 text-[#D85A30]" />}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Realizas el pago mes a mes libremente por PSE, Nequi o Daviplata.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTipoSuscripcion('DEBITO_AUTOMATICO')}
                className={`p-4 rounded-2xl border-2 text-left text-xs transition space-y-1 ${
                  tipoSuscripcion === 'DEBITO_AUTOMATICO'
                    ? 'border-[#D85A30] bg-[#FEEBE7]/40 text-[#D85A30] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>Débito Automático (Recurrente)</span>
                  </span>
                  {tipoSuscripcion === 'DEBITO_AUTOMATICO' && <Check className="w-4 h-4 text-[#D85A30]" />}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Cobro recurrente automático sin preocupaciones con tarjeta o Wompi.
                </p>
              </button>
            </div>
          </div>

          {/* Selector 2: Medio de Pago */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Selecciona Medio de Pago Wompi
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* PSE */}
              <button
                type="button"
                onClick={() => setMetodoPago('PSE')}
                className={`p-3.5 rounded-2xl border-2 text-xs font-bold transition flex flex-col items-center justify-center gap-2 ${
                  metodoPago === 'PSE'
                    ? 'border-[#D85A30] bg-[#FEEBE7]/40 text-[#D85A30] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-5 h-5 text-[#D85A30]" />
                <span>PSE (Bancos)</span>
              </button>

              {/* Nequi */}
              <button
                type="button"
                onClick={() => setMetodoPago('NEQUI')}
                className={`p-3.5 rounded-2xl border-2 text-xs font-bold transition flex flex-col items-center justify-center gap-2 ${
                  metodoPago === 'NEQUI'
                    ? 'border-[#D85A30] bg-[#FEEBE7]/40 text-[#D85A30] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span>Nequi</span>
              </button>

              {/* Daviplata */}
              <button
                type="button"
                onClick={() => setMetodoPago('DAVIPLATA')}
                className={`p-3.5 rounded-2xl border-2 text-xs font-bold transition flex flex-col items-center justify-center gap-2 ${
                  metodoPago === 'DAVIPLATA'
                    ? 'border-[#D85A30] bg-[#FEEBE7]/40 text-[#D85A30] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-5 h-5 text-red-600" />
                <span>Daviplata</span>
              </button>

              {/* Tarjeta */}
              <button
                type="button"
                onClick={() => setMetodoPago('TARJETA')}
                className={`p-3.5 rounded-2xl border-2 text-xs font-bold transition flex flex-col items-center justify-center gap-2 ${
                  metodoPago === 'TARJETA'
                    ? 'border-[#D85A30] bg-[#FEEBE7]/40 text-[#D85A30] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Tarjeta</span>
              </button>
            </div>
          </div>

          {/* Opciones dinámicas según medio de pago */}
          {metodoPago === 'PSE' && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800">
                Selecciona tu Banco de Origen
              </label>
              <select
                value={bancoSeleccionado}
                onChange={(e) => setBancoSeleccionado(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#D85A30] focus:outline-none"
              >
                {BANCOS_COLOMBIA.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(metodoPago === 'NEQUI' || metodoPago === 'DAVIPLATA') && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800">
                Número de Celular registrado en {metodoPago}
              </label>
              <input
                type="tel"
                value={celularInput}
                onChange={(e) => setCelularInput(e.target.value)}
                placeholder="Ej. 3001234567"
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#D85A30] focus:outline-none"
              />
            </div>
          )}

          {/* Resumen Final de Cobro y Botón */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-slate-500 font-medium block text-xs">Total a abonar hoy vía Wompi:</span>
              <span className="text-base font-black text-slate-900">{formatPrice(montoMes)} COP</span>
            </div>

            <button
              type="submit"
              disabled={paying}
              className="px-6 py-3 bg-[#D85A30] hover:bg-[#F56649] disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Conectando con Wompi...</span>
                </>
              ) : (
                <>
                  <span>Verificar Pago Wompi ({metodoPago})</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Firma Digital POL-EMP-001 */}
      <PolicySignatureModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        initialNombre={user?.nombre || ''}
        isSubmitting={signingPolicy}
        onSign={handleSignPolicy}
      />
    </div>
  );
}
