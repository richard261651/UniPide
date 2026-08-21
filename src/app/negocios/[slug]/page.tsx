'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BusinessItem, ProductItem, RatingItem } from '@/types';
import ProductCard from '@/components/ProductCard';
import DeliveryBadge from '@/components/DeliveryBadge';
import {
  Star,
  Clock,
  MapPin,
  Store,
  Phone,
  Mail,
  Tag,
  Sparkles,
  MessageSquare,
  User,
  ChevronLeft,
  Award,
} from 'lucide-react';
import Link from 'next/link';

export default function BusinessDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<BusinessItem | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBusiness() {
      try {
        setLoading(true);
        const res = await fetch(`/api/businesses/slug/${slug}`);
        if (!res.ok) {
          throw new Error('Emprendimiento no encontrado');
        }
        const data = await res.json();
        setBusiness(data.business);
      } catch (err: any) {
        setError(err.message || 'Error cargando negocio');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchBusiness();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-64 bg-gray-200 rounded-3xl animate-pulse" />
        <div className="h-12 bg-gray-200 rounded-2xl w-1/3 animate-pulse" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Store className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">Emprendimiento no disponible</h2>
        <p className="text-xs text-gray-500">
          No pudimos encontrar este negocio o aún está en proceso de aprobación.
        </p>
        <Link
          href="/negocios"
          className="inline-flex items-center gap-1 text-xs font-bold text-uninorte-red hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al directorio</span>
        </Link>
      </div>
    );
  }

  // Filtrar productos
  const products = business.products || [];
  const subCategories = ['Todos', ...Array.from(new Set(products.map((p) => p.categoria).filter(Boolean)))];

  const filteredProducts =
    selectedSubCat === 'Todos'
      ? products
      : products.filter((p) => p.categoria === selectedSubCat);

  return (
    <div className="space-y-8 pb-16">
      {/* Banner y Portada */}
      <div className="relative bg-gray-900 text-white">
        <div className="h-56 sm:h-72 w-full relative overflow-hidden bg-gradient-to-r from-red-950 to-neutral-900">
          {business.banner && (
            <img
              src={business.banner}
              alt={business.nombre}
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        </div>

        {/* Info flotante */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 z-10 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1.5 shadow-2xl border-2 border-white/20 shrink-0 overflow-hidden">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.nombre}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full bg-uninorte-red text-white flex items-center justify-center font-black text-3xl rounded-2xl">
                  {business.nombre.charAt(0)}
                </div>
              )}
            </div>

            {/* Títulos y badges */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-600/80 text-white backdrop-blur-xs">
                  {business.categoria}
                </span>
                {business.esFundador && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm border border-amber-300">
                    <Award className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                    <span>Insignia de Fundador UniPide</span>
                  </span>
                )}
                <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{(business.avgRating || 4.8).toFixed(1)}</span>
                  <span>({business.ratings?.length || 0} reseñas)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {business.nombre}
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
                {business.descripcion}
              </p>

              {/* Ubicación y tiempo */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <MapPin className="w-4 h-4 text-uninorte-red shrink-0" />
                  <span>{business.ubicacionCampus}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Productos listos para entrega inmediata en campus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filtro de Subcategorías del Negocio */}
        {subCategories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
            {subCategories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedSubCat(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedSubCat === cat
                    ? 'bg-uninorte-red text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Menú de Productos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <span>Menú y Productos</span>
              <span className="text-xs text-gray-400 font-normal">
                ({filteredProducts.length} disponibles)
              </span>
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-8 space-y-2">
              <Store className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800 text-sm">No hay productos en esta sección</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    business: {
                      id: business.id,
                      nombre: business.nombre,
                      slug: business.slug,
                      ubicacionCampus: business.ubicacionCampus,
                      zonaCampusCodigo: business.zonaCampusCodigo,
                      tiempoBasePrepMin: business.tiempoBasePrepMin,
                    },
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Reseñas y Calificaciones de Estudiantes */}
        <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base">
                  Reseñas de la Comunidad Uninorte
                </h3>
                <p className="text-xs text-gray-500">
                  Opiniones verificadas de estudiantes que han pedido aquí
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-500 font-black text-lg">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{(business.avgRating || 4.8).toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">de 5 estrellas</span>
            </div>
          </div>

          {!business.ratings || business.ratings.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-4">
              Aún no hay reseñas para este emprendimiento. ¡Sé el primero en calificar tras recibir tu pedido!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {business.ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-100 text-uninorte-red font-bold text-xs flex items-center justify-center">
                        {rating.cliente?.nombre ? rating.cliente.nombre.charAt(0) : 'E'}
                      </div>
                      <span className="text-xs font-bold text-gray-800">
                        {rating.cliente?.nombre || 'Estudiante Uninorte'}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rating.puntuacion
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rating.comentario && (
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{rating.comentario}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
