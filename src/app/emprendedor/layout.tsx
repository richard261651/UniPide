'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Store,
  ArrowLeft,
  ShieldAlert,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
} from 'lucide-react';

export default function EmprendedorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.rol !== 'EMPRENDEDOR' && user.rol !== 'ADMIN'))) {
      router.push('/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uninorte-red" />
      </div>
    );
  }

  const navLinks = [
    { href: '/emprendedor', label: 'Resumen & Métricas', icon: LayoutDashboard, exact: true },
    { href: '/emprendedor/pedidos', label: 'Pedidos Entrantes', icon: ShoppingBag },
    { href: '/emprendedor/productos', label: 'Catálogo de Productos', icon: UtensilsCrossed },
    { href: '/emprendedor/suscripcion', label: 'Mi Suscripción & Pago', icon: CreditCard },
    { href: '/emprendedor/pqrs', label: 'PQRS Recibidas', icon: FileText },
    { href: '/emprendedor/perfil', label: 'Perfil del Negocio', icon: Store },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header del Portal Emprendedor */}
      <div className="bg-gradient-to-r from-neutral-900 via-zinc-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded-full">
              Portal del Emprendedor
            </span>
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Campus Uninorte
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user.businessName || 'Tu Emprendimiento'}
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Gestiona tu catálogo, recibe pedidos en tiempo real y revisa tus ingresos estudiantiles
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Tienda</span>
        </Link>
      </div>

      {/* Navegación por pestañas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-gray-200 mb-8 scrollbar-none">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-uninorte-red text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
