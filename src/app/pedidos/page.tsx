'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OrderDetail } from '@/types';
import { formatPrice, formatShortDate } from '@/lib/utils';
import {
 Clock,
 Store,
 ChevronRight,
 ShoppingBag,
 CheckCircle2,
 Bike,
 ChefHat,
 XCircle,
 Star,
} from 'lucide-react';
import RatingModal from '@/components/RatingModal';

export default function MisPedidosPage() {
 const { user, loading: authLoading } = useAuth();
 const router = useRouter();

 const [orders, setOrders] = useState<OrderDetail[]>([]);
 const [loading, setLoading] = useState(true);
 const [ratingOrder, setRatingOrder] = useState<OrderDetail | null>(null);

 const fetchOrders = async () => {
 try {
 setLoading(true);
 const res = await fetch('/api/orders');
 if (res.ok) {
 const data = await res.json();
 setOrders(data.orders || []);
 }
 } catch (err) {
 console.error('Error cargando pedidos:', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (!authLoading && !user) {
 router.push('/login');
 return;
 }
 if (user) {
 fetchOrders();
 }
 }, [user, authLoading]);

 const getStatusBadge = (estado: string) => {
 switch (estado) {
 case 'RECIBIDO':
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
 <Clock className="w-3 h-3" />
 Recibido
 </span>
 );
 case 'EN_PREPARACION':
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
 <ChefHat className="w-3 h-3" />
 En Preparación
 </span>
 );
 case 'EN_CAMINO':
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
 <Bike className="w-3 h-3" />
 En Camino
 </span>
 );
 case 'ENTREGADO':
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
 <CheckCircle2 className="w-3 h-3" />
 Entregado
 </span>
 );
 case 'CANCELADO':
 return (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
 <XCircle className="w-3 h-3" />
 Cancelado
 </span>
 );
 default:
 return null;
 }
 };

 return (
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
 {/* Encabezado */}
 <div>
 <span className="text-[11px] font-bold text-uninorte-red uppercase tracking-wider">
 Tus compras
 </span>
 <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
 Mis Pedidos Universitarios
 </h1>
 <p className="text-xs text-gray-500 mt-1">
 Revisa el estado de entrega en tiempo real y el historial de tus pedidos
 </p>
 </div>

 {loading ? (
 <div className="space-y-4">
 {[1, 2, 3].map((n) => (
 <div key={n} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100" />
 ))}
 </div>
 ) : orders.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
 <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
 <h3 className="font-bold text-gray-800 text-base">Aún no has realizado pedidos</h3>
 <p className="text-xs text-gray-500 max-w-sm mx-auto">
 Explora las delicias y productos creados por los emprendedores de Uninorte.
 </p>
 <Link
 href="/negocios"
 className="inline-flex items-center gap-2 px-6 py-2.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-2xl shadow-md transition"
 >
 <span>Ver Emprendimientos</span>
 </Link>
 </div>
 ) : (
 <div className="space-y-4">
 {orders.map((order) => (
 <div
 key={order.id}
 className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition space-y-4"
 >
 {/* Header de la tarjeta */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-red-50 text-uninorte-red flex items-center justify-center font-black text-xs">
 {order.codigoPedido}
 </div>
 <div>
 <h3 className="font-black text-gray-900 text-sm sm:text-base">
 {order.business?.nombre || 'Emprendimiento Uninorte'}
 </h3>
 <p className="text-[11px] text-gray-400">
 {formatShortDate(order.fechaCreacion)} • Entregar en {order.zonaEntregaNombre}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3 self-end sm:self-center">
 {getStatusBadge(order.estado)}
 </div>
 </div>

 {/* Items */}
 <div className="text-xs text-gray-600 space-y-1">
 {order.items.map((item) => (
 <div key={item.id} className="flex justify-between">
 <span>
 {item.cantidad}x {item.nombreProducto}
 </span>
 <span className="font-semibold text-gray-900">
 {formatPrice(item.precioUnitario * item.cantidad)}
 </span>
 </div>
 ))}
 </div>

 {/* Footer con Total y Acciones */}
 <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-baseline gap-2">
 <span className="text-xs text-gray-500 font-medium">Total Pagado:</span>
 <span className="text-base font-black text-gray-900">{formatPrice(order.total)}</span>
 </div>

 <div className="flex items-center gap-2">
 {order.estado === 'ENTREGADO' && !order.rating && (
 <button
 onClick={() => setRatingOrder(order)}
 className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 transition flex items-center gap-1.5"
 >
 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
 <span>Calificar Pedido</span>
 </button>
 )}

 {order.rating && (
 <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1">
 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
 Calificado ({order.rating.puntuacion})
 </span>
 )}

 <Link
 href={`/pedidos/${order.id}`}
 className="px-4 py-2 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
 >
 <span>Seguimiento en Vivo</span>
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Modal de Calificación */}
 {ratingOrder && (
 <RatingModal
 isOpen={true}
 orderId={ratingOrder.id}
 businessId={ratingOrder.businessId}
 businessNombre={ratingOrder.business?.nombre || 'Emprendimiento'}
 onClose={() => setRatingOrder(null)}
 onSuccess={() => {
 fetchOrders();
 setRatingOrder(null);
 }}
 />
 )}
 </div>
 );
}
