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
  FileText,
  Heart,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4DD] shadow-xs w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Logo e Identidad UniPide */}
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <img
                  src="https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg"
                  alt="UniPide Icon"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain group-hover:scale-105 transition shadow-xs"
                />
                <span className="font-black text-slate-900 tracking-tight text-lg sm:text-2xl">
                  Uni<span className="text-[#F56649]">Pide</span>
                </span>
              </Link>

              {/* Enlaces Principales Desktop */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border ${
                    pathname === '/'
                      ? 'text-[#F56649] bg-[#FEEBE7] border-[#FBC6BB]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                  }`}
                >
                  Inicio
                </Link>
                <Link
                  href="/negocios"
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border ${
                    pathname.startsWith('/negocios')
                      ? 'text-[#F56649] bg-[#FEEBE7] border-[#FBC6BB]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                  }`}
                >
                  Emprendimientos
                </Link>
                <Link
                  href="/nosotros"
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border ${
                    pathname === '/nosotros'
                      ? 'text-[#F56649] bg-[#FEEBE7] border-[#FBC6BB]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                  }`}
                >
                  Nosotros
                </Link>
                <Link
                  href="/precios"
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border ${
                    pathname === '/precios'
                      ? 'text-[#F56649] bg-[#FEEBE7] border-[#FBC6BB]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                  }`}
                >
                  Precios & Afiliación
                </Link>
                {user && (
                  <>
                    <Link
                      href="/favoritos"
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border ${
                        pathname === '/favoritos'
                          ? 'text-[#F56649] bg-[#FEEBE7] border-[#FBC6BB]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      Mis Favoritos
                    </Link>
                    <Link
                      href="/pedidos"
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition border ${
                        pathname.startsWith('/pedidos')
                          ? 'text-[#F56649] bg-[#FEEBE7] border-[#FBC6BB]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      Mis Pedidos
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Carrito y Perfil de Usuario */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Botón Carrito */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#2D3136] hover:text-[#D9534F] hover:bg-[#FDF2F2] rounded-xl transition shrink-0"
                title="Ver carrito de compras"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D9534F] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Campana de Notificaciones en Tiempo Real */}
              <NotificationBell />

              {/* Usuario o Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition active:scale-95 border border-transparent hover:border-gray-200"
                    title="Opciones de usuario"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 text-uninorte-red font-bold flex items-center justify-center text-xs overflow-hidden border border-red-200 shrink-0">
                      {user.foto ? (
                        <img src={user.foto} alt={user.nombre} className="w-full h-full object-cover" />
                      ) : (
                        user.nombre.charAt(0)
                      )}
                    </div>
                    <div className="text-left text-xs">
                      <div className="font-bold text-gray-800 line-clamp-1 max-w-[90px] sm:max-w-[120px]">
                        {user.nombre.split(' ')[0]}
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wider hidden sm:block">
                        {user.rol}
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/5"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-2 bg-gray-50 rounded-xl mb-1 border border-gray-100">
                          <p className="text-xs font-bold text-gray-900 line-clamp-1">{user.nombre}</p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{user.correo}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-uninorte-red">
                            Rol: {user.rol}
                          </span>
                        </div>

                        <div className="py-1 space-y-0.5">
                          {isEmprendedor && (
                            <Link
                              href="/emprendedor"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#F56649] bg-[#FEEBE7] hover:bg-[#FBC6BB]/40 rounded-xl transition"
                            >
                              <Store className="w-4 h-4 text-[#F56649]" />
                              Panel de Emprendedor
                            </Link>
                          )}

                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                            >
                              <Shield className="w-4 h-4 text-slate-800" />
                              Panel de Administrador
                            </Link>
                          )}

                          <Link
                            href="/favoritos"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-xl transition"
                          >
                            <Heart className="w-4 h-4 text-uninorte-red fill-uninorte-red" />
                            Mis Productos Favoritos
                          </Link>

                          <Link
                            href="/pedidos"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-xl transition"
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            Mis Pedidos y Compras
                          </Link>

                          <Link
                            href="/pqrs"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-xl transition"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            Radicar PQRS / Ayuda
                          </Link>
                        </div>

                        <div className="pt-1.5 mt-1 border-t border-gray-100">
                          <button
                            onClick={async () => {
                              setUserDropdownOpen(false);
                              await logout();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-red-600" />
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
                    className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#F56649] transition whitespace-nowrap"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-[#F56649] hover:bg-[#F77C64] rounded-xl shadow-xs transition whitespace-nowrap"
                  >
                    Registrarme
                  </Link>
                </div>
              )}

              {/* Botón Menú Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-xl md:hidden transition shrink-0"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top duration-150">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 rounded-xl hover:bg-slate-50"
            >
              <Compass className="w-4 h-4 text-amber-600" />
              Inicio y Ofertas
            </Link>
            <Link
              href="/negocios"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 rounded-xl hover:bg-slate-50"
            >
              <Store className="w-4 h-4 text-amber-600" />
              Explorar Emprendimientos
            </Link>
            <Link
              href="/precios"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 rounded-xl hover:bg-slate-50"
            >
              <Zap className="w-4 h-4 text-[#D85A30]" />
              Precios & Afiliación
            </Link>
            {user && (
              <Link
                href="/pedidos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 rounded-xl hover:bg-slate-50"
              >
                <Clock className="w-4 h-4 text-amber-600" />
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
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-900 bg-slate-100 rounded-xl"
              >
                <Shield className="w-4 h-4 text-slate-700" />
                Panel Administrador
              </Link>
            )}

            {user ? (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4 text-slate-700" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-800 bg-slate-100 rounded-xl"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-slate-900 rounded-xl"
                >
                  Crear Cuenta Gratis
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Barra de Navegación Nativa Estilo App Móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 pt-2 pb-safe px-2 flex items-center justify-around shadow-2xl">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-90 ${
            pathname === '/' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Inicio</span>
        </Link>

        <Link
          href="/negocios"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-90 ${
            pathname.startsWith('/negocios') ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className={`w-5 h-5 ${pathname.startsWith('/negocios') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Negocios</span>
        </Link>

        {/* Botón Carrito Destacado */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-600 active:scale-90 transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-slate-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {totalItems}
              </span>
            )}
          </div>
          <span>Carrito</span>
        </button>

        <Link
          href={user ? '/pedidos' : '/login'}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-90 ${
            pathname.startsWith('/pedidos') ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className={`w-5 h-5 ${pathname.startsWith('/pedidos') ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>Pedidos</span>
        </Link>

        <Link
          href={isEmprendedor ? '/emprendedor' : isAdmin ? '/admin' : user ? '/pqrs' : '/login'}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-90 ${
            pathname.startsWith('/emprendedor') || pathname.startsWith('/admin') || pathname.startsWith('/pqrs')
              ? 'text-amber-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span>{isEmprendedor ? 'Mi Negocio' : isAdmin ? 'Admin' : user ? 'Ayuda/PQRS' : 'Ingresar'}</span>
        </Link>
      </div>
    </>
  );
}
