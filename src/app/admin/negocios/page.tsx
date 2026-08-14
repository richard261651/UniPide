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
  Trash2,
  Shield,
  Loader2,
  User,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminNegociosPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('TODOS');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal de confirmación para eliminar negocio
  const [deletingBusiness, setDeletingBusiness] = useState<BusinessItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      setActionLoadingId(b.id);
      const res = await fetch(`/api/businesses/${b.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !b.activo }),
      });

      if (res.ok) {
        setFeedbackMsg({
          type: 'success',
          text: `Emprendimiento "${b.nombre}" ${!b.activo ? 'activado' : 'suspendido'} exitosamente.`,
        });
        fetchBusinesses();
      }
    } catch (err) {
      console.error('Error cambiando estado del negocio:', err);
      setFeedbackMsg({ type: 'error', text: 'Error al cambiar estado del negocio.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateApproval = async (b: BusinessItem, nuevoEstado: string) => {
    try {
      setActionLoadingId(b.id);
      const res = await fetch(`/api/businesses/${b.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoAprobacion: nuevoEstado }),
      });

      if (res.ok) {
        setFeedbackMsg({
          type: 'success',
          text: `Estado de aprobación actualizado a "${nuevoEstado}".`,
        });
        fetchBusinesses();
      }
    } catch (err) {
      console.error('Error actualizando aprobación:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDeleteBusiness = async () => {
    if (!deletingBusiness) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/businesses/${deletingBusiness.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setFeedbackMsg({
          type: 'success',
          text: `El emprendimiento "${deletingBusiness.nombre}" ha sido eliminado definitivamente.`,
        });
        setDeletingBusiness(null);
        fetchBusinesses();
      } else {
        const data = await res.json();
        setFeedbackMsg({ type: 'error', text: data.error || 'Error al eliminar el emprendimiento.' });
      }
    } catch (err) {
      console.error('Error eliminando emprendimiento:', err);
      setFeedbackMsg({ type: 'error', text: 'Error al conectar con el servidor.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = businesses.filter((b) => {
    const matchesSearch =
      b.nombre.toLowerCase().includes(search.toLowerCase()) ||
      b.categoria.toLowerCase().includes(search.toLowerCase()) ||
      b.ubicacionCampus.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.nombre.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.correo.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'TODOS' || b.estadoAprobacion === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-uninorte-red" />
            <span>Gestión y Eliminación de Emprendimientos</span>
          </h2>
          <p className="text-xs text-gray-500">
            Administra, suspende, aprueba o elimina definitivamente negocios estudiantiles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Filtro de Aprobación */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-xs px-3 py-2 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none font-medium text-gray-700"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="APROBADO">Aprobados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="RECHAZADO">Rechazados</option>
            <option value="SUSPENDIDO">Suspendidos</option>
          </select>

          {/* Buscador */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, estudiante..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-bold px-2 hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

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
                  <th className="p-4">Estudiante Responsable</th>
                  <th className="p-4">Ubicación Campus</th>
                  <th className="p-4">Aprobación</th>
                  <th className="p-4">Actividad</th>
                  <th className="p-4 text-right">Acciones de Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-800 shrink-0 overflow-hidden border border-gray-200">
                          {b.logo ? (
                            <img src={b.logo} alt={b.nombre} className="w-full h-full object-cover" />
                          ) : (
                            b.nombre.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{b.nombre}</p>
                          <span className="text-[10px] text-gray-400">
                            {b.categoria} • Creado: {formatShortDate(b.fechaCreacion)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-gray-800 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{b.user?.nombre || 'Estudiante'}</span>
                        </p>
                        <p className="text-[11px] text-gray-500">{b.user?.correo}</p>
                        {b.user?.telefono && (
                          <p className="text-[10px] text-gray-400">Tel: {b.user.telefono}</p>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-uninorte-red shrink-0" />
                        <span>{b.ubicacionCampus}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={b.estadoAprobacion}
                        onChange={(e) => handleUpdateApproval(b, e.target.value)}
                        disabled={actionLoadingId === b.id}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition outline-none cursor-pointer ${
                          b.estadoAprobacion === 'APROBADO'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : b.estadoAprobacion === 'PENDIENTE'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        <option value="APROBADO">APROBADO</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="RECHAZADO">RECHAZADO</option>
                        <option value="SUSPENDIDO">SUSPENDIDO</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActivo(b)}
                        disabled={actionLoadingId === b.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                          b.activo
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                        title="Clic para cambiar visibilidad"
                      >
                        <Power className="w-3 h-3" />
                        <span>{b.activo ? 'Activo' : 'Pausado'}</span>
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.estadoAprobacion === 'APROBADO' && (
                          <Link
                            href={`/negocios/${b.slug}`}
                            className="p-2 text-gray-400 hover:text-uninorte-red hover:bg-red-50 rounded-xl transition"
                            title="Ver en marketplace"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}

                        {/* Botón Eliminar Definitivo */}
                        <button
                          onClick={() => setDeletingBusiness(b)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Eliminar emprendimiento definitivamente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-xs text-gray-400">
                No se encontraron emprendimientos con los filtros seleccionados
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Emprendimiento */}
      {deletingBusiness && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-gray-900">
                ¿Eliminar este emprendimiento?
              </h3>
              <p className="text-xs text-gray-500">
                Estás a punto de eliminar permanentemente a{' '}
                <span className="font-bold text-gray-800">"{deletingBusiness.nombre}"</span>. Se borrarán todos sus productos, menús y registros asociados.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 font-medium space-y-1">
              <p>⚠️ <strong>Atención:</strong> Esta acción no se puede deshacer.</p>
              <p>Estudiante dueño: {deletingBusiness.user?.nombre} ({deletingBusiness.user?.correo})</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBusiness(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteBusiness}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Eliminar Negocio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
