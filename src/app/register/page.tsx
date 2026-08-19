'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail } from '@/lib/utils';
import { ShoppingBag, Store, Shield, Loader2, ArrowRight, CheckCircle2, Lock, Mail, User, Phone, MapPin, QrCode, Sparkles, Copy, Check } from 'lucide-react';

const CAMPUS_ZONES = [
  { codigo: 'BLOQUE_A', nombre: 'Bloque A' },
  { codigo: 'BLOQUE_B', nombre: 'Bloque B' },
  { codigo: 'BLOQUE_C', nombre: 'Bloque C' },
  { codigo: 'BLOQUE_D', nombre: 'Bloque D' },
  { codigo: 'BLOQUE_E', nombre: 'Bloque E' },
  { codigo: 'BLOQUE_F', nombre: 'Bloque F' },
  { codigo: 'BLOQUE_G', nombre: 'Bloque G' },
  { codigo: 'BLOQUE_I', nombre: 'Bloque I' },
  { codigo: 'BLOQUE_J', nombre: 'Bloque J' },
  { codigo: 'BLOQUE_K', nombre: 'Bloque K' },
  { codigo: 'BLOQUE_L', nombre: 'Bloque L' },
  { codigo: 'BLOQUE_M', nombre: 'Bloque M' },
  { codigo: 'BAMBU_1', nombre: 'Bambú 1' },
  { codigo: 'BAMBU_2', nombre: 'Bambú 2' },
  { codigo: 'FUENTE_CENTRAL', nombre: 'Fuente' },
  { codigo: 'COLISEO_FUNDADORES', nombre: 'Coliseo' },
  { codigo: 'AUDITORIO_PRINCIPAL', nombre: 'Auditorio' },
  { codigo: 'BIBLIOTECA_PARRISH', nombre: 'Biblioteca' },
  { codigo: 'CASA_ESTUDIO', nombre: 'Casa Estudio' },
  { codigo: 'CENTRO_MEDICO', nombre: 'Centro Médico' },
  { codigo: 'CENTRO_DEPORTIVO', nombre: 'Centro Deportivo' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [rol, setRol] = useState<'CLIENTE' | 'EMPRENDEDOR' | 'ADMIN'>('CLIENTE');

  // Datos de usuario
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');

  // Datos de emprendimiento
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [categoriaNegocio, setCategoriaNegocio] = useState('Comida Rápida');
  const [ubicacionCampus, setUbicacionCampus] = useState('');
  const [zonaCampusCodigo, setZonaCampusCodigo] = useState('BLOQUE_F');
  const [descripcionNegocio, setDescripcionNegocio] = useState('');

  // Clave de Administrador
  const [adminKey, setAdminKey] = useState('');

  // 2FA Setup
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Paso 1: Validar formulario e iniciar vinculo 2FA
  const handleProceedTo2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(correo)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, action: 'generate' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al configurar autenticación 2FA');
      }

      setTotpSecret(data.secret);
      setQrCodeUrl(data.qrImageUrl);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar vinculación 2FA');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar código 2FA y crear cuenta
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!totpCode || totpCode.trim().length !== 6) {
      setError('Por favor ingresa el código de 6 dígitos de tu aplicación Authenticator');
      return;
    }

    setLoading(true);

    try {
      // 1. Verificar token TOTP contra el secreto generado
      const verifyRes = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo,
          action: 'verify',
          secret: totpSecret,
          token: totpCode.trim(),
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'El código del Authenticator es incorrecto');
      }

      // 2. Crear cuenta guardando el secreto 2FA
      const res = await register({
        nombre,
        correo,
        password,
        rol,
        telefono,
        twoFactorSecret: totpSecret,
        ...(rol === 'EMPRENDEDOR' && {
          nombreNegocio,
          categoriaNegocio,
          ubicacionCampus,
          zonaCampusCodigo,
          descripcionNegocio,
        }),
        ...(rol === 'ADMIN' && {
          adminKey,
        }),
      });

      if (!res.success) {
        setError(res.error || 'Error al registrar la cuenta');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error al completar registro con 2FA');
      setLoading(false);
    }
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 3000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-uninorte-red to-red-800 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-red-900/20">
            U
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Crear Cuenta en <span className="text-uninorte-red">UniPide</span>
          </h1>
          <p className="text-xs text-gray-500">
            {step === 1
              ? 'Únete a la comunidad de estudiantes y emprendimientos del campus Uninorte'
              : 'Doble Factor Obligatorio: Vincula tu App Authenticator para máxima seguridad'}
          </p>
        </div>

        {step === 1 && (
          /* Selector de Rol */
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-gray-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setRol('CLIENTE')}
              className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                rol === 'CLIENTE'
                  ? 'bg-white text-uninorte-red shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => setRol('EMPRENDEDOR')}
              className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                rol === 'EMPRENDEDOR'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Emprendedor</span>
            </button>

            <button
              type="button"
              onClick={() => setRol('ADMIN')}
              className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                rol === 'ADMIN'
                  ? 'bg-white text-red-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* PASO 1: Formulario Principal */}
          {step === 1 && (
            <form onSubmit={handleProceedTo2FA} className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  1. Datos del Estudiante / Usuario
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="ejemplo@uninorte.edu.co"
                        className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Celular / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="300 123 4567"
                        className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {rol === 'ADMIN' && (
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-uninorte-red" />
                    <span>Clave Maestra de Administrador</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Clave de autorización (ej. uninorte2026)"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                  />
                </div>
              )}

              {rol === 'EMPRENDEDOR' && (
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>2. Datos de tu Emprendimiento</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nombre del Negocio
                    </label>
                    <input
                      type="text"
                      required
                      value={nombreNegocio}
                      onChange={(e) => setNombreNegocio(e.target.value)}
                      placeholder="Ej. Sweet Brownies Uninorte"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        value={categoriaNegocio}
                        onChange={(e) => setCategoriaNegocio(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="Comida Rápida">Comida Rápida</option>
                        <option value="Postres & Dulces">Postres & Dulces</option>
                        <option value="Bebidas & Café">Bebidas & Café</option>
                        <option value="Accesorios & Merch">Accesorios & Merch</option>
                        <option value="Ropa & Moda">Ropa & Moda</option>
                        <option value="Papelería & Stickers">Papelería & Stickers</option>
                        <option value="Servicios">Servicios</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bloque / Zona Base
                      </label>
                      <select
                        value={zonaCampusCodigo}
                        onChange={(e) => setZonaCampusCodigo(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white"
                      >
                        {CAMPUS_ZONES.map((z) => (
                          <option key={z.codigo} value={z.codigo}>
                            {z.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Ubicación Específica en Campus
                    </label>
                    <input
                      type="text"
                      required
                      value={ubicacionCampus}
                      onChange={(e) => setUbicacionCampus(e.target.value)}
                      placeholder="Ej. Bloque F pasillo principal"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando código 2FA...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar a Vinculación de 2FA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* PASO 2: Vinculación Obligatoria de 2FA Authenticator */}
          {step === 2 && (
            <form onSubmit={handleFinalRegister} className="space-y-5 animate-in fade-in">
              <div className="bg-slate-900 text-white rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <QrCode className="w-5 h-5 shrink-0" />
                  <span>Vincula tu Aplicación Authenticator</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Escanea este código QR con <strong className="text-white">Google Authenticator</strong>, <strong className="text-white">Microsoft Authenticator</strong> o <strong className="text-white">Authy</strong> en tu celular.
                </p>
              </div>

              {/* QR Code y Clave Secreta */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Código QR 2FA Authenticator"
                    className="w-44 h-44 rounded-xl border border-gray-200 bg-white p-2 shadow-xs"
                  />
                ) : (
                  <div className="w-44 h-44 bg-gray-200 rounded-xl flex items-center justify-center animate-pulse" />
                )}

                <div className="w-full text-center space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                    O ingresa la clave secreta manualmente:
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs font-mono font-black bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-slate-900 tracking-wider">
                      {totpSecret}
                    </code>
                    <button
                      type="button"
                      onClick={copySecretToClipboard}
                      className="p-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition"
                      title="Copiar secreto"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Input del Código de 6 dígitos */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 text-center">
                  Introduce el Código de 6 dígitos generado en tu App Authenticator *
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    className="w-full text-base font-mono font-black tracking-widest text-center py-3 px-4 rounded-xl border-2 border-uninorte-red focus:ring-4 focus:ring-red-100 outline-none shadow-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading || totpCode.trim().length !== 6}
                  className="w-2/3 py-3 text-xs sm:text-sm font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed disabled:opacity-50 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando 2FA...</span>
                    </>
                  ) : (
                    <>
                      <span>Verificar 2FA y Crear Cuenta</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-bold text-uninorte-red hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
