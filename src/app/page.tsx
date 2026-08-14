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
  MapPin,
  Clock,
  ShieldCheck,
  Utensils,
  Cake,
  Coffee,
  Palette,
  Shirt,
  ArrowRight,
  Zap,
  Lock,
  Mail,
  Loader2,
  ShoppingBag,
  Shield,
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
  const { user, loading: authLoading, login } = useAuth();

  // Estados del Marketplace
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [offers, setOffers] = useState<ProductItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  // Estados del Formulario de Ingreso Directo
  const [loginCorreo, setLoginCorreo] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const res = await login(loginCorreo, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Credenciales inválidas');
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        setLoadingData(true);
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
        setLoadingData(false);
      }
    }

    fetchData();
  }, [user, selectedCategory, searchQuery]);

  // 1. Pantalla de Carga Inicial
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-uninorte-red to-red-800 flex items-center justify-center text-white shadow-xl animate-bounce">
          <Zap className="w-7 h-7 fill-white text-white" />
        </div>
        <p className="text-xs font-bold text-gray-500 animate-pulse">Cargando RapiNorte...</p>
      </div>
    );
  }

  // 2. PANTALLA INICIAL DE LOGGEO: Si el usuario NO ha iniciado sesión, es lo primero que ve antes de entrar al portal
  if (!user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-b from-red-50/40 via-white to-slate-50">
        <div className="max-w-md w-full space-y-6">
          {/* Encabezado RapiNorte */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-uninorte-red to-red-800 flex items-center justify-center text-white mx-auto shadow-lg shadow-red-900/20">
              <Zap className="w-8 h-8 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Rapi<span className="text-uninorte-red">Norte</span>
              </h1>
              <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider bg-red-100 text-uninorte-red px-2.5 py-0.5 rounded-full">
                Marketplace Oficial Campus Uninorte
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Inicia sesión con tu cuenta institucional para acceder a los pedidos, emprendimientos y entregas en el campus.
            </p>
          </div>

          {/* Tarjeta de Formulario de Ingreso */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-5">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleDirectLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Correo Institucional
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginCorreo}
                    onChange={(e) => setLoginCorreo(e.target.value)}
                    placeholder="usuario@uninorte.edu.co"
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-red-900/20 transition flex items-center justify-center gap-2 active:scale-98"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando acceso...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center space-y-3">
              <p className="text-xs text-gray-500">¿Aún no tienes cuenta registrada?</p>
              <Link
                href="/register"
                className="block w-full py-2.5 text-center text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Crear Cuenta de Estudiante o Emprendedor
              </Link>
            </div>
          </div>

          {/* Badges de Confianza del Campus */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-gray-500 font-medium pt-2">
            <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-2xs">
              <MapPin className="w-4 h-4 text-uninorte-red mx-auto mb-1" />
              <span>Todos los Bloques</span>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-2xs">
              <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span>Entrega Rápida</span>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span>100% Uninorte</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. PANTALLA PRINCIPAL: Se muestra una vez que el usuario ha iniciado sesión
  return (
    <div className="space-y-10 sm:space-y-12 pb-16 w-full max-w-full overflow-hidden">
      {/* Hero Banner Uninorte con Saludo Personal */}
      <section className="relative overflow-hidden bg-gradient-to-br from-uninorte-darkRed via-uninorte-red to-red-900 text-white pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 rounded-b-3xl sm:rounded-b-[40px] shadow-lg shadow-red-950/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5" />
            <span>¡Hola, {user.nombre.split(' ')[0]}! — RapiNorte Campus</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Pide en el campus, apoya el <span className="text-amber-400 underline decoration-amber-400/40">talento universitario</span>
          </h1>

          <p className="text-xs sm:text-base text-red-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Hamburguesas smash, brownies, café frío y merch de tus compañeros de Uninorte entregados en tu bloque o punto de encuentro.
          </p>

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

        {loadingData ? (
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
