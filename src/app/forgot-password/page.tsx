'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, KeyRound, ArrowRight, Loader2, CheckCircle2, ArrowLeft, ShieldCheck, QrCode, Smartphone } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [correo, setCorreo] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');

  // Paso 1: Buscar cuenta
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al verificar la cuenta');
        setLoading(false);
        return;
      }

      setNombreUsuario(data.nombreUsuario || '');
      setStep(2);
    } catch (err: any) {
      setError('Error de conexión con el servidor. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Restablecer Contraseña verificando con Google Authenticator
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code || code.trim().length !== 6) {
      setError('Por favor ingresa el código de 6 dígitos generado por tu aplicación Google Authenticator');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo,
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al actualizar la contraseña');
        setLoading(false);
        return;
      }

      setStep(3);
    } catch (err: any) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-red-50/30 via-white to-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <img
            src="https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg"
            alt="UniPide Icon"
            className="w-14 h-14 mx-auto object-contain drop-shadow-sm hover:scale-105 transition"
          />
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Recuperar Contraseña con 2FA
          </h1>
          <p className="text-xs text-gray-500">
            {step === 1 && 'Ingresa tu correo electrónico registrado para verificar tu cuenta'}
            {step === 2 && `Abre tu app Google Authenticator e ingresa el código activo para la cuenta de ${nombreUsuario || 'UniPide'}`}
            {step === 3 && '¡Tu clave ha sido actualizada con éxito mediante Google Authenticator!'}
          </p>
        </div>

        {/* Contenedor del Formulario */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Banner Guía Google Authenticator en Paso 2 */}
          {step === 2 && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>Google Authenticator</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Busca la entrada <strong className="text-white">UniPide Uninorte</strong> en tu celular y copia los 6 dígitos que cambian cada 30 segundos.
              </p>
            </div>
          )}

          {/* PASO 1: Ingresar correo registrado */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="usuario@uninorte.edu.co"
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar a Verificación 2FA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* PASO 2: Ingresar Código de Google Authenticator y Nueva Contraseña */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Código de 6 dígitos de Google Authenticator *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    className="w-full text-base font-mono font-black tracking-widest text-center py-3 pl-10 pr-3 rounded-xl border-2 border-uninorte-red focus:ring-4 focus:ring-red-100 outline-none text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.trim().length !== 6}
                className="w-full py-3.5 bg-uninorte-red hover:bg-uninorte-darkRed disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validando con Google Authenticator...</span>
                  </>
                ) : (
                  <>
                    <span>Validar 2FA y Restablecer Clave</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                className="w-full py-2 text-center text-xs text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver e ingresar otro correo</span>
              </button>
            </form>
          )}

          {/* PASO 3: Éxito */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900">
                  ¡Contraseña Restablecida!
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Tu clave ha sido actualizada con éxito verificando con Google Authenticator.
                </p>
              </div>

              <Link
                href="/login"
                className="block w-full py-3.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Iniciar Sesión Ahora
              </Link>
            </div>
          )}

          {step !== 3 && (
            <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
              ¿Recordaste tu contraseña?{' '}
              <Link href="/login" className="font-bold text-uninorte-red hover:underline">
                Volver a Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
