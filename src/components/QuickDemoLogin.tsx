'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Shield, Store, ShoppingBag, CheckCircle, ChevronDown } from 'lucide-react';

export default function QuickDemoLogin() {
  const { user, loginWithDemo } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleDemo = async (role: any, label: string) => {
    setLoadingRole(label);
    try {
      await loginWithDemo(role);
      setIsOpen(false);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-full transition shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
        <span>Acceso Rápido Demo</span>
        <ChevronDown className="w-3 h-3 text-amber-700" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1.5 border-b border-gray-100 mb-2">
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-uninorte-red" />
                Probar Roles al Instante
              </p>
              <p className="text-[11px] text-gray-500">
                Inicia sesión con un solo clic sin escribir contraseñas
              </p>
            </div>

            <div className="space-y-1">
              {/* ADMIN */}
              <button
                onClick={() => handleDemo('ADMIN', 'Admin')}
                disabled={loadingRole !== null}
                className="w-full text-left flex items-center justify-between px-2.5 py-2 text-xs rounded-xl hover:bg-red-50 text-gray-800 hover:text-uninorte-red transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-100 text-uninorte-red group-hover:bg-uninorte-red group-hover:text-white transition">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold">Administrador Uninorte</div>
                    <div className="text-[10px] text-gray-400">Aprobar negocios y métricas</div>
                  </div>
                </div>
                {user?.rol === 'ADMIN' && <CheckCircle className="w-4 h-4 text-green-600" />}
              </button>

              {/* EMPRENDEDOR BURGERS */}
              <button
                onClick={() => handleDemo('EMPRENDEDOR_BURGERS', 'Burger Lab')}
                disabled={loadingRole !== null}
                className="w-full text-left flex items-center justify-between px-2.5 py-2 text-xs rounded-xl hover:bg-amber-50 text-gray-800 hover:text-amber-800 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold">Emprendedor: Burger Lab 🍔</div>
                    <div className="text-[10px] text-gray-400">Negocio de comida aprobado</div>
                  </div>
                </div>
                {user?.correo === 'burgers@uninorte.edu.co' && <CheckCircle className="w-4 h-4 text-green-600" />}
              </button>

              {/* EMPRENDEDOR SWEET */}
              <button
                onClick={() => handleDemo('EMPRENDEDOR_SWEET', 'Sweet Bites')}
                disabled={loadingRole !== null}
                className="w-full text-left flex items-center justify-between px-2.5 py-2 text-xs rounded-xl hover:bg-pink-50 text-gray-800 hover:text-pink-700 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-100 text-pink-700 group-hover:bg-pink-600 group-hover:text-white transition">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold">Emprendedor: Sweet Bites 🍰</div>
                    <div className="text-[10px] text-gray-400">Postres y repostería</div>
                  </div>
                </div>
                {user?.correo === 'sweet@uninorte.edu.co' && <CheckCircle className="w-4 h-4 text-green-600" />}
              </button>

              {/* EMPRENDEDOR MERCH */}
              <button
                onClick={() => handleDemo('EMPRENDEDOR_MERCH', 'Campus Merch')}
                disabled={loadingRole !== null}
                className="w-full text-left flex items-center justify-between px-2.5 py-2 text-xs rounded-xl hover:bg-purple-50 text-gray-800 hover:text-purple-700 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold">Emprendedor: Stickers 🎨</div>
                    <div className="text-[10px] text-gray-400">Accesorios y merch</div>
                  </div>
                </div>
                {user?.correo === 'merch@uninorte.edu.co' && <CheckCircle className="w-4 h-4 text-green-600" />}
              </button>

              {/* CLIENTE ESTUDIANTE */}
              <button
                onClick={() => handleDemo('CLIENTE', 'Cliente')}
                disabled={loadingRole !== null}
                className="w-full text-left flex items-center justify-between px-2.5 py-2 text-xs rounded-xl hover:bg-blue-50 text-gray-800 hover:text-blue-700 transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold">Cliente: Estudiante 🎒</div>
                    <div className="text-[10px] text-gray-400">Pedir comida y calificar</div>
                  </div>
                </div>
                {user?.rol === 'CLIENTE' && <CheckCircle className="w-4 h-4 text-green-600" />}
              </button>
            </div>

            {loadingRole && (
              <div className="mt-2 text-center text-[11px] text-amber-700 font-medium py-1 bg-amber-50 rounded-lg animate-pulse">
                Cambiando a {loadingRole}...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
