'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice, formatShortDate } from '@/lib/utils';
import {
  Users,
  Store,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/stats/admin');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error cargando métricas admin:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner de Solicitudes Pendientes si existen */}
      {stats?.pendingBusinesses > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <AlertCircle className="w-6 h-6 fill-white text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Tienes {stats.pendingBusinesses} emprendimiento(s) pendiente(s) de aprobación
              </h3>
              <p className="text-xs text-amber-100">
                Revisa los datos antes de que aparezcan en el catálogo público del campus.
              </p>
            </div>
          </div>

          <Link
            href="/admin/solicitudes"
            className="px-5 py-2.5 bg-white text-amber-900 text-xs font-bold rounded-2xl shadow-sm hover:bg-amber-50 transition shrink-0"
          >
            Revisar Solicitudes
          </Link>
        </div>
      )}

      {/* Grid de KPIs Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Negocios Activos */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Negocios Activos</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {stats?.approvedBusinesses || 0}
          </p>
          <p className="text-[11px] text-gray-400">
            De {stats?.totalBusinesses || 0} registrados en total
          </p>
        </div>

        {/* Solicitudes en Espera */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Pendientes de Aprobación</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">
            {stats?.pendingBusinesses || 0}
          </p>
          <p className="text-[11px] text-gray-400">
            Control de calidad estudiantil
          </p>
        </div>

        {/* Usuarios Registrados */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Usuarios Registrados</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {stats?.totalUsers || 0}
          </p>
          <p className="text-[11px] text-gray-400">
            Estudiantes, emprendedores y admins
          </p>
        </div>

        {/* Volumen Transaccionado */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Volumen de Pedidos</span>
            <div className="p-2 bg-red-50 text-uninorte-red rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {formatPrice(stats?.platformRevenue || 0)}
          </p>
          <p className="text-[11px] text-gray-400">
            {stats?.totalOrders || 0} pedidos totales en campus
          </p>
        </div>
      </div>

      {/* Usuarios Recientemente Registrados */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-uninorte-red" />
            <span>Últimos Usuarios Registrados en la Comunidad</span>
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {stats?.recentUsers?.map((u: any) => (
            <div key={u.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-gray-900">{u.nombre}</p>
                <p className="text-[11px] text-gray-400">{u.correo}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    u.rol === 'ADMIN'
                      ? 'bg-red-100 text-uninorte-red'
                      : u.rol === 'EMPRENDEDOR'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {u.rol}
                </span>
                <span className="text-[10px] text-gray-400">
                  {formatShortDate(u.fechaRegistro)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
