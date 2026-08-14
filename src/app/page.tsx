'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BusinessItem, ProductItem } from '@/types';
import BusinessCard from '@/components/BusinessCard';
import ProductCard from '@/components/ProductCard';
import {
  Search,
  Sparkles,
  Tag,
  Store,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Utensils,
  Cake,
  Coffee,
  Palette,
  Shirt,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Todos', icon: Sparkles },
  { name: 'Comida Rápida', icon: Utensils },
  { name: 'Postres & Dulces', icon: Cake },
  { name: 'Bebidas & Café', icon: Coffee },
  { name: 'Accesorios & Merch', icon: Palette },
  { name: 'Ropa & Moda', icon: Shirt },
];

export default function HomePage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [offers, setOffers] = useState<ProductItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch Negocios
        const bizRes = await fetch(
          `/api/businesses?categoria=${encodeURIComponent(selectedCategory)}&q=${encodeURIComponent(searchQuery)}`
        );
        if (bizRes.ok) {
          const data = await bizRes.json();
          setBusinesses(data.businesses || []);
        }

        // Fetch Ofertas
        const offerRes = await fetch('/api/products?ofertas=true');
        if (offerRes.ok) {
          const offerData = await offerRes.json();
          setOffers(offerData.products || []);
        }
      } catch (err) {
        console.error('Error cargando catálogo:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Uninorte */}
      <section className="relative overflow-hidden bg-gradient-to-br from-uninorte-darkRed via-uninorte-red to-red-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 rounded-b-3xl sm:rounded-b-[40px] shadow-lg shadow-red-950/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RapiNorte — Marketplace & Delivery Campus Uninorte</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Pide en el campus, apoya el <span className="text-amber-400 underline decoration-amber-400/40">talento universitario</span>
          </h1>

          <p className="text-sm sm:text-base text-red-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Hamburguesas smash, brownies, galletas, café frío, stickers y merch de tus compañeros de Uninorte. Te lo entregamos en tu bloque o punto de encuentro.
          </p>

          {/* Buscador Rápido */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-xl ring-1 ring-black/5 text-gray-900">
              <div className="pl-3.5 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por hamburguesa, brownie, stickers, bloque..."
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none placeholder-gray-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Badges de confianza Uninorte */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] sm:text-xs text-red-200 pt-2 font-medium">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              Entregas en todos los Bloques (A, B, F, G, K, Parrish...)
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              Entrega rápida sin salir del campus
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Emprendedores 100% verificados
            </span>
          </div>
        </div>
      </section>

      {/* Selector de Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <span>Explorar Categorías</span>
          </h2>
          <span className="text-xs text-gray-500 font-medium">Filtra tus antojos</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap shadow-xs ${
                  isSelected
                    ? 'bg-uninorte-red text-white shadow-md shadow-red-900/20 scale-102'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-uninorte-red'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sección Destacada: OFERTAS DEL DÍA EN CAMPUS */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 rounded-3xl p-6 border border-amber-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
                    <span>Ofertas Especiales del Día</span>
                    <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
                      Exclusivo Campus
                    </span>
                  </h2>
                  <p className="text-xs text-gray-600">Descuentos y combos activos hoy para estudiantes</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {offers.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} showBusinessInfo={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lista de Emprendimientos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-uninorte-red" />
              <span>Emprendimientos en Campus</span>
            </h2>
            <p className="text-xs text-gray-500">Negocios aprobados listos para recibir tu pedido</p>
          </div>
          <Link
            href="/negocios"
            className="text-xs font-bold text-uninorte-red hover:underline flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
            <Store className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-800 text-base">No encontramos negocios en esta categoría</h3>
            <p className="text-xs text-gray-500">Prueba buscando con otro término o seleccionando "Todos".</p>
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 bg-uninorte-red text-white text-xs font-semibold rounded-xl"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        )}
      </section>

      {/* ¿Cómo Funciona? Banner explicativo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-bold text-uninorte-red uppercase tracking-wider">
              Fácil, Rápido y Universitario
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-1">¿Cómo pedir en Uninorte Emprende?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 text-uninorte-red font-black text-lg flex items-center justify-center shadow-xs">
                1
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">Elige tu Antojo</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Explora el catálogo de comida, postres, snacks o merch de los estudiantes de la universidad.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 font-black text-lg flex items-center justify-center shadow-xs">
                2
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">Indica tu Bloque</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Selecciona tu ubicación en el campus (Bloque A, F, K, Biblioteca, etc.) y calcularemos el tiempo estimado exacto.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center shadow-xs">
                3
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">Recibe y Disfruta</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Sigue las etapas de tu pedido en tiempo real y paga al recibir en efectivo, Nequi o Daviplata.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Emprendedores */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gray-900 via-zinc-900 to-black text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl z-10">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Comunidad Estudiantil
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              ¿Vendes comida, accesorios o postres en Uninorte?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Crea tu perfil de emprendedor gratis, publica tu menú, recibe pedidos organizados y aumenta tus ventas dentro del campus.
            </p>
          </div>

          <div className="z-10 shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg transition transform active:scale-95"
            >
              <span>Registrar mi Emprendimiento</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
