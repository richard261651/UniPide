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
      'Los primeros 10 emprendimientos aprobados en la plataforma obtienen una tarifa preferencial de $19.900 COP/mes durante sus primeros 3 meses (33% de descuento frente a la tarifa regular de $29.900 COP/mes) e insignia permanente de Fundador UniPide ⭐.',
  },
  {
    pregunta: '¿Qué sucede cuando se acaban los 10 cupos de lanzamiento?',
    respuesta:
      'Los siguientes emprendimientos se registrarán con el Plan Estándar a la tarifa regular de $29.900 COP/mes. Todos los emprendimientos disfrutan de las mismas funciones de catálogo, pedidos y pagos por Wompi.',
  },
  {
    pregunta: '¿Cómo se pagan las suscripciones en la plataforma?',
    respuesta:
      'Puedes elegir entre Prepagado (abono manual mes a mes por PSE, Nequi o Daviplata) o Débito Automático (cobro recurrente sin interrupciones a través de Wompi). Al pagar se envía la Factura Digital a tu correo.',
  },
  {
    pregunta: '¿Cuál es el proceso para que mi emprendimiento aparezca en la web?',
    respuesta:
      '1) Llenas el formulario de registro y firmas la Política POL-EMP-001. 2) Verificas tu pago de suscripción con Wompi. 3) El Administrador aprueba tu tienda en /admin/solicitudes y queda visible inmediatamente para todo el campus Uninorte.',
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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-white to-[#FEEBE7]/40 rounded-3xl sm:rounded-[36px] p-6 sm:p-10 lg:p-14 border border-[#FBC6BB]/60 shadow-xl shadow-slate-950/5 space-y-12">
        
        {/* Elementos Decorativos */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#D85A30]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#0F6E56]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado */}
        <div className="relative z-10 text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEEBE7] border border-[#FBC6BB] text-[#D85A30] text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D85A30]" />
            <span>Tarifas & Planes de Afiliación UniPide</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1F222E] tracking-tight leading-tight">
            Planes de Suscripción para Emprendedores Uninorte
          </h2>

          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Impulsa tus ventas en el campus con la tarifa promocional de lanzamiento o la tarifa estándar regular. Sin cláusulas ocultas ni comisiones por venta.
          </p>
        </div>

        {/* REJILLA DUAL DE PLANES DE PRECIO */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* PLAN 1: OFERTA DE LANZAMIENTO (PLAN FUNDADOR) */}
          <div className={`relative bg-white rounded-3xl p-6 sm:p-8 border-2 ${promocionActiva ? 'border-[#D85A30] shadow-xl shadow-[#D85A30]/10 ring-2 ring-[#D85A30]/20' : 'border-slate-200 opacity-90'} flex flex-col justify-between space-y-6`}>
            
            {promocionActiva && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D85A30] to-amber-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Oferta Limitada de Lanzamiento</span>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-[#FEEBE7] text-[#D85A30] rounded-full border border-[#FBC6BB]">
                  Plan Fundador ⭐
                </span>
                <Award className="w-6 h-6 text-[#D85A30]" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">Precio regular: <span className="line-through">$29.900 COP/mes</span></p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-[#D85A30] tracking-tight">
                    $19.900
                  </span>
                  <span className="text-xs font-bold text-slate-600">COP/mes</span>
                </div>
                <p className="text-xs font-bold text-[#0F6E56] mt-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Por tus primeros 3 meses de suscripción (33% OFF)</span>
                </p>
              </div>

              {/* Contador de Cupos en Vivo */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#D85A30]" />
                    <span>Cargando disponibilidad de cupos...</span>
                  </div>
                ) : promocionActiva ? (
                  <>
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#1F222E]">
                      <span className="flex items-center gap-1 text-[#D85A30]">
                        <Flame className="w-4 h-4 fill-[#D85A30]" />
                        <span>Cupos Fundador:</span>
                      </span>
                      <span className="bg-[#FEEBE7] text-[#D85A30] px-2.5 py-0.5 rounded-full border border-[#FBC6BB]">
                        {cuposOcupados} de {totalCupos} ocupados
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#D85A30] to-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (cuposOcupados / totalCupos) * 100)}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-2.5 bg-slate-100 rounded-2xl text-[11px] text-slate-600 font-medium">
                    Los 10 cupos promocionales han sido completados.
                  </div>
                )}
              </div>

              {/* Lista de Beneficios */}
              <ul className="space-y-3 pt-2 text-xs">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F6E56] shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">⭐ <strong>Insignia de Fundador UniPide</strong> permanente en tu perfil.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F6E56] shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">🥇 <strong>1º Posición en tu categoría</strong> durante 3 meses.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F6E56] shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">💳 Pagos por <strong>Wompi (Prepagado o Débito Automático)</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F6E56] shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">📜 Firma Digital POL-EMP-001 enviada a Google Drive.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/register?rol=EMPRENDEDOR&plan=fundador"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D85A30] hover:bg-[#F56649] text-white text-xs font-black rounded-2xl shadow-md transition transform active:scale-98 cursor-pointer"
              >
                <span>{promocionActiva ? 'Quiero ser uno de los 10 Fundadores' : 'Registrar Emprendimiento'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

          {/* PLAN 2: PRECIO FULL (PLAN ESTÁNDAR REGULAR) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  Plan Estándar Regular
                </span>
                <Zap className="w-6 h-6 text-slate-600" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">Tarifa Regular Post-Lanzamiento:</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    $29.900
                  </span>
                  <span className="text-xs font-bold text-slate-600">COP/mes</span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Tarifa full oficial aplicable al agotarse los 10 cupos o tras la promo.
                </p>
              </div>

              {/* Detalle informativo */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 font-medium">
                Sin comisiones por ventas. Pagas únicamente tu mensualidad fija de suscripción.
              </div>

              {/* Lista de Beneficios Plan Estándar */}
              <ul className="space-y-3 pt-2 text-xs">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">🛍️ Catálogo de productos y promociones ilimitado.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">🛵 Rastreador de entregas por bloques del campus Uninorte.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">🧾 Facturación Digital automática por correo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">⚡ Opción de cobro en Débito Automático con Wompi.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/register?rol=EMPRENDEDOR&plan=estandar"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl shadow-md transition transform active:scale-98 cursor-pointer"
              >
                <span>Registrarme con Tarifa Estándar</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

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
