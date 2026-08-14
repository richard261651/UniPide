'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Store } from 'lucide-react';

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

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-50 text-uninorte-red rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Tu Carrito</h3>
                {businessName && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Store className="w-3 h-3 text-uninorte-red" />
                    <span>{businessName}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 opacity-50" />
                </div>
                <h4 className="font-bold text-gray-800 text-base">Tu carrito está vacío</h4>
                <p className="text-xs text-gray-500 max-w-xs">
                  Explora los emprendimientos de Uninorte y agrega tus antojos favoritos.
                </p>
                <Link
                  href="/negocios"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-4 py-2 bg-uninorte-red text-white font-semibold text-xs rounded-xl hover:bg-uninorte-darkRed transition shadow-sm"
                >
                  Ver Emprendimientos
                </Link>
              </div>
            ) : (
              items.map(({ product, cantidad, notas }) => {
                const precio = product.esOferta && product.precioOferta ? product.precioOferta : product.precio;
                return (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100 relative group"
                  >
                    {product.foto && (
                      <img
                        src={product.foto}
                        alt={product.nombre}
                        className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-gray-200/60"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-1">
                          {product.nombre}
                        </h4>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-gray-400 hover:text-red-600 transition p-1 -mt-1 -mr-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs font-extrabold text-uninorte-red mt-0.5">
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
                          onClick={() => updateQuantity(product.id, cantidad - 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-800 w-4 text-center">
                          {cantidad}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, cantidad + 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer con Subtotal y Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal ({totalItems} items):</span>
                <span className="text-lg font-extrabold text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="py-3 px-3 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  Vaciar
                </button>
                <Link
                  href="/carrito"
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 py-3 px-4 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-900/10 transition active:scale-95"
                >
                  <span>Proceder al Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
