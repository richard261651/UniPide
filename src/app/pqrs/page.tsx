'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BusinessItem } from '@/types';
import { formatShortDate } from '@/lib/utils';
import {
 FileText,
 AlertTriangle,
 HelpCircle,
 MessageSquare,
 CheckCircle2,
 Clock,
 Plus,
 Send,
 Loader2,
 Store,
 Check,
 ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

interface PQRSItem {
 id: string;
 tipo: 'QUEJA' | 'RECLAMO' | 'PETICION' | 'SUGERENCIA';
 asunto: string;
 mensaje: string;
 respuesta?: string | null;
 estado: 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO';
 fechaCreacion: string | Date;
 fechaRespuesta?: string | Date | null;
 business?: {
 id: string;
 nombre: string;
 logo?: string | null;
 } | null;
}

export default function PQRSPage() {
 const { user } = useAuth();
 const [pqrsList, setPqrsList] = useState<PQRSItem[]>([]);
 const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
 const [loading, setLoading] = useState(true);

 // Modal / Form State
 const [modalOpen, setModalOpen] = useState(false);
 const [tipo, setTipo] = useState<'QUEJA' | 'RECLAMO' | 'PETICION' | 'SUGERENCIA'>('QUEJA');
 const [businessId, setBusinessId] = useState('');
 const [asunto, setAsunto] = useState('');
 const [mensaje, setMensaje] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState('');
 const [successMsg, setSuccessMsg] = useState('');

 const fetchData = async () => {
 try {
 setLoading(true);
 const [resPqrs, resBiz] = await Promise.all([
 fetch('/api/pqrs'),
 fetch('/api/businesses'),
 ]);

 if (resPqrs.ok) {
 const dPqrs = await resPqrs.json();
 setPqrsList(dPqrs.pqrs || []);
 }
 if (resBiz.ok) {
 const dBiz = await resBiz.json();
 setBusinesses(dBiz.businesses || []);
 }
 } catch (err) {
 console.error('Error cargando datos de PQRS:', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 }, [user]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!user) {
 setError('Debes iniciar sesión para enviar un PQRS.');
 return;
 }

 setSubmitting(true);
 setError('');

 try {
 const res = await fetch('/api/pqrs', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 tipo,
 businessId: businessId || null,
 asunto,
 mensaje,
 }),
 });

 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || 'Error al radicar PQRS');
 }

 setModalOpen(false);
 setAsunto('');
 setMensaje('');
 setBusinessId('');
 setSuccessMsg('Tu PQRS ha sido radicado exitosamente. Recibirás respuesta pronto.');
 setTimeout(() => setSuccessMsg(''), 4000);
 fetchData();
 } catch (err: any) {
 setError(err.message || 'Error al radicar PQRS');
 } finally {
 setSubmitting(false);
 }
 };

 return (
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
 {/* Encabezado */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <span className="text-[11px] font-bold text-uninorte-red uppercase tracking-wider">
 Atención al Estudiante & Usuario
 </span>
 <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
 Portal de PQRS (Peticiones, Quejas, Reclamos & Sugerencias)
 </h1>
 <p className="text-xs text-gray-500 mt-1">
 Envía comentarios a la plataforma o directamente a los emprendimientos del campus Uninorte
 </p>
 </div>

 <button
 onClick={() => {
 setError('');
 setModalOpen(true);
 }}
 className="inline-flex items-center gap-2 px-4 py-2.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-2xl shadow-md transition self-start sm:self-auto"
 >
 <Plus className="w-4 h-4" />
 <span>Radicar Nuevo PQRS</span>
 </button>
 </div>

 {successMsg && (
 <div className="p-4 bg-emerald-50 text-emerald-700 text-xs rounded-2xl font-bold flex items-center gap-2 border border-emerald-200">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
 <span>{successMsg}</span>
 </div>
 )}

 {/* Lista de PQRS radicados */}
 <div className="space-y-4">
 <h2 className="text-base font-black text-gray-900">Mis Solicitudes & PQRS Radicados</h2>

 {loading ? (
 <div className="space-y-3">
 {[1, 2, 3].map((n) => (
 <div key={n} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100" />
 ))}
 </div>
 ) : pqrsList.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
 <FileText className="w-12 h-12 text-gray-300 mx-auto" />
 <h3 className="font-bold text-gray-800 text-sm">No has radicado ninguna solicitud de PQRS</h3>
 <p className="text-xs text-gray-500 max-w-sm mx-auto">
 Si tienes algún inconveniente con un pedido, negocio o sugerencia para la plataforma, radícala aquí.
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {pqrsList.map((item) => (
 <div
 key={item.id}
 className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3"
 >
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-2">
 <span
 className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
 item.tipo === 'QUEJA'
 ? 'bg-red-100 text-red-700'
 : item.tipo === 'RECLAMO'
 ? 'bg-amber-100 text-amber-800'
 : item.tipo === 'PETICION'
 ? 'bg-blue-100 text-blue-800'
 : 'bg-emerald-100 text-emerald-800'
 }`}
 >
 {item.tipo}
 </span>
 {item.business && (
 <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
 <Store className="w-3 h-3 text-uninorte-red" />
 <span>{item.business.nombre}</span>
 </span>
 )}
 </div>

 <span
 className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
 item.estado === 'RESUELTO'
 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
 : 'bg-amber-50 text-amber-700 border border-amber-200'
 }`}
 >
 {item.estado === 'RESUELTO' ? ' Resuelto' : ' En revisión'}
 </span>
 </div>

 <div>
 <h4 className="font-bold text-gray-900 text-sm">{item.asunto}</h4>
 <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.mensaje}</p>
 <span className="text-[10px] text-gray-400 block mt-1">
 Radicado el {formatShortDate(item.fechaCreacion)}
 </span>
 </div>

 {/* Respuesta oficial */}
 {item.respuesta ? (
 <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 space-y-1">
 <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block">
 Respuesta Oficial:
 </span>
 <p className="text-xs text-emerald-950 font-medium">{item.respuesta}</p>
 {item.fechaRespuesta && (
 <span className="text-[9px] text-emerald-700 block">
 Respondido el {formatShortDate(item.fechaRespuesta)}
 </span>
 )}
 </div>
 ) : (
 <p className="text-[11px] text-gray-400 italic bg-gray-50 p-2 rounded-xl">
 Pendiente de respuesta del equipo o emprendimiento.
 </p>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Modal para Radicar PQRS */}
 {modalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
 <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
 <h3 className="text-base font-black text-gray-900">Radicar Nuevo PQRS</h3>
 <button
 onClick={() => setModalOpen(false)}
 className="p-1 text-gray-400 hover:text-gray-700"
 >
 
 </button>
 </div>

 {error && (
 <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4 text-xs">
 <div>
 <label className="block font-bold text-gray-700 mb-1">Tipo de Solicitud *</label>
 <div className="grid grid-cols-2 gap-2">
 {[
 { id: 'QUEJA', label: 'Queja', desc: 'Inconformidad con un servicio/producto' },
 { id: 'RECLAMO', label: 'Reclamo', desc: 'Incumplimiento o cobro/entrega' },
 { id: 'PETICION', label: 'Petición', desc: 'Solicitud de información o ajuste' },
 { id: 'SUGERENCIA', label: 'Sugerencia', desc: 'Idea para mejorar la plataforma' },
 ].map((t) => (
 <button
 key={t.id}
 type="button"
 onClick={() => setTipo(t.id as any)}
 className={`p-2.5 rounded-xl border text-left transition ${
 tipo === t.id
 ? 'border-uninorte-red bg-red-50/60 ring-1 ring-uninorte-red'
 : 'border-gray-200 bg-white hover:bg-gray-50'
 }`}
 >
 <span className="font-bold text-gray-900 block">{t.label}</span>
 <span className="text-[10px] text-gray-400 leading-tight block">{t.desc}</span>
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Emprendimiento Dirigido (Opcional)
 </label>
 <select
 value={businessId}
 onChange={(e) => setBusinessId(e.target.value)}
 className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none bg-white font-medium text-gray-800"
 >
 <option value="">Plataforma General UniPide</option>
 {businesses.map((b) => (
 <option key={b.id} value={b.id}>
 {b.nombre}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">Asunto *</label>
 <input
 type="text"
 required
 value={asunto}
 onChange={(e) => setAsunto(e.target.value)}
 placeholder="Ej: Inconveniente con pedido #ORD-1092 / Sugerencia de categoría"
 className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
 />
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">Mensaje / Detalle *</label>
 <textarea
 rows={4}
 required
 value={mensaje}
 onChange={(e) => setMensaje(e.target.value)}
 placeholder="Explica detalladamente tu solicitud, queja o sugerencia..."
 className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
 />
 </div>

 <div className="flex gap-2 pt-2">
 <button
 type="button"
 onClick={() => setModalOpen(false)}
 className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={submitting}
 className="flex-1 py-2.5 font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md flex items-center justify-center gap-2"
 >
 {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
 <span>Enviar PQRS</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
