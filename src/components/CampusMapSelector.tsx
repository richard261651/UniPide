'use client';

import React, { useState } from 'react';
import { MapPin, Compass, ExternalLink, Sparkles, X, CheckCircle2, Building2, Trees } from 'lucide-react';
import { CampusZoneItem } from '@/types';

interface CampusMapSelectorProps {
 zones: CampusZoneItem[];
 selectedZone: string;
 onSelectZone: (zoneCodigo: string) => void;
}

export const OFFICIAL_CAMPUS_SPOTS = [
 // --- Edificios Principales (Letras) ---
 { codigo: 'BLOQUE_A', nombre: 'A: Bloque A (Ingenierías)', letra: 'A', icon: '', categoria: 'EDIFICIOS', top: '22%', left: '15%' },
 { codigo: 'BLOQUE_B', nombre: 'B: Bloque B (Ciencias)', letra: 'B', icon: '', categoria: 'EDIFICIOS', top: '22%', left: '30%' },
 { codigo: 'BLOQUE_C', nombre: 'C: Bloque C (Humanidades)', letra: 'C', icon: '', categoria: 'EDIFICIOS', top: '22%', left: '45%' },
 { codigo: 'BLOQUE_D', nombre: 'D: Bloque D (Decanaturas)', letra: 'D', icon: '', categoria: 'EDIFICIOS', top: '22%', left: '60%' },
 { codigo: 'BLOQUE_E', nombre: 'E: Bloque E (Aulas de Clase)', letra: 'E', icon: '', categoria: 'EDIFICIOS', top: '22%', left: '75%' },
 { codigo: 'BLOQUE_F', nombre: 'F: Bloque F (Auditorios & Salones)', letra: 'F', icon: '', categoria: 'EDIFICIOS', top: '22%', left: '90%' },
 
 { codigo: 'BLOQUE_G', nombre: 'G: Bloque G (Diseño & Arq.)', letra: 'G', icon: '', categoria: 'EDIFICIOS', top: '48%', left: '15%' },
 { codigo: 'BLOQUE_I', nombre: 'I: Bloque I (Ingenierías II)', letra: 'I', icon: '', categoria: 'EDIFICIOS', top: '48%', left: '30%' },
 { codigo: 'BLOQUE_J', nombre: 'J: Bloque J (Aulas de Clase)', letra: 'J', icon: '', categoria: 'EDIFICIOS', top: '48%', left: '45%' },
 { codigo: 'BLOQUE_K', nombre: 'K: Bloque K (Posgrados)', letra: 'K', icon: '', categoria: 'EDIFICIOS', top: '48%', left: '60%' },
 { codigo: 'BLOQUE_L', nombre: 'L: Bloque L (Laboratorios)', letra: 'L', icon: '', categoria: 'EDIFICIOS', top: '48%', left: '75%' },
 { codigo: 'BLOQUE_M', nombre: 'M: Bloque M (Aulas)', letra: 'M', icon: '', categoria: 'EDIFICIOS', top: '48%', left: '90%' },

 // --- Espacios Comunes y Servicios ---
 { codigo: 'BAMBU_1', nombre: 'B1: Bambú 1', letra: 'B1', icon: '', categoria: 'SERVICIOS', top: '74%', left: '14%' },
 { codigo: 'BAMBU_2', nombre: 'B2: Bambú 2', letra: 'B2', icon: '', categoria: 'SERVICIOS', top: '74%', left: '28%' },
 { codigo: 'FUENTE_CENTRAL', nombre: 'F: Fuente Central', letra: 'F', icon: '', categoria: 'SERVICIOS', top: '74%', left: '42%' },
 { codigo: 'COLISEO_FUNDADORES', nombre: 'C: Coliseo', letra: 'C', icon: '', categoria: 'SERVICIOS', top: '74%', left: '56%' },
 { codigo: 'AUDITORIO_PRINCIPAL', nombre: 'A: Auditorio Principal', letra: 'A', icon: '', categoria: 'SERVICIOS', top: '74%', left: '70%' },
 { codigo: 'BIBLIOTECA_PARRISH', nombre: 'BKC: Biblioteca Karl C. Parrish', letra: 'BKC', icon: '', categoria: 'SERVICIOS', top: '74%', left: '86%' },

 { codigo: 'CASA_ESTUDIO', nombre: 'CE: Casa Estudio', letra: 'CE', icon: '', categoria: 'SERVICIOS', top: '90%', left: '20%' },
 { codigo: 'CENTRO_MEDICO', nombre: 'CM: Centro Médico', letra: 'CM', icon: '', categoria: 'SERVICIOS', top: '90%', left: '40%' },
 { codigo: 'CENTRO_DEPORTIVO', nombre: 'CD: Centro Deportivo', letra: 'CD', icon: '', categoria: 'SERVICIOS', top: '90%', left: '60%' },
 { codigo: 'SALON_PROYECCIONES', nombre: 'SP: Salón de Proyecciones', letra: 'SP', icon: '', categoria: 'SERVICIOS', top: '90%', left: '80%' },
];

export default function CampusMapSelector({
 zones,
 selectedZone,
 onSelectZone,
}: CampusMapSelectorProps) {
 const [show360Modal, setShow360Modal] = useState(false);
 const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
 const [filtroCategoria, setFiltroCategoria] = useState<'TODOS' | 'EDIFICIOS' | 'SERVICIOS'>('TODOS');

 const selectedSpotObj = OFFICIAL_CAMPUS_SPOTS.find((s) => s.codigo === selectedZone);
 const filteredSpots = OFFICIAL_CAMPUS_SPOTS.filter(
 (s) => filtroCategoria === 'TODOS' || s.categoria === filtroCategoria
 );

 return (
 <div className="space-y-4">
 {/* Encabezado del Mapa */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-2">
 <Compass className="w-5 h-5 text-uninorte-red" />
 <div>
 <h4 className="font-black text-gray-900 text-xs sm:text-sm">
 Mapa Interactivo de Bloques y Servicios — Uninorte
 </h4>
 <p className="text-[11px] text-gray-500">
 Selecciona tu edificio (A-M) o espacio común (B1, BKC, CE, CM, etc.)
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={() => setShow360Modal(true)}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-50 via-amber-50 to-red-100 text-uninorte-red hover:bg-red-100 text-xs font-black rounded-2xl border border-red-200 shadow-xs transition self-start sm:self-auto active:scale-95"
 >
 <Sparkles className="w-3.5 h-3.5 fill-uninorte-red" />
 <span>Ver Tour 360° Uninorte</span>
 <ExternalLink className="w-3.5 h-3.5" />
 </button>
 </div>

 {/* Filtros rápidos: Edificios vs Servicios */}
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setFiltroCategoria('TODOS')}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
 filtroCategoria === 'TODOS'
 ? 'bg-slate-900 text-white shadow-xs'
 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
 >
 Todos ({OFFICIAL_CAMPUS_SPOTS.length})
 </button>
 <button
 type="button"
 onClick={() => setFiltroCategoria('EDIFICIOS')}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
 filtroCategoria === 'EDIFICIOS'
 ? 'bg-uninorte-red text-white shadow-xs'
 : 'bg-red-50 text-uninorte-red hover:bg-red-100'
 }`}
 >
 <Building2 className="w-3.5 h-3.5" />
 <span>Edificios A-M (12)</span>
 </button>
 <button
 type="button"
 onClick={() => setFiltroCategoria('SERVICIOS')}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
 filtroCategoria === 'SERVICIOS'
 ? 'bg-emerald-700 text-white shadow-xs'
 : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
 }`}
 >
 <Trees className="w-3.5 h-3.5" />
 <span>Espacios & Servicios (10)</span>
 </button>
 </div>

 {/* Plano Visual Interactivo del Campus */}
 <div className="relative w-full h-96 sm:h-[420px] bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
 {/* Grilla y textura del plano */}
 <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

 {/* Título de Marca de Fondo */}
 <div className="absolute top-4 left-4 opacity-40 text-white font-black text-[11px] tracking-widest pointer-events-none uppercase">
 UNIVERSIDAD DEL NORTE • PLANO OFICIAL
 </div>

 {/* Puntos / Spots en el plano */}
 {filteredSpots.map((spot) => {
 const isSelected = selectedZone === spot.codigo;
 const isHovered = hoveredSpot === spot.codigo;

 return (
 <div
 key={spot.codigo}
 style={{ top: spot.top, left: spot.left }}
 className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
 onMouseEnter={() => setHoveredSpot(spot.codigo)}
 onMouseLeave={() => setHoveredSpot(null)}
 >
 <button
 type="button"
 onClick={() => onSelectZone(spot.codigo)}
 className={`relative group/pin px-2.5 py-1.5 rounded-2xl transition-all duration-200 transform flex items-center gap-1.5 active:scale-95 ${
 isSelected
 ? 'bg-uninorte-red text-white scale-110 shadow-xl shadow-red-900/60 ring-4 ring-white/40 z-20 font-black'
 : spot.categoria === 'EDIFICIOS'
 ? 'bg-white/95 hover:bg-white text-gray-900 font-bold scale-95 hover:scale-105 shadow-md border border-gray-200'
 : 'bg-emerald-500 hover:bg-emerald-400 text-white font-bold scale-95 hover:scale-105 shadow-md border border-emerald-400'
 }`}
 >
 <span className="text-xs">{spot.icon}</span>
 <span className="text-[11px] font-black tracking-tight">
 {spot.letra}
 </span>

 {isSelected && (
 <CheckCircle2 className="w-3.5 h-3.5 fill-white text-uninorte-red" />
 )}
 </button>

 {/* Tooltip informativo flotante */}
 {(isHovered || isSelected) && (
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-900/95 backdrop-blur-md text-white text-[11px] p-2.5 rounded-2xl shadow-2xl z-30 pointer-events-none border border-slate-700 animate-in fade-in zoom-in-95 duration-100">
 <div className="font-black flex items-center gap-1 text-xs">
 <span>{spot.icon}</span>
 <span>{spot.nombre}</span>
 </div>
 <p className="text-[10px] text-gray-300 mt-1">
 {isSelected ? ' Punto de entrega seleccionado' : 'Haz clic para seleccionar este lugar'}
 </p>
 </div>
 )}
 </div>
 );
 })}

 {/* Indicador inferior de zona seleccionada */}
 <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2.5 z-20 text-xs">
 <MapPin className="w-5 h-5 text-uninorte-red animate-bounce" />
 <div>
 <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Ubicación Elegida:</span>
 <span className="font-black text-gray-900">
 {selectedSpotObj?.nombre || 'Selecciona un bloque'}
 </span>
 </div>
 </div>
 </div>

 {/* Grid de Accesos Rápidos con Botones */}
 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
 {OFFICIAL_CAMPUS_SPOTS.map((spot) => {
 const isSelected = selectedZone === spot.codigo;
 return (
 <button
 key={spot.codigo}
 type="button"
 onClick={() => onSelectZone(spot.codigo)}
 className={`p-2 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
 isSelected
 ? 'bg-uninorte-red text-white border-uninorte-red shadow-md font-black'
 : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 font-semibold'
 }`}
 >
 <span className="text-xs">{spot.icon}</span>
 <span className="text-[10px] line-clamp-1">{spot.nombre}</span>
 </button>
 );
 })}
 </div>

 {/* Modal Interactivo con Tour 360° de Uninorte */}
 {show360Modal && (
 <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
 <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
 {/* Header del Modal */}
 <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-uninorte-red flex items-center justify-center text-white">
 <Sparkles className="w-4 h-4" />
 </div>
 <div>
 <h3 className="font-black text-sm sm:text-base">
 Tour Virtual 360° — Universidad del Norte
 </h3>
 <p className="text-[10px] sm:text-xs text-gray-300">
 Navega por los bloques A-M, Biblioteca BKC, Casa Estudio CE, etc.
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

 {/* Iframe del Tour Virtual 360° */}
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
