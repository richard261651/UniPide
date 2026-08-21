'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProductItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Check,
  X,
  Loader2,
  Sparkles,
  ShoppingBag,
  Power,
  Layers,
  Shirt,
  Palette,
  Sliders,
  Images,
} from 'lucide-react';
import MultiImageUpload from '@/components/MultiImageUpload';

export default function EmprendedorProductosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form Fields
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<number | string>('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [stock, setStock] = useState<number | string>(20);
  const [categoria, setCategoria] = useState('');
  const [disponible, setDisponible] = useState(true);

  // Ofertas
  const [esOferta, setEsOferta] = useState(false);
  const [precioOferta, setPrecioOferta] = useState<number | string>('');
  const [descripcionOferta, setDescripcionOferta] = useState('');

  // Tallas, Colores y Variantes
  const [tieneTallas, setTieneTallas] = useState(false);
  const [tallasInput, setTallasInput] = useState('');

  const [tieneColores, setTieneColores] = useState(false);
  const [coloresInput, setColoresInput] = useState('');

  const [tieneVariaciones, setTieneVariaciones] = useState(false);
  const [nombreVariaciones, setNombreVariaciones] = useState('');
  const [opcionesVariacionesInput, setOpcionesVariacionesInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Modal Confirmar Eliminar Producto
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?businessId=${user?.businessId}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.businessId) {
      fetchProducts();
    }
  }, [user]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setFotos([]);
    setStock(20);
    setCategoria('');
    setDisponible(true);
    setEsOferta(false);
    setPrecioOferta('');
    setDescripcionOferta('');

    setTieneTallas(false);
    setTallasInput('S, M, L, XL');
    setTieneColores(false);
    setColoresInput('Negro, Blanco, Rojo, Azul');
    setTieneVariaciones(false);
    setNombreVariaciones('');
    setOpcionesVariacionesInput('');

    setError('');
    setModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setNombre(p.nombre);
    setDescripcion(p.descripcion || '');
    setPrecio(p.precio);
    
    // Fotos carrusel
    const photoList = p.fotos && p.fotos.length > 0 ? p.fotos : p.foto ? [p.foto] : [];
    setFotos(photoList);

    setStock(p.stock);
    setCategoria(p.categoria || '');
    setDisponible(p.disponible);
    setEsOferta(p.esOferta);
    setPrecioOferta(p.precioOferta || '');
    setDescripcionOferta(p.descripcionOferta || '');

    // Tallas, colores, variantes
    setTieneTallas(Boolean(p.tieneTallas));
    setTallasInput((p.tallasDisponibles || []).join(', '));

    setTieneColores(Boolean(p.tieneColores));
    setColoresInput((p.coloresDisponibles || []).join(', '));

    setTieneVariaciones(Boolean(p.tieneVariaciones));
    setNombreVariaciones(p.nombreVariaciones || '');
    setOpcionesVariacionesInput((p.opcionesVariaciones || []).join(', '));

    setError('');
    setModalOpen(true);
  };

  const parseInputList = (input: string) => {
    return input
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const tallasArray = tieneTallas ? parseInputList(tallasInput) : [];
    const coloresArray = tieneColores ? parseInputList(coloresInput) : [];
    const opcionesVariacionesArray = tieneVariaciones ? parseInputList(opcionesVariacionesInput) : [];

    const payload = {
      businessId: user?.businessId,
      nombre,
      descripcion,
      precio: Number(precio),
      foto: fotos.length > 0 ? fotos[0] : null,
      fotos,
      stock: Number(stock),
      categoria,
      disponible,
      esOferta,
      precioOferta: esOferta && precioOferta ? Number(precioOferta) : null,
      descripcionOferta: esOferta ? descripcionOferta : null,
      tieneTallas,
      tallasDisponibles: tallasArray,
      tieneColores,
      coloresDisponibles: coloresArray,
      tieneVariaciones,
      nombreVariaciones: tieneVariaciones ? nombreVariaciones : null,
      opcionesVariaciones: opcionesVariacionesArray,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error guardando producto');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDisponible = async (p: ProductItem) => {
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible: !p.disponible }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Error cambiando disponibilidad:', err);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setDeletingProduct(null);
        if (modalOpen && editingProduct?.id === deletingProduct.id) {
          setModalOpen(false);
        }
        fetchProducts();
      } else {
        alert(data.error || 'Error al eliminar el producto');
      }
    } catch (err) {
      console.error('Error eliminando producto:', err);
      alert('Error de conexión al procesar la eliminación');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            Catálogo & Menú del Emprendimiento
          </h2>
          <p className="text-xs text-gray-500">
            Agrega productos con carrusel de fotos, tallas, colores y ofertas personalizadas
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-2xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Lista de Productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 text-base">Aún no tienes productos publicados</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Comienza agregando tus productos, ropa, combos o accesorios a tu menú estudiantil.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-uninorte-red text-white text-xs font-bold rounded-2xl shadow-md"
          >
            Agregar mi Primer Producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const hasMultiplePhotos = p.fotos && p.fotos.length > 1;
            const mainImg = p.foto || (p.fotos && p.fotos[0]);

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-5 border transition flex flex-col justify-between space-y-3 ${
                  !p.disponible ? 'border-gray-300 opacity-60 bg-gray-50' : 'border-gray-100 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      {mainImg ? (
                        <img
                          src={mainImg}
                          alt={p.nombre}
                          className="w-16 h-16 rounded-2xl object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}

                      {hasMultiplePhotos && (
                        <span className="absolute -bottom-1 -right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                          <Images className="w-2.5 h-2.5" />
                          <span>{p.fotos?.length}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-gray-900 truncate">{p.nombre}</h4>
                        {p.esOferta && (
                          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                            Oferta
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-extrabold text-uninorte-red mt-0.5">
                        {p.esOferta && p.precioOferta ? (
                          <>
                            <span>{formatPrice(p.precioOferta)}</span>
                            <span className="text-[11px] text-gray-400 line-through ml-1.5 font-normal">
                              {formatPrice(p.precio)}
                            </span>
                          </>
                        ) : (
                          formatPrice(p.precio)
                        )}
                      </p>

                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                        {p.categoria || 'Sin categoría'} • Stock: {p.stock} un.
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.descripcion}</p>

                  {/* Badges de Tallas, Colores, Variantes activas */}
                  {(p.tieneTallas || p.tieneColores || p.tieneVariaciones) && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-gray-50">
                      {p.tieneTallas && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                          <Shirt className="w-3 h-3" />
                          <span>Tallas ({p.tallasDisponibles?.length || 0})</span>
                        </span>
                      )}
                      {p.tieneColores && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">
                          <Palette className="w-3 h-3" />
                          <span>Colores ({p.coloresDisponibles?.length || 0})</span>
                        </span>
                      )}
                      {p.tieneVariaciones && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                          <Sliders className="w-3 h-3" />
                          <span>{p.nombreVariaciones || 'Variantes'} ({p.opcionesVariaciones?.length || 0})</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleDisponible(p)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                      p.disponible
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{p.disponible ? 'Disponible' : 'Agotado hoy'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 text-gray-500 hover:text-uninorte-red hover:bg-red-50 rounded-xl transition"
                      title="Editar producto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingProduct(p)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear/Editar Producto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Camiseta Uninorte Oversize / Smash Burger"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Precio Regular (COP) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="18000"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Categoría Interna
                  </label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ej: Ropa, Postres, Accesorios"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                  />
                </div>
              </div>

              {/* Componente Multi-Imagen para Carrusel */}
              <MultiImageUpload
                images={fotos}
                onChange={(updated) => setFotos(updated)}
                label="Carrusel de Fotos del Producto"
                maxImages={6}
              />

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Descripción e Información de Producto
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe qué incluye el producto, características..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                />
              </div>

              {/* Módulo de Personalización (Tallas, Colores y Variantes) */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-uninorte-red" />
                  <span>Opciones de Personalización & Categorización</span>
                </h4>

                {/* Switch Tallas */}
                <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-blue-600" />
                      Activar Selección de Tallaje (Tallas)
                    </span>
                    <input
                      type="checkbox"
                      checked={tieneTallas}
                      onChange={(e) => setTieneTallas(e.target.checked)}
                      className="rounded text-uninorte-red focus:ring-uninorte-red"
                    />
                  </label>

                  {tieneTallas && (
                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        Tallas Disponibles (separadas por comas) *
                      </label>
                      <input
                        type="text"
                        required={tieneTallas}
                        value={tallasInput}
                        onChange={(e) => setTallasInput(e.target.value)}
                        placeholder="S, M, L, XL o 38, 40, 42"
                        className="w-full p-2 rounded-lg border border-gray-200 outline-none text-xs"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Ejemplo: <span className="font-mono">XS, S, M, L, XL</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Switch Colores */}
                <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-purple-600" />
                      Activar Opciones de Colores
                    </span>
                    <input
                      type="checkbox"
                      checked={tieneColores}
                      onChange={(e) => setTieneColores(e.target.checked)}
                      className="rounded text-uninorte-red focus:ring-uninorte-red"
                    />
                  </label>

                  {tieneColores && (
                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">
                        Colores Disponibles (separados por comas) *
                      </label>
                      <input
                        type="text"
                        required={tieneColores}
                        value={coloresInput}
                        onChange={(e) => setColoresInput(e.target.value)}
                        placeholder="Negro, Blanco, Rojo, Azul"
                        className="w-full p-2 rounded-lg border border-gray-200 outline-none text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Switch Variantes Personalizadas */}
                <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      Activar Variante Personalizada
                    </span>
                    <input
                      type="checkbox"
                      checked={tieneVariaciones}
                      onChange={(e) => setTieneVariaciones(e.target.checked)}
                      className="rounded text-uninorte-red focus:ring-uninorte-red"
                    />
                  </label>

                  {tieneVariaciones && (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                          Título de la Variante *
                        </label>
                        <input
                          type="text"
                          required={tieneVariaciones}
                          value={nombreVariaciones}
                          onChange={(e) => setNombreVariaciones(e.target.value)}
                          placeholder="Ej: Presentación, Sabor, Tipo de Tela, Término"
                          className="w-full p-2 rounded-lg border border-gray-200 outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                          Opciones (separadas por comas) *
                        </label>
                        <input
                          type="text"
                          required={tieneVariaciones}
                          value={opcionesVariacionesInput}
                          onChange={(e) => setOpcionesVariacionesInput(e.target.value)}
                          placeholder="Ej: 100g, 250g, 500g o Chocolate, Vainilla"
                          className="w-full p-2 rounded-lg border border-gray-200 outline-none text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Módulo de Ofertas y Descuentos */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esOferta}
                    onChange={(e) => setEsOferta(e.target.checked)}
                    className="rounded text-uninorte-red focus:ring-uninorte-red"
                  />
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Activar Oferta / Precio de Descuento
                  </span>
                </label>

                {esOferta && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Precio con Descuento (COP) *
                      </label>
                      <input
                        type="number"
                        required={esOferta}
                        min="100"
                        value={precioOferta}
                        onChange={(e) => setPrecioOferta(e.target.value)}
                        placeholder="15000"
                        className="w-full p-2 rounded-xl border border-amber-300 bg-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                        Descripción de Oferta
                      </label>
                      <input
                        type="text"
                        value={descripcionOferta}
                        onChange={(e) => setDescripcionOferta(e.target.value)}
                        placeholder="Ej: Promo Almuerzo 15% OFF"
                        className="w-full p-2 rounded-xl border border-amber-300 bg-white outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => setDeletingProduct(editingProduct)}
                    className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex items-center gap-1 transition text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                )}

                <div className="flex gap-2 flex-1 justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación Explicita */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-uninorte-red flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900">
                ¿Eliminar este producto?
              </h3>
              <p className="text-xs text-gray-600 font-semibold">
                "{deletingProduct.nombre}"
              </p>
              <p className="text-[11px] text-gray-400 pt-1 leading-relaxed">
                ¿Estás seguro de eliminar este producto? No podrás deshacer este cambio y se eliminará permanentemente de tu catálogo en el campus.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="flex-1 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 text-xs"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
