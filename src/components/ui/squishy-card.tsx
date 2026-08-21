'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
 Sparkles,
 Flame,
 Award,
 ArrowRight,
 CheckCircle2,
 Zap,
} from 'lucide-react';

interface SquishyPricingCardProps {
 variant: 'fundador' | 'estandar';
 monto: number;
 montoTachado?: number;
 promocionActiva?: boolean;
 cuposOcupados?: number;
 totalCupos?: number;
 ctaText: string;
 ctaHref: string;
}

export const SquishyPricingCard = ({
 variant,
 monto,
 montoTachado,
 promocionActiva = true,
 cuposOcupados = 0,
 totalCupos = 10,
 ctaText,
 ctaHref,
}: SquishyPricingCardProps) => {
 const isFundador = variant === 'fundador';

 return (
 <motion.div
 whileHover="hover"
 initial="initial"
 transition={{
 duration: 0.8,
 ease: 'backInOut',
 }}
 variants={{
 hover: {
 scale: 1.03,
 translateY: -6,
 },
 }}
 className={`relative min-h-[420px] sm:min-h-[460px] w-full shrink-0 overflow-hidden rounded-3xl p-5 sm:p-8 flex flex-col justify-between shadow-xl transition-shadow ${
 isFundador
 ? 'bg-gradient-to-br from-[#D85A30] via-[#F56649] to-[#C04925] text-white border-2 border-[#FBC6BB]/40 shadow-[#D85A30]/20'
 : 'bg-gradient-to-br from-[#1F222E] via-[#0F6E56] to-[#0A4A3A] text-white border border-slate-700/60 shadow-slate-950/20'
 }`}
 >
 {/* Elemento de Fondo SVG con Animacion Elastic Squishy */}
 <BackgroundSVG variant={variant} />

 {/* Contenido Principal (Capacidades de frente Z-10) */}
 <div className="relative z-10 space-y-3.5 sm:space-y-4">
 <div className="flex items-center justify-between gap-2 flex-wrap">
 <span
 className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-2xs ${
 isFundador
 ? 'bg-white/20 text-white border border-white/30'
 : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
 }`}
 >
 {isFundador ? (
 <>
 <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
 <span>Plan Fundador </span>
 </>
 ) : (
 <>
 <Zap className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
 <span>Tarifa Estándar</span>
 </>
 )}
 </span>

 {isFundador && promocionActiva && (
 <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
 <Flame className="w-3 h-3 fill-slate-950 shrink-0" />
 <span>33% OFF</span>
 </span>
 )}
 </div>

 {/* Bloque de Precio con Animación de Escala en Hover */}
 <div>
 {montoTachado && isFundador && promocionActiva && (
 <p className="text-[11px] sm:text-xs font-medium text-white/70 line-through">
 Precio regular: ${montoTachado.toLocaleString('es-CO')} COP/mes
 </p>
 )}

 <motion.div
 initial={{ scale: 0.95 }}
 variants={{
 hover: {
 scale: 1.05,
 },
 }}
 transition={{
 duration: 0.8,
 ease: 'backInOut',
 }}
 className="my-1 block origin-top-left font-black text-3xl sm:text-5xl tracking-tight leading-none text-white"
 >
 ${monto.toLocaleString('es-CO')}
 <span className="text-[11px] sm:text-sm font-bold text-white/80 font-sans ml-1">
 COP/mes
 </span>
 </motion.div>

 <p className="text-[11px] sm:text-xs font-semibold text-white/90 mt-1 flex items-center gap-1">
 {isFundador && promocionActiva ? (
 <>
 <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
 <span>Primeros 3 meses (Cupos Limitados)</span>
 </>
 ) : (
 <span>Sin cláusulas de permanencia</span>
 )}
 </p>
 </div>

 {/* Indicador de Cupos en Vivo (Si es Fundador) */}
 {isFundador && (
 <div className="p-2.5 sm:p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 space-y-1 text-xs">
 <div className="flex items-center justify-between font-extrabold text-[#FFF] text-[11px] sm:text-xs">
 <span className="flex items-center gap-1">
 <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
 <span>Cupos Ocupados:</span>
 </span>
 <span className="bg-white/30 px-2 py-0.5 rounded-full">
 {cuposOcupados} de {totalCupos}
 </span>
 </div>
 <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
 <div
 className="bg-amber-300 h-full rounded-full transition-all duration-500"
 style={{ width: `${Math.min(100, (cuposOcupados / totalCupos) * 100)}%` }}
 />
 </div>
 </div>
 )}

 {/* Lista de Beneficios Exclusivos */}
 <ul className="space-y-2 pt-1 text-[11px] sm:text-xs">
 {isFundador ? (
 <>
 <li className="flex items-center gap-2 text-white/95 font-medium">
 <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
 <span> <strong>Insignia de Fundador UniPide</strong> permanente.</span>
 </li>
 <li className="flex items-center gap-2 text-white/95 font-medium">
 <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
 <span> <strong>1ª Posición en tu categoría</strong> por 3 meses.</span>
 </li>
 <li className="flex items-center gap-2 text-white/95 font-medium">
 <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
 <span> Verificación de Pago y Activación por Admin.</span>
 </li>
 <li className="flex items-center gap-2 text-white/95 font-medium">
 <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
 <span> Contrato POL-EMP-001 en Google Drive.</span>
 </li>
 </>
 ) : (
 <>
 <li className="flex items-center gap-2 text-white/95 font-medium">
 <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
 <span> Catálogo y publicaciones sin límite.</span>
 </li>
 <li className="flex items-center gap-2 text-white/95 font-medium">
 <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
 <span> Entrega guiada por bloques en Uninorte.</span>
 </li>
 <li className="flex items-center gap-2 text-white/95 font-medium">
 <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
 <span> Facturación Digital automática por correo.</span>
 </li>
 <li className="flex items-center gap-2 text-white/95 font-medium">
 <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
 <span> 0% de comisiones por ventas realizadas.</span>
 </li>
 </>
 )}
 </ul>
 </div>

 {/* Boton Principal CTA con efecto Backdrop Blur Animado */}
 <div className="relative z-20 pt-3 sm:pt-4 border-t border-white/20">
 <Link
 href={ctaHref}
 className={`w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer text-center ${
 isFundador
 ? 'bg-white text-[#D85A30] hover:bg-white/90 hover:shadow-white/20'
 : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 hover:shadow-emerald-400/20'
 }`}
 >
 <span>{ctaText}</span>
 <ArrowRight className="w-4 h-4 shrink-0" />
 </Link>
 </div>
 </motion.div>
 );
};

const BackgroundSVG = ({ variant }: { variant: 'fundador' | 'estandar' }) => {
 return (
 <motion.svg
 viewBox="0 0 360 480"
 preserveAspectRatio="xMidYMid slice"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-35"
 variants={{
 hover: {
 scale: 1.25,
 rotate: 3,
 },
 }}
 transition={{
 duration: 0.9,
 ease: 'backInOut',
 }}
 >
 <motion.circle
 variants={{
 hover: {
 scaleY: 0.6,
 y: -30,
 },
 }}
 transition={{
 duration: 0.9,
 ease: 'backInOut',
 delay: 0.1,
 }}
 cx="180"
 cy="140"
 r="130"
 fill={variant === 'fundador' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(16, 185, 129, 0.25)'}
 />
 <motion.ellipse
 variants={{
 hover: {
 scaleY: 2.1,
 y: -20,
 },
 }}
 transition={{
 duration: 0.9,
 ease: 'backInOut',
 delay: 0.15,
 }}
 cx="180"
 cy="330"
 rx="130"
 ry="55"
 fill={variant === 'fundador' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(16, 185, 129, 0.18)'}
 />
 </motion.svg>
 );
};
