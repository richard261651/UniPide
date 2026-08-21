'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Store, Plus, Edit2, Trash2, Search, Loader2, Check, X, Tag, Power, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import ImageUpload from '@/components/ImageUpload';
import { BusinessItem } from '@/types';

interface AdminProductItem {
  id: string;
  businessId: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  foto?: string | null;
  stock: number;
  categoria?: string | null;
  disponible: boolean;
  esOferta: boolean;
  precioOferta?: number | null;
  descripcionOferta?: string | null;
  business?: { id: string; nombre: string; logo?: string | null; ubicacionCampus?: string | null };
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBusinessFilter, setSelectedBusinessFilter] = useState<string>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);

  // Form Fields
  const [businessId, setBusinessId] = useState('');
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
  const [successMsg, setSuccessMsg] = useState('');

  // Modal Confirmación Eliminar
  const [deletingProduct, setDeletingProduct] = useState<AdminProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProd, resBiz] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/businesses'),
      ]);

      if (resProd.ok) {
        const dProd = await resProd.json();
        setProducts(dProd.products || []);
      }

      if (resBiz.ok) {
        const dBiz = await resBiz.json();
        setBusinesses(dBiz.businesses || []);
      }
    } catch (err) {
      console.error('Error cargando datos de admin productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setBusinessId(businesses[0]?.id || '');
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

  const openEditModal = (p: AdminProductItem) => {
    setEditingProduct(p);
    setBusinessId(p.businessId);
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
      businessId,
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
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar producto');
      }

      setModalOpen(false);
      setSuccessMsg(editingProduct ? 'Producto actualizado correctamente.' : 'Producto creado con éxito.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error al procesar producto');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingProduct(null);
        if (modalOpen && editingProduct?.id === deletingProduct.id) {
          setModalOpen(false);
        }
        setSuccessMsg('Producto eliminado correctamente del sistema.');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchData();
      }
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.categoria || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.business?.nombre || '').toLowerCase().includes(search.toLowerCase());

    const matchesBiz = selectedBusinessFilter === 'ALL' || p.businessId === selectedBusinessFilter;

    return matchesSearch && matchesBiz;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Gestión Global de Productos (Todos los Emprendimientos)
          </h2>
          <p className="text-xs text-gray-500">
            Crea, edita fotos, precios, ofertas o elimina cualquier producto de la plataforma
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs font-bold rounded-2xl shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs rounded-2xl font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de producto o emprendimiento..."
            className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none bg-white"
          />
        </div>

        <select
          value={selectedBusinessFilter}
          onChange={(e) => setSelectedBusinessFilter(e.target.value)}
          className="text-xs p-2.5 rounded-2xl border border-gray-200 bg-white font-medium outline-none focus:ring-2 focus:ring-uninorte-red w-full sm:w-auto"
        >
          <option value="ALL">Todos los Emprendimientos</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-6 space-y-3">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 text-sm">No se encontraron productos</h3>
          <p className="text-xs text-gray-400">Intenta cambiar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between space-y-3 hover:border-gray-200 transition"
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
                    <div className="flex items-center gap-1">
                      <Store className="w-3 h-3 text-uninorte-red shrink-0" />
                      <span className="text-[11px] font-bold text-gray-700 truncate">
                        {p.business?.nombre}
                      </span>
                    </div>

                    <h4 className="font-black text-sm text-gray-900 truncate mt-0.5">{p.nombre}</h4>

                    <p className="text-xs font-extrabold text-uninorte-red">
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
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.descripcion || 'Sin descripción'}</p>
              </div>

              {/* Botones de acción admin */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                  Stock: {p.stock}
                </span>

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
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Producto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">
                {editingProduct ? 'Editar Producto (Admin)' : 'Crear Nuevo Producto (Admin)'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Perteneciente al Emprendimiento *</label>
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none bg-white font-bold text-gray-800"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del producto"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Precio Regular (COP) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="15000"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Disponible</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                  />
                </div>
              </div>

              <ImageUpload
                label="Foto del Producto (Arrastra o pega URL)"
                value={foto}
                onChange={(val) => setFoto(val)}
                aspectRatio="square"
              />

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles del producto..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
                />
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
                    className="px-5 py-2.5 font-bold text-white bg-uninorte-red hover:bg-uninorte-darkRed rounded-xl shadow-md flex items-center justify-center gap-1.5"
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

      {/* Modal de Confirmación de Eliminación Explicita (Admin) */}
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
                ¿Estás seguro de eliminar este producto? No podrás deshacer los cambios y el producto se eliminará permanentemente de la plataforma.
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
