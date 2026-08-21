'use client';

import React, { useEffect, useState } from 'react';
import { OrderDetail } from '@/types';
import { formatPrice, formatShortDate } from '@/lib/utils';
import { MessageSquare, ShieldCheck, Search, Store, MapPin, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import OrderChatModal from '@/components/OrderChatModal';

export default function AdminPedidosPage() {
 const [orders, setOrders] = useState<OrderDetail[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState('TODOS');
 const [selectedChatOrder, setSelectedChatOrder] = useState<OrderDetail | null>(null);
 const [refreshing, setRefreshing] = useState(false);

 const fetchOrders = async (showRefresh = false) => {
 try {
 if (showRefresh) setRefreshing(true);
 const res = await fetch('/api/orders?all=true');
 if (res.ok) {
 const data = await res.json();
 setOrders(data.orders || []);
 }
 } catch (err) {
 console.error('Error cargando pedidos en admin:', err);
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 };

 useEffect(() => {
 fetchOrders();
 }, []);

 const filteredOrders = orders.filter((o) => {
 const matchesSearch =
 o.codigoPedido.toLowerCase().includes(search.toLowerCase()) ||
 (o.cliente?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
 (o.business?.nombre || '').toLowerCase().includes(search.toLowerCase());

 const matchesStatus = statusFilter === 'TODOS' || o.estado === statusFilter;
 return matchesSearch && matchesStatus;
 });

 return (
 <div className="space-y-6">
 {/* Encabezado */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
 <ShieldCheck className="w-5 h-5 text-purple-600" />
 <span>Auditoría Global de Pedidos & Chat en Vivo</span>
 </h2>
 <p className="text-xs text-gray-500">
 Supervisa todos los pedidos activos en el campus y audita las conversaciones en tiempo real
 </p>
 </div>

 <button
 onClick={() => fetchOrders(true)}
 disabled={refreshing}
 className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-2xl shadow-2xs transition self-start sm:self-auto"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-uninorte-red' : ''}`} />
 <span>{refreshing ? 'Refrescando...' : 'Refrescar Pedidos'}</span>
 </button>
 </div>

 {/* Filtros */}
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="relative flex-1 w-full">
 <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Buscar por código de pedido, estudiante o emprendimiento..."
 className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none bg-white"
 />
 </div>

 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="text-xs p-2.5 rounded-2xl border border-gray-200 bg-white font-bold outline-none focus:ring-2 focus:ring-uninorte-red w-full sm:w-auto"
 >
 <option value="TODOS">Todos los Estados</option>
 <option value="RECIBIDO">RECIBIDO</option>
 <option value="EN_PREPARACION">EN PREPARACIÓN</option>
 <option value="EN_CAMINO">EN CAMINO</option>
 <option value="ENTREGADO">ENTREGADO</option>
 <option value="CANCELADO">CANCELADO</option>
 </select>
 </div>

 {/* Lista de Pedidos en Admin */}
 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {[1, 2, 3, 4, 5, 6].map((n) => (
 <div key={n} className="h-44 bg-white rounded-3xl animate-pulse border border-gray-100" />
 ))}
 </div>
 ) : filteredOrders.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-6 space-y-3">
 <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
 <h3 className="font-bold text-gray-800 text-sm">No se encontraron pedidos</h3>
 <p className="text-xs text-gray-400">Intenta cambiar los filtros de búsqueda.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredOrders.map((order) => (
 <div
 key={order.id}
 className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between space-y-3"
 >
 <div className="space-y-2">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-xs font-black text-gray-900">{order.codigoPedido}</span>
 <p className="text-[10px] text-gray-400">{formatShortDate(order.fechaCreacion)}</p>
 </div>
 <span
 className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
 order.estado === 'RECIBIDO'
 ? 'bg-blue-100 text-blue-800'
 : order.estado === 'EN_PREPARACION'
 ? 'bg-amber-100 text-amber-800'
 : order.estado === 'EN_CAMINO'
 ? 'bg-emerald-100 text-emerald-800'
 : order.estado === 'ENTREGADO'
 ? 'bg-gray-100 text-gray-700'
 : 'bg-red-100 text-red-700'
 }`}
 >
 {order.estado}
 </span>
 </div>

 <div className="text-xs space-y-1 pt-1 border-t border-gray-100">
 <div className="flex items-center gap-1.5 font-bold text-gray-800">
 <Store className="w-3.5 h-3.5 text-uninorte-red shrink-0" />
 <span>{order.business?.nombre}</span>
 </div>

 <p className="text-gray-600">
 Estudiante: <span className="font-semibold text-gray-800">{order.cliente?.nombre}</span>
 </p>

 <p className="text-gray-500 text-[11px] flex items-center gap-1">
 <MapPin className="w-3 h-3 text-emerald-600" />
 <span>{order.zonaEntregaNombre} ({order.detalleUbicacion || 'Sin piso/salón'})</span>
 </p>

 {order.ubicacionRepartidorNombre && (
 <p className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
 Ubicación Reportada: {order.ubicacionRepartidorNombre}
 </p>
 )}
 </div>

 <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
 {order.items.map((it) => (
 <div key={it.id} className="text-[11px]">
 <div className="flex justify-between">
 <span>{it.cantidad}x {it.nombreProducto}</span>
 <span className="font-semibold">{formatPrice(it.precioUnitario * it.cantidad)}</span>
 </div>
 {it.opcionesSeleccionadas && (
 <span className="text-[9px] font-bold text-uninorte-red bg-red-50 px-1 py-0.2 rounded-md block mt-0.5">
 {it.opcionesSeleccionadas}
 </span>
 )}
 </div>
 ))}
 </div>
 </div>

 <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
 <span className="text-sm font-black text-uninorte-red">{formatPrice(order.total)}</span>

 <button
 onClick={() => setSelectedChatOrder(order)}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
 >
 <MessageSquare className="w-3.5 h-3.5" />
 <span>Auditar Chat</span>
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Modal de Chat Auditoría Admin */}
 {selectedChatOrder && (
 <OrderChatModal
 orderId={selectedChatOrder.id}
 codigoPedido={selectedChatOrder.codigoPedido}
 businessNombre={selectedChatOrder.business?.nombre}
 isOpen={Boolean(selectedChatOrder)}
 onClose={() => setSelectedChatOrder(null)}
 isAdminAuditor={true}
 />
 )}
 </div>
 );
}
