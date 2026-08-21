'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
 CheckCircle2,
 Sparkles,
 ArrowRight,
 Flame,
 Star,
 Award,
 TrendingUp,
 Loader2,
 ShieldCheck,
 Zap,
 HelpCircle,
 ChevronDown,
} from 'lucide-react';
import { SquishyPricingCard } from '@/components/ui/squishy-card';

interface LaunchStats {
 totalCupos: number;
 cuposOcupados: number;
 cuposDisponibles: number;
 promocionActiva: boolean;
}

const FAQS_EMPRENDEDORES = [
 {
 pregunta: '¿Cómo funciona la Oferta de Lanzamiento de $19.900/mes?',
 respuesta:
 'Los primeros 10 emprendimientos aprobados en la plataforma obtienen una tarifa preferencial de $19.900 COP/mes durante sus primeros 3 meses (33% de descuento frente a la tarifa regular de $29.900 COP/mes) e insignia permanente de Fundador UniPide .',
 },
 {
 pregunta: '¿Qué sucede cuando se acaban los 10 cupos de lanzamiento?',
 respuesta:
 'Los siguientes emprendimientos se registrarán con el Plan Estándar a la tarifa regular de $29.900 COP/mes. Todos los emprendimientos disfrutan de las mismas funciones de catálogo, pedidos y visibilidad en el campus.',
 },
 {
 pregunta: '¿Cómo se pagan las suscripciones en la plataforma?',
 respuesta:
 'Puedes realizar el pago por Nequi, Daviplata o transferencia bancaria directa a la administración. Al confirmar tu pago, el Administrador activa tu cuenta y abre tu negocio.',
 },
 {
 pregunta: '¿Cuál es el proceso para que mi emprendimiento aparezca en la web?',
 respuesta:
 '1) Llenas el formulario de registro y firmas la Política POL-EMP-001. 2) Realizas el pago de la suscripción. 3) El Administrador verifica tu pago en /admin/solicitudes, abre tu tienda y recibes una notificación por correo electrónico.',
 },
];

export default function LaunchPricingSection() {
 const [stats, setStats] = useState<LaunchStats | null>(null);
 const [loading, setLoading] = useState(true);
 const [openFaq, setOpenFaq] = useState<number | null>(null);

 useEffect(() => {
 async function fetchLaunchStats() {
 try {
 setLoading(true);
 const res = await fetch('/api/businesses/launch-stats');
 if (res.ok) {
 const data = await res.json();
 setStats(data);
 } else {
 setStats({
 totalCupos: 10,
 cuposOcupados: 0,
 cuposDisponibles: 10,
 promocionActiva: true,
 });
 }
 } catch (err) {
 setStats({
 totalCupos: 10,
 cuposOcupados: 0,
 cuposDisponibles: 10,
 promocionActiva: true,
 });
 } finally {
 setLoading(false);
 }
 }

 fetchLaunchStats();
 }, []);

 const promocionActiva = stats ? stats.promocionActiva : true;
 const cuposOcupados = stats ? stats.cuposOcupados : 0;
 const totalCupos = stats ? stats.totalCupos : 10;

 return (
 <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-16">
 <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-white to-[#FEEBE7]/40 rounded-3xl sm:rounded-[36px] p-4 sm:p-8 lg:p-14 border border-[#FBC6BB]/60 shadow-xl shadow-slate-950/5 space-y-8 sm:space-y-12">
 
 {/* Elementos Decorativos */}
 <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#D85A30]/10 rounded-full blur-3xl pointer-events-none" />
 <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#0F6E56]/10 rounded-full blur-3xl pointer-events-none" />

 {/* Encabezado */}
 <div className="relative z-10 text-center space-y-2.5 sm:space-y-3 max-w-3xl mx-auto">
 <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#FEEBE7] border border-[#FBC6BB] text-[#D85A30] text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-2xs">
 <Sparkles className="w-3.5 h-3.5 text-[#D85A30] shrink-0" />
 <span>Tarifas & Planes de Afiliación UniPide</span>
 </div>

 <h2 className="text-xl sm:text-4xl lg:text-5xl font-black text-[#1F222E] tracking-tight leading-tight">
 Planes de Suscripción para Emprendedores Uninorte
 </h2>

 <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
 Impulsa tus ventas en el campus con la tarifa promocional de lanzamiento o la tarifa estándar regular. Sin cláusulas ocultas ni comisiones por venta.
 </p>
 </div>

 {/* REJILLA DUAL DE PLANES DE PRECIO ANIMADOS (SQUISHY CARDS) */}
 <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-stretch max-w-5xl mx-auto">
 {/* TARJETA 1: PLAN FUNDADOR (OFERTA DE LANZAMIENTO) */}
 <SquishyPricingCard
 variant="fundador"
 monto={19900}
 montoTachado={29900}
 promocionActiva={promocionActiva}
 cuposOcupados={cuposOcupados}
 totalCupos={totalCupos}
 ctaText={promocionActiva ? 'Quiero ser uno de los 10 Fundadores' : 'Registrar Emprendimiento'}
 ctaHref="/register?rol=EMPRENDEDOR&plan=fundador"
 />

 {/* TARJETA 2: PLAN ESTÁNDAR (PRECIO FULL) */}
 <SquishyPricingCard
 variant="estandar"
 monto={29900}
 promocionActiva={false}
 ctaText="Registrarme con Tarifa Estándar"
 ctaHref="/register?rol=EMPRENDEDOR&plan=estandar"
 />
 </div>

 {/* SECCIÓN PREGUNTAS FRECUENTES (FAQ) */}
 <div className="relative z-10 max-w-3xl mx-auto pt-6 border-t border-slate-200/80 space-y-6">
 <div className="text-center space-y-1">
 <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center justify-center gap-2">
 <HelpCircle className="w-5 h-5 text-[#D85A30]" />
 <span>Preguntas Frecuentes de Emprendedores</span>
 </h3>
 <p className="text-xs text-slate-500 font-medium">
 Todo lo que necesitas saber antes de afiliar tu negocio en UniPide.
 </p>
 </div>

 <div className="space-y-3">
 {FAQS_EMPRENDEDORES.map((faq, idx) => {
 const isOpen = openFaq === idx;
 return (
 <div
 key={idx}
 className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition"
 >
 <button
 type="button"
 onClick={() => setOpenFaq(isOpen ? null : idx)}
 className="w-full text-left p-4 flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition cursor-pointer"
 >
 <span>{faq.pregunta}</span>
 <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#D85A30]' : ''}`} />
 </button>
 {isOpen && (
 <div className="p-4 pt-0 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 bg-slate-50/50">
 {faq.respuesta}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>

 </div>
 </section>
 );
}
