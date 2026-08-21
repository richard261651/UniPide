'use client';

import React, { useState } from 'react';
import { ProductItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Plus, Check, Tag, AlertCircle, ShoppingBag, Images, Shirt, Palette, Sliders, Heart } from 'lucide-react';
import ProductModal from './ProductModal';

interface ProductCardProps {
 product: ProductItem;
 showBusinessInfo?: boolean;
}

export default function ProductCard({ product, showBusinessInfo = false }: ProductCardProps) {
 const { addItem, clearCart } = useCart();
 const { isFavorite, toggleFavorite } = useFavorites();
 const [added, setAdded] = useState(false);
 const [modalOpen, setModalOpen] = useState(false);
 const [conflictModalOpen, setConflictModalOpen] = useState(false);
 const [currentBizName, setCurrentBizName] = useState('');

 const fav = isFavorite(product.id);

 const handleFavoriteClick = async (e: React.MouseEvent) => {
 e.stopPropagation();
 await toggleFavorite(product.id);
 };

 const precioFinal = product.esOferta && product.precioOferta ? product.precioOferta : product.precio;
 const tieneDescuento = product.esOferta && product.precioOferta && product.precioOferta < product.precio;
 const porcentajeDescuento = tieneDescuento
 ? Math.round(((product.precio - product.precioOferta!) / product.precio) * 100)
 : 0;

 const hasMultiplePhotos = product.fotos && product.fotos.length > 1;
 const hasVariants = Boolean(
 (product.tieneTallas && product.tallasDisponibles && product.tallasDisponibles.length > 0) ||
 (product.tieneColores && product.coloresDisponibles && product.coloresDisponibles.length > 0) ||
 (product.tieneVariaciones && product.opcionesVariaciones && product.opcionesVariaciones.length > 0)
 );

 const mainPhoto = product.foto || (product.fotos && product.fotos[0]);

 const handleCardClick = () => {
 setModalOpen(true);
 };

 const handleButtonClick = (e: React.MouseEvent) => {
 e.stopPropagation();
 if (!product.disponible || product.stock <= 0) return;

 // Si tiene variantes obligatorias o fotos múltiples, abrir modal de detalle
 if (hasVariants || hasMultiplePhotos) {
 setModalOpen(true);
 return;
 }

 // Si es un producto simple sin variantes, agregar directamente
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
 <div
 onClick={handleCardClick}
 className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative cursor-pointer"
 >
 {/* Imagen y Badges */}
 <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
 {mainPhoto ? (
 <img
 src={mainPhoto}
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
 <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
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

 {/* Botón de Favorito */}
 <button
 onClick={handleFavoriteClick}
 className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-md transition-all shadow-xs active:scale-90 ${
 fav
 ? 'bg-white text-uninorte-red shadow-md'
 : 'bg-black/40 text-white hover:bg-white hover:text-uninorte-red'
 }`}
 title={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
 >
 <Heart className={`w-4 h-4 transition-transform ${fav ? 'fill-uninorte-red scale-110' : ''}`} />
 </button>

 {/* Badge de fotos múltiples / carrusel */}
 {hasMultiplePhotos && (
 <div className="absolute top-2.5 right-11 z-10">
 <span className="inline-flex items-center gap-1 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
 <Images className="w-3 h-3" />
 <span>{product.fotos?.length}</span>
 </span>
 </div>
 )}

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

 <p className="text-xs text-slate-700 font-medium mt-1 line-clamp-2 leading-relaxed">
 {product.descripcion || 'Delicioso producto disponible en el campus.'}
 </p>

 {/* Badges de Opciones disponibles (Tallas, Colores, Variantes) */}
 {hasVariants && (
 <div className="flex flex-wrap gap-1 mt-2">
 {product.tieneTallas && (
 <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md">
 <Shirt className="w-2.5 h-2.5" />
 <span>Tallas</span>
 </span>
 )}
 {product.tieneColores && (
 <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-md">
 <Palette className="w-2.5 h-2.5" />
 <span>Colores</span>
 </span>
 )}
 {product.tieneVariaciones && (
 <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md">
 <Sliders className="w-2.5 h-2.5" />
 <span>{product.nombreVariaciones || 'Opciones'}</span>
 </span>
 )}
 </div>
 )}

 {product.descripcionOferta && product.esOferta && (
 <p className="mt-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 rounded-lg px-2 py-0.5 inline-block">
 {product.descripcionOferta}
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
 onClick={handleButtonClick}
 disabled={!product.disponible || product.stock <= 0}
 className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
 !product.disponible || product.stock <= 0
 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
 : added
 ? 'bg-emerald-600 text-white'
 : hasVariants
 ? 'bg-[#1F222E] text-white hover:bg-slate-800 active:scale-95'
 : 'bg-[#FEEBE7] text-[#F56649] hover:bg-[#F56649] hover:text-white border border-[#FBC6BB] active:scale-95'
 }`}
 >
 {added ? (
 <>
 <Check className="w-3.5 h-3.5" />
 <span>¡Agregado!</span>
 </>
 ) : hasVariants ? (
 <>
 <Sliders className="w-3.5 h-3.5" />
 <span>Elegir</span>
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

 {/* Modal Detallado con Carrusel y Selector de Variantes */}
 <ProductModal
 product={product}
 isOpen={modalOpen}
 onClose={() => setModalOpen(false)}
 />

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
