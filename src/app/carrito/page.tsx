'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { CampusZoneItem, DeliveryEstimateResult } from '@/types';
import {
 ShoppingBag,
 MapPin,
 Clock,
 CreditCard,
 Plus,
 Minus,
 Trash2,
 ArrowRight,
 Store,
 Loader2,
 CheckCircle2,
 AlertCircle,
 Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function CarritoPage() {
 const router = useRouter();
 const { user } = useAuth();
 const {
 items,
 removeItem,
 updateQuantity,
 clearCart,
 subtotal,
 totalItems,
 businessId,
 businessName,
 } = useCart();

 const [zones, setZones] = useState<CampusZoneItem[]>([]);
 const [selectedZone, setSelectedZone] = useState('BLOQUE_F');
 const [detalleUbicacion, setDetalleUbicacion] = useState('');
 const [instrucciones, setInstrucciones] = useState('');
 const [metodoPago, setMetodoPago] = useState('Efectivo / Nequi / Daviplata al recibir');
 const [estimate, setEstimate] = useState<DeliveryEstimateResult | null>(null);

 const [loadingZones, setLoadingZones] = useState(true);
 const [calculatingTime, setCalculatingTime] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState('');

 // 1. Cargar Zonas del Campus
 useEffect(() => {
 async function loadZones() {
 try {
 const res = await fetch('/api/zones');
 if (res.ok) {
 const data = await res.json();
 setZones(data.zones || []);
 }
 } catch (err) {
 console.error('Error cargando zonas:', err);
 } finally {
 setLoadingZones(false);
 }
 }
 loadZones();
 }, []);

 // 2. Calcular Tiempo Estimado en Vivo cuando cambia la zona seleccionada
 useEffect(() => {
 async function updateEstimate() {
 if (!items.length || !items[0].product.business) return;

 const businessZone = items[0].product.business.zonaCampusCodigo || 'ZONA_EMPRENDIMIENTOS';
 const prepMin = items[0].product.business.tiempoBasePrepMin || 15;

 try {
 setCalculatingTime(true);
 const res = await fetch(
 `/api/zones?origen=${businessZone}&destino=${selectedZone}&prepMin=${prepMin}`
 );
 if (res.ok) {
 const data = await res.json();
 setEstimate(data.estimate);
 }
 } catch (err) {
 console.error('Error calculando estimación:', err);
 } finally {
 setCalculatingTime(false);
 }
 }

 if (selectedZone && items.length > 0) {
 updateEstimate();
 }
 }, [selectedZone, items]);

 const handleCheckout = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!user) {
 router.push('/login');
 return;
 }

 if (!items.length || !businessId) {
 setError('Tu carrito está vacío');
 return;
 }

 if (!detalleUbicacion.trim()) {
 setError('Por favor indica el detalle de tu ubicación (ej. Salón, Piso, o punto de referencia)');
 return;
 }

 setSubmitting(true);
 setError('');

 try {
 const selectedZoneObj = zones.find((z) => z.codigo === selectedZone);

 const orderPayload = {
 businessId,
 items: items.map((item) => ({
 productId: item.product.id,
 cantidad: item.cantidad,
 opcionesSeleccionadas: item.opcionesSeleccionadas || null,
 notas: item.notas,
 })),
 zonaEntregaCodigo: selectedZone,
 zonaEntregaNombre: selectedZoneObj?.nombre || selectedZone,
 detalleUbicacion,
 instrucciones,
 metodoPago,
 };

 const res = await fetch('/api/orders', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(orderPayload),
 });

 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || 'Error al procesar el pedido');
 }

 // Limpiar carrito y redirigir al tracking
 clearCart();
 router.push(`/pedidos/${data.order.id}`);
 } catch (err: any) {
 setError(err.message || 'Error al crear el pedido');
 setSubmitting(false);
 }
 };

 if (items.length === 0) {
 return (
 <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
 <div className="w-16 h-16 rounded-full bg-red-50 text-uninorte-red flex items-center justify-center mx-auto">
 <ShoppingBag className="w-8 h-8" />
 </div>
 <h2 className="text-xl font-black text-gray-900">Tu carrito está vacío</h2>
 <p className="text-xs text-gray-500 max-w-sm mx-auto">
 Aún no has agregado productos a tu orden. Descubre los mejores antojos de tus compañeros en el campus.
 </p>
 <Link
 href="/negocios"
 className="inline-flex items-center gap-2 px-6 py-3 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-2xl shadow-md transition"
 >
 <span>Explorar Emprendimientos</span>
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 );
 }

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
 {/* Encabezado */}
 <div>
 <span className="text-[11px] font-bold text-uninorte-red uppercase tracking-wider">
 Finalizar Pedido
 </span>
 <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
 Carrito & Datos de Entrega
 </h1>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Columna Izquierda: Formulario de Entrega en Campus */}
 <div className="lg:col-span-7 space-y-6">
 <form onSubmit={handleCheckout} className="space-y-6" id="checkout-form">
 {error && (
 <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl font-medium flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {/* 1. Punto de Entrega en Campus */}
 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
 <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
 <div className="p-2 bg-red-100 text-uninorte-red rounded-xl">
 <MapPin className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-gray-900 text-sm">
 1. ¿En qué lugar del campus te encuentras?
 </h3>
 <p className="text-xs text-gray-500">
 Selecciona tu bloque o zona para calcular el tiempo de desplazamiento
 </p>
 </div>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Bloque o Edificio de Entrega *
 </label>
 <select
 value={selectedZone}
 onChange={(e) => setSelectedZone(e.target.value)}
 className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition bg-white font-medium text-gray-800"
 >
 {zones.map((z) => (
 <option key={z.codigo} value={z.codigo}>
 {z.nombre}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Ubicación exacta / Salón / Piso *
 </label>
 <input
 type="text"
 required
 value={detalleUbicacion}
 onChange={(e) => setDetalleUbicacion(e.target.value)}
 placeholder="Ej: Bloque F - Piso 3 salón 302, en la fila del medio"
 className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Instrucciones adicionales para la entrega (Opcional)
 </label>
 <textarea
 rows={2}
 value={instrucciones}
 onChange={(e) => setInstrucciones(e.target.value)}
 placeholder="Ej: Llamar cuando llegues al primer piso, llevo camisa azul."
 className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
 />
 </div>
 </div>
 </div>

 {/* 2. Método de Pago */}
 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
 <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
 <CreditCard className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-gray-900 text-sm">
 2. Método de Pago al Recibir
 </h3>
 <p className="text-xs text-gray-500">
 Paga directamente al emprendedor contraentrega en el campus
 </p>
 </div>
 </div>

 <div className="space-y-2">
 {[
 'Efectivo / Contraentrega en Campus',
 'Transferencia Nequi / Daviplata al recibir',
 ].map((metodo) => (
 <label
 key={metodo}
 className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
 metodoPago === metodo
 ? 'border-uninorte-red bg-red-50/50 ring-1 ring-uninorte-red'
 : 'border-gray-200 hover:bg-gray-50'
 }`}
 >
 <div className="flex items-center gap-3">
 <input
 type="radio"
 name="metodoPago"
 checked={metodoPago === metodo}
 onChange={() => setMetodoPago(metodo)}
 className="text-uninorte-red focus:ring-uninorte-red"
 />
 <span className="text-xs font-bold text-gray-800">{metodo}</span>
 </div>
 <CheckCircle2
 className={`w-4 h-4 ${
 metodoPago === metodo ? 'text-uninorte-red' : 'text-transparent'
 }`}
 />
 </label>
 ))}
 </div>
 </div>
 </form>
 </div>

 {/* Columna Derecha: Resumen de Pedido y Cálculo de Tiempo */}
 <div className="lg:col-span-5 space-y-6">
 {/* Card de Tiempo Estimado Dinámico */}
 <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-3">
 <div className="flex items-center gap-2">
 <Clock className="w-5 h-5 text-emerald-700" />
 <h4 className="font-black text-emerald-950 text-sm">
 Tiempo Estimado de Entrega en Campus
 </h4>
 </div>

 {calculatingTime ? (
 <div className="flex items-center gap-2 text-xs text-emerald-800 py-2">
 <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
 <span>Calculando distancia en campus...</span>
 </div>
 ) : estimate ? (
 <div className="space-y-2">
 <div className="flex items-baseline gap-2">
 <span className="text-3xl font-black text-emerald-800">
 {estimate.rangoTexto}
 </span>
 <span className="text-xs text-emerald-700 font-semibold">aprox.</span>
 </div>
 <div className="text-[11px] text-emerald-800 space-y-1 bg-white/60 p-2.5 rounded-xl">
 <div className="flex justify-between">
 <span>Tiempo de preparación ({businessName}):</span>
 <span className="font-bold">~{estimate.tiempoBasePrepMin} min</span>
 </div>
 <div className="flex justify-between">
 <span>Desplazamiento a pie en campus:</span>
 <span className="font-bold">~{estimate.tiempoTrasladoMin} min</span>
 </div>
 </div>
 </div>
 ) : (
 <p className="text-xs text-emerald-800 font-medium">
 Selecciona tu bloque de entrega para ver el tiempo aproximado.
 </p>
 )}
 </div>

 {/* Resumen de Productos */}
 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
 <div className="flex items-center gap-2">
 <Store className="w-4 h-4 text-uninorte-red" />
 <span className="font-bold text-gray-900 text-xs">{businessName}</span>
 </div>
 <span className="text-xs text-gray-500 font-medium">{totalItems} productos</span>
 </div>

 <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
 {items.map(({ product, cantidad, opcionesSeleccionadas }, idx) => {
 const precio = product.esOferta && product.precioOferta ? product.precioOferta : product.precio;
 return (
 <div key={`${product.id}-${idx}`} className="flex items-center justify-between text-xs py-1">
 <div className="flex items-center gap-2 min-w-0">
 <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-md text-gray-700 font-bold">
 <button
 onClick={() => updateQuantity(idx, cantidad - 1)}
 className="hover:text-red-600"
 >
 -
 </button>
 <span>{cantidad}</span>
 <button
 onClick={() => updateQuantity(idx, cantidad + 1)}
 className="hover:text-green-600"
 >
 +
 </button>
 </div>
 <div className="min-w-0">
 <span className="font-medium text-gray-800 truncate block">{product.nombre}</span>
 {opcionesSeleccionadas && (
 <span className="text-[10px] text-uninorte-red font-bold block">{opcionesSeleccionadas}</span>
 )}
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <span className="font-extrabold text-gray-900">
 {formatPrice(precio * cantidad)}
 </span>
 <button
 onClick={() => removeItem(idx)}
 className="text-gray-300 hover:text-red-500"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 );
 })}
 </div>

 {/* Totales */}
 <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
 <div className="flex justify-between text-gray-500">
 <span>Subtotal:</span>
 <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
 </div>
 <div className="flex justify-between text-gray-500">
 <span>Costo de envío en campus:</span>
 <span className="font-bold text-emerald-600">¡GRATIS!</span>
 </div>
 <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
 <span>Total a pagar:</span>
 <span className="text-lg text-uninorte-red">{formatPrice(subtotal)}</span>
 </div>

 {/* Distintivo Informativo de Pago Contraentrega */}
 <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 font-medium space-y-0.5">
 <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
 Método de Pago: Pago Contraentrega
 </p>
 <p className="text-emerald-800 text-[10.5px]">
 Le pagas directamente al emprendedor en efectivo o transferencia Nequi/Daviplata al recibir tu pedido en el bloque seleccionado. UniPide no cobra comisiones.
 </p>
 </div>
 </div>

 {/* Botón Confirmar */}
 {!user ? (
 <div className="space-y-2 pt-2">
 <Link
 href="/login"
 className="w-full py-3 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
 >
 <span>Inicia sesión para pedir</span>
 <ArrowRight className="w-4 h-4" />
 </Link>
 <p className="text-[11px] text-gray-400 text-center">
 ¿No tienes cuenta? <Link href="/register" className="text-uninorte-red font-bold hover:underline">Regístrate aquí</Link>
 </p>
 </div>
 ) : (
 <button
 type="submit"
 form="checkout-form"
 disabled={submitting}
 className="w-full py-3.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-2xl shadow-lg shadow-red-900/10 transition flex items-center justify-center gap-2 active:scale-95"
 >
 {submitting ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 <span>Confirmando pedido...</span>
 </>
 ) : (
 <>
 <span>Confirmar Pedido Universitario</span>
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
