'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Store,
  HeartHandshake,
} from 'lucide-react';

export default function LaunchPricingSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-16">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-white to-[#FEEBE7]/40 rounded-3xl sm:rounded-[36px] p-6 sm:p-10 lg:p-14 border border-[#FBC6BB]/60 shadow-xl shadow-slate-950/5 space-y-8 sm:space-y-12">
        
        {/* Elementos Decorativos */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#D85A30]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#0F6E56]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado */}
        <div className="relative z-10 text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Gratuito para Estudiantes Uninorte</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1F222E] tracking-tight leading-tight">
            Impulsa tu Emprendimiento en el Campus Sin Costos
          </h2>

          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            UniPide es una plataforma creada para apoyar el talento de la Universidad del Norte. Registrar tu tienda, publicar tus productos y recibir pedidos en tiempo real es <strong>totalmente gratis</strong>.
          </p>
        </div>

        {/* Tarjetas Beneficios Gratuitos */}
        <div className="relative z-10 max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D85A30] flex items-center justify-center font-black mx-auto md:mx-0">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Catálogo Ilimitado</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Publica todos tus productos, postres, merch o servicios con fotos, precios y stock en vivo sin comisiones.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black mx-auto md:mx-0">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Pedidos en Tiempo Real</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Recibe notificaciones instantáneas de compras de estudiantes y gestiona tus entregas en el mapa del campus.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black mx-auto md:mx-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Comunidad Exclusiva</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Respaldo institucional con firma digital de buenas prácticas (POL-EMP-001) para la confianza de tus clientes.
            </p>
          </div>
        </div>

        {/* Botón CTA */}
        <div className="relative z-10 text-center">
          <Link
            href="/register?rol=EMPRENDEDOR"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#D85A30] hover:bg-[#F56649] text-white font-black text-sm rounded-2xl shadow-lg shadow-[#D85A30]/20 transition transform hover:-translate-y-0.5"
          >
            <span>Registrar mi Emprendimiento Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
