'use client';

import React, { useEffect, useState } from 'react';
import { BusinessItem } from '@/types';
import { formatShortDate } from '@/lib/utils';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Store,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Loader2,
  ShieldCheck,
  FileText,
  CreditCard,
  Download,
} from 'lucide-react';

export default function AdminSolicitudesPage() {
  const [pendingBusinesses, setPendingBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/businesses?all=true');
      if (res.ok) {
        const data = await res.json();
        const pending = (data.businesses || []).filter(
          (b: BusinessItem) => b.estadoAprobacion === 'PENDIENTE'
        );
        setPendingBusinesses(pending);
      }
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleStatusChange = async (id: string, nuevoEstado: 'APROBADO' | 'RECHAZADO') => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/businesses/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoAprobacion: nuevoEstado }),
      });

      if (res.ok) {
        fetchPending();
      }
    } catch (err) {
      console.error('Error procesando solicitud:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#D85A30]" />
            <span>Solicitudes & Aperturas de Emprendimientos</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Revisa y confirma la verificación de pago de los nuevos emprendimientos para autorizar su apertura en UniPide.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-[#FEEBE7] border border-[#FBC6BB] text-[#D85A30] text-xs font-black rounded-full self-start sm:self-auto">
          {pendingBusinesses.length} Solicitud(es) Pendiente(s)
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-[#D85A30] animate-spin" />
        </div>
      ) : pendingBusinesses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto font-black text-xl">
            ✓
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">
            ¡No hay solicitudes pendientes!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            Todos los emprendimientos registrados han sido revisados y procesados correctamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingBusinesses.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4 transition hover:border-slate-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900">{b.nombre}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {b.categoria}
                    </span>
                    {b.esFundador && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        Plan Fundador (33% OFF)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Registrado el {formatShortDate(b.fechaCreacion)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={processingId === b.id}
                    onClick={() => handleStatusChange(b.id, 'APROBADO')}
                    className="px-4 py-2 bg-[#0F6E56] hover:bg-[#0A4A3A] text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {processingId === b.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirmar Pago y Abrir Negocio</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={processingId === b.id}
                    onClick={() => handleStatusChange(b.id, 'RECHAZADO')}
                    className="px-3 py-2 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Datos del Negocio */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-[#D85A30]" />
                    <span>Información de la Tienda</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {b.descripcion || 'Sin descripción ingresada.'}
                  </p>
                  <div className="pt-2 border-t border-slate-200/60 space-y-1 text-slate-700">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Ubicación: <strong>{b.ubicacionCampus}</strong></span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Tiempo Prep. Base: <strong>{b.tiempoBasePrepMin} minutos</strong></span>
                    </p>
                  </div>
                </div>

                {/* Datos del Emprendedor Firmante */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#D85A30]" />
                      <span>Emprendedor Responsable</span>
                    </h4>

                    <div className="flex items-center gap-1.5">
                      {b.firmaPoliticaHigiene ? (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>POL-EMP-001 Firmado</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Sin firma
                        </span>
                      )}
                      {b.user?.correoVerificado ? (
                        <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Mail className="w-3 h-3 text-blue-600" />
                          <span>Gmail Verificado</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Gmail Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="font-medium text-slate-900">{b.user?.nombre || 'Estudiante Uninorte'}</p>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>{b.user?.correo}</span>
                  </p>

                  {b.user?.telefono && (
                    <p className="text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{b.user.telefono}</span>
                    </p>
                  )}

                  {b.nombreFirmante && (
                    <div className="pt-1.5 border-t border-slate-200/80 space-y-1">
                      <p className="text-[11px] text-slate-600 font-medium">
                        Firmante Legal POL-EMP-001: <strong>{b.nombreFirmante}</strong> ({b.documentoFirmante})
                      </p>
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <a
                          href={`/api/businesses/${b.id}/contract?download=true`}
                          className="inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-[#D85A30] hover:bg-[#F56649] px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-white" />
                          <span>Descargar Contrato a Mi Equipo</span>
                        </a>

                        <a
                          href={`/api/businesses/${b.id}/contract`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1.5 rounded-lg transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#D85A30]" />
                          <span>Ver Online</span>
                        </a>

                        <a
                          href={`/api/businesses/${b.id}/receipt`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-lg transition"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ver Constancia Pago</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
