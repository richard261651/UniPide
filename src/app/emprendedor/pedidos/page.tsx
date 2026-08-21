'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { OrderDetail, OrderStatus, CampusZoneItem } from '@/types';
import { formatPrice, formatShortDate } from '@/lib/utils';
import {
 ShoppingBag,
 Clock,
 ChefHat,
 Bike,
 PackageCheck,
 Phone,
 MapPin,
 RefreshCw,
 MessageSquare,
 CheckCircle,
 X,
 Compass,
} from 'lucide-react';
import OrderChatModal from '@/components/OrderChatModal';

export default function EmprendedorPedidosPage() {
 const { user } = useAuth();
 const [orders, setOrders] = useState<OrderDetail[]>([]);
 const [zones, setZones] = useState<CampusZoneItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [updatingId, setUpdatingId] = useState<string | null>(null);
 const [refreshing, setRefreshing] = useState(false);

 // Modal para Ubicación del Emprendedor al Aceptar Pedido
 const [acceptingOrder, setAcceptingOrder] = useState<OrderDetail | null>(null);
 const [selectedLocation, setSelectedLocation] = useState('Bloque F');

 // Modal de Chat
 const [activeChatOrder, setActiveChatOrder] = useState<OrderDetail | null>(null);

 const fetchOrders = async (showRefresh = false) => {
 try {
 if (showRefresh) setRefreshing(true);
 const res = await fetch(`/api/orders?businessId=${user?.businessId}`);
 if (res.ok) {
 const data = await res.json();
 setOrders(data.orders || []);
 }
 } catch (err) {
 console.error('Error cargando pedidos:', err);
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 };

 useEffect(() => {
 async function loadZones() {
 try {
 const res = await fetch('/api/zones');
 if (res.ok) {
 const data = await res.json();
 setZones(data.zones || []);
 if (data.zones && data.zones.length > 0) {
 setSelectedLocation(data.zones[0].nombre);
 }
 }
 } catch (err) {
 console.error('Error cargando zonas:', err);
 }
 }

 if (user?.businessId) {
 fetchOrders();
 loadZones();
 const interval = setInterval(() => fetchOrders(false), 4000);
 return () => clearInterval(interval);
 }
 }, [user]);

 const updateOrderStatus = async (orderId: string, nuevoEstado: OrderStatus, ubicacionNombre?: string) => {
 try {
 setUpdatingId(orderId);
 const res = await fetch(`/api/orders/${orderId}/status`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 estado: nuevoEstado,
 ...(ubicacionNombre && { ubicacionRepartidorNombre: ubicacionNombre }),
 }),
 });

 if (res.ok) {
 fetchOrders(false);
 }
 } catch (err) {
 console.error('Error actualizando pedido:', err);
 } finally {
 setUpdatingId(null);
 setAcceptingOrder(null);
 }
 };

 const handleConfirmAccept = () => {
 if (!acceptingOrder) return;
 updateOrderStatus(acceptingOrder.id, 'EN_PREPARACION', selectedLocation);
 };

 // Agrupar pedidos por estado
 const pedidosRecibidos = orders.filter((o) => o.estado === 'RECIBIDO');
 const pedidosPreparando = orders.filter((o) => o.estado === 'EN_PREPARACION');
 const pedidosEnCamino = orders.filter((o) => o.estado === 'EN_CAMINO');
 const pedidosEntregados = orders.filter((o) => o.estado === 'ENTREGADO');

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
 <span>Gestor de Pedidos en Vivo</span>
 <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
 </h2>
 <p className="text-xs text-gray-500">
 Acepta pedidos entrantes, reporta tu ubicación actual en el campus y chatea en tiempo real con los estudiantes
 </p>
 </div>

 <button
 onClick={() => fetchOrders(true)}
 disabled={refreshing}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-2xl shadow-2xs transition self-start sm:self-auto"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-uninorte-red' : ''}`} />
 <span>{refreshing ? 'Actualizando...' : 'Refrescar Tablero'}</span>
 </button>
 </div>

 {/* Tablero Kanban de Pedidos */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 {/* Columna 1: RECIBIDOS */}
 <div className="space-y-3">
 <div className="flex items-center justify-between bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-100">
 <div className="flex items-center gap-2 text-xs font-black text-blue-900">
 <Clock className="w-4 h-4 text-blue-600" />
 <span>Nuevos ({pedidosRecibidos.length})</span>
 </div>
 <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
 Paso 1
 </span>
 </div>

 <div className="space-y-3">
 {pedidosRecibidos.map((order) => (
 <div key={order.id} className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm space-y-3">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-xs font-black text-gray-900">{order.codigoPedido}</span>
 <p className="text-[10px] text-gray-400">{formatShortDate(order.fechaCreacion)}</p>
 </div>
 <span className="text-xs font-extrabold text-uninorte-red">{formatPrice(order.total)}</span>
 </div>

 <div className="text-xs space-y-1">
 <p className="font-semibold text-gray-800">Cliente: {order.cliente?.nombre}</p>
 <p className="text-gray-500 flex items-center gap-1 text-[11px]">
 <MapPin className="w-3.5 h-3.5 text-uninorte-red shrink-0" />
 <span>{order.zonaEntregaNombre}</span>
 </p>
 {order.detalleUbicacion && (
 <p className="text-gray-400 text-[10px] italic">"{order.detalleUbicacion}"</p>
 )}
 </div>

 <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-600">
 {order.items.map((it) => (
 <div key={it.id} className="text-[11px] pb-1 border-b border-gray-50 last:border-0">
 <div className="flex justify-between">
 <span>{it.cantidad}x {it.nombreProducto}</span>
 <span className="font-medium">{formatPrice(it.precioUnitario * it.cantidad)}</span>
 </div>
 {it.opcionesSeleccionadas && (
 <p className="text-[10px] font-bold text-uninorte-red bg-red-50 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
 {it.opcionesSeleccionadas}
 </p>
 )}
 </div>
 ))}
 </div>

 <div className="flex gap-2 pt-1">
 <button
 onClick={() => setActiveChatOrder(order)}
 className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
 title="Chat con estudiante"
 >
 <MessageSquare className="w-4 h-4" />
 </button>
 <button
 onClick={() => setAcceptingOrder(order)}
 disabled={updatingId === order.id}
 className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
 >
 <ChefHat className="w-3.5 h-3.5" />
 <span>Aceptar Pedido</span>
 </button>
 </div>
 </div>
 ))}
 {pedidosRecibidos.length === 0 && (
 <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
 No hay pedidos nuevos
 </div>
 )}
 </div>
 </div>

 {/* Columna 2: EN PREPARACIÓN / LISTO */}
 <div className="space-y-3">
 <div className="flex items-center justify-between bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-100">
 <div className="flex items-center gap-2 text-xs font-black text-amber-900">
 <ChefHat className="w-4 h-4 text-amber-600" />
 <span>Aceptados ({pedidosPreparando.length})</span>
 </div>
 <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
 Paso 2
 </span>
 </div>

 <div className="space-y-3">
 {pedidosPreparando.map((order) => (
 <div key={order.id} className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-3">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-xs font-black text-gray-900">{order.codigoPedido}</span>
 <p className="text-[10px] text-gray-400">{formatShortDate(order.fechaCreacion)}</p>
 </div>
 <span className="text-xs font-extrabold text-uninorte-red">{formatPrice(order.total)}</span>
 </div>

 <div className="text-xs space-y-1">
 <p className="font-semibold text-gray-800">Cliente: {order.cliente?.nombre}</p>
 <p className="text-gray-500 flex items-center gap-1 text-[11px]">
 <MapPin className="w-3.5 h-3.5 text-amber-600" />
 <span>{order.zonaEntregaNombre}</span>
 </p>
 {order.ubicacionRepartidorNombre && (
 <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
 Tu ubicación reportada: {order.ubicacionRepartidorNombre}
 </p>
 )}
 </div>

 <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-600">
 {order.items.map((it) => (
 <div key={it.id} className="text-[11px] pb-1 border-b border-gray-50 last:border-0">
 <div className="flex justify-between">
 <span>{it.cantidad}x {it.nombreProducto}</span>
 <span className="font-medium">{formatPrice(it.precioUnitario * it.cantidad)}</span>
 </div>
 {it.opcionesSeleccionadas && (
 <p className="text-[10px] font-bold text-uninorte-red bg-red-50 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
 {it.opcionesSeleccionadas}
 </p>
 )}
 </div>
 ))}
 </div>

 <div className="flex gap-2 pt-1">
 <button
 onClick={() => setActiveChatOrder(order)}
 className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
 title="Chat con estudiante"
 >
 <MessageSquare className="w-4 h-4 text-uninorte-red" />
 </button>
 <button
 onClick={() => updateOrderStatus(order.id, 'EN_CAMINO')}
 disabled={updatingId === order.id}
 className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
 >
 <Bike className="w-3.5 h-3.5" />
 <span>Salir a Entregar</span>
 </button>
 </div>
 </div>
 ))}
 {pedidosPreparando.length === 0 && (
 <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
 Sin pedidos aceptados
 </div>
 )}
 </div>
 </div>

 {/* Columna 3: EN CAMINO */}
 <div className="space-y-3">
 <div className="flex items-center justify-between bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-100">
 <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
 <Bike className="w-4 h-4 text-emerald-600" />
 <span>En Camino ({pedidosEnCamino.length})</span>
 </div>
 <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
 Paso 3
 </span>
 </div>

 <div className="space-y-3">
 {pedidosEnCamino.map((order) => (
 <div key={order.id} className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-sm space-y-3">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-xs font-black text-gray-900">{order.codigoPedido}</span>
 <p className="text-[10px] text-gray-400">{order.zonaEntregaNombre}</p>
 </div>
 <span className="text-xs font-extrabold text-uninorte-red">{formatPrice(order.total)}</span>
 </div>

 <div className="text-xs space-y-1">
 <p className="font-semibold text-gray-800">Entregar a: {order.cliente?.nombre}</p>
 <p className="text-gray-500 text-[11px]"> {order.detalleUbicacion || 'Campus'}</p>
 </div>

 <div className="flex gap-2 pt-1">
 <button
 onClick={() => setActiveChatOrder(order)}
 className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
 title="Chat con estudiante"
 >
 <MessageSquare className="w-4 h-4 text-uninorte-red" />
 </button>
 <button
 onClick={() => updateOrderStatus(order.id, 'ENTREGADO')}
 disabled={updatingId === order.id}
 className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
 >
 <PackageCheck className="w-3.5 h-3.5" />
 <span>Marcar Entregado</span>
 </button>
 </div>
 </div>
 ))}
 {pedidosEnCamino.length === 0 && (
 <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
 Ningún pedido en camino
 </div>
 )}
 </div>
 </div>

 {/* Columna 4: ENTREGADOS */}
 <div className="space-y-3">
 <div className="flex items-center justify-between bg-gray-100 px-4 py-2.5 rounded-2xl border border-gray-200">
 <div className="flex items-center gap-2 text-xs font-black text-gray-800">
 <CheckCircle className="w-4 h-4 text-gray-600" />
 <span>Entregados ({pedidosEntregados.length})</span>
 </div>
 <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
 Paso 4
 </span>
 </div>

 <div className="space-y-3">
 {pedidosEntregados.slice(0, 5).map((order) => (
 <div key={order.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2 opacity-80">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-xs font-bold text-gray-800">{order.codigoPedido}</span>
 <p className="text-[10px] text-gray-400">{formatShortDate(order.fechaCreacion)}</p>
 </div>
 <span className="text-xs font-bold text-gray-700">{formatPrice(order.total)}</span>
 </div>
 <p className="text-[11px] text-gray-500 truncate">
 {order.cliente?.nombre} • {order.zonaEntregaNombre}
 </p>
 </div>
 ))}
 {pedidosEntregados.length === 0 && (
 <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
 Sin pedidos completados
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Modal para Seleccionar Ubicación Actual al Aceptar Pedido */}
 {acceptingOrder && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
 <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-xs">
 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
 <h3 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
 <Compass className="w-4 h-4 text-uninorte-red" />
 <span>¿Dónde te encuentras ahora?</span>
 </h3>
 <button onClick={() => setAcceptingOrder(null)} className="p-1 text-gray-400 hover:text-gray-700">
 <X className="w-4 h-4" />
 </button>
 </div>

 <p className="text-gray-500 text-xs">
 Selecciona tu bloque o espacio actual en el campus para informar al estudiante y coordinar la entrega.
 </p>

 <div>
 <label className="block font-bold text-gray-700 mb-1.5">Bloque / Zona Actual en Campus *</label>
 <select
 value={selectedLocation}
 onChange={(e) => setSelectedLocation(e.target.value)}
 className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none bg-white font-bold text-gray-800"
 >
 {zones.map((z) => (
 <option key={z.codigo} value={z.nombre}>
 {z.nombre}
 </option>
 ))}
 </select>
 </div>

 <div className="flex gap-2 pt-2">
 <button
 type="button"
 onClick={() => setAcceptingOrder(null)}
 className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
 >
 Cancelar
 </button>
 <button
 type="button"
 onClick={handleConfirmAccept}
 disabled={updatingId === acceptingOrder.id}
 className="flex-1 py-2.5 font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md"
 >
 Confirmar y Aceptar
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Modal de Chat en Vivo */}
 {activeChatOrder && (
 <OrderChatModal
 orderId={activeChatOrder.id}
 codigoPedido={activeChatOrder.codigoPedido}
 businessNombre={activeChatOrder.business?.nombre}
 isOpen={Boolean(activeChatOrder)}
 onClose={() => setActiveChatOrder(null)}
 />
 )}
 </div>
 );
}
