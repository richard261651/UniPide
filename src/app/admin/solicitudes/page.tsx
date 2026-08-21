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
 {/* Header */}
 <div>
 <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
 <CheckSquare className="w-5 h-5 text-uninorte-red" />
 <span>Solicitudes de Nuevos Emprendimientos</span>
 </h2>
 <p className="text-xs text-gray-500">
 Revisa y aprueba los nuevos negocios antes de que sean visibles en el catálogo general de Uninorte
 </p>
 </div>

 {loading ? (
 <div className="space-y-4">
 {[1, 2].map((n) => (
 <div key={n} className="h-44 bg-white rounded-3xl animate-pulse border border-gray-100" />
 ))}
 </div>
 ) : pendingBusinesses.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
 <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
 <h3 className="font-bold text-gray-800 text-base">¡Al día! No hay solicitudes pendientes</h3>
 <p className="text-xs text-gray-500 max-w-sm mx-auto">
 Todos los emprendimientos registrados han sido revisados y procesados.
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {pendingBusinesses.map((b) => (
 <div
 key={b.id}
 className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
 <div className="flex items-center gap-3">
 {b.logo ? (
 <img
 src={b.logo}
 alt={b.nombre}
 className="w-12 h-12 rounded-2xl object-cover"
 />
 ) : (
 <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-base">
 {b.nombre.charAt(0)}
 </div>
 )}
 <div>
 <div className="flex items-center gap-2">
 <h3 className="font-black text-gray-900 text-base">{b.nombre}</h3>
 <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
 {b.categoria}
 </span>
 </div>
 <p className="text-[11px] text-gray-400">
 Registrado el {formatShortDate(b.fechaCreacion)}
 </p>
 </div>
 </div>

 <div className="flex gap-2">
 <button
 onClick={() => handleStatusChange(b.id, 'RECHAZADO')}
 disabled={processingId === b.id}
 className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
 >
 <XCircle className="w-4 h-4" />
 <span>Rechazar</span>
 </button>

 <button
 onClick={() => handleStatusChange(b.id, 'APROBADO')}
 disabled={processingId === b.id}
 className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
 >
 {processingId === b.id ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <CheckCircle className="w-4 h-4" />
 )}
 <span>Confirmar Pago y Abrir Negocio</span>
 </button>
 </div>
 </div>

 {/* Detalles del Negocio */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
 <div className="space-y-1.5 text-gray-600">
 <div className="flex items-center gap-1.5 text-gray-800 font-semibold">
 <MapPin className="w-4 h-4 text-uninorte-red shrink-0" />
 <span>Ubicación: {b.ubicacionCampus} ({b.zonaCampusCodigo})</span>
 </div>
 <div className="flex items-center gap-1.5 text-gray-800 font-semibold">
 <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
 <span>Suscripción: ${b.suscripcionMonto?.toLocaleString('es-CO') || '19.900'} COP/mes</span>
 </div>
 <p className="text-gray-500 pt-1 italic">"{b.descripcion}"</p>
 </div>

 <div className="bg-gray-50 p-3 rounded-2xl space-y-2 text-gray-700">
 <div className="flex items-center justify-between flex-wrap gap-1">
 <span className="font-bold text-gray-900 text-xs flex items-center gap-1">
 <User className="w-3.5 h-3.5 text-gray-400" />
 <span>Estudiante Responsable:</span>
 </span>
 <div className="flex items-center gap-1 flex-wrap">
 {b.pagoVerificado ? (
 <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
 <CheckCircle className="w-3 h-3 text-emerald-600" />
 <span> Pago Verificado Admin</span>
 </span>
 ) : (
 <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
 Pendiente Verificación Pago
 </span>
 )}
 {b.firmaPoliticaHigiene ? (
 <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
 <ShieldCheck className="w-3 h-3 text-emerald-600" />
 <span>POL-EMP-001 Firmada</span>
 </span>
 ) : (
 <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
 Sin firma
 </span>
 )}
 {b.user?.correoVerificado ? (
 <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
 <Mail className="w-3 h-3 text-blue-600" />
 <span>Gmail Verificado </span>
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
 {b.contratoDriveUrl && (
 <a
 href={b.contratoDriveUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition"
 >
 <FileText className="w-3.5 h-3.5 text-emerald-600" />
 <span> Ver Contrato POL-EMP-001 en Google Drive</span>
 </a>
 )}
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
