'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BusinessItem, ProductItem } from '@/types';
import BusinessCard from '@/components/BusinessCard';
import ProductCard from '@/components/ProductCard';
import { isValidEmail } from '@/lib/utils';
import { BUSINESS_CATEGORIES } from '@/lib/categories';
import WhatToOrderModal from '@/components/WhatToOrderModal';
import LaunchPricingSection from '@/components/LaunchPricingSection';
import {
 Search,
 Sparkles,
 Tag,
 Store,
 ChevronRight,
 MapPin,
 Clock,
 ShieldCheck,
 ArrowRight,
 Zap,
 Lock,
 Mail,
 Loader2,
 Dice5,
 Heart,
} from 'lucide-react';

const CATEGORIES = [
 { name: 'Todos', icon: Sparkles },
 ...BUSINESS_CATEGORIES.map((c) => ({ name: c.name, icon: c.icon })),
];

export default function HomePage() {
 const { user, loading: authLoading, login } = useAuth();

 // Estados del Marketplace
 const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
 const [offers, setOffers] = useState<ProductItem[]>([]);
 const [selectedCategory, setSelectedCategory] = useState('Todos');
 const [searchQuery, setSearchQuery] = useState('');
 const [loadingData, setLoadingData] = useState(true);
 const [whatToOrderOpen, setWhatToOrderOpen] = useState(false);

 // Estados del Formulario de Ingreso Directo
 const [loginCorreo, setLoginCorreo] = useState('');
 const [loginPassword, setLoginPassword] = useState('');
 const [loginLoading, setLoginLoading] = useState(false);
 const [loginError, setLoginError] = useState('');

 const handleDirectLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoginError('');

 if (!isValidEmail(loginCorreo)) {
 setLoginError('Por favor ingresa un correo electrónico válido');
 return;
 }

 setLoginLoading(true);

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
 <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 bg-slate-50">
 <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-xl animate-bounce border border-slate-800">
 <Zap className="w-7 h-7 fill-amber-400 text-amber-400" />
 </div>
 <p className="text-xs font-bold text-slate-500 animate-pulse">Cargando UniPide...</p>
 </div>
 );
 }

 // 2. PANTALLA INICIAL DE LOGGEO: Si el usuario NO ha iniciado sesión, es lo primero que ve antes de entrar al portal
 if (!user) {
 return (
 <div className="min-h-[85vh] w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-b from-[#FEEBE7]/60 via-slate-50 to-white">
   <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
     
     {/* Columna Izquierda (En PC) / Arriba (En Teléfonos): Formulario de Login */}
     <div className="w-full max-w-md shrink-0 space-y-6">
       {/* Encabezado UniPide con Ícono Favicon */}
       <div className="text-center space-y-3">
         <img
           src="https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg"
           alt="UniPide Icon"
           className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain drop-shadow-md hover:scale-105 transition duration-300"
         />
         <div>
           <h1 className="text-3xl sm:text-4xl font-black text-[#1F222E] tracking-tight">
             Uni<span className="text-[#F56649]">Pide</span>
           </h1>
           <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#FEEBE7] text-[#F56649] border border-[#FBC6BB] px-3 py-1 rounded-full">
             LO DE TU CAMPUS, A UN PEDIDO DE DISTANCIA
           </span>
         </div>
          <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium leading-relaxed">
            Plataforma creada por <strong>Richard Guzmán</strong>, estudiante de la Universidad del Norte. Inicia sesión para acceder a los pedidos, emprendimientos y entregas en el campus.
          </p>
       </div>

       {/* Tarjeta de Formulario de Ingreso */}
       <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DC] shadow-xl shadow-[#1F222E]/5 space-y-5">
         {loginError && (
           <div className="p-3 bg-[#FEEBE7] border border-[#FBC6BB] text-[#C94026] text-xs rounded-xl font-medium">
             {loginError}
           </div>
         )}

         <form onSubmit={handleDirectLogin} className="space-y-4">
           <div>
             <label className="block text-xs font-semibold text-slate-800 mb-1">
               Correo Electrónico
             </label>
             <div className="relative">
               <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
               <input
                 type="email"
                 required
                 value={loginCorreo}
                 onChange={(e) => setLoginCorreo(e.target.value)}
                 placeholder="usuario@correo.com"
                 className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#F56649] focus:border-transparent outline-none transition font-medium text-slate-900"
               />
             </div>
           </div>

           <div>
             <div className="flex items-center justify-between mb-1">
               <label className="block text-xs font-semibold text-slate-800">
                 Contraseña
               </label>
               <Link
                 href="/forgot-password"
                 className="text-[11px] font-semibold text-[#F56649] hover:underline"
               >
                 ¿Olvidaste tu contraseña?
               </Link>
             </div>
             <div className="relative">
               <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
               <input
                 type="password"
                 required
                 value={loginPassword}
                 onChange={(e) => setLoginPassword(e.target.value)}
                 placeholder="••••••••"
                 className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#F56649] focus:border-transparent outline-none transition font-medium text-slate-900"
               />
             </div>
           </div>

           <button
             type="submit"
             disabled={loginLoading}
             className="w-full py-3.5 bg-[#F56649] hover:bg-[#F77C64] text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-[#F56649]/25 transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
           >
             {loginLoading ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin text-white" />
                 <span className="text-white">Verificando acceso...</span>
               </>
             ) : (
               <>
                 <span className="text-white">Ingresar al Portal</span>
                 <ArrowRight className="w-4 h-4 text-white" />
               </>
             )}
           </button>
         </form>

         <div className="pt-4 border-t border-slate-100 text-center space-y-3">
           <p className="text-xs text-slate-500">¿Aún no tienes cuenta registrada?</p>
           <Link
             href="/register"
             className="block w-full py-2.5 text-center text-xs font-bold text-slate-800 bg-[#F8F6F4] hover:bg-[#FEEBE7] hover:text-[#F56649] border border-slate-200 rounded-xl transition"
           >
             Crear Cuenta de Estudiante o Emprendedor
           </Link>
         </div>
       </div>

       {/* Badges de Confianza del Campus */}
       <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600 font-medium pt-2">
         <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
           <MapPin className="w-4 h-4 text-[#F56649] mx-auto mb-1" />
           <span>Todos los Bloques</span>
         </div>
         <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
           <Clock className="w-4 h-4 text-[#F56649] mx-auto mb-1" />
           <span>Entrega Rápida</span>
         </div>
         <div className="bg-[#0F6E56]/10 p-2.5 rounded-2xl border border-[#0F6E56]/20 shadow-2xs">
           <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
           <span>100% Uninorte</span>
         </div>
       </div>
     </div>

     {/* Columna Derecha (En PC) / Abajo (En Teléfonos): Sección de Precios */}
     <div className="w-full flex-1 min-w-0">
       <LaunchPricingSection />
     </div>

   </div>
 </div>
);
 }

 // 3. PANTALLA PRINCIPAL: Se muestra una vez que el usuario ha iniciado sesión
 return (
 <div className="space-y-10 sm:space-y-12 pb-16 w-full max-w-full overflow-hidden">
 {/* Hero Banner Uninorte con Saludo Personal */}
 <section className="relative overflow-hidden bg-slate-900 text-white pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 rounded-b-3xl sm:rounded-b-[40px] shadow-xl border-b border-slate-800">
 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

 <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5 sm:space-y-6">
 <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xs">
 <Sparkles className="w-3.5 h-3.5 text-[#F56649]" />
 <span className="text-white">¡Hola, {user.nombre.split(' ')[0]}! — UniPide Campus</span>
 </div>

 <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
 <span className="text-white">Pide en el campus, apoya el </span>
 <span className="text-[#F56649] underline decoration-[#F56649]/40">talento universitario</span>
 </h1>

 <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
 Hamburguesas smash, brownies, café frío y merch de tus compañeros de Uninorte entregados en tu bloque o punto de encuentro.
 </p>

 {/* Buscador Rápido */}
 <div className="max-w-2xl mx-auto pt-1">
 <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-xl border border-slate-200 text-slate-900 focus-within:ring-2 focus-within:ring-[#F56649] transition">
 <div className="pl-3.5 text-slate-400">
 <Search className="w-5 h-5" />
 </div>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Busca por hamburguesa, brownie, stickers, bloque..."
 className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400 font-medium text-slate-900"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="px-2 text-xs text-slate-400 hover:text-slate-700 font-bold"
 >
 
 </button>
 )}
 </div>
 </div>

 {/* Badges de confianza Uninorte */}
 <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-white pt-1 font-semibold">
 <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/15 text-white shadow-xs">
 <MapPin className="w-3.5 h-3.5 text-[#F56649]" />
 <span>Bloques A, B, F, G, K, Parrish...</span>
 </span>
 <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/15 text-white shadow-xs">
 <Clock className="w-3.5 h-3.5 text-[#F56649]" />
 <span>Entrega en minutos sin salir de clase</span>
 </span>
 <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/15 text-white shadow-xs">
 <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
 <span>Emprendedores Uninorte</span>
 </span>
 </div>
 </div>
 </section>

 {/* Selector de Categorías */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
 <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
 <span>Explorar Categorías</span>
 </h2>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setWhatToOrderOpen(true)}
 className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
 >
 <Dice5 className="w-4 h-4 text-white" />
 <span> ¿No sabes qué pedir?</span>
 </button>
 <Link
 href="/favoritos"
 className="px-3 py-1.5 bg-white hover:bg-red-50 text-uninorte-red border border-red-200 text-xs font-bold rounded-xl transition flex items-center gap-1"
 >
 <Heart className="w-3.5 h-3.5 fill-uninorte-red" />
 <span>Mis Favoritos</span>
 </Link>
 </div>
 </div>

 <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
 {CATEGORIES.map((cat) => {
 const Icon = cat.icon;
 const isSelected = selectedCategory === cat.name;
 return (
 <button
 key={cat.name}
 onClick={() => setSelectedCategory(cat.name)}
 className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap shadow-xs cursor-pointer ${
 isSelected
 ? 'bg-[#F56649] text-white shadow-md shadow-[#F56649]/20'
 : 'bg-white text-slate-700 hover:bg-[#FEEBE7] hover:text-[#F56649] border border-slate-200'
 }`}
 >
 <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#F56649]'}`} />
 <span>{cat.name}</span>
 </button>
 );
 })}
 </div>
 </section>

 {/* Sección Ofertas Especiales del Día */}
 {offers.length > 0 && selectedCategory === 'Todos' && !searchQuery && (
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="bg-[#1F222E] rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div className="flex items-center gap-2.5">
 <div className="p-2 bg-[#F56649] rounded-xl shadow-md">
 <Tag className="w-5 h-5 text-white fill-white" />
 </div>
 <div>
 <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
 Ofertas Universitarias del Día
 </h2>
 <p className="text-xs text-slate-300 font-medium">
 Descuentos y combos exclusivos para estudiantes de Uninorte
 </p>
 </div>
 </div>
 <span className="self-start sm:self-auto text-[11px] font-extrabold bg-[#F56649] text-white px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
 Tiempo Limitado 
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 {offers.slice(0, 3).map((prod) => (
 <div key={prod.id} className="bg-white rounded-2xl p-1 shadow-sm text-slate-900">
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
 <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
 <Store className="w-5 h-5 text-[#F56649]" />
 <span>Emprendimientos en Campus</span>
 </h2>
 <p className="text-xs text-slate-500 font-medium">
 {selectedCategory === 'Todos'
 ? 'Todos los negocios activos hoy en Uninorte'
 : `Mostrando negocios de ${selectedCategory}`}
 </p>
 </div>

 <Link
 href="/negocios"
 className="text-xs font-bold text-[#F56649] hover:underline flex items-center gap-1"
 >
 <span>Ver Directorio</span>
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>

 {loadingData ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3, 4, 5, 6].map((n) => (
 <div key={n} className="bg-white rounded-2xl h-64 animate-pulse border border-slate-200" />
 ))}
 </div>
 ) : businesses.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
 <Store className="w-12 h-12 text-slate-300 mx-auto" />
 <h3 className="font-bold text-slate-900 text-base">No se encontraron emprendimientos</h3>
 <p className="text-xs text-slate-500">
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
 <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
 <div className="space-y-2 text-center md:text-left">
 <span className="text-[11px] font-bold text-[#F56649] uppercase tracking-wider">
 ¿Tienes un negocio en la U?
 </span>
 <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
 Vende en UniPide y llega a todo el campus
 </h3>
 <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
 Crea tu menú digital, recibe pedidos organizados por salón y administra tus ofertas con cálculo automático de distancias entre bloques.
 </p>
 </div>

 <Link
 href="/register"
 className="px-6 py-3.5 bg-[#F56649] hover:bg-[#F77C64] text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-[#F56649]/25 transition whitespace-nowrap flex items-center gap-2 active:scale-98"
 >
 <span>Registrar mi Emprendimiento</span>
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 </section>

 {/* Sección de Precios de Lanzamiento para Emprendimientos */}
 <LaunchPricingSection />

 {/* Modal interactivo Recomendador ¿No sabes qué pedir? */}
 <WhatToOrderModal
 isOpen={whatToOrderOpen}
 onClose={() => setWhatToOrderOpen(false)}
 />
 </div>
 );
}
