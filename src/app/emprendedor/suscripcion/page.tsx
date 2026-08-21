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

 const handleSignPolicy = async (data: { nombreFirmante: string; documentoFirmante: string; firmaVirtualBase64?: string }) => {
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
 <span>Gestión de Suscripción & Verificación de Pago</span>
 </div>
 <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
 Suscripción de Emprendimiento
 </h1>
 <p className="text-xs text-slate-500 font-medium">
 Consulta el estado de tu suscripción, confirma la firma de la política legal y revisa los datos para la verificación de tu pago por el Administrador.
 </p>
 </div>

 {/* Alerta si la Suscripción está por Caducar */}
 {estaPorCaducar && (
 <div className="p-4 bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-3xl space-y-2 animate-in fade-in shadow-sm">
 <div className="flex items-center gap-2 font-black text-sm text-amber-900">
 <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
 <span> Notificación de Vencimiento: ¡Tu suscripción caduca en {diasRestantes} días!</span>
 </div>
 <p className="text-xs text-amber-800 font-medium leading-relaxed">
 Tu tarifa promocional finaliza el <strong>{fechaFinPromo ? formatShortDate(fechaFinPromo) : ''}</strong>. Realiza tu renovación para mantener tu posición de <strong>Fundador UniPide </strong>.
 </p>
 </div>
 )}

 {/* Banner de Estado de Pago y Aprobación */}
 {business.pagoVerificado && business.estadoAprobacion === 'APROBADO' ? (
 <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl border border-emerald-500/40 shadow-lg space-y-3">
 <div className="flex items-center justify-between flex-wrap gap-2">
 <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-400">
 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
 <span> Pago Verificado y Negocio Abierto</span>
 </div>
 <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
 Activo en Campus
 </span>
 </div>
 <p className="text-xs text-slate-300 leading-relaxed font-medium">
 El Administrador ha verificado tu pago de suscripción de <strong>{formatPrice(montoMes)} COP</strong>. Tu tienda se encuentra abierta y visible para los estudiantes del campus Uninorte.
 </p>
 </div>
 ) : (
 <div className="p-5 bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 text-white rounded-3xl border border-amber-500/40 shadow-lg space-y-3">
 <div className="flex items-center justify-between flex-wrap gap-2">
 <div className="flex items-center gap-2 font-extrabold text-sm text-amber-400">
 <Clock className="w-5 h-5 text-amber-400" />
 <span> Pago Pendiente de Verificación por el Administrador</span>
 </div>
 <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
 Pendiente Apertura
 </span>
 </div>
 <p className="text-xs text-slate-200 leading-relaxed font-medium">
 Tu negocio no se abrirá ni será visible en la plataforma hasta que el <strong>Administrador verifique tu pago de suscripción ({formatPrice(montoMes)} COP)</strong>. Tan pronto el Administrador confirme tu pago desde el portal de control, recibirás un correo de notificación en <strong>{user?.correo}</strong> y tu tienda quedará activa automáticamente.
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
 {esFundador ? 'Plan Fundador UniPide ' : 'Plan Emprendedor UniPide'}
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
 <span className="text-xs text-slate-400 block font-medium">Tarifa Mensual</span>
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
 <span>{business.pagoVerificado ? 'ACTIVA Y PAGADA' : 'PENDIENTE VERIFICACIÓN'}</span>
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
 <span className="text-slate-400 font-medium block">Verificación Admin</span>
 <span className="font-bold text-amber-300 flex items-center gap-1">
 <ShieldCheck className="w-3.5 h-3.5" />
 <span>{business.pagoVerificado ? 'Verificado ' : 'En espera'}</span>
 </span>
 </div>
 </div>
 </div>

 {/* Instrucciones de Pago y Firma Legal */}
 <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
 <div className="border-b border-slate-100 pb-4">
 <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
 <ShieldCheck className="w-5 h-5 text-[#D85A30]" />
 <span>Instrucciones de Pago y Firma de Política</span>
 </h3>
 <p className="text-xs text-slate-500 font-medium mt-1">
 Requisitos obligatorios para la apertura y funcionamiento de tu emprendimiento en UniPide.
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
              : 'Para procesar la apertura de tu emprendimiento es obligatorio firmar digitalmente la Política POL-EMP-001.'}
          </p>

          {!business.firmaPoliticaHigiene ? (
            <button
              type="button"
              onClick={() => setPolicyModalOpen(true)}
              className="px-4 py-2.5 bg-[#D85A30] hover:bg-[#F56649] text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Firmar Digitalmente POL-EMP-001 Ahora</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <a
                href={`/api/businesses/${business.id}/contract`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Ver Mi Contrato Firmado POL-EMP-001</span>
              </a>

              <a
                href={`/api/businesses/${business.id}/receipt`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#0F6E56] hover:bg-[#0A4A3A] text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-emerald-300" />
                <span>Ver / Imprimir Constancia de Pago</span>
              </a>
            </div>
          )}
        </div>

 {/* Instrucciones de Pago Manual */}
 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
 <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
 <span> Medios de Pago Directos para Verificación</span>
 </h4>
 <p className="leading-relaxed">
 Realiza la transferencia del valor correspondiente a tu mensualidad (<strong>{formatPrice(montoMes)} COP</strong>) a la administración de UniPide a través de cualquiera de estos canales:
 </p>
 <ul className="space-y-1.5 pl-4 list-disc font-medium text-slate-800">
 <li><strong>Nequi Número:</strong> 314 753 5514 (Richard Guzmán - CEO UniPide)</li>
 <li><strong>Llave Nequi / Cédula:</strong> 1043640071</li>
 </ul>
 <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/80 italic">
 Una vez realizado el pago, el Administrador verificará la transacción en la plataforma, aprobará tu negocio y se enviará la confirmación a tu correo electrónico.
 </p>
 </div>
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
