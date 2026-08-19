'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Store,
  Shield,
  LogOut,
  Menu,
  X,
  Compass,
  Clock,
  ChevronDown,
  Zap,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isEmprendedor = user?.rol === 'EMPRENDEDOR';
  const isAdmin = user?.rol === 'ADMIN';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Logo e Identidad UniPide */}
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-uninorte-red to-red-800 flex items-center justify-center text-white shadow-md shadow-red-900/20 group-hover:scale-105 transition">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-gray-900 tracking-tight text-base sm:text-xl">
                      Uni<span className="text-uninorte-red">Pide</span>
                    </span>
                    <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-red-100 text-uninorte-red px-1.5 py-0.5 rounded">
                      Campus
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium -mt-1 hidden sm:block">
                    Marketplace Universitario Uninorte
                  </p>
                </div>
              </Link>

              {/* Enlaces Principales Desktop */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                    pathname === '/'
                      ? 'text-uninorte-red bg-red-50/80 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Inicio
                </Link>
                <Link
                  href="/negocios"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                    pathname.startsWith('/negocios')
                      ? 'text-uninorte-red bg-red-50/80 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Emprendimientos
                </Link>
                {user && (
                  <Link
                    href="/pedidos"
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                      pathname.startsWith('/pedidos')
                        ? 'text-uninorte-red bg-red-50/80 font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Mis Pedidos
                  </Link>
                )}
              </nav>
            </div>

            {/* Carrito y Perfil de Usuario */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Botón Carrito */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-uninorte-red hover:bg-red-50 rounded-xl transition shrink-0"
                title="Ver carrito de compras"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-uninorte-red text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Usuario o Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 text-uninorte-red font-bold flex items-center justify-center text-xs overflow-hidden border border-red-200 shrink-0">
                      {user.foto ? (
                        <img src={user.foto} alt={user.nombre} className="w-full h-full object-cover" />
                      ) : (
                        user.nombre.charAt(0)
                      )}
                    </div>
                    <div className="hidden lg:block text-left text-xs">
                      <div className="font-bold text-gray-800 line-clamp-1 max-w-[100px]">
                        {user.nombre.split(' ')[0]}
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                        {user.rol}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-900 line-clamp-1">{user.nombre}</p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{user.correo}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-uninorte-red">
                            Rol: {user.rol}
                          </span>
                        </div>

                        <div className="py-1">
                          {isEmprendedor && (
                            <Link
                              href="/emprendedor"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl my-1 transition"
                            >
                              <Store className="w-4 h-4 text-amber-600" />
                              Panel de Emprendedor
                            </Link>
                          )}

                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-900 bg-red-50 hover:bg-red-100 rounded-xl my-1 transition"
                            >
                              <Shield className="w-4 h-4 text-uninorte-red" />
                              Panel de Administrador
                            </Link>
                          )}

                          <Link
                            href="/pedidos"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-xl transition"
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            Mis Pedidos y Compras
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/login"
                    className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-uninorte-red transition whitespace-nowrap"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-xs transition whitespace-nowrap"
                  >
                    Registrarme
                  </Link>
                </div>
              )}

              {/* Botón Menú Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-xl md:hidden transition shrink-0"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top duration-150">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-800 rounded-xl hover:bg-gray-50"
            >
              <Compass className="w-4 h-4 text-uninorte-red" />
              Inicio y Ofertas
            </Link>
            <Link
              href="/negocios"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-800 rounded-xl hover:bg-gray-50"
            >
              <Store className="w-4 h-4 text-uninorte-red" />
              Explorar Emprendimientos
            </Link>
            {user && (
              <Link
                href="/pedidos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-800 rounded-xl hover:bg-gray-50"
              >
                <Clock className="w-4 h-4 text-uninorte-red" />
                Mis Pedidos
              </Link>
            )}

            {isEmprendedor && (
              <Link
                href="/emprendedor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-amber-900 bg-amber-50 rounded-xl"
              >
                <Store className="w-4 h-4 text-amber-700" />
                Portal Emprendedor
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-900 bg-red-50 rounded-xl"
              >
                <Shield className="w-4 h-4 text-uninorte-red" />
                Panel Administrador
              </Link>
            )}

            {!user && (
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-gray-800 bg-gray-100 rounded-xl"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-uninorte-red rounded-xl"
                >
                  Crear Cuenta Gratis
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Barra de Navegación Inferior Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-4 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            pathname === '/' ? 'text-uninorte-red' : 'text-gray-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Inicio</span>
        </Link>
        <Link
          href="/negocios"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            pathname.startsWith('/negocios') ? 'text-uninorte-red' : 'text-gray-500'
          }`}
        >
          <Store className="w-5 h-5" />
          <span>Negocios</span>
        </Link>
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-semibold text-gray-500"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Carrito</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 right-1 bg-uninorte-red text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
        <Link
          href={user ? '/pedidos' : '/login'}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            pathname.startsWith('/pedidos') || pathname.startsWith('/login') ? 'text-uninorte-red' : 'text-gray-500'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>{user ? 'Pedidos' : 'Ingresar'}</span>
        </Link>
      </div>
    </>
  );
}
