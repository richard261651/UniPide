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
} from 'lucide-react';

interface LaunchStats {
  totalCupos: number;
  cuposOcupados: number;
  cuposDisponibles: number;
  promocionActiva: boolean;
}

export default function LaunchPricingSection() {
  const [stats, setStats] = useState<LaunchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLaunchStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/businesses/launch-stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          // Fallback seguro si falla el request
          setStats({
            totalCupos: 10,
            cuposOcupados: 3,
            cuposDisponibles: 7,
            promocionActiva: true,
          });
        }
      } catch (err) {
        console.error('Error cargando stats de lanzamiento:', err);
        setStats({
          totalCupos: 10,
          cuposOcupados: 3,
          cuposDisponibles: 7,
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
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-white to-[#FEEBE7]/40 rounded-3xl sm:rounded-[36px] p-6 sm:p-10 lg:p-14 border border-[#FBC6BB]/60 shadow-xl shadow-slate-950/5 space-y-8 sm:space-y-10">
        
        {/* Decoraciones sutiles de fondo con colores de marca */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#D85A30]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#0F6E56]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header de la Sección */}
        <div className="relative z-10 text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEEBE7] border border-[#FBC6BB] text-[#D85A30] text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D85A30]" />
            <span>Exclusivo para Emprendimientos Uninorte</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1F222E] tracking-tight leading-tight">
            {promocionActiva
              ? 'Sé de los primeros 10 emprendimientos en UniPide'
              : 'Los cupos de lanzamiento ya se agotaron'}
          </h2>

          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            {promocionActiva
              ? 'Estamos armando el marketplace de los emprendimientos de Uninorte, y buscamos a los primeros 10 que quieran crecer con nosotros desde el día uno.'
              : 'Gracias a los primeros 10 emprendimientos que confiaron en UniPide. Puedes registrar tu emprendimiento al precio regular y aun así ser parte de la comunidad.'}
          </p>
        </div>

        {/* Bloque Principal: Precios + Beneficios (Mobile: apilado vertical, Desktop: 2 columnas) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Columna Izquierda: Tarjeta Destacada de Precios */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D85A30]/30 shadow-lg shadow-[#D85A30]/10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-[#0F6E56]/10 text-[#0F6E56] rounded-full border border-[#0F6E56]/20">
                  {promocionActiva ? 'Oferta de Lanzamiento' : 'Tarifa Regular'}
                </span>
                <Award className="w-5 h-5 text-[#D85A30]" />
              </div>

              {/* Comparación de Precios */}
              <div className="space-y-1">
                {promocionActiva && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">
                      Precio regular:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-400 line-through">
                      $29.900 COP/mes
                    </span>
                  </div>
                )}

                <div className="pt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-5xl font-black text-[#D85A30] tracking-tight">
                      {promocionActiva ? '$19.900' : '$29.900'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-600">
                      COP/mes
                    </span>
                  </div>

                  {promocionActiva && (
                    <p className="text-xs font-bold text-[#0F6E56] mt-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Durante tus primeros 3 meses de afiliación</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Urgencia / Contador de Cupos */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-[#D85A30]" />
                  <span>Verificando disponibilidad de cupos...</span>
                </div>
              ) : promocionActiva ? (
                <>
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#1F222E]">
                    <span className="flex items-center gap-1.5 text-[#D85A30]">
                      <Flame className="w-4 h-4 fill-[#D85A30]" />
                      <span>Cupos de Lanzamiento:</span>
                    </span>
                    <span className="bg-[#FEEBE7] text-[#D85A30] px-2.5 py-0.5 rounded-full border border-[#FBC6BB]">
                      {cuposOcupados} de {totalCupos} cupos ocupados
                    </span>
                  </div>

                  {/* Barra de Progreso de Cupos */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#D85A30] to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (cuposOcupados / totalCupos) * 100)}%` }}
                    />
                  </div>

                  <div className="p-3 bg-[#FEEBE7]/60 rounded-2xl border border-[#FBC6BB]/70 text-[11px] text-[#1F222E] font-medium leading-normal">
                    Solo hay <strong>10 cupos</strong> para esta oferta de lanzamiento. Una vez se llenen, el siguiente emprendimiento entra al precio regular.
                  </div>
                </>
              ) : (
                <div className="p-3 bg-slate-100 rounded-2xl text-[11px] text-slate-600 font-medium">
                  Los 10 cupos con descuento del 33% han sido tomados. ¡Aún puedes afiliar tu negocio al precio regular!
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Lista de Beneficios */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-black text-[#1F222E] flex items-center gap-2 border-b border-slate-100 pb-3">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <span>Beneficios Exclusivos de Afiliación</span>
              </h3>

              <ul className="space-y-4">
                {/* Beneficio 1 */}
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-xl bg-[#0F6E56]/10 text-[#0F6E56] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0F6E56]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#1F222E]">
                      {promocionActiva
                        ? '$19.900/mes en vez de $29.900 (precio regular)'
                        : 'Suscripción accesible $29.900/mes'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {promocionActiva
                        ? 'Descuento especial del 33% aplicado durante tus primeros 3 meses en la plataforma.'
                        : 'Acceso a la plataforma, pedidos por bloque y clientes de todo el campus Uninorte.'}
                    </p>
                  </div>
                </li>

                {/* Beneficio 2 */}
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-xl bg-[#D85A30]/10 text-[#D85A30] shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4 text-[#D85A30]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#1F222E]">
                      Posición destacada: tu negocio aparece primero en su categoría
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {promocionActiva
                        ? 'Durante los mismos 3 meses, para que sea lo primero que vean los estudiantes al entrar a esa categoría.'
                        : 'Visibilidad completa en el directorio principal de Uninorte.'}
                    </p>
                  </div>
                </li>

                {/* Beneficio 3 */}
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <Award className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#1F222E]">
                      Insignia de Fundador UniPide
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Visible en tu perfil de forma permanente como uno de los emprendimientos pioneros del campus.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Botón CTA y Letra Chica */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-center sm:text-left">
              <Link
                href="/register?rol=EMPRENDEDOR"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#D85A30] hover:bg-[#F56649] text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-[#D85A30]/25 transition duration-300 transform active:scale-98 cursor-pointer"
              >
                <span>
                  {promocionActiva ? 'Quiero ser uno de los 10' : 'Registrar mi emprendimiento'}
                </span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                {promocionActiva
                  ? 'Después de los 3 meses, tu mensualidad pasa a $29.900 COP/mes. Tu posición destacada aplica únicamente mientras dure la promoción.'
                  : 'Sin cláusulas de permanencia. Cancela o suspende la visibilidad de tu negocio cuando desees.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
