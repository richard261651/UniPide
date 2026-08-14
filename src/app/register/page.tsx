'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Store, Loader2, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [rol, setRol] = useState<'CLIENTE' | 'EMPRENDEDOR'>('CLIENTE');

  // Datos de usuario
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');

  // Datos de emprendimiento (si rol === 'EMPRENDEDOR')
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [categoriaNegocio, setCategoriaNegocio] = useState('Comida Rápida');
  const [ubicacionCampus, setUbicacionCampus] = useState('');
  const [zonaCampusCodigo, setZonaCampusCodigo] = useState('ZONA_EMPRENDIMIENTOS');
  const [descripcionNegocio, setDescripcionNegocio] = useState('');
  const [tiempoBasePrepMin, setTiempoBasePrepMin] = useState(15);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await register({
      nombre,
      correo,
      password,
      rol,
      telefono,
      ...(rol === 'EMPRENDEDOR' && {
        nombreNegocio,
        categoriaNegocio,
        ubicacionCampus,
        zonaCampusCodigo,
        descripcionNegocio,
        tiempoBasePrepMin,
      }),
    });

    if (!res.success) {
      setError(res.error || 'Error al registrar la cuenta');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-uninorte-red text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-red-900/20">
            U
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Crear Cuenta en Uninorte Emprende
          </h1>
          <p className="text-xs text-gray-500">
            Únete a la comunidad de estudiantes y emprendimientos del campus
          </p>
        </div>

        {/* Selector de Rol */}
        <div className="grid grid-cols-2 gap-3 bg-gray-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setRol('CLIENTE')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              rol === 'CLIENTE'
                ? 'bg-white text-uninorte-red shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Quiero Comprar (Cliente)</span>
          </button>

          <button
            type="button"
            onClick={() => setRol('EMPRENDEDOR')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              rol === 'EMPRENDEDOR'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Quiero Vender (Emprendedor)</span>
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
              1. Datos de tu Cuenta
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Laura Castro"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 3001234567"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Correo Institucional *
                </label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@uninorte.edu.co"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Campos adicionales de Emprendimiento */}
            {rol === 'EMPRENDEDOR' && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-700">
                    2. Datos de tu Emprendimiento
                  </h3>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Sujeto a Aprobación
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nombre del Negocio *
                    </label>
                    <input
                      type="text"
                      required
                      value={nombreNegocio}
                      onChange={(e) => setNombreNegocio(e.target.value)}
                      placeholder="Ej: Donas Dulce Uninorte"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={categoriaNegocio}
                      onChange={(e) => setCategoriaNegocio(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition bg-white"
                    >
                      <option value="Comida Rápida">🍔 Comida Rápida</option>
                      <option value="Postres & Dulces">🍰 Postres & Dulces</option>
                      <option value="Bebidas & Café">☕ Bebidas & Café</option>
                      <option value="Accesorios & Merch">🎨 Accesorios & Merch</option>
                      <option value="Ropa & Moda">👕 Ropa & Moda</option>
                      <option value="Servicios">📋 Servicios Estudiantiles</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Zona Principal en Campus *
                    </label>
                    <select
                      value={zonaCampusCodigo}
                      onChange={(e) => setZonaCampusCodigo(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition bg-white"
                    >
                      <option value="ZONA_EMPRENDIMIENTOS">Zona de Emprendimientos (Ágora)</option>
                      <option value="BLOQUE_F">Bloque F (Aulas Principales)</option>
                      <option value="BLOQUE_A">Bloque A (Ingenierías)</option>
                      <option value="BLOQUE_G">Bloque G (Diseño y Arquitectura)</option>
                      <option value="BLOQUE_K">Bloque K (Posgrados)</option>
                      <option value="FUENTE_CENTRAL">Fuente Central / Plaza de la Paz</option>
                      <option value="CAFETERIA_CENTRAL">Cafetería Central / Du Nord</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tiempo Base de Preparación
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="60"
                      value={tiempoBasePrepMin}
                      onChange={(e) => setTiempoBasePrepMin(Number(e.target.value))}
                      placeholder="15 min"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ubicación exacta / Punto de referencia en Campus *
                  </label>
                  <input
                    type="text"
                    required
                    value={ubicacionCampus}
                    onChange={(e) => setUbicacionCampus(e.target.value)}
                    placeholder="Ej: Pasillo Bloque F junto a las bancas, Kiosco 02"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Descripción del Emprendimiento
                  </label>
                  <textarea
                    rows={2}
                    value={descripcionNegocio}
                    onChange={(e) => setDescripcionNegocio(e.target.value)}
                    placeholder="Cuéntanos qué productos ofreces..."
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                rol === 'EMPRENDEDOR'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-uninorte-red hover:bg-uninorte-darkRed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>
                    {rol === 'EMPRENDEDOR'
                      ? 'Crear Emprendimiento y Enviar a Revisión'
                      : 'Completar Registro de Cliente'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-bold text-uninorte-red hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
