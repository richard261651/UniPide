'use client';

import React, { useState } from 'react';
import { ProductItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Plus, Check, Tag, AlertCircle, ShoppingBag, X } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  showBusinessInfo?: boolean;
}

export default function ProductCard({ product, showBusinessInfo = false }: ProductCardProps) {
  const { addItem, clearCart } = useCart();
  const [added, setAdded] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [currentBizName, setCurrentBizName] = useState('');

  const precioFinal = product.esOferta && product.precioOferta ? product.precioOferta : product.precio;
  const tieneDescuento = product.esOferta && product.precioOferta && product.precioOferta < product.precio;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(((product.precio - product.precioOferta!) / product.precio) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product.disponible || product.stock <= 0) return;

    const result = addItem(product, 1);
    if (result.requiresReset) {
      setCurrentBizName(result.currentBusinessName || 'otro negocio');
      setConflictModalOpen(true);
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleResetAndAdd = () => {
    clearCart();
    addItem(product, 1);
    setConflictModalOpen(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative">
        {/* Imagen y Badges */}
        <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
          {product.foto ? (
            <img
              src={product.foto}
              alt={product.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              <ShoppingBag className="w-8 h-8 opacity-40" />
            </div>
          )}

          {/* Badges de Oferta o Agotado */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {tieneDescuento && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
                <Tag className="w-3 h-3" />
                {porcentajeDescuento}% OFF
              </span>
            )}
            {!product.disponible || product.stock <= 0 ? (
              <span className="inline-block bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Agotado hoy
              </span>
            ) : null}
          </div>

          {/* Subcategoría badge */}
          {product.categoria && (
            <div className="absolute bottom-2 left-2.5">
              <span className="text-[10px] font-medium bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                {product.categoria}
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            {showBusinessInfo && product.business && (
              <p className="text-[11px] font-bold text-uninorte-red uppercase tracking-wider mb-1 line-clamp-1">
                {product.business.nombre}
              </p>
            )}

            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-uninorte-red transition-colors">
              {product.nombre}
            </h3>

            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {product.descripcion}
            </p>

            {product.descripcionOferta && product.esOferta && (
              <p className="mt-1 text-[11px] font-medium text-amber-700 bg-amber-50 rounded-lg px-2 py-0.5 inline-block">
                ✨ {product.descripcionOferta}
              </p>
            )}
          </div>

          {/* Precio y Botón Agregar */}
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-gray-900">
                  {formatPrice(precioFinal)}
                </span>
                {tieneDescuento && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.precio)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.disponible || product.stock <= 0}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                !product.disponible || product.stock <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-50 text-uninorte-red hover:bg-uninorte-red hover:text-white active:scale-95'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Agregado!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Advertencia de Carrito Multi-Negocio */}
      {conflictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">¿Deseas cambiar de negocio?</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Tu carrito actual contiene productos de <span className="font-semibold text-gray-800">{currentBizName}</span>. Cada pedido debe ser del mismo emprendimiento para calcular correctamente los tiempos de entrega en campus.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConflictModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Mantener actual
              </button>
              <button
                onClick={handleResetAndAdd}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md transition"
              >
                Vaciar y agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
