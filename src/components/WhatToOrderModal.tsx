'use client';

import React, { useState } from 'react';
import { ProductItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import {
 Sparkles,
 Dice5,
 X,
 ShoppingBag,
 Heart,
 Plus,
 Check,
 Zap,
 DollarSign,
 Utensils,
 Cake,
 Coffee,
 Laptop,
} from 'lucide-react';

interface WhatToOrderModalProps {
 isOpen: boolean;
 onClose: () => void;
}

const MOODS = [
 { id: 'random', label: ' Sorpréndeme', icon: Dice5 },
 { id: 'sweet', label: ' Algo Dulce', icon: Cake },
 { id: 'salty', label: ' Algo Salado', icon: Utensils },
 { id: 'coffee', label: ' Café / Bebida', icon: Coffee },
 { id: 'tech', label: ' Tecnología', icon: Laptop },
 { id: 'cheap', label: ' Menos de $10.000', icon: DollarSign },
 { id: 'favorites', label: ' Mis Favoritos', icon: Heart },
];

export default function WhatToOrderModal({ isOpen, onClose }: WhatToOrderModalProps) {
 const { addItem, clearCart } = useCart();
 const { favoriteProducts } = useFavorites();
 
 const [selectedMood, setSelectedMood] = useState('random');
 const [pickedProduct, setPickedProduct] = useState<ProductItem | null>(null);
 const [isSpinning, setIsSpinning] = useState(false);
 const [added, setAdded] = useState(false);

 if (!isOpen) return null;

 const fetchAndPickProduct = async () => {
 setIsSpinning(true);
 setPickedProduct(null);

 try {
 let pool: ProductItem[] = [];

 if (selectedMood === 'favorites') {
 pool = favoriteProducts;
 } else {
 const res = await fetch('/api/products?limite=50');
 if (res.ok) {
 const data = await res.json();
 const allProds: ProductItem[] = data.products || [];

 if (selectedMood === 'sweet') {
 pool = allProds.filter(
 (p) =>
 p.business?.categoria?.includes('Postres') ||
 p.nombre.toLowerCase().includes('brownie') ||
 p.nombre.toLowerCase().includes('galleta') ||
 p.nombre.toLowerCase().includes('dulce') ||
 p.nombre.toLowerCase().includes('chocolate')
 );
 } else if (selectedMood === 'salty') {
 pool = allProds.filter(
 (p) =>
 p.business?.categoria?.includes('Comida') ||
 p.nombre.toLowerCase().includes('hamburguesa') ||
 p.nombre.toLowerCase().includes('perro') ||
 p.nombre.toLowerCase().includes('salchipapa') ||
 p.nombre.toLowerCase().includes('tequeño')
 );
 } else if (selectedMood === 'coffee') {
 pool = allProds.filter(
 (p) =>
 p.business?.categoria?.includes('Bebidas') ||
 p.nombre.toLowerCase().includes('café') ||
 p.nombre.toLowerCase().includes('latte') ||
 p.nombre.toLowerCase().includes('té') ||
 p.nombre.toLowerCase().includes('jugo')
 );
 } else if (selectedMood === 'tech') {
 pool = allProds.filter(
 (p) =>
 p.business?.categoria?.includes('Tecnología') ||
 p.nombre.toLowerCase().includes('cable') ||
 p.nombre.toLowerCase().includes('cargador') ||
 p.nombre.toLowerCase().includes('audífono') ||
 p.nombre.toLowerCase().includes('gadget')
 );
 } else if (selectedMood === 'cheap') {
 pool = allProds.filter((p) => {
 const price = p.esOferta && p.precioOferta ? p.precioOferta : p.precio;
 return price <= 10000;
 });
 } else {
 pool = allProds;
 }

 // Fallback a todos si el filtro específico no tiene productos
 if (pool.length === 0) pool = allProds;
 }
 }

 if (pool.length === 0) {
 setPickedProduct(null);
 } else {
 // Simular ruleta rápida
 setTimeout(() => {
 const randomIndex = Math.floor(Math.random() * pool.length);
 setPickedProduct(pool[randomIndex]);
 setIsSpinning(false);
 }, 600);
 }
 } catch (err) {
 console.error('Error seleccionando recomendado:', err);
 setIsSpinning(false);
 }
 };

 const handleAddToCart = () => {
 if (!pickedProduct) return;
 addItem(pickedProduct, 1);
 setAdded(true);
 setTimeout(() => {
 setAdded(false);
 onClose();
 }, 1200);
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
 <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
 {/* Encabezado */}
 <div className="flex items-center justify-between border-b border-gray-100 pb-3">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
 <Dice5 className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-base font-black text-gray-900 leading-tight">
 ¿No sabes qué pedir?
 </h3>
 <p className="text-[11px] text-gray-500 font-medium">
 Selecciona tu antojo y te sugerimos la mejor opción del campus
 </p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Selector de Estado de Ánimo / Filtro */}
 <div className="flex flex-wrap gap-1.5 justify-center">
 {MOODS.map((mood) => {
 const Icon = mood.icon;
 const isSelected = selectedMood === mood.id;
 return (
 <button
 key={mood.id}
 onClick={() => setSelectedMood(mood.id)}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
 isSelected
 ? 'bg-uninorte-red text-white border-uninorte-red shadow-xs'
 : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
 }`}
 >
 <Icon className="w-3.5 h-3.5" />
 <span>{mood.label}</span>
 </button>
 );
 })}
 </div>

 {/* Botón de Girar Ruleta */}
 <button
 onClick={fetchAndPickProduct}
 disabled={isSpinning}
 className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
 >
 {isSpinning ? (
 <>
 <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
 <span>Buscando la mejor opción...</span>
 </>
 ) : (
 <>
 <Dice5 className="w-4 h-4 text-amber-400" />
 <span>¡Lanzar sugerencia aleatoria!</span>
 </>
 )}
 </button>

 {/* Resultado Recomendado */}
 {pickedProduct ? (
 <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3 animate-in zoom-in-95 duration-200">
 <div className="flex items-center gap-3">
 {pickedProduct.foto || pickedProduct.fotos?.[0] ? (
 <img
 src={pickedProduct.foto || pickedProduct.fotos?.[0]}
 alt={pickedProduct.nombre}
 className="w-16 h-16 rounded-xl object-cover border border-amber-200 shrink-0"
 />
 ) : (
 <div className="w-16 h-16 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
 <ShoppingBag className="w-6 h-6" />
 </div>
 )}
 <div className="min-w-0 flex-1">
 {pickedProduct.business && (
 <span className="text-[10px] font-bold text-uninorte-red uppercase tracking-wider block">
 {pickedProduct.business.nombre}
 </span>
 )}
 <h4 className="font-bold text-gray-900 text-sm truncate">
 {pickedProduct.nombre}
 </h4>
 <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
 {pickedProduct.descripcion || 'Ideal para tu antojo hoy'}
 </p>
 <div className="text-xs font-black text-slate-900 mt-1">
 {formatPrice(
 pickedProduct.esOferta && pickedProduct.precioOferta
 ? pickedProduct.precioOferta
 : pickedProduct.precio
 )}
 </div>
 </div>
 </div>

 <button
 onClick={handleAddToCart}
 className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
 added
 ? 'bg-emerald-600 text-white'
 : 'bg-uninorte-red hover:bg-uninorte-darkRed text-white active:scale-95'
 }`}
 >
 {added ? (
 <>
 <Check className="w-4 h-4" />
 <span>¡Agregado al carrito!</span>
 </>
 ) : (
 <>
 <Plus className="w-4 h-4" />
 <span>Agregar al carrito</span>
 </>
 )}
 </button>
 </div>
 ) : !isSpinning ? (
 <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
 Haz clic en <strong className="text-gray-700">"Lanzar sugerencia aleatoria"</strong> para descubrir qué pedir.
 </div>
 ) : null}
 </div>
 </div>
 );
}
