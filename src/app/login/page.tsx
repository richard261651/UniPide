'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail } from '@/lib/utils';
import { Loader2, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(correo)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);

    const res = await login(correo, password);
    if (!res.success) {
      setError(res.error || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-3">
          <img
            src="https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg"
            alt="UniPide Icon"
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain drop-shadow-md hover:scale-105 transition duration-300"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Iniciar Sesión en Uni<span className="text-[#F56649]">Pide</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa con tu correo electrónico y contraseña registrados
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEEBE7] border border-[#FBC6BB] text-[#C94026] text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#F56649] focus:border-transparent outline-none transition font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[#F56649] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#F56649] focus:border-transparent outline-none transition font-medium text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#F56649] hover:bg-[#F77C64] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F56649]/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-bold text-[#F56649] hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
