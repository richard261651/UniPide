'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OrderDetail } from '@/types';
import {
  MapPin,
  Clock,
  Navigation,
  Smartphone,
  Maximize2,
  Minimize2,
  Store,
  Compass,
  CheckCircle2,
  Phone,
  MessageCircle,
  Sparkles,
  Zap,
  ExternalLink,
} from 'lucide-react';

interface CampusLiveMapTrackerProps {
  order: OrderDetail;
}

// Coordenadas relativas en porcentaje (0-100) para el mapa vectorial del Campus Uninorte
const CAMPUS_ZONES_COORDINATES: Record<string, { x: number; y: number; label: string; block: string }> = {
  ZONA_EMPRENDIMIENTOS: { x: 50, y: 52, label: 'Ágora Central', block: 'Zona Emprendimientos' },
  BLOQUE_A: { x: 28, y: 35, label: 'Bloque A', block: 'Ingenierías' },
  BLOQUE_B: { x: 38, y: 30, label: 'Bloque B', block: 'Ciencias Básicas' },
  BLOQUE_C: { x: 58, y: 30, label: 'Bloque C', block: 'Humanidades' },
  BLOQUE_F: { x: 34, y: 68, label: 'Bloque F', block: 'Aulas & Auditorios' },
  BLOQUE_G: { x: 18, y: 72, label: 'Bloque G', block: 'Diseño & Arquitectura' },
  BLOQUE_K: { x: 78, y: 62, label: 'Bloque K', block: 'Posgrados & Innovación' },
  CAFETERIA_CENTRAL: { x: 56, y: 44, label: 'Du Nord', block: 'Cafetería Central' },
  BIBLIOTECA_PARRISH: { x: 44, y: 58, label: 'Biblioteca', block: 'Karl C. Parrish' },
  COLISEO_FUNDADORES: { x: 82, y: 28, label: 'Coliseo', block: 'Los Fundadores' },
  FUENTE_CENTRAL: { x: 50, y: 48, label: 'Plaza de la Paz', block: 'Fuente Central' },
  BIENESTAR_ESTUDIANTIL: { x: 72, y: 42, label: 'Bienestar', block: 'Centro Médico' },
};

export default function CampusLiveMapTracker({ order }: CampusLiveMapTrackerProps) {
  const [showGenially, setShowGenially] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0.5); // 0 a 1 entre origen y destino

  const origenCode = order.business?.zonaCampusCodigo || 'ZONA_EMPRENDIMIENTOS';
  const destinoCode = order.zonaEntregaCodigo || 'BLOQUE_F';

  const origenCoord = CAMPUS_ZONES_COORDINATES[origenCode] || { x: 50, y: 50, label: 'Local', block: 'Campus' };
  const destinoCoord = CAMPUS_ZONES_COORDINATES[destinoCode] || { x: 35, y: 65, label: 'Entrega', block: 'Salón' };

  // Animación del repartidor si está en camino
  useEffect(() => {
    if (order.estado !== 'EN_CAMINO') return;

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 0.95) return 0.2;
        return prev + 0.05;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [order.estado]);

  // Si hay GPS real del teléfono del repartidor:
  // Interpolación o posición del repartidor en el canvas
  const courierX =
    order.estado === 'RECIBIDO' || order.estado === 'EN_PREPARACION'
      ? origenCoord.x
      : order.estado === 'ENTREGADO'
      ? destinoCoord.x
      : origenCoord.x + (destinoCoord.x - origenCoord.x) * simulatedProgress;

  const courierY =
    order.estado === 'RECIBIDO' || order.estado === 'EN_PREPARACION'
      ? origenCoord.y
      : order.estado === 'ENTREGADO'
      ? destinoCoord.y
      : origenCoord.y + (destinoCoord.y - origenCoord.y) * simulatedProgress;

  const tieneGpsEnVivo = order.repartidorLat && order.repartidorLng;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-4">
      {/* Header del Tracker */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-red-50/50 via-white to-amber-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-uninorte-red text-white flex items-center justify-center shadow-md shadow-red-900/20">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-gray-900 text-sm sm:text-base">
                Rastreador Campus en Vivo
              </h3>
              {order.estado === 'EN_CAMINO' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  EN CAMINO
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Ruta desde <span className="font-semibold text-gray-800">{origenCoord.label}</span> hasta{' '}
              <span className="font-semibold text-gray-800">{destinoCoord.label}</span>
            </p>
          </div>
        </div>

        {/* Botón para alternar Mapa Interactivo Genially */}
        <button
          onClick={() => setShowGenially(!showGenially)}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            showGenially
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Compass className="w-4 h-4 text-uninorte-red" />
          <span>{showGenially ? 'Ver Mapa GPS Vectorial' : 'Explorar Mapa Genially Uninorte'}</span>
        </button>
      </div>

      {/* Contenedor del Mapa */}
      <div className="px-4 sm:px-5 pb-4">
        {showGenially ? (
          /* Mapa Oficial Genially Embebido */
          <div className="relative w-full aspect-16/10 sm:aspect-16/9 rounded-2xl overflow-hidden border border-gray-200 bg-slate-900 shadow-inner">
            <iframe
              title="Mapa Oficial Campus Universidad del Norte"
              src="https://view.genially.com/629545f66abaf30012c22f04"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
            />
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 pointer-events-none">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Mapa Oficial Uninorte</span>
            </div>
          </div>
        ) : (
          /* Mapa Vectorial Gráfico Estilo Rappi Campus */
          <div className="relative w-full aspect-16/11 sm:aspect-16/8 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner select-none">
            {/* Grid de fondo y textura de campus */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

            {/* SVG de Senderos y Rutas del Campus */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C8102E" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>

              {/* Senderos entre bloques */}
              <line x1="28%" y1="35%" x2="38%" y2="30%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="38%" y1="30%" x2="58%" y2="30%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="38%" y1="30%" x2="50%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="28%" y1="35%" x2="34%" y2="68%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="34%" y1="68%" x2="18%" y2="72%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="50%" y1="50%" x2="56%" y2="44%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="50%" y1="50%" x2="44%" y2="58%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
              <line x1="50%" y1="50%" x2="78%" y2="62%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />

              {/* Línea de ruta activa de la orden */}
              <line
                x1={`${origenCoord.x}%`}
                y1={`${origenCoord.y}%`}
                x2={`${destinoCoord.x}%`}
                y2={`${destinoCoord.y}%`}
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            {/* Puntos de Bloques del Campus */}
            {Object.entries(CAMPUS_ZONES_COORDINATES).map(([key, zone]) => {
              const isOrigen = key === origenCode;
              const isDestino = key === destinoCode;

              if (isOrigen || isDestino) return null; // Se dibujan destacados abajo

              return (
                <div
                  key={key}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 group-hover:scale-125 transition" />
                  <span className="text-[9px] font-medium text-slate-400 mt-1 whitespace-nowrap hidden sm:block">
                    {zone.label}
                  </span>
                </div>
              );
            })}

            {/* Pin 1: ORIGEN (Emprendimiento) */}
            <div
              style={{ left: `${origenCoord.x}%`, top: `${origenCoord.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
            >
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping" />
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white font-bold">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-1 bg-slate-900/90 backdrop-blur-xs border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                {order.business?.nombre || origenCoord.label}
              </div>
            </div>

            {/* Pin 2: DESTINO (Estudiante) */}
            <div
              style={{ left: `${destinoCoord.x}%`, top: `${destinoCoord.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
            >
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-ping" />
                <div className="w-8 h-8 rounded-full bg-uninorte-red text-white flex items-center justify-center shadow-lg border-2 border-white font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-1 bg-slate-900/90 backdrop-blur-xs border border-red-500/40 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                {destinoCoord.label} ({order.detalleUbicacion || 'Tu Salón'})
              </div>
            </div>

            {/* AVATAR REPARTIDOR / COURIER EN MOVIMIENTO ESTILO RAPPI */}
            <div
              style={{
                left: `${courierX}%`,
                top: `${courierY}%`,
                transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute -inset-2 rounded-full bg-emerald-400/30 animate-ping" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-xl border-2 border-white ring-2 ring-emerald-500/50">
                  <Zap className="w-5 h-5 fill-white text-white animate-bounce" />
                </div>
              </div>
              <div className="mt-1 bg-emerald-950/90 backdrop-blur-md border border-emerald-500 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {order.estado === 'EN_CAMINO'
                    ? 'Repartidor RapiNorte en camino'
                    : order.estado === 'ENTREGADO'
                    ? '¡Pedido Entregado!'
                    : 'Preparando en local'}
                </span>
              </div>
            </div>

            {/* Badge Flotante Superior: GPS / Estado */}
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-white text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>
                {tieneGpsEnVivo
                  ? '📍 GPS Celular en Vivo Activo'
                  : '📡 Telemetría Campus Uninorte'}
              </span>
            </div>

            {/* Badge Flotante Inferior: Tiempo Estimado */}
            <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                {order.estado === 'ENTREGADO'
                  ? 'Entregado con éxito'
                  : `Llegada estimada: ~${order.tiempoEstimadoMin} min`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info Card de Entrega & Contacto */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-red-100 text-uninorte-red flex items-center justify-center font-bold text-sm shrink-0">
            {order.business?.nombre?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">{order.business?.nombre}</p>
            <p className="text-[11px] text-gray-500">
              Ubicación del negocio: {order.business?.ubicacionCampus}
            </p>
          </div>
        </div>

        {/* Botones de Contacto Rápido */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {order.business?.telefono && (
            <a
              href={`https://wa.me/57${order.business.telefono.replace(/\D/g, '')}?text=Hola!%20Te%20escribo%20por%20mi%20pedido%20de%20RapiNorte%20${order.codigoPedido}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          )}
          <a
            href="https://view.genially.com/629545f66abaf30012c22f04"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span>Mapa Genially</span>
          </a>
        </div>
      </div>
    </div>
  );
}
