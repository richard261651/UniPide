'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Shield, Store, ShoppingBag, Loader2, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithDemo } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(correo, password);
    if (!res.success) {
      setError(res.error || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: any, label: string) => {
    setDemoLoading(label);
    setError('');
    try {
      await loginWithDemo(role);
    } catch (e: any) {
      setError('Error al iniciar sesión demo');
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-uninorte-red text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-red-900/20">
            U
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-gray-500">
            Ingresa con tu correo institucional de la Universidad del Norte
          </p>
        </div>

        {/* Cuentas Demo de 1-Clic */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 rounded-3xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin-slow" />
            <span className="text-xs font-bold text-amber-900">
              Acceso Rápido para Pruebas (1 Clic)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('ADMIN', 'Admin')}
              disabled={demoLoading !== null}
              className="p-2.5 bg-white hover:bg-red-50 text-gray-800 border border-gray-200 hover:border-red-300 rounded-xl text-left transition text-xs flex items-center gap-2 group"
            >
              <div className="p-1 rounded-md bg-red-100 text-uninorte-red group-hover:bg-uninorte-red group-hover:text-white transition shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate">Admin Uninorte</p>
                <p className="text-[9px] text-gray-400">Moderar y Métricas</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('EMPRENDEDOR_BURGERS', 'Burger Lab')}
              disabled={demoLoading !== null}
              className="p-2.5 bg-white hover:bg-amber-50 text-gray-800 border border-gray-200 hover:border-amber-300 rounded-xl text-left transition text-xs flex items-center gap-2 group"
            >
              <div className="p-1 rounded-md bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition shrink-0">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate">Burger Lab 🍔</p>
                <p className="text-[9px] text-gray-400">Emprendedor</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('EMPRENDEDOR_SWEET', 'Sweet Bites')}
              disabled={demoLoading !== null}
              className="p-2.5 bg-white hover:bg-pink-50 text-gray-800 border border-gray-200 hover:border-pink-300 rounded-xl text-left transition text-xs flex items-center gap-2 group"
            >
              <div className="p-1 rounded-md bg-pink-100 text-pink-700 group-hover:bg-pink-600 group-hover:text-white transition shrink-0">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate">Sweet Bites 🍰</p>
                <p className="text-[9px] text-gray-400">Postres</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('CLIENTE', 'Cliente')}
              disabled={demoLoading !== null}
              className="p-2.5 bg-white hover:bg-blue-50 text-gray-800 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition text-xs flex items-center gap-2 group"
            >
              <div className="p-1 rounded-md bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[11px] truncate">Estudiante 🎒</p>
                <p className="text-[9px] text-gray-400">Pedir Comida</p>
              </div>
            </button>
          </div>
          {demoLoading && (
            <p className="text-[11px] font-bold text-center text-amber-800 animate-pulse">
              Iniciando sesión como {demoLoading}...
            </p>
          )}
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@uninorte.edu.co"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
                />
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
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading !== null}
              className="w-full py-3 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-bold text-uninorte-red hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
