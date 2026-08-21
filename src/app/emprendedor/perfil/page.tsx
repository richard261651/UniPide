'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BusinessItem, CampusZoneItem } from '@/types';
import { Store, MapPin, Clock, Check, Loader2, Image, Layers, Sparkles } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

export default function EmprendedorPerfilPage() {
 const { user } = useAuth();
 const [business, setBusiness] = useState<BusinessItem | null>(null);
 const [zones, setZones] = useState<CampusZoneItem[]>([]);

 const [nombre, setNombre] = useState('');
 const [categoria, setCategoria] = useState('');
 const [descripcion, setDescripcion] = useState('');
 const [logo, setLogo] = useState('');
 const [banner, setBanner] = useState('');
 const [ubicacionCampus, setUbicacionCampus] = useState('');
 const [zonaCampusCodigo, setZonaCampusCodigo] = useState('ZONA_EMPRENDIMIENTOS');
 const [tiempoBasePrepMin, setTiempoBasePrepMin] = useState(15);

 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [savedSuccess, setSavedSuccess] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
 async function loadData() {
 try {
 setLoading(true);
 if (user?.businessId) {
 const res = await fetch(`/api/businesses/${user.businessId}`);
 if (res.ok) {
 const data = await res.json();
 const b = data.business;
 setBusiness(b);
 setNombre(b.nombre);
 setCategoria(b.categoria);
 setDescripcion(b.descripcion || '');
 setLogo(b.logo || '');
 setBanner(b.banner || '');
 setUbicacionCampus(b.ubicacionCampus || '');
 setZonaCampusCodigo(b.zonaCampusCodigo || 'ZONA_EMPRENDIMIENTOS');
 setTiempoBasePrepMin(b.tiempoBasePrepMin || 15);
 }
 }

 const zRes = await fetch('/api/zones');
 if (zRes.ok) {
 const zData = await zRes.json();
 setZones(zData.zones || []);
 }
 } catch (err) {
 console.error('Error cargando perfil:', err);
 } finally {
 setLoading(false);
 }
 }

 if (user) {
 loadData();
 }
 }, [user]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);
 setError('');
 setSavedSuccess(false);

 try {
 const res = await fetch(`/api/businesses/${user?.businessId}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 nombre,
 categoria,
 descripcion,
 logo,
 banner,
 ubicacionCampus,
 zonaCampusCodigo,
 tiempoBasePrepMin,
 }),
 });

 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || 'Error al actualizar información');
 }

 setSavedSuccess(true);
 setTimeout(() => setSavedSuccess(false), 3000);
 } catch (err: any) {
 setError(err.message || 'Error guardando cambios');
 } finally {
 setSaving(false);
 }
 };

 if (loading) {
 return (
 <div className="max-w-2xl mx-auto py-12">
 <div className="h-96 bg-white rounded-3xl animate-pulse border border-gray-100" />
 </div>
 );
 }

 return (
 <div className="max-w-3xl mx-auto space-y-6">
 <div>
 <h2 className="text-xl font-black text-gray-900">
 Información y Ubicación del Negocio
 </h2>
 <p className="text-xs text-gray-500">
 Modifica los detalles visibles para los clientes y el cálculo de entrega en campus
 </p>
 </div>

 <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
 {savedSuccess && (
 <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs rounded-2xl font-bold flex items-center gap-2">
 <Check className="w-4 h-4 text-emerald-600" />
 <span>¡Información del emprendimiento actualizada correctamente!</span>
 </div>
 )}

 {error && (
 <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl font-medium">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4 text-xs">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block font-semibold text-gray-700 mb-1">
 Nombre del Negocio *
 </label>
 <input
 type="text"
 required
 value={nombre}
 onChange={(e) => setNombre(e.target.value)}
 className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
 />
 </div>

 <div>
 <label className="block font-semibold text-gray-700 mb-1">
 Categoría del Negocio *
 </label>
 <select
 value={categoria}
 onChange={(e) => setCategoria(e.target.value)}
 className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none bg-white font-medium text-gray-800"
 >
 <option value="Comida Rápida"> Comida Rápida</option>
 <option value="Postres & Dulces"> Postres & Dulces</option>
 <option value="Bebidas & Café"> Bebidas & Café</option>
 <option value="Tecnología & Gadgets"> Tecnología & Gadgets</option>
 <option value="Accesorios & Merch"> Accesorios & Merch</option>
 <option value="Ropa & Moda"> Ropa & Moda</option>
 <option value="Papelería & Stickers"> Papelería & Stickers</option>
 <option value="Librería & Libros"> Librería & Libros</option>
 <option value="Belleza & Cuidado"> Belleza & Cuidado</option>
 <option value="Servicios & Tutorías"> Servicios & Tutorías</option>
 </select>
 </div>
 </div>

 <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
 <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
 <span> Modalidad de Emprendimiento Móvil en Campus</span>
 </div>
 <p className="text-[11px] text-slate-500 leading-relaxed">
 Tu negocio no requiere un local físico fijo ni tiempo de preparación programado. Los pedidos se procesan y entregan en tiempo real en los salones y bloques del campus Uninorte.
 </p>
 </div>

 <div>
 <label className="block font-semibold text-gray-700 mb-1">
 Descripción del Emprendimiento
 </label>
 <textarea
 rows={3}
 value={descripcion}
 onChange={(e) => setDescripcion(e.target.value)}
 className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
 <ImageUpload
 label="Logo del Emprendimiento"
 value={logo}
 onChange={(val) => setLogo(val)}
 aspectRatio="square"
 placeholderText="Arrastra el logo de tu negocio aquí"
 />

 <ImageUpload
 label="Banner / Imagen de Portada"
 value={banner}
 onChange={(val) => setBanner(val)}
 aspectRatio="banner"
 placeholderText="Arrastra la portada de tu negocio aquí"
 />
 </div>

 <button
 type="submit"
 disabled={saving}
 className="w-full py-3 bg-uninorte-red hover:bg-uninorte-darkRed text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs"
 >
 {saving ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 <span>Guardando...</span>
 </>
 ) : (
 <>
 <Check className="w-4 h-4" />
 <span>Actualizar Perfil del Negocio</span>
 </>
 )}
 </button>
 </form>
 </div>
 </div>
 );
}
