'use client';

import React, { useEffect, useState } from 'react';
import { Star, Trash2, Edit2, Search, Loader2, Check, X, MessageSquare, Store, User, Filter, AlertCircle } from 'lucide-react';
import { formatShortDate } from '@/lib/utils';

interface AdminRatingItem {
 id: string;
 puntuacion: number;
 comentario?: string | null;
 fechaCreacion: string;
 cliente?: { id: string; nombre: string; correo: string };
 business?: { id: string; nombre: string; logo?: string | null };
 order?: { id: string; codigoPedido: string };
}

export default function AdminResenasPage() {
 const [ratings, setRatings] = useState<AdminRatingItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [filterStar, setFilterStar] = useState<number | 'ALL'>('ALL');

 // Modal de Edición
 const [editingItem, setEditingItem] = useState<AdminRatingItem | null>(null);
 const [editScore, setEditScore] = useState(5);
 const [editComment, setEditComment] = useState('');
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState('');
 const [successMsg, setSuccessMsg] = useState('');

 const fetchRatings = async () => {
 try {
 setLoading(true);
 const res = await fetch('/api/admin/ratings');
 if (res.ok) {
 const data = await res.json();
 setRatings(data.ratings || []);
 }
 } catch (err) {
 console.error('Error cargando reseñas:', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchRatings();
 }, []);

 const handleDelete = async (id: string) => {
 if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta reseña?')) {
 return;
 }

 try {
 const res = await fetch(`/api/admin/ratings/${id}`, { method: 'DELETE' });
 if (res.ok) {
 setSuccessMsg('Reseña eliminada con éxito.');
 setTimeout(() => setSuccessMsg(''), 3000);
 fetchRatings();
 } else {
 alert('Error al eliminar la reseña');
 }
 } catch (err) {
 alert('Error de conexión');
 }
 };

 const openEditModal = (r: AdminRatingItem) => {
 setEditingItem(r);
 setEditScore(r.puntuacion);
 setEditComment(r.comentario || '');
 setError('');
 };

 const handleSaveEdit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!editingItem) return;
 setSaving(true);

 try {
 const res = await fetch(`/api/admin/ratings/${editingItem.id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 puntuacion: editScore,
 comentario: editComment,
 }),
 });

 if (res.ok) {
 setEditingItem(null);
 setSuccessMsg('Reseña modificada correctamente.');
 setTimeout(() => setSuccessMsg(''), 3000);
 fetchRatings();
 } else {
 const data = await res.json();
 setError(data.error || 'Error al modificar');
 }
 } catch (err) {
 setError('Error de conexión');
 } finally {
 setSaving(false);
 }
 };

 // Filtrado
 const filteredRatings = ratings.filter((r) => {
 const matchesSearch =
 (r.business?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
 (r.cliente?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
 (r.cliente?.correo || '').toLowerCase().includes(search.toLowerCase()) ||
 (r.comentario || '').toLowerCase().includes(search.toLowerCase());

 const matchesStar = filterStar === 'ALL' || r.puntuacion === filterStar;

 return matchesSearch && matchesStar;
 });

 return (
 <div className="space-y-6">
 {/* Encabezado */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-gray-900 tracking-tight">
 Administración & Moderación de Reseñas
 </h2>
 <p className="text-xs text-gray-500">
 Modera, edita o elimina comentarios y calificaciones de cualquier cliente en la plataforma
 </p>
 </div>
 </div>

 {successMsg && (
 <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs rounded-2xl font-bold flex items-center gap-2">
 <Check className="w-4 h-4 text-emerald-600" />
 <span>{successMsg}</span>
 </div>
 )}

 {/* Barra de Filtros y Búsqueda */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative flex-1 w-full">
 <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Buscar por cliente, emprendimiento o comentario..."
 className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none bg-white"
 />
 </div>

 <div className="flex items-center gap-1 w-full sm:w-auto">
 <Filter className="w-3.5 h-3.5 text-gray-400" />
 <select
 value={filterStar}
 onChange={(e) => setFilterStar(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
 className="text-xs p-2.5 rounded-2xl border border-gray-200 bg-white font-medium outline-none focus:ring-2 focus:ring-uninorte-red w-full sm:w-auto"
 >
 <option value="ALL">Todas las estrellas</option>
 <option value={5}> 5 Estrellas</option>
 <option value={4}> 4 Estrellas</option>
 <option value={3}> 3 Estrellas</option>
 <option value={2}> 2 Estrellas</option>
 <option value={1}> 1 Estrella</option>
 </select>
 </div>
 </div>

 {/* Lista de Reseñas */}
 {loading ? (
 <div className="space-y-3">
 {[1, 2, 3].map((n) => (
 <div key={n} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-100" />
 ))}
 </div>
 ) : filteredRatings.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-6 space-y-3">
 <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
 <h3 className="font-bold text-gray-800 text-sm">No se encontraron reseñas</h3>
 <p className="text-xs text-gray-400">Prueba con otro filtro de búsqueda.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {filteredRatings.map((r) => (
 <div
 key={r.id}
 className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-200 transition"
 >
 <div className="space-y-2 min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
 <span className="font-black text-amber-900 text-xs">{r.puntuacion}.0</span>
 </div>

 <div className="flex items-center gap-1.5 text-xs text-gray-800 font-bold">
 <Store className="w-3.5 h-3.5 text-uninorte-red" />
 <span>{r.business?.nombre || 'Emprendimiento'}</span>
 </div>

 <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
 {formatShortDate(r.fechaCreacion)}
 </span>
 </div>

 <div className="text-xs text-gray-700 space-y-0.5">
 <div className="flex items-center gap-1 text-[11px] text-gray-500">
 <User className="w-3 h-3 text-gray-400" />
 <span>
 Cliente: <strong>{r.cliente?.nombre}</strong> ({r.cliente?.correo})
 </span>
 </div>
 {r.comentario ? (
 <p className="text-gray-800 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
 "{r.comentario}"
 </p>
 ) : (
 <p className="text-gray-400 text-[11px] italic">Sin comentario escrito</p>
 )}
 </div>
 </div>

 {/* Botones Moderar */}
 <div className="flex items-center gap-2 shrink-0">
 <button
 onClick={() => openEditModal(r)}
 className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
 >
 <Edit2 className="w-3.5 h-3.5 text-uninorte-red" />
 <span>Editar</span>
 </button>

 <button
 onClick={() => handleDelete(r.id)}
 className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
 >
 <Trash2 className="w-3.5 h-3.5" />
 <span>Eliminar</span>
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Modal de Edición de Reseña */}
 {editingItem && (
 <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
 <h3 className="font-black text-gray-900 text-sm">Editar Reseña de Cliente</h3>
 <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">
 <X className="w-5 h-5" />
 </button>
 </div>

 {error && (
 <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-1">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
 <div>
 <label className="block font-bold text-gray-700 mb-1.5">Puntuación de Estrellas (1 - 5)</label>
 <div className="flex items-center gap-2">
 {[1, 2, 3, 4, 5].map((num) => (
 <button
 key={num}
 type="button"
 onClick={() => setEditScore(num)}
 className={`p-2 rounded-xl border text-sm font-bold flex items-center gap-1 transition ${
 editScore === num
 ? 'bg-amber-500 text-white border-amber-500'
 : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
 }`}
 >
 <Star className={`w-4 h-4 ${editScore === num ? 'fill-white' : 'fill-amber-400'}`} />
 <span>{num}</span>
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">Comentario</label>
 <textarea
 rows={3}
 value={editComment}
 onChange={(e) => setEditComment(e.target.value)}
 placeholder="Escribe o edita el comentario de la reseña..."
 className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
 />
 </div>

 <div className="flex gap-2 pt-2">
 <button
 type="button"
 onClick={() => setEditingItem(null)}
 className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={saving}
 className="flex-1 py-2.5 font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md flex items-center justify-center gap-1.5"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
 <span>Guardar Cambios</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
