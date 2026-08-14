'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { OrderDetail, OrderStatus } from '@/types';
import { formatPrice, formatShortDate } from '@/lib/utils';
import {
  ShoppingBag,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  XCircle,
  Phone,
  MapPin,
  RefreshCw,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function EmprendedorPedidosPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    if (user?.businessId) {
      fetchOrders();
      const interval = setInterval(() => fetchOrders(false), 4000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const updateOrderStatus = async (orderId: string, nuevoEstado: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        fetchOrders(false);
      }
    } catch (err) {
      console.error('Error actualizando pedido:', err);
    } finally {
      setUpdatingId(null);
    }
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
            Acepta pedidos entrantes y actualiza el estado para que los estudiantes lo sigan en el campus
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-2xl shadow-2xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-uninorte-red' : ''}`} />
          <span>{refreshing ? 'Actualizando...' : 'Refrescar Tablero'}</span>
        </button>
      </div>

      {/* Columnas Kanban de Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Columna 1: RECIBIDOS (Nuevos) */}
        <div className="bg-blue-50/50 rounded-3xl p-4 border border-blue-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Nuevos ({pedidosRecibidos.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {pedidosRecibidos.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 italic">
                Sin pedidos nuevos por ahora
              </p>
            ) : (
              pedidosRecibidos.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-black text-xs text-blue-700">{order.codigoPedido}</span>
                    <span className="text-[10px] text-gray-400">
                      {formatShortDate(order.fechaCreacion)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-gray-800">{order.cliente?.nombre || 'Cliente'}</p>
                    <div className="flex items-start gap-1 text-[11px] text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-uninorte-red shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {order.zonaEntregaNombre} - {order.detalleUbicacion}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="text-[11px] bg-gray-50 p-2 rounded-xl space-y-0.5 text-gray-700">
                    {order.items.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>
                          {i.cantidad}x {i.nombreProducto}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(i.precioUnitario * i.cantidad)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-xs">
                      <span>Total:</span>
                      <span className="text-uninorte-red">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'CANCELADO')}
                      disabled={updatingId === order.id}
                      className="py-1.5 px-2 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'EN_PREPARACION')}
                      disabled={updatingId === order.id}
                      className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                    >
                      <span>Aceptar Pedido</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna 2: EN PREPARACIÓN */}
        <div className="bg-amber-50/50 rounded-3xl p-4 border border-amber-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Preparando ({pedidosPreparando.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {pedidosPreparando.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 italic">
                No hay pedidos en preparación
              </p>
            ) : (
              pedidosPreparando.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-black text-xs text-amber-700">{order.codigoPedido}</span>
                    <span className="text-[10px] text-gray-400">
                      {formatShortDate(order.fechaCreacion)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-gray-800">{order.cliente?.nombre}</p>
                    <div className="flex items-start gap-1 text-[11px] text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-uninorte-red shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {order.zonaEntregaNombre} - {order.detalleUbicacion}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] bg-gray-50 p-2 rounded-xl space-y-0.5 text-gray-700">
                    {order.items.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>
                          {i.cantidad}x {i.nombreProducto}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(i.precioUnitario * i.cantidad)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-xs">
                      <span>Total:</span>
                      <span className="text-uninorte-red">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => updateOrderStatus(order.id, 'EN_CAMINO')}
                    disabled={updatingId === order.id}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                  >
                    <span>Listo, Marcar En Camino</span>
                    <Bike className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna 3: EN CAMINO */}
        <div className="bg-purple-50/50 rounded-3xl p-4 border border-purple-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-purple-600" />
              <span>En Camino ({pedidosEnCamino.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {pedidosEnCamino.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 italic">
                Sin pedidos en camino
              </p>
            ) : (
              pedidosEnCamino.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-purple-200 shadow-sm space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="font-black text-xs text-purple-700">{order.codigoPedido}</span>
                    <span className="text-[10px] text-gray-400">
                      {formatShortDate(order.fechaCreacion)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-gray-800">{order.cliente?.nombre}</p>
                    <div className="flex items-start gap-1 text-[11px] text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-uninorte-red shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {order.zonaEntregaNombre} - {order.detalleUbicacion}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => updateOrderStatus(order.id, 'ENTREGADO')}
                    disabled={updatingId === order.id}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                  >
                    <span>Confirmar Entrega</span>
                    <PackageCheck className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna 4: ENTREGADOS (Historial) */}
        <div className="bg-emerald-50/50 rounded-3xl p-4 border border-emerald-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Entregados ({pedidosEntregados.length})</span>
            </h3>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {pedidosEntregados.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-6 italic">
                Aún no hay entregas
              </p>
            ) : (
              pedidosEntregados.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/80 rounded-2xl p-3.5 border border-emerald-100 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{order.codigoPedido}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Entregado
                    </span>
                  </div>
                  <p className="text-gray-600">{order.cliente?.nombre}</p>
                  <p className="font-bold text-uninorte-red">{formatPrice(order.total)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
