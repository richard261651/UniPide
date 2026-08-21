'use client';

import React, { useState } from 'react';
import { ProductItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Tag,
  Shirt,
  Palette,
  Sliders,
  AlertCircle,
  Heart,
} from 'lucide-react';

interface ProductModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addItem, clearCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTalla, setSelectedTalla] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariacion, setSelectedVariacion] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);
  const [validationError, setValidationError] = useState('');

  const [addedSuccess, setAddedSuccess] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [currentBizName, setCurrentBizName] = useState('');

  if (!isOpen || !product) return null;

  const fav = isFavorite(product.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(product.id);
  };

  const photos = product.fotos && product.fotos.length > 0 ? product.fotos : product.foto ? [product.foto] : [];
  const precioFinal = product.esOferta && product.precioOferta ? product.precioOferta : product.precio;
  const tieneDescuento = product.esOferta && product.precioOferta && product.precioOferta < product.precio;
  const porcentajeDescuento = tieneDescuento
    ? Math.round(((product.precio - product.precioOferta!) / product.precio) * 100)
    : 0;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    setValidationError('');

    // Validar selecciones obligatorias si están activas
    if (product.tieneTallas && product.tallasDisponibles && product.tallasDisponibles.length > 0 && !selectedTalla) {
      setValidationError('Por favor selecciona una talla antes de agregar al carrito.');
      return;
    }

    if (product.tieneColores && product.coloresDisponibles && product.coloresDisponibles.length > 0 && !selectedColor) {
      setValidationError('Por favor selecciona un color.');
      return;
    }

    if (
      product.tieneVariaciones &&
      product.opcionesVariaciones &&
      product.opcionesVariaciones.length > 0 &&
      !selectedVariacion
    ) {
      setValidationError(`Por favor selecciona una opción para "${product.nombreVariaciones || 'Variante'}".`);
      return;
    }

    // Construir texto de opciones seleccionadas
    const opcionesParts: string[] = [];
    if (selectedTalla) opcionesParts.push(`Talla: ${selectedTalla}`);
    if (selectedColor) opcionesParts.push(`Color: ${selectedColor}`);
    if (selectedVariacion) opcionesParts.push(`${product.nombreVariaciones || 'Opción'}: ${selectedVariacion}`);

    const opcionesTexto = opcionesParts.length > 0 ? opcionesParts.join(' | ') : undefined;

    const result = addItem(
      product,
      cantidad,
      undefined,
      selectedTalla || undefined,
      selectedColor || undefined,
      selectedVariacion || undefined,
      opcionesTexto
    );

    if (result.requiresReset) {
      setCurrentBizName(result.currentBusinessName || 'otro negocio');
      setConflictModalOpen(true);
    } else {
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const handleResetAndAdd = () => {
    clearCart();
    const opcionesParts: string[] = [];
    if (selectedTalla) opcionesParts.push(`Talla: ${selectedTalla}`);
    if (selectedColor) opcionesParts.push(`Color: ${selectedColor}`);
    if (selectedVariacion) opcionesParts.push(`${product.nombreVariaciones || 'Opción'}: ${selectedVariacion}`);
    const opcionesTexto = opcionesParts.length > 0 ? opcionesParts.join(' | ') : undefined;

    addItem(
      product,
      cantidad,
      undefined,
      selectedTalla || undefined,
      selectedColor || undefined,
      selectedVariacion || undefined,
      opcionesTexto
    );
    setConflictModalOpen(false);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Botones superiores de Favorito y Cerrar */}
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full backdrop-blur-md transition shadow-md active:scale-90 ${
              fav
                ? 'bg-white text-uninorte-red'
                : 'bg-black/50 hover:bg-black/80 text-white'
            }`}
            title={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-uninorte-red' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition shadow-md"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Zona Carrusel de Imágenes */}
        <div className="relative aspect-4/3 w-full bg-gray-900 shrink-0 overflow-hidden group">
          {photos.length > 0 ? (
            <img
              src={photos[currentImageIndex]}
              alt={product.nombre}
              className="w-full h-full object-cover transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-950">
              <ShoppingBag className="w-12 h-12 opacity-30" />
            </div>
          )}

          {/* Badges de Oferta */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {tieneDescuento && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                <Tag className="w-3.5 h-3.5" />
                {porcentajeDescuento}% OFF
              </span>
            )}
            {!product.disponible || product.stock <= 0 ? (
              <span className="inline-block bg-gray-950/80 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                Agotado hoy
              </span>
            ) : null}
          </div>

          {/* Flechas de Navegación del Carrusel (si hay más de 1 foto) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-xs transition z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-xs transition z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Puntos de Navegación / Indicadores */}
              <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Miniaturas de Fotos (si existen) */}
        {photos.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-t border-gray-800 overflow-x-auto shrink-0">
            {photos.map((ph, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-11 h-11 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                  idx === currentImageIndex ? 'border-amber-400 scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={ph} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Detalles del Producto y Selectores */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            {product.business && (
              <span className="text-[11px] font-bold text-uninorte-red uppercase tracking-wider block mb-0.5">
                {product.business.nombre}
              </span>
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-black text-gray-900 text-lg leading-snug">{product.nombre}</h3>
              <div className="text-right shrink-0">
                <span className="text-lg font-black text-gray-900 block">
                  {formatPrice(precioFinal * cantidad)}
                </span>
                {tieneDescuento && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.precio * cantidad)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{product.descripcion}</p>
          </div>

          {validationError && (
            <div className="p-3 bg-red-50 text-red-700 font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Opciones de Tallaje (Tallas) */}
          {product.tieneTallas && product.tallasDisponibles && product.tallasDisponibles.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-blue-600" />
                <span>Seleccionar Talla *</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.tallasDisponibles.map((talla) => (
                  <button
                    key={talla}
                    type="button"
                    onClick={() => {
                      setSelectedTalla(talla);
                      setValidationError('');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition border ${
                      selectedTalla === talla
                        ? 'bg-uninorte-red text-white border-uninorte-red shadow-xs scale-105'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opciones de Colores */}
          {product.tieneColores && product.coloresDisponibles && product.coloresDisponibles.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                <span>Seleccionar Color *</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.coloresDisponibles.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => {
                      setSelectedColor(col);
                      setValidationError('');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition border ${
                      selectedColor === col
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs scale-105'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opciones de Variante Personalizada */}
          {product.tieneVariaciones &&
            product.opcionesVariaciones &&
            product.opcionesVariaciones.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{product.nombreVariaciones || 'Variante'} *</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.opcionesVariaciones.map((opc) => (
                    <button
                      key={opc}
                      type="button"
                      onClick={() => {
                        setSelectedVariacion(opc);
                        setValidationError('');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition border ${
                        selectedVariacion === opc
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs scale-105'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {opc}
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Contador de Cantidad y Botón de Agregar */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
            {/* Controles + / - */}
            <div className="flex items-center bg-gray-100 rounded-2xl p-1 shrink-0">
              <button
                onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                className="p-1.5 text-gray-600 hover:bg-white rounded-xl transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 font-black text-gray-900 text-xs">{cantidad}</span>
              <button
                onClick={() => setCantidad((prev) => prev + 1)}
                className="p-1.5 text-gray-600 hover:bg-white rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.disponible || product.stock <= 0}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition shadow-md flex items-center justify-center gap-2 ${
                !product.disponible || product.stock <= 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-uninorte-red text-white hover:bg-uninorte-darkRed active:scale-[0.98]'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Agregado al Carrito!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar al Carrito • {formatPrice(precioFinal * cantidad)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Advertencia Multi-Negocio */}
      {conflictModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">¿Deseas cambiar de negocio?</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Tu carrito actual contiene productos de <span className="font-semibold text-gray-800">{currentBizName}</span>. Cada pedido debe pertenecer al mismo emprendimiento.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConflictModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Mantener actual
              </button>
              <button
                onClick={handleResetAndAdd}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md"
              >
                Vaciar y agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
