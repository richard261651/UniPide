'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Navigation,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export default function EmprendedorPedidosPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estado de transmisión GPS del celular del repartidor
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [currentGps, setCurrentGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

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

  // Transmisión de ubicación GPS del celular del repartidor
  const toggleGpsBroadcast = (orderId: string) => {
    if (activeTrackingOrderId === orderId) {
      // Detener transmisión
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setActiveTrackingOrderId(null);
      setCurrentGps(null);
      return;
    }

    if (!navigator.geolocation) {
      setGpsError('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setGpsError(null);
    setActiveTrackingOrderId(orderId);

    // Iniciar rastreo con alta precisión
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentGps({ lat, lng });

        try {
          await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              estado: 'EN_CAMINO',
              repartidorLat: lat,
              repartidorLng: lng,
              ubicacionRepartidorNombre: `Repartidor en movimiento (Precisión: ${Math.round(pos.coords.accuracy)}m)`,
            }),
          });
        } catch (err) {
          console.error('Error enviando coordenadas GPS:', err);
        }
      },
      (err) => {
        console.error('Error obteniendo GPS:', err);
        setGpsError('No se pudo acceder al GPS. Asegúrate de dar permisos de ubicación.');
        setActiveTrackingOrderId(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

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
            <span>Gestor de Pedidos y GPS RapiNorte</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </h2>
          <p className="text-xs text-gray-500">
            Acepta pedidos entrantes y transmite tu GPS en vivo por el campus de Uninorte
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

      {/* Banner de Transmisión GPS Activa */}
      {activeTrackingOrderId && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs">
              <Navigation className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                <h4 className="font-black text-sm">Transmitiendo tu ubicación GPS en vivo</h4>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {currentGps
                  ? `Lat: ${currentGps.lat.toFixed(5)}, Lng: ${currentGps.lng.toFixed(5)} — El estudiante te ve en el mapa de Uninorte en vivo`
                  : 'Obteniendo señal GPS del teléfono...'}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleGpsBroadcast(activeTrackingOrderId)}
            className="w-full sm:w-auto px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-sm transition"
          >
            Detener Transmisión GPS
          </button>
        </div>
      )}

      {gpsError && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-2xl font-medium">
          {gpsError}
        </div>
      )}

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
                    <MapPin className="w-3.5 h-3.5 text-uninorte-red" />
                    <span>{order.zonaEntregaNombre}</span>
                  </p>
                  {order.detalleUbicacion && (
                    <p className="text-gray-400 text-[10px] italic">"{order.detalleUbicacion}"</p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-[11px]">
                      <span>{it.cantidad}x {it.nombreProducto}</span>
                      <span className="font-medium">{formatPrice(it.precioUnitario * it.cantidad)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'EN_PREPARACION')}
                  disabled={updatingId === order.id}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Aceptar y Preparar</span>
                </button>
              </div>
            ))}
            {pedidosRecibidos.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                No hay pedidos nuevos
              </div>
            )}
          </div>
        </div>

        {/* Columna 2: EN PREPARACIÓN */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900">
              <ChefHat className="w-4 h-4 text-amber-600" />
              <span>Preparando ({pedidosPreparando.length})</span>
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
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-[11px]">
                      <span>{it.cantidad}x {it.nombreProducto}</span>
                      <span className="font-medium">{formatPrice(it.precioUnitario * it.cantidad)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'EN_CAMINO')}
                  disabled={updatingId === order.id}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Enviar / Salir en Camino</span>
                </button>
              </div>
            ))}
            {pedidosPreparando.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                Sin pedidos en cocina
              </div>
            )}
          </div>
        </div>

        {/* Columna 3: EN CAMINO (Con soporte de GPS) */}
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
            {pedidosEnCamino.map((order) => {
              const isTracking = activeTrackingOrderId === order.id;

              return (
                <div key={order.id} className="bg-white rounded-2xl p-4 border-2 border-emerald-400 shadow-md space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black text-gray-900">{order.codigoPedido}</span>
                      <p className="text-[10px] text-gray-400">{order.zonaEntregaNombre}</p>
                    </div>
                    <span className="text-xs font-extrabold text-uninorte-red">{formatPrice(order.total)}</span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-gray-800">Entregar a: {order.cliente?.nombre}</p>
                    <p className="text-gray-500 text-[11px]">📍 {order.detalleUbicacion || 'Campus'}</p>
                    {order.cliente?.telefono && (
                      <a
                        href={`tel:${order.cliente.telefono}`}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.cliente.telefono}</span>
                      </a>
                    )}
                  </div>

                  {/* Botón de Transmisión GPS Celular */}
                  <button
                    onClick={() => toggleGpsBroadcast(order.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      isTracking
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse'
                        : 'bg-slate-900 hover:bg-black text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{isTracking ? '📡 GPS Activo (Transmitiendo)' : '📍 Activar GPS de mi Celular'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isTracking) toggleGpsBroadcast(order.id);
                      updateOrderStatus(order.id, 'ENTREGADO');
                    }}
                    disabled={updatingId === order.id}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Marcar como Entregado</span>
                  </button>
                </div>
              );
            })}
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
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Completado
                </span>
              </div>
            ))}
            {pedidosEntregados.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                Sin pedidos completados aún
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
