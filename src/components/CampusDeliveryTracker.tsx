'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Store, Compass, Sparkles, ExternalLink, X } from 'lucide-react';

interface CampusDeliveryTrackerProps {
 estado: string; // "RECIBIDO" | "EN_PREPARACION" | "EN_CAMINO" | "ENTREGADO" | "CANCELADO"
 origenZonaNombre: string;
 destinoZonaNombre: string;
 tiempoEstimadoMin: number;
}

export default function CampusDeliveryTracker({
 estado,
 origenZonaNombre,
 destinoZonaNombre,
 tiempoEstimadoMin,
}: CampusDeliveryTrackerProps) {
 const [show360Modal, setShow360Modal] = useState(false);

 // Determinar porcentaje de avance según estado
 const getProgressPercentage = () => {
 switch (estado) {
 case 'RECIBIDO':
 return 15;
 case 'EN_PREPARACION':
 return 45;
 case 'EN_CAMINO':
 return 80;
 case 'ENTREGADO':
 return 100;
 default:
 return 0;
 }
 };

 const progressPct = getProgressPercentage();

 return (
 <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
 {/* Fondo decorativo */}
 <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
 <Compass className="w-64 h-64 text-white -mr-16 -mt-16" />
 </div>

 {/* Encabezado */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
 Ruta en Campus Uninorte
 </span>
 <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
 <Clock className="w-3.5 h-3.5" />
 ~{tiempoEstimadoMin} min aprox.
 </span>
 </div>
 <h3 className="text-lg sm:text-xl font-black tracking-tight mt-1">
 Seguimiento de Entrega Bloque a Bloque
 </h3>
 </div>

 <button
 type="button"
 onClick={() => setShow360Modal(true)}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20 text-xs font-bold rounded-2xl backdrop-blur-xs transition self-start sm:self-auto"
 >
 <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
 <span>Ver Mapa 360°</span>
 <ExternalLink className="w-3 h-3" />
 </button>
 </div>

 {/* Barra de Progreso de Ruta de Campus */}
 <div className="relative pt-4 pb-2 z-10">
 {/* Origen y Destino */}
 <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-3">
 <div className="flex items-center gap-1.5 text-amber-400">
 <Store className="w-4 h-4" />
 <span>Origen: {origenZonaNombre}</span>
 </div>
 <div className="flex items-center gap-1.5 text-emerald-400 text-right">
 <MapPin className="w-4 h-4" />
 <span>Destino: {destinoZonaNombre}</span>
 </div>
 </div>

 {/* Pista de progreso */}
 <div className="relative h-3 bg-slate-700/80 rounded-full overflow-hidden border border-slate-600">
 <div
 className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-400 via-uninorte-red to-emerald-400 transition-all duration-700 ease-out"
 style={{ width: `${progressPct}%` }}
 />
 </div>

 {/* Marcador del repartidor en movimiento */}
 <div
 className="absolute top-7 -translate-x-1/2 transition-all duration-700 ease-out"
 style={{ left: `${progressPct}%` }}
 >
 <div className="p-2 bg-uninorte-red text-white rounded-2xl shadow-lg ring-4 ring-white/20 animate-pulse flex items-center justify-center">
 <Navigation className="w-4 h-4 fill-white text-white transform rotate-45" />
 </div>
 </div>
 </div>

 {/* Explicación del estado actual */}
 <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-gray-300 flex items-center justify-between z-10 relative">
 <span>
 {estado === 'RECIBIDO' && ' El pedido ha sido recibido en el kiosco.'}
 {estado === 'EN_PREPARACION' && ' El emprendedor está preparando tu orden.'}
 {estado === 'EN_CAMINO' && ' ¡El repartidor va caminando por los pasillos del campus a tu bloque!'}
 {estado === 'ENTREGADO' && ' El pedido ha sido entregado exitosamente en tu ubicación.'}
 </span>
 <span className="font-mono font-bold text-amber-300">{progressPct}%</span>
 </div>

 {/* Modal 360° Integrado */}
 {show360Modal && (
 <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
 <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
 <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-uninorte-red flex items-center justify-center text-white">
 <Sparkles className="w-4 h-4" />
 </div>
 <div>
 <h3 className="font-black text-sm sm:text-base">
 Tour 360° — Universidad del Norte
 </h3>
 <p className="text-[10px] sm:text-xs text-gray-300">
 Visualiza el campus y ubica tu punto de entrega
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={() => setShow360Modal(false)}
 className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="flex-1 w-full h-full bg-slate-950 relative">
 <iframe
 src="https://comino.uninorte.edu.co/TourVirtual/index.htm"
 className="w-full h-full border-none"
 title="Tour 360 Uninorte"
 allowFullScreen
 />
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
