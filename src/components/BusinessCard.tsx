import React from 'react';
import Link from 'next/link';
import { BusinessItem } from '@/types';
import { Star, Clock, MapPin, ChevronRight, Store, Award } from 'lucide-react';

interface BusinessCardProps {
  business: BusinessItem;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const avgRating = business.avgRating || 4.8;
  const ratingCount = business._count?.ratings || business.ratings?.length || 0;

  return (
    <Link
      href={`/negocios/${business.slug}`}
      className="group bg-white rounded-3xl border border-[#E5E2DC] shadow-sm hover:shadow-xl hover:border-[#FBC6BB] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Banner con Logo sobrepuesto */}
        <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
          {business.banner ? (
            <img
              src={business.banner}
              alt={business.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#F56649] to-amber-600 flex items-center justify-center">
              <Store className="w-10 h-10 text-white/40" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

          {/* Insignia de Fundador */}
          {business.esFundador && (
            <span className="absolute top-3 left-3 bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-300">
              <Award className="w-3 h-3 text-slate-900 fill-slate-900" />
              <span>Fundador UniPide</span>
            </span>
          )}

          {/* Badge de Categoría */}
          <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#1F222E] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs tracking-wider">
            {business.categoria}
          </span>

          {/* Logo del Emprendimiento */}
          <div className="absolute -bottom-3.5 left-5 w-14 h-14 rounded-2xl bg-white p-1 shadow-md border border-[#E5E2DC] overflow-hidden">
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.nombre}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-[#F56649] text-white flex items-center justify-center font-black text-base rounded-xl">
                {business.nombre.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Info del Negocio con Legibilidad Nítida */}
        <div className="pt-6 px-5 pb-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-[#1F222E] text-base group-hover:text-[#F56649] transition-colors line-clamp-1">
              {business.nombre}
            </h3>
            <div className="flex items-center gap-1 bg-[#FEEBE7] px-2 py-0.5 rounded-full text-[#F56649] text-xs font-bold shrink-0 border border-[#FBC6BB]">
              <Star className="w-3.5 h-3.5 fill-[#F56649] text-[#F56649]" />
              <span>{avgRating.toFixed(1)}</span>
              {ratingCount > 0 && <span className="text-[10px] text-slate-600 font-semibold">({ratingCount})</span>}
            </div>
          </div>

          <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
            {business.descripcion || 'Emprendimiento estudiantil en el campus Uninorte.'}
          </p>

          <div className="pt-1 flex items-center gap-2 text-xs text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-[#F56649] shrink-0" />
            <span className="line-clamp-1 font-bold text-slate-800">{business.ubicacionCampus || 'Campus Uninorte'}</span>
          </div>
        </div>
      </div>

      {/* Footer de la tarjeta */}
      <div className="px-5 py-3.5 bg-[#FAF7F2] border-t border-[#E5E2DC] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Entrega en Campus</span>
        </div>
        <div className="flex items-center gap-1 text-[#F56649] font-bold group-hover:translate-x-1 transition-transform">
          <span>Ver Menú</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
