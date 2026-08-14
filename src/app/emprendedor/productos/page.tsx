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
} from 'lucide-react';

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
  const [foto, setFoto] = useState('');
  const [stock, setStock] = useState<number | string>(20);
  const [categoria, setCategoria] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [esOferta, setEsOferta] = useState(false);
  const [precioOferta, setPrecioOferta] = useState<number | string>('');
  const [descripcionOferta, setDescripcionOferta] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    setFoto('');
    setStock(20);
    setCategoria('');
    setDisponible(true);
    setEsOferta(false);
    setPrecioOferta('');
    setDescripcionOferta('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setNombre(p.nombre);
    setDescripcion(p.descripcion || '');
    setPrecio(p.precio);
    setFoto(p.foto || '');
    setStock(p.stock);
    setCategoria(p.categoria || '');
    setDisponible(p.disponible);
    setEsOferta(p.esOferta);
    setPrecioOferta(p.precioOferta || '');
    setDescripcionOferta(p.descripcionOferta || '');
    setError('');
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      businessId: user?.businessId,
      nombre,
      descripcion,
      precio: Number(precio),
      foto,
      stock: Number(stock),
      categoria,
      disponible,
      esOferta,
      precioOferta: esOferta && precioOferta ? Number(precioOferta) : null,
      descripcionOferta: esOferta ? descripcionOferta : null,
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

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto del menú?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Error eliminando producto:', err);
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
            Agrega productos, activa descuentos y marca items como "Agotados hoy" al instante
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
            <div key={n} className="h-40 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 text-base">Aún no tienes productos publicados</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Comienza agregando los primeros platos, postres o accesorios a tu menú estudiantil.
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
          {products.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-5 border transition flex flex-col justify-between space-y-3 ${
                !p.disponible ? 'border-gray-300 opacity-60 bg-gray-50' : 'border-gray-100 shadow-sm'
              }`}
            >
              <div>
                <div className="flex gap-3">
                  {p.foto ? (
                    <img
                      src={p.foto}
                      alt={p.nombre}
                      className="w-16 h-16 rounded-2xl object-cover bg-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}

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
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {/* Switch Agotado Hoy */}
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
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                  placeholder="Ej: Smash Burger Doble Queso"
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
                    placeholder="Ej: Hamburguesas, Postres, Combos"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  URL de la Foto del Producto
                </label>
                <input
                  type="url"
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Descripción e Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe qué contiene el producto..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                />
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

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
