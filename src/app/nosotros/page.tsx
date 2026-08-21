import React from 'react';
import Metadata from 'next';
import Link from 'next/link';
import { Store, ShieldCheck, Heart, MapPin, Sparkles, ArrowRight, Zap, CheckCircle2, Award, Users } from 'lucide-react';

export const metadata = {
  title: 'UniPide | Sobre Nosotros y Nuestra Misión en Uninorte',
  description:
    'Conoce la historia y misión de UniPide, la plataforma y marketplace universitario oficial que conecta a emprendedores estudiantiles con toda la comunidad de la Universidad del Norte en Barranquilla.',
};

export default function NosotrosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section Nosotros */}
      <div className="text-center space-y-4">
        <img
          src="https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg"
          alt="UniPide Isotipo Oficial"
          className="w-20 h-20 mx-auto object-contain drop-shadow-md"
        />
        <div className="space-y-1">
          <span className="text-xs font-bold text-uninorte-red uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Marca Oficial & Historia
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight pt-2">
            Sobre <span className="text-uninorte-red">UniPide</span> Uninorte
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            El marketplace estudiantil creado por y para la comunidad de la Universidad del Norte en Barranquilla.
          </p>
        </div>
      </div>

      {/* Tarjeta de Misión y Visión */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2 border-b border-gray-100 pb-3">
          <Sparkles className="w-5 h-5 text-uninorte-red" />
          <span>Nuestra Misión y Propósito</span>
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          <strong className="text-gray-900 font-bold">UniPide</strong> nació en el corazón del campus de la Universidad del Norte como una iniciativa innovadora para digitalizar y potenciar el comercio de los estudiantes emprendedores. En <strong className="text-gray-900 font-bold">UniPide</strong> creemos firmemente en el talento uninorteño y en el impacto de apoyar la economía colaborativa dentro de la universidad.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 space-y-2">
            <Store className="w-6 h-6 text-uninorte-red" />
            <h3 className="font-bold text-gray-900 text-xs">Visibilidad a Emprendedores</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Permite a los estudiantes mostrar sus menús, postres, bebidas, combos y accesorios de forma profesional.
            </p>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
            <Zap className="w-6 h-6 text-amber-600" />
            <h3 className="font-bold text-gray-900 text-xs">Entregas en Campus</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Cálculo inteligente de distancias y tiempo a pie entre Bloques A a M y espacios comunes de Uninorte.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-xs">Seguridad y Confianza</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Doble factor de autenticación 2FA, chat directo auditado y módulo de PQRS oficial.
            </p>
          </div>
        </div>
      </div>

      {/* Valores de la Marca UniPide */}
      <div className="bg-gradient-to-br from-slate-900 to-gray-900 text-white rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <h3 className="text-xl font-black tracking-tight">¿Por qué usar UniPide?</h3>
            <p className="text-xs text-gray-400">La experiencia diseñada para el ritmo universitario</p>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">100% Uninorteño:</strong> Todos los negocios pertenencen a estudiantes del campus.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Directo a tu Salón:</strong> Recibe tu pedido en cualquier Bloque de la universidad.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Transparencia Total:</strong> Calificaciones y opiniones reales verficadas.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Soporte Continuo:</strong> Sistema de PQRS para solución oportuna de inquietudes.</span>
          </li>
        </ul>
      </div>

      {/* Llamado a la Acción */}
      <div className="text-center bg-white rounded-3xl p-8 border border-gray-100 space-y-4 shadow-sm">
        <h3 className="text-lg font-black text-gray-900">¿Listo para formar parte de UniPide?</h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Explora los menús de hoy o registra tu emprendimiento estudiantil para comenzar a recibir pedidos en el campus.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/negocios"
            className="w-full sm:w-auto px-6 py-3 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Ver Emprendimientos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-2xl transition"
          >
            Registrar mi Negocio
          </Link>
        </div>
      </div>
    </div>
  );
}
