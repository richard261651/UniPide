'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import {
 TrendingUp,
 ShoppingBag,
 DollarSign,
 Star,
 Clock,
 ArrowRight,
 Sparkles,
 UtensilsCrossed,
 Package,
 ShieldCheck,
 FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function EmprendedorDashboard() {
 const { user } = useAuth();
 const [stats, setStats] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 async function loadStats() {
 try {
 const res = await fetch('/api/stats/merchant');
 if (res.ok) {
 const data = await res.json();
 setStats(data.stats);
 }
 } catch (err) {
 console.error('Error cargando métricas:', err);
 } finally {
 setLoading(false);
 }
 }

 loadStats();
 }, []);

 if (loading) {
 return (
 <div className="space-y-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {[1, 2, 3, 4].map((n) => (
 <div key={n} className="h-28 bg-white rounded-3xl animate-pulse border border-gray-100" />
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-8">
 {/* Banner de Solicitud en Revisión por el Administrador */}
 {user?.rol === 'EMPRENDEDOR' && (user?.businessEstadoAprobacion === 'PENDIENTE' || !user?.businessPagoVerificado) && (
   <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl shadow-xl space-y-3 relative overflow-hidden animate-in fade-in zoom-in-95">
     <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
     
     <div className="flex items-center gap-3">
       <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shrink-0 text-white shadow-md">
         <Clock className="w-6 h-6 animate-pulse text-white" />
       </div>
       <div>
         <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900/40 text-amber-100 px-2.5 py-0.5 rounded-full">
           Estado: Solicitud Pendiente de Verificación Admin
         </span>
         <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
           ¡Tu emprendimiento "{user.businessName}" está en proceso de revisión y activación! ⏳
         </h2>
       </div>
     </div>

     <p className="text-xs sm:text-sm text-amber-50 leading-relaxed font-medium max-w-3xl">
       Tu registro de cuenta, comprobante de pago y firma del contrato <strong>POL-EMP-001</strong> han sido recibidos. El Administrador (Richard Guzmán - <code className="bg-slate-900/40 px-1.5 py-0.5 rounded text-amber-200">richardbb839@gmail.com</code>) está verificando tu pago para abrir oficialmente tu tienda en UniPide.
     </p>

     <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-white/20 text-xs">
       <span className="font-bold flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
         <ShieldCheck className="w-4 h-4 text-emerald-300" />
         <span>Te avisaremos por correo y notificación en cuanto tu pago sea verificado.</span>
       </span>

       <Link
         href="/emprendedor/suscripcion"
         className="font-black text-slate-900 bg-white hover:bg-amber-100 px-4 py-1.5 rounded-xl shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
       >
         <FileText className="w-4 h-4 text-[#D85A30]" />
         <span>Ver Contrato & Constancia de Pago</span>
       </Link>
     </div>
   </div>
 )}

 {/* Tarjetas de Métricas Principales */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Ventas Hoy */}
 <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-gray-500">Ventas de Hoy</span>
 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
 <DollarSign className="w-4 h-4" />
 </div>
 </div>
 <p className="text-2xl font-black text-gray-900">
 {formatPrice(stats?.todayRevenue || 0)}
 </p>
 <p className="text-[11px] text-gray-400">
 {stats?.todayOrdersCount || 0} pedidos recibidos hoy
 </p>
 </div>

 {/* Pedidos Activos en Campus */}
 <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-gray-500">Pedidos Activos</span>
 <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
 <Clock className="w-4 h-4" />
 </div>
 </div>
 <p className="text-2xl font-black text-amber-600">
 {stats?.activeOrdersCount || 0}
 </p>
 <p className="text-[11px] text-gray-400">
 Pendientes de entrega o preparación
 </p>
 </div>

 {/* Total Ingresos Histórico */}
 <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-gray-500">Ingresos Totales</span>
 <div className="p-2 bg-red-50 text-uninorte-red rounded-xl">
 <TrendingUp className="w-4 h-4" />
 </div>
 </div>
 <p className="text-2xl font-black text-gray-900">
 {formatPrice(stats?.totalRevenue || 0)}
 </p>
 <p className="text-[11px] text-gray-400">
 {stats?.totalOrdersCount || 0} pedidos completados
 </p>
 </div>

 {/* Calificación Promedio */}
 <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-gray-500">Calificación Clientes</span>
 <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
 <Star className="w-4 h-4 fill-amber-400" />
 </div>
 </div>
 <p className="text-2xl font-black text-gray-900">
 {(stats?.avgRating || 4.8).toFixed(1)} 
 </p>
 <p className="text-[11px] text-gray-400">
 {stats?.ratingsCount || 0} calificaciones recibidas
 </p>
 </div>
 </div>

 {/* Secciones de Acciones Rápidas y Productos Más Vendidos */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Acciones Rápidas */}
 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
 <h3 className="font-black text-gray-900 text-base">Acciones Rápidas</h3>
 <div className="space-y-2.5">
 <Link
 href="/emprendedor/pedidos"
 className="flex items-center justify-between p-3.5 bg-red-50 hover:bg-red-100/70 text-uninorte-red rounded-2xl transition group"
 >
 <div className="flex items-center gap-3">
 <ShoppingBag className="w-5 h-5" />
 <span className="text-xs font-bold">Ver Pedidos en Vivo</span>
 </div>
 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </Link>

 <Link
 href="/emprendedor/productos"
 className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-2xl transition group"
 >
 <div className="flex items-center gap-3">
 <UtensilsCrossed className="w-5 h-5 text-gray-600" />
 <span className="text-xs font-bold">Gestionar Productos y Stock</span>
 </div>
 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </Link>

 <Link
 href="/emprendedor/perfil"
 className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-2xl transition group"
 >
 <div className="flex items-center gap-3">
 <Package className="w-5 h-5 text-gray-600" />
 <span className="text-xs font-bold">Editar Ubicación en Campus</span>
 </div>
 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>
 </div>

 {/* Productos Más Vendidos */}
 <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
 <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-amber-500" />
 <span>Productos Más Vendidos</span>
 </h3>
 <span className="text-xs text-gray-400 font-medium">Top del negocio</span>
 </div>

 {!stats?.topProducts || stats.topProducts.length === 0 ? (
 <p className="text-xs text-gray-400 py-8 text-center italic">
 Aún no hay suficientes ventas registradas para calcular el ranking de productos.
 </p>
 ) : (
 <div className="divide-y divide-gray-100">
 {stats.topProducts.map((p: any, idx: number) => (
 <div key={idx} className="py-3 flex items-center justify-between text-xs">
 <div className="flex items-center gap-3">
 <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs">
 #{idx + 1}
 </span>
 <div>
 <p className="font-bold text-gray-900">{p.nombre}</p>
 <p className="text-[11px] text-gray-400">{p.cantidad} unidades vendidas</p>
 </div>
 </div>
 <span className="font-extrabold text-gray-900">
 {formatPrice(p.total)}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
