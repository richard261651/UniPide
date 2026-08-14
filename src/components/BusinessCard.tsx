import React from 'react';
import Link from 'next/link';
import { BusinessItem } from '@/types';
import { Star, Clock, MapPin, ChevronRight, Store } from 'lucide-react';

interface BusinessCardProps {
  business: BusinessItem;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const avgRating = business.avgRating || 4.8;
  const ratingCount = business._count?.ratings || business.ratings?.length || 0;

  return (
    <Link
      href={`/negocios/${business.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Banner con Logo sobrepuesto */}
        <div className="relative h-32 w-full bg-gray-100 overflow-hidden">
          {business.banner ? (
            <img
              src={business.banner}
              alt={business.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-red-900 to-amber-900 flex items-center justify-center">
              <Store className="w-10 h-10 text-white/40" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badge de Categoría */}
          <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            {business.categoria}
          </span>

          {/* Logo del Emprendimiento */}
          <div className="absolute -bottom-3 left-4 w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-gray-100 overflow-hidden">
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.nombre}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-uninorte-red text-white flex items-center justify-center font-bold text-sm rounded-lg">
                {business.nombre.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Info del Negocio */}
        <div className="pt-5 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-gray-900 text-base group-hover:text-uninorte-red transition-colors line-clamp-1">
              {business.nombre}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md text-amber-700 text-xs font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{avgRating.toFixed(1)}</span>
              {ratingCount > 0 && <span className="text-[10px] text-gray-400">({ratingCount})</span>}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {business.descripcion}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-uninorte-red shrink-0" />
            <span className="line-clamp-1 font-medium">{business.ubicacionCampus}</span>
          </div>
        </div>
      </div>

      {/* Footer de la tarjeta con tiempo estimado y enlace */}
      <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Prep. {business.tiempoBasePrepMin} min</span>
        </div>
        <div className="flex items-center gap-0.5 text-uninorte-red font-bold group-hover:translate-x-1 transition-transform">
          <span>Ver Menú</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
