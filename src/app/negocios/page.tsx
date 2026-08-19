'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BusinessItem } from '@/types';
import BusinessCard from '@/components/BusinessCard';
import { BUSINESS_CATEGORIES } from '@/lib/categories';
import { Search, Store, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { name: 'Todos', icon: Sparkles },
  ...BUSINESS_CATEGORIES.map((c) => ({ name: c.name, icon: c.icon })),
];

function NegociosContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'Todos';

  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/businesses?categoria=${encodeURIComponent(selectedCategory)}&q=${encodeURIComponent(searchQuery)}`
        );
        if (res.ok) {
          const data = await res.json();
          setBusinesses(data.businesses || []);
        }
      } catch (err) {
        console.error('Error cargando negocios:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <span className="text-[11px] font-bold text-uninorte-red uppercase tracking-wider">
            Directorio Campus Uninorte
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Emprendimientos Estudiantiles
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Encuentra negocios de comida, postres, merch y servicios dentro de la universidad
          </p>
        </div>

        {/* Buscador */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o bloque..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition shadow-2xs"
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-2xs ${
                isSelected
                  ? 'bg-uninorte-red text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-uninorte-red'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Grid de Negocios */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
          <Store className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 text-base">No hay emprendimientos disponibles</h3>
          <p className="text-xs text-gray-500">Prueba con otra búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NegociosPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
          <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <NegociosContent />
    </Suspense>
  );
}
