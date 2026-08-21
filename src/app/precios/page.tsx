import React from 'react';
import { Metadata } from 'next';
import LaunchPricingSection from '@/components/LaunchPricingSection';
import { ShieldCheck, CreditCard, UserCheck, ArrowRight, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Precios & Afiliación Emprendimientos | UniPide Uninorte',
  description: 'Conoce los planes de suscripción para vender tus productos en la plataforma universitaria UniPide de la Universidad del Norte.',
};

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16 space-y-12">
      {/* Hero Header para Emprendedores */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D85A30]/20 border border-[#D85A30]/40 text-[#F56649] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#F56649]" />
            <span>Únete a UniPide Uninorte</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Afilia tu Emprendimiento Estudiantil
          </h1>

          <p className="text-xs sm:text-base text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Publica tus alimentos, postres o accesorios en la plataforma exclusiva para el campus de la Universidad del Norte. Sin comisiones por venta.
          </p>
        </div>
      </section>

      {/* Rejilla de Precios Duales (Lanzamiento $19.900 vs Estándar $29.900) */}
      <LaunchPricingSection />

      {/* Proceso de Afiliación en 4 Pasos */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Proceso de Afiliación & Publicación en 4 Pasos
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Todo el flujo está optimizado con firmas legales y cobros seguros por Wompi Colombia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            {/* Paso 1 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative">
              <span className="w-7 h-7 bg-[#D85A30] text-white font-black text-xs rounded-full flex items-center justify-center">
                1
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm">Registro & Firma POL-EMP-001</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Llenas el formulario de tu negocio y firmas digitalmente la Política de Calidad e Higiene POL-EMP-001 con tu Cédula Colombiana.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative">
              <span className="w-7 h-7 bg-[#D85A30] text-white font-black text-xs rounded-full flex items-center justify-center">
                2
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm">Pago de Suscripción</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Realizas el pago de la tarifa correspondiente por Nequi, Daviplata o Transferencia Bancaria directa a la administración.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative">
              <span className="w-7 h-7 bg-[#D85A30] text-white font-black text-xs rounded-full flex items-center justify-center">
                3
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm">Verificación del Admin</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                El Administrador confirma la recepción del pago en el Portal Admin, activa tu cuenta de emprendedor y autoriza la apertura del negocio.
              </p>
            </div>

            {/* Paso 4 */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 relative">
              <span className="w-7 h-7 bg-[#0F6E56] text-white font-black text-xs rounded-full flex items-center justify-center">
                4
              </span>
              <h3 className="font-extrabold text-emerald-950 text-sm">Apertura & Correo</h3>
              <p className="text-emerald-800 font-medium leading-relaxed">
                Recibes un correo electrónico automático informándote que tu negocio está abierto y listo para publicar productos en el campus Uninorte.
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/register?rol=EMPRENDEDOR"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D85A30] hover:bg-[#F56649] text-white text-xs font-black rounded-2xl shadow-lg transition transform active:scale-98 cursor-pointer"
            >
              <span>Comenzar Registro de Emprendimiento</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
