'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Store, Sliders } from 'lucide-react';
import {
 Drawer,
 DrawerContent,
 DrawerHeader,
 DrawerTitle,
 DrawerDescription,
 DrawerBody,
 DrawerFooter,
 DrawerClose,
} from '@/components/ui/drawer';

export default function CartDrawer() {
 const {
 items,
 removeItem,
 updateQuantity,
 clearCart,
 subtotal,
 totalItems,
 businessName,
 isCartOpen,
 setIsCartOpen,
 } = useCart();

 return (
 <Drawer open={isCartOpen} onOpenChange={setIsCartOpen} direction="right">
 <DrawerContent className="h-full flex flex-col justify-between">
 {/* Header del Carrito */}
 <DrawerHeader className="flex flex-row items-center justify-between border-b border-gray-100 p-5">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-red-50 text-uninorte-red rounded-2xl shadow-xs">
 <ShoppingBag className="w-5 h-5" />
 </div>
 <div>
 <DrawerTitle className="text-base font-black text-gray-900">Tu Carrito</DrawerTitle>
 {businessName ? (
 <DrawerDescription className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
 <Store className="w-3.5 h-3.5 text-uninorte-red" />
 <span>{businessName}</span>
 </DrawerDescription>
 ) : (
 <DrawerDescription className="text-xs text-gray-500">
 {totalItems > 0 ? `${totalItems} productos seleccionados` : 'Carrito vacío'}
 </DrawerDescription>
 )}
 </div>
 </div>

 <DrawerClose className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition outline-none">
 <X className="w-5 h-5" />
 </DrawerClose>
 </DrawerHeader>

 {/* Cuerpo / Lista de Productos */}
 <DrawerBody className="flex-1 overflow-y-auto p-5 space-y-3.5">
 {items.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
 <div className="w-16 h-16 rounded-3xl bg-red-50 text-uninorte-red flex items-center justify-center shadow-inner">
 <ShoppingBag className="w-8 h-8 opacity-60" />
 </div>
 <div className="space-y-1">
 <h4 className="font-black text-gray-900 text-base">Tu carrito está vacío</h4>
 <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
 Explora los emprendimientos de Uninorte y agrega tus antojos o artículos favoritos.
 </p>
 </div>
 <Link
 href="/negocios"
 onClick={() => setIsCartOpen(false)}
 className="mt-2 px-5 py-2.5 bg-uninorte-red text-white font-bold text-xs rounded-2xl hover:bg-uninorte-darkRed transition shadow-md shadow-red-900/10 active:scale-95 inline-flex items-center gap-2"
 >
 <span>Ver Emprendimientos</span>
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 ) : (
 items.map(({ product, cantidad, opcionesSeleccionadas, notas }, idx) => {
 const precio = product.esOferta && product.precioOferta ? product.precioOferta : product.precio;
 const photoUrl = product.foto || (product.fotos && product.fotos[0]);

 return (
 <div
 key={`${product.id}-${idx}`}
 className="flex gap-3.5 p-3 bg-gray-50/90 hover:bg-gray-100/60 rounded-2xl border border-gray-100 transition relative group"
 >
 {photoUrl && (
 <img
 src={photoUrl}
 alt={product.nombre}
 className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-gray-200/60 shadow-xs"
 />
 )}

 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-1">
 <h4 className="font-bold text-xs text-gray-900 line-clamp-1">
 {product.nombre}
 </h4>
 <button
 onClick={() => removeItem(idx)}
 className="text-gray-400 hover:text-red-600 transition p-1 -mt-1 -mr-1 rounded-lg"
 title="Eliminar producto"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>

 {/* Especificaciones / Variantes elegidas */}
 {opcionesSeleccionadas && (
 <p className="text-[10px] font-bold text-uninorte-red bg-red-50 px-2 py-0.5 rounded-md mt-1 inline-block">
 {opcionesSeleccionadas}
 </p>
 )}

 <p className="text-xs font-black text-gray-900 mt-1">
 {formatPrice(precio * cantidad)}
 </p>

 {notas && (
 <p className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">
 "{notas}"
 </p>
 )}

 {/* Controles de Cantidad */}
 <div className="flex items-center gap-2 mt-2">
 <button
 onClick={() => updateQuantity(idx, cantidad - 1)}
 className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition shadow-2xs font-bold"
 >
 <Minus className="w-3 h-3" />
 </button>
 <span className="text-xs font-black text-gray-900 w-5 text-center">
 {cantidad}
 </span>
 <button
 onClick={() => updateQuantity(idx, cantidad + 1)}
 className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition shadow-2xs font-bold"
 >
 <Plus className="w-3 h-3" />
 </button>
 </div>
 </div>
 </div>
 );
 })
 )}
 </DrawerBody>

 {/* Footer del Carrito con Subtotal y Checkout */}
 {items.length > 0 && (
 <DrawerFooter className="p-5 border-t border-gray-100 bg-white space-y-3">
 <div className="flex items-center justify-between text-sm">
 <span className="text-gray-500 font-semibold">Subtotal ({totalItems} items):</span>
 <span className="text-xl font-black text-gray-900">{formatPrice(subtotal)}</span>
 </div>

 <div className="flex gap-2 pt-1">
 <button
 onClick={clearCart}
 className="py-3 px-3.5 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
 >
 Vaciar
 </button>
 <Link
 href="/carrito"
 onClick={() => setIsCartOpen(false)}
 className="flex-1 py-3 px-4 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition active:scale-95"
 >
 <span>Proceder al Pago</span>
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 </DrawerFooter>
 )}
 </DrawerContent>
 </Drawer>
 );
}
