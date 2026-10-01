'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import {
	X,
	ShoppingBag,
	Plus,
	Minus,
	Trash2,
	ArrowRight,
	Store,
	Sparkles,
	MapPin,
	MessageSquare,
	ChevronRight,
} from 'lucide-react';
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
			<DrawerContent className="h-full flex flex-col justify-between bg-slate-50/50">
				{/* Encabezado Estético del Carrito */}
				<DrawerHeader className="bg-white border-b border-slate-100 p-5 shadow-2xs">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D85A30] to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
								<ShoppingBag className="w-5 h-5" />
							</div>
							<div>
								<DrawerTitle className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
									<span>Tu Carrito</span>
									{totalItems > 0 && (
										<span className="px-2 py-0.5 rounded-full bg-[#FEEBE7] text-[#D85A30] text-[11px] font-extrabold border border-[#FBC6BB]">
											{totalItems}
										</span>
									)}
								</DrawerTitle>
								{businessName ? (
									<DrawerDescription className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
										<Store className="w-3.5 h-3.5 text-[#D85A30]" />
										<span className="text-slate-800 font-bold truncate max-w-[200px]">{businessName}</span>
									</DrawerDescription>
								) : (
									<DrawerDescription className="text-xs text-slate-400 font-medium">
										{totalItems > 0 ? 'Revisa tu pedido antes de confirmar' : 'El carrito está vacío'}
									</DrawerDescription>
								)}
							</div>
						</div>

						<DrawerClose className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center outline-none">
							<X className="w-4 h-4" />
						</DrawerClose>
					</div>
				</DrawerHeader>

				{/* Cuerpo Principal del Carrito */}
				<DrawerBody className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
					{items.length === 0 ? (
						<div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 space-y-4">
							<div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-50 via-slate-100 to-amber-50 border border-orange-100 flex items-center justify-center shadow-inner relative">
								<ShoppingBag className="w-10 h-10 text-[#D85A30] opacity-40" />
								<Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
							</div>
							<div className="space-y-1.5 max-w-xs">
								<h4 className="font-black text-slate-900 text-base">¡Tu carrito está vacío!</h4>
								<p className="text-xs text-slate-500 font-medium leading-relaxed">
									Explora los emprendimientos de la Universidad del Norte y apoya el talento estudiantil del campus.
								</p>
							</div>
							<Link
								href="/negocios"
								onClick={() => setIsCartOpen(false)}
								className="mt-2 px-6 py-3 bg-[#D85A30] hover:bg-[#F56649] text-white font-black text-xs rounded-2xl transition shadow-lg shadow-orange-500/20 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
							>
								<span>Explorar Negocios</span>
								<ArrowRight className="w-4 h-4" />
							</Link>
						</div>
					) : (
						<div className="space-y-3">
							{/* Alerta de Tienda Única */}
							<div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 font-semibold flex items-center gap-2">
								<Store className="w-4 h-4 text-amber-600 shrink-0" />
								<span>Estás pidiendo a <strong>{businessName}</strong>. Entrega en campus Uninorte.</span>
							</div>

							{items.map(({ product, cantidad, opcionesSeleccionadas, notas }, idx) => {
								const precio = product.esOferta && product.precioOferta ? product.precioOferta : product.precio;
								const photoUrl = product.foto || (product.fotos && product.fotos[0]);

								return (
									<div
										key={`${product.id}-${idx}`}
										className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex gap-3.5 items-start relative group"
									>
										{/* Foto del Producto o Placeholder */}
										<div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 relative">
											{photoUrl ? (
												<img
													src={photoUrl}
													alt={product.nombre}
													className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xl">
													🍔
												</div>
											)}
										</div>

										{/* Detalles del Producto */}
										<div className="flex-1 min-w-0 space-y-1">
											<div className="flex items-start justify-between gap-1">
												<h4 className="font-extrabold text-xs text-slate-900 line-clamp-1 leading-snug">
													{product.nombre}
												</h4>
												<button
													type="button"
													onClick={() => removeItem(idx)}
													className="text-slate-400 hover:text-rose-600 transition p-1 -mt-1 -mr-1 rounded-lg hover:bg-rose-50"
													title="Eliminar ítem"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>

											{/* Opciones seleccionadas */}
											{opcionesSeleccionadas && (
												<p className="text-[10px] font-bold text-[#D85A30] bg-[#FEEBE7] px-2 py-0.5 rounded-md inline-block border border-[#FBC6BB]/40">
													{opcionesSeleccionadas}
												</p>
											)}

											{/* Notas del cliente */}
											{notas && (
												<p className="text-[10px] text-slate-500 font-medium italic flex items-center gap-1">
													<MessageSquare className="w-2.5 h-2.5 text-slate-400 shrink-0" />
													<span className="truncate">"{notas}"</span>
												</p>
											)}

											{/* Precio y Controles de Cantidad */}
											<div className="flex items-center justify-between pt-1.5">
												<span className="text-xs font-black text-slate-900">
													{formatPrice(precio * cantidad)}
												</span>

												<div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
													<button
														type="button"
														onClick={() => updateQuantity(idx, cantidad - 1)}
														className="w-6 h-6 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-rose-600 active:scale-95 transition shadow-2xs font-bold"
													>
														<Minus className="w-3 h-3" />
													</button>
													<span className="text-xs font-black text-slate-900 w-5 text-center">
														{cantidad}
													</span>
													<button
														type="button"
														onClick={() => updateQuantity(idx, cantidad + 1)}
														className="w-6 h-6 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-emerald-600 active:scale-95 transition shadow-2xs font-bold"
													>
														<Plus className="w-3 h-3" />
													</button>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</DrawerBody>

				{/* Pie / Resumen del Pedido y Acción de Checkout */}
				{items.length > 0 && (
					<DrawerFooter className="p-5 border-t border-slate-200 bg-white space-y-3 shadow-lg">
						{/* Subtotal e Información de Entrega */}
						<div className="space-y-1.5">
							<div className="flex items-center justify-between text-xs text-slate-500 font-medium">
								<span className="flex items-center gap-1">
									<MapPin className="w-3.5 h-3.5 text-slate-400" />
									<span>Entrega en Campus Uninorte:</span>
								</span>
								<span className="font-bold text-emerald-700">Calculada en Checkout</span>
							</div>

							<div className="flex items-center justify-between pt-1 border-t border-slate-100">
								<span className="text-slate-700 font-extrabold text-xs uppercase tracking-wider">Subtotal:</span>
								<span className="text-2xl font-black text-slate-900 tracking-tight">{formatPrice(subtotal)}</span>
							</div>
						</div>

						{/* Botones de Acción */}
						<div className="flex items-center gap-2 pt-1">
							<button
								type="button"
								onClick={clearCart}
								className="py-3 px-3.5 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
							>
								Vaciar
							</button>

							<Link
								href="/carrito"
								onClick={() => setIsCartOpen(false)}
								className="flex-1 py-3.5 px-5 bg-gradient-to-r from-[#D85A30] to-[#F56649] hover:from-[#C04925] hover:to-[#D85A30] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition active:scale-98 cursor-pointer"
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
