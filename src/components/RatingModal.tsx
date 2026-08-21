'use client';

import React, { useState } from 'react';
import { Star, X, Check, Loader2 } from 'lucide-react';

interface RatingModalProps {
 orderId: string;
 businessId: string;
 businessNombre: string;
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
}

export default function RatingModal({
 orderId,
 businessId,
 businessNombre,
 isOpen,
 onClose,
 onSuccess,
}: RatingModalProps) {
 const [puntuacion, setPuntuacion] = useState(5);
 const [hoverRating, setHoverRating] = useState(0);
 const [comentario, setComentario] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 if (!isOpen) return null;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
 const res = await fetch('/api/ratings', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 orderId,
 businessId,
 puntuacion,
 comentario,
 }),
 });

 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || 'Error al enviar calificación');
 }

 onSuccess();
 onClose();
 } catch (err: any) {
 setError(err.message || 'Error al enviar calificación');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
 <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
 <button
 onClick={onClose}
 className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="text-center space-y-1">
 <span className="text-[11px] font-bold uppercase tracking-wider text-uninorte-red">
 Calificar experiencia
 </span>
 <h3 className="text-lg font-black text-gray-900">
 ¿Qué te pareció tu pedido de {businessNombre}?
 </h3>
 <p className="text-xs text-gray-500">
 Tu opinión ayuda a los emprendedores de Uninorte a seguir mejorando.
 </p>
 </div>

 {error && (
 <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Estrellas */}
 <div className="flex justify-center items-center gap-2 py-2">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 type="button"
 key={star}
 onClick={() => setPuntuacion(star)}
 onMouseEnter={() => setHoverRating(star)}
 onMouseLeave={() => setHoverRating(0)}
 className="p-1.5 transition transform hover:scale-110 focus:outline-none"
 >
 <Star
 className={`w-8 h-8 ${
 (hoverRating || puntuacion) >= star
 ? 'fill-amber-400 text-amber-400'
 : 'text-gray-300'
 }`}
 />
 </button>
 ))}
 </div>

 <div className="text-center text-xs font-bold text-gray-700">
 {puntuacion === 5 && '¡Excelente! Me encantó '}
 {puntuacion === 4 && 'Muy bueno '}
 {puntuacion === 3 && 'Aceptable '}
 {puntuacion === 2 && 'Podría mejorar '}
 {puntuacion === 1 && 'Mala experiencia '}
 </div>

 {/* Comentario */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Comentario opcional:
 </label>
 <textarea
 rows={3}
 value={comentario}
 onChange={(e) => setComentario(e.target.value)}
 placeholder="¿Qué tal estuvo la comida, el tiempo de entrega o la atención?"
 className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
 />
 </div>

 <div className="flex gap-2 pt-2">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={loading}
 className="flex-1 py-2.5 text-xs font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
 >
 {loading ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 <span>Enviando...</span>
 </>
 ) : (
 <>
 <Check className="w-4 h-4" />
 <span>Publicar Calificación</span>
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
