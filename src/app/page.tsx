'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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
  UserCheck,
  LogIn,
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
  const { user } = useAuth();
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
    <div className="space-y-10 sm:space-y-12 pb-16 w-full max-w-full overflow-hidden">
      {/* Hero Banner Uninorte */}
      <section className="relative overflow-hidden bg-gradient-to-br from-uninorte-darkRed via-uninorte-red to-red-900 text-white pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 rounded-b-3xl sm:rounded-b-[40px] shadow-lg shadow-red-950/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RapiNorte — Delivery & Marketplace Campus Uninorte</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Pide en el campus, apoya el <span className="text-amber-400 underline decoration-amber-400/40">talento universitario</span>
          </h1>

          <p className="text-xs sm:text-base text-red-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Hamburguesas smash, brownies, café frío y merch de tus compañeros de Uninorte entregados en tu bloque o punto de encuentro.
          </p>

          {/* Banner de Inicio / Registro para usuarios que no han iniciado sesión */}
          {!user && (
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="text-left text-xs">
                <p className="font-bold text-white">¿Eres nuevo en RapiNorte?</p>
                <p className="text-red-200 text-[11px]">Inicia sesión o crea tu cuenta para pedir</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/login"
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  href="/register"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-uninorte-red hover:bg-amber-100 text-xs font-black transition shadow-sm flex items-center justify-center gap-1"
                >
                  <span>Registrarme</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Buscador Rápido */}
          <div className="max-w-2xl mx-auto pt-1">
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
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-red-200 pt-1 font-medium">
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              Bloques A, B, F, G, K, Parrish...
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              Entrega en minutos sin salir de clase
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Emprendedores Uninorte
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

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap shadow-xs ${
                  isSelected
                    ? 'bg-uninorte-red text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-uninorte-red'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sección Ofertas Especiales del Día */}
      {offers.length > 0 && selectedCategory === 'Todos' && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 rounded-3xl p-5 sm:p-8 text-white shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Tag className="w-5 h-5 fill-white text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    Ofertas Universitarias del Día
                  </h2>
                  <p className="text-xs text-amber-100">
                    Descuentos y combos exclusivos para estudiantes de Uninorte
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Tiempo Limitado 🔥
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {offers.slice(0, 3).map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl p-1 shadow-sm text-gray-900">
                  <ProductCard product={prod} showBusinessInfo />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid Principal de Emprendimientos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Store className="w-5 h-5 text-uninorte-red" />
              <span>Emprendimientos en Campus</span>
            </h2>
            <p className="text-xs text-gray-500">
              {selectedCategory === 'Todos'
                ? 'Todos los negocios activos hoy en Uninorte'
                : `Mostrando negocios de ${selectedCategory}`}
            </p>
          </div>

          <Link
            href="/negocios"
            className="text-xs font-bold text-uninorte-red hover:underline flex items-center gap-1"
          >
            <span>Ver Directorio</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
            <Store className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-800 text-base">No se encontraron emprendimientos</h3>
            <p className="text-xs text-gray-500">
              Prueba buscando por otro término o selecciona una categoría diferente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        )}
      </section>

      {/* Banner para Estudiantes que quieren Vender */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-gray-900 text-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              ¿Tienes un negocio en la U?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Vende en RapiNorte y llega a todo el campus
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Crea tu menú digital, recibe pedidos organizados por salón y administra tus ofertas con cálculo automático de distancias entre bloques.
            </p>
          </div>

          <Link
            href="/register"
            className="px-6 py-3.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-red-900/40 transition whitespace-nowrap flex items-center gap-2"
          >
            <span>Registrar mi Emprendimiento</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
