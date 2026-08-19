'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  CheckSquare,
  Building2,
  Users,
  ArrowLeft,
  ShoppingBag,
  Star,
  MessageSquare,
  FileText,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, loading]);

  if (loading || !user || user.rol !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uninorte-red" />
      </div>
    );
  }

  const adminLinks = [
    { href: '/admin', label: 'Métricas Globales', icon: LayoutDashboard, exact: true },
    { href: '/admin/solicitudes', label: 'Solicitudes Pendientes', icon: CheckSquare },
    { href: '/admin/negocios', label: 'Gestión de Emprendimientos', icon: Building2 },
    { href: '/admin/productos', label: 'Productos del Menú', icon: ShoppingBag },
    { href: '/admin/pedidos', label: 'Auditoría de Pedidos & Chat', icon: MessageSquare },
    { href: '/admin/pqrs', label: 'Gestión de PQRS', icon: FileText },
    { href: '/admin/reseñas', label: 'Moderación de Reseñas', icon: Star },
    { href: '/admin/usuarios', label: 'Usuarios & Cuentas', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-black text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
              Panel Administrativo UniPide
            </span>
            <span className="text-xs text-red-200 font-semibold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-uninorte-red" />
              Control Total & Moderación Absoluta
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gestión Central UniPide Campus
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Supervisión, edición y eliminación de productos, reseñas, emprendimientos y usuarios
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ir a la Tienda</span>
        </Link>
      </div>

      {/* Pestañas de Navegación Admin */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-gray-200 mb-8 scrollbar-none">
        {adminLinks.map((link) => {
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
