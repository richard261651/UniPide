'use client';

import React from 'react';
import Link from 'next/link';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ShoppingBag, ArrowLeft, Store, Sparkles } from 'lucide-react';

export default function FavoritosPage() {
 const { user } = useAuth();
 const { favoriteProducts, loading } = useFavorites();

 if (!user) {
 return (
 <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
 <div className="w-14 h-14 bg-red-50 text-uninorte-red rounded-2xl flex items-center justify-center mx-auto">
 <Heart className="w-7 h-7 fill-uninorte-red" />
 </div>
 <h2 className="text-xl font-black text-gray-900">Inicia sesión para ver tus favoritos</h2>
 <p className="text-xs text-gray-500">
 Guarda tus snacks, postres y productos preferidos para pedirlos rápidamente en cualquier momento.
 </p>
 <Link
 href="/login"
 className="inline-block px-6 py-2.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-xl shadow-md transition"
 >
 Ingresar a mi cuenta
 </Link>
 </div>
 );
 }

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
 {/* Encabezado */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
 <div>
 <Link
 href="/"
 className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-uninorte-red mb-2 transition"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Volver al inicio</span>
 </Link>
 <div className="flex items-center gap-2">
 <Heart className="w-6 h-6 text-uninorte-red fill-uninorte-red" />
 <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
 Mis Productos Favoritos
 </h1>
 </div>
 <p className="text-xs text-gray-500 mt-1">
 Tus productos guardados para pedir en campus a un solo clic
 </p>
 </div>

 <Link
 href="/negocios"
 className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition self-start sm:self-auto"
 >
 <Store className="w-4 h-4 text-uninorte-red" />
 <span>Explorar más productos</span>
 </Link>
 </div>

 {/* Grid de Productos Favoritos */}
 {loading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3].map((n) => (
 <div key={n} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
 ))}
 </div>
 ) : favoriteProducts.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-4 max-w-lg mx-auto">
 <div className="w-16 h-16 bg-red-50 text-uninorte-red rounded-full flex items-center justify-center mx-auto">
 <Heart className="w-8 h-8 text-uninorte-red stroke-1" />
 </div>
 <div>
 <h3 className="font-bold text-gray-900 text-base">Aún no tienes productos favoritos</h3>
 <p className="text-xs text-gray-500 mt-1 leading-relaxed">
 Explora los emprendimientos del campus y haz clic en el icono del corazón en cualquier producto para guardarlo aquí.
 </p>
 </div>
 <Link
 href="/negocios"
 className="inline-flex items-center gap-2 px-5 py-2.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-xl shadow-md transition"
 >
 <Sparkles className="w-4 h-4" />
 <span>Descubrir productos</span>
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {favoriteProducts.map((prod) => (
 <ProductCard key={prod.id} product={prod} showBusinessInfo />
 ))}
 </div>
 )}
 </div>
 );
}
