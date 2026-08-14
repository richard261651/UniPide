'use client';

import React, { useEffect, useState } from 'react';
import { BusinessItem } from '@/types';
import { formatShortDate } from '@/lib/utils';
import {
  Building2,
  Store,
  MapPin,
  Clock,
  Power,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminNegociosPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/businesses?all=true');
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses || []);
      }
    } catch (err) {
      console.error('Error cargando negocios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleToggleActivo = async (b: BusinessItem) => {
    try {
      setTogglingId(b.id);
      const res = await fetch(`/api/businesses/${b.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !b.activo }),
      });

      if (res.ok) {
        fetchBusinesses();
      }
    } catch (err) {
      console.error('Error cambiando estado del negocio:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = businesses.filter(
    (b) =>
      b.nombre.toLowerCase().includes(search.toLowerCase()) ||
      b.categoria.toLowerCase().includes(search.toLowerCase()) ||
      b.ubicacionCampus.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-uninorte-red" />
            <span>Todos los Emprendimientos Registrados</span>
          </h2>
          <p className="text-xs text-gray-500">
            Control de activación, suspensión y auditoría de negocios en el campus
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar emprendimiento..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
          />
        </div>
      </div>

      {/* Tabla de Negocios */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4">Emprendimiento</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Ubicación Campus</th>
                  <th className="p-4">Aprobación</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-800 shrink-0 overflow-hidden">
                          {b.logo ? (
                            <img src={b.logo} alt={b.nombre} className="w-full h-full object-cover" />
                          ) : (
                            b.nombre.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{b.nombre}</p>
                          <p className="text-[10px] text-gray-400">
                            Registrado: {formatShortDate(b.fechaCreacion)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-gray-800">{b.categoria}</td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-700">
                        <MapPin className="w-3 h-3 text-uninorte-red" />
                        <span>{b.ubicacionCampus}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.estadoAprobacion === 'APROBADO'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.estadoAprobacion === 'PENDIENTE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {b.estadoAprobacion}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {b.activo ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.estadoAprobacion === 'APROBADO' && (
                          <Link
                            href={`/negocios/${b.slug}`}
                            className="p-1.5 text-gray-400 hover:text-uninorte-red hover:bg-red-50 rounded-lg transition"
                            title="Ver en tienda"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}

                        <button
                          onClick={() => handleToggleActivo(b)}
                          disabled={togglingId === b.id}
                          className={`px-3 py-1 text-[11px] font-bold rounded-xl transition ${
                            b.activo
                              ? 'bg-red-50 hover:bg-red-100 text-red-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {b.activo ? 'Suspender' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
