'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OrderDetail } from '@/types';
import { formatPrice, formatShortDate } from '@/lib/utils';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import RatingModal from '@/components/RatingModal';
import OrderChatModal from '@/components/OrderChatModal';
import {
 Clock,
 Store,
 MapPin,
 CreditCard,
 Star,
 ChevronLeft,
 Phone,
 RefreshCw,
 Sparkles,
 MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

export default function OrderTrackingPage() {
 const params = useParams();
 const router = useRouter();
 const orderId = params.id as string;
 const { user } = useAuth();

 const [order, setOrder] = useState<OrderDetail | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [ratingModalOpen, setRatingModalOpen] = useState(false);
 const [chatOpen, setChatOpen] = useState(false);
 const [refreshing, setRefreshing] = useState(false);

 const fetchOrder = async (showLoading = true) => {
 try {
 if (showLoading) setRefreshing(true);
 const res = await fetch(`/api/orders/${orderId}`);
 if (!res.ok) {
 throw new Error('No se pudo encontrar el pedido');
 }
 const data = await res.json();
 setOrder(data.order);
 } catch (err: any) {
 setError(err.message || 'Error cargando información del pedido');
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 };

 useEffect(() => {
 fetchOrder(false);

 // Polling cada 5 segundos para actualizar estado en vivo
 const interval = setInterval(() => {
 fetchOrder(false);
 }, 5000);

 return () => clearInterval(interval);
 }, [orderId]);

 if (loading) {
 return (
 <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
 <div className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100" />
 <div className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
 </div>
 );
 }

 if (error || !order) {
 return (
 <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
 <h2 className="text-xl font-bold text-gray-800">Pedido no encontrado</h2>
 <p className="text-xs text-gray-500">{error || 'Verifica el enlace del pedido.'}</p>
 <Link
 href="/pedidos"
 className="inline-flex items-center gap-1 text-xs font-bold text-uninorte-red hover:underline"
 >
 <ChevronLeft className="w-4 h-4" />
 <span>Volver a mis pedidos</span>
 </Link>
 </div>
 );
 }

 return (
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
 {/* Encabezado */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <Link
 href="/pedidos"
 className="p-2 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:text-uninorte-red hover:bg-red-50 transition"
 >
 <ChevronLeft className="w-5 h-5" />
 </Link>
 <div>
 <div className="flex items-center gap-2">
 <h1 className="text-xl sm:text-2xl font-black text-gray-900">
 Pedido {order.codigoPedido}
 </h1>
 <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
 {formatShortDate(order.fechaCreacion)}
 </span>
 </div>
 <p className="text-xs text-gray-500">
 Seguimiento en vivo dentro del campus de la Universidad del Norte
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 self-start sm:self-auto">
 <button
 onClick={() => setChatOpen(true)}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl transition shadow-xs"
 >
 <MessageSquare className="w-3.5 h-3.5" />
 <span>Chat con Vendedor</span>
 </button>

 <button
 onClick={() => fetchOrder(true)}
 disabled={refreshing}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition shadow-2xs"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-uninorte-red' : ''}`} />
 <span>{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
 </button>
 </div>
 </div>

 {/* Tracker Visual de Estados */}
 <OrderStatusTracker
 status={order.estado}
 tiempoEstimadoMin={order.tiempoEstimadoMin}
 />

 {/* Banner de Calificación si está ENTREGADO */}
 {order.estado === 'ENTREGADO' && !order.rating && (
 <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
 <Star className="w-6 h-6 fill-white text-white" />
 </div>
 <div>
 <h3 className="font-bold text-sm">¡Tu pedido fue entregado con éxito!</h3>
 <p className="text-xs text-amber-100">
 ¿Qué te pareció la comida y la atención de {order.business?.nombre}?
 </p>
 </div>
 </div>

 <button
 onClick={() => setRatingModalOpen(true)}
 className="px-5 py-2.5 bg-white text-amber-800 text-xs font-bold rounded-2xl shadow-sm hover:bg-amber-50 transition shrink-0"
 >
 Calificar Emprendimiento
 </button>
 </div>
 )}

 {/* Si ya está calificado */}
 {order.rating && (
 <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
 <span className="font-bold text-amber-900">
 Calificaste este pedido con {order.rating.puntuacion} de 5 estrellas
 </span>
 </div>
 {order.rating.comentario && (
 <span className="text-gray-500 italic">"{order.rating.comentario}"</span>
 )}
 </div>
 )}

 {/* Detalles del Pedido y Entrega en Campus */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Info del Emprendimiento */}
 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
 <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
 <div className="p-2 bg-red-100 text-uninorte-red rounded-xl">
 <Store className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-gray-900 text-sm">Emprendimiento</h3>
 <p className="text-xs text-gray-500">{order.business?.nombre}</p>
 </div>
 </div>

 <div className="space-y-2 text-xs text-gray-600">
 <div className="flex items-start gap-2">
 <MapPin className="w-4 h-4 text-uninorte-red shrink-0 mt-0.5" />
 <div>
 <span className="font-semibold text-gray-800">Ubicación del Negocio:</span>
 <p className="text-gray-500">{order.business?.ubicacionCampus}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Info de Destino en Campus */}
 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
 <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
 <MapPin className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-gray-900 text-sm">Lugar de Entrega en Campus</h3>
 <p className="text-xs text-gray-500">{order.zonaEntregaNombre}</p>
 </div>
 </div>

 <div className="space-y-2 text-xs text-gray-600">
 <div>
 <span className="font-semibold text-gray-800">Detalle de ubicación:</span>
 <p className="text-gray-700 bg-gray-50 p-2 rounded-xl mt-1">
 {order.detalleUbicacion || 'Sin detalles adicionales'}
 </p>
 </div>

 {order.instrucciones && (
 <div>
 <span className="font-semibold text-gray-800">Instrucciones:</span>
 <p className="text-gray-500 italic mt-0.5">"{order.instrucciones}"</p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Lista de Productos del Pedido */}
 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
 <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
 Resumen de Productos Comprados
 </h3>

 <div className="divide-y divide-gray-100">
 {order.items.map((item) => (
 <div key={item.id} className="py-3 flex items-center justify-between text-xs">
 <div className="flex items-center gap-3">
 {item.product?.foto && (
 <img
 src={item.product.foto}
 alt={item.nombreProducto}
 className="w-10 h-10 rounded-xl object-cover"
 />
 )}
 <div>
 <p className="font-bold text-gray-900">
 {item.cantidad}x {item.nombreProducto}
 </p>
 {item.opcionesSeleccionadas && (
 <p className="text-[10px] font-bold text-uninorte-red bg-red-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
 {item.opcionesSeleccionadas}
 </p>
 )}
 {item.notas && (
 <p className="text-[11px] text-gray-400 italic">Nota: {item.notas}</p>
 )}
 </div>
 </div>
 <span className="font-extrabold text-gray-900">
 {formatPrice(item.precioUnitario * item.cantidad)}
 </span>
 </div>
 ))}
 </div>

 {/* Total */}
 <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
 <div className="flex items-center gap-2 text-xs text-gray-500">
 <CreditCard className="w-4 h-4" />
 <span>Método: {order.metodoPago}</span>
 </div>
 <div className="text-right">
 <span className="text-xs text-gray-500 block">Total Pagado</span>
 <span className="text-lg font-black text-uninorte-red">{formatPrice(order.total)}</span>
 </div>
 </div>
 </div>

 {/* Modal de Calificación */}
 <RatingModal
 isOpen={ratingModalOpen}
 orderId={order.id}
 businessId={order.businessId}
 businessNombre={order.business?.nombre || 'Emprendimiento'}
 onClose={() => setRatingModalOpen(false)}
 onSuccess={() => {
 fetchOrder(true);
 setRatingModalOpen(false);
 }}
 />

 {/* Modal de Chat en Vivo */}
 <OrderChatModal
 orderId={order.id}
 codigoPedido={order.codigoPedido}
 businessNombre={order.business?.nombre}
 isOpen={chatOpen}
 onClose={() => setChatOpen(false)}
 />
 </div>
 );
}
