'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatShortDate } from '@/lib/utils';
import { FileText, Send, CheckCircle2, MessageSquare, Loader2, User, RefreshCw, Check } from 'lucide-react';

interface PQRSItem {
 id: string;
 tipo: 'QUEJA' | 'RECLAMO' | 'PETICION' | 'SUGERENCIA';
 asunto: string;
 mensaje: string;
 respuesta?: string | null;
 estado: 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO';
 fechaCreacion: string | Date;
 fechaRespuesta?: string | Date | null;
 usuario?: {
 nombre: string;
 correo: string;
 };
}

export default function EmprendedorPQRSPage() {
 const { user } = useAuth();
 const [pqrsList, setPqrsList] = useState<PQRSItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);

 // Modal Respuesta
 const [selectedPqrs, setSelectedPqrs] = useState<PQRSItem | null>(null);
 const [respuestaText, setRespuestaText] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState('');

 const fetchPQRS = async (showRefresh = false) => {
 try {
 if (showRefresh) setRefreshing(true);
 const res = await fetch('/api/pqrs');
 if (res.ok) {
 const data = await res.json();
 setPqrsList(data.pqrs || []);
 }
 } catch (err) {
 console.error('Error cargando PQRS:', err);
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 };

 useEffect(() => {
 if (user?.businessId) {
 fetchPQRS();
 }
 }, [user]);

 const handleSendResponse = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedPqrs || !respuestaText.trim()) return;

 setSubmitting(true);
 setError('');

 try {
 const res = await fetch(`/api/pqrs/${selectedPqrs.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ respuesta: respuestaText }),
 });

 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || 'Error respondiendo PQRS');
 }

 setSelectedPqrs(null);
 setRespuestaText('');
 fetchPQRS(false);
 } catch (err: any) {
 setError(err.message || 'Error al enviar respuesta');
 } finally {
 setSubmitting(false);
 }
 };

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
 <FileText className="w-5 h-5 text-uninorte-red" />
 <span>Gestión de PQRS Recibidas</span>
 </h2>
 <p className="text-xs text-gray-500">
 Responde a las sugerencias, peticiones y reclamos radicados por los estudiantes para tu emprendimiento
 </p>
 </div>

 <button
 onClick={() => fetchPQRS(true)}
 disabled={refreshing}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-2xl shadow-2xs transition self-start sm:self-auto"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-uninorte-red' : ''}`} />
 <span>{refreshing ? 'Actualizando...' : 'Refrescar Lista'}</span>
 </button>
 </div>

 {/* Lista de PQRS */}
 {loading ? (
 <div className="space-y-3">
 {[1, 2, 3].map((n) => (
 <div key={n} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100" />
 ))}
 </div>
 ) : pqrsList.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
 <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
 <h3 className="font-bold text-gray-800 text-sm">No tienes PQRS pendientes</h3>
 <p className="text-xs text-gray-500 max-w-sm mx-auto">
 ¡Excelente trabajo! No hay quejas ni sugerencias pendientes para tu negocio.
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
 <span className="text-xs font-semibold text-gray-500">
 Estudiante: <strong className="text-gray-800">{item.usuario?.nombre}</strong>
 </span>
 </div>

 <span
 className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
 item.estado === 'RESUELTO'
 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
 : 'bg-amber-50 text-amber-700 border border-amber-200'
 }`}
 >
 {item.estado === 'RESUELTO' ? ' Resuelto' : ' Pendiente de Respuesta'}
 </span>
 </div>

 <div>
 <h4 className="font-bold text-gray-900 text-sm">{item.asunto}</h4>
 <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.mensaje}</p>
 <span className="text-[10px] text-gray-400 block mt-1">
 Recibido el {formatShortDate(item.fechaCreacion)}
 </span>
 </div>

 {item.respuesta ? (
 <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
 <span className="text-[10px] font-black text-emerald-900 uppercase">Tu Respuesta:</span>
 <p className="text-xs text-emerald-950 font-medium">{item.respuesta}</p>
 </div>
 ) : (
 <div className="pt-2">
 <button
 onClick={() => {
 setSelectedPqrs(item);
 setRespuestaText('');
 setError('');
 }}
 className="inline-flex items-center gap-1.5 px-4 py-2 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-xl shadow-xs transition"
 >
 <MessageSquare className="w-3.5 h-3.5" />
 <span>Responder Oficialmente</span>
 </button>
 </div>
 )}
 </div>
 ))}
 </div>
 )}

 {/* Modal para Responder PQRS */}
 {selectedPqrs && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
 <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 text-xs">
 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
 <h3 className="font-black text-gray-900 text-sm">Responder PQRS #{selectedPqrs.id.slice(-5)}</h3>
 <button onClick={() => setSelectedPqrs(null)} className="p-1 text-gray-400 hover:text-gray-700">
 
 </button>
 </div>

 {error && (
 <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
 {error}
 </div>
 )}

 <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1">
 <span className="font-bold text-gray-800">{selectedPqrs.asunto}</span>
 <p className="text-gray-600 text-[11px] leading-relaxed">{selectedPqrs.mensaje}</p>
 </div>

 <form onSubmit={handleSendResponse} className="space-y-4">
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Tu Respuesta Oficial para el Estudiante *
 </label>
 <textarea
 rows={4}
 required
 value={respuestaText}
 onChange={(e) => setRespuestaText(e.target.value)}
 placeholder="Escribe una respuesta clara y amable..."
 className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none text-xs"
 />
 </div>

 <div className="flex gap-2 pt-2">
 <button
 type="button"
 onClick={() => setSelectedPqrs(null)}
 className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={submitting}
 className="flex-1 py-2.5 font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md flex items-center justify-center gap-1.5"
 >
 {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
 <span>Enviar Respuesta</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
