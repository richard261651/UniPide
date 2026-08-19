'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail } from '@/lib/utils';
import { ShoppingBag, Store, Shield, Loader2, ArrowRight, CheckCircle2, Lock, Mail, User, Phone, MapPin } from 'lucide-react';

const CAMPUS_ZONES = [
  { codigo: 'BLOQUE_A', nombre: 'Bloque A' },
  { codigo: 'BLOQUE_B', nombre: 'Bloque B' },
  { codigo: 'BLOQUE_C', nombre: 'Bloque C' },
  { codigo: 'BLOQUE_D', nombre: 'Bloque D' },
  { codigo: 'BLOQUE_E', nombre: 'Bloque E' },
  { codigo: 'BLOQUE_F', nombre: 'Bloque F' },
  { codigo: 'BLOQUE_G', nombre: 'Bloque G' },
  { codigo: 'BLOQUE_I', nombre: 'Bloque I' },
  { codigo: 'BLOQUE_J', nombre: 'Bloque J' },
  { codigo: 'BLOQUE_K', nombre: 'Bloque K' },
  { codigo: 'BLOQUE_L', nombre: 'Bloque L' },
  { codigo: 'BLOQUE_M', nombre: 'Bloque M' },
  { codigo: 'BAMBU_1', nombre: 'Bambú 1' },
  { codigo: 'BAMBU_2', nombre: 'Bambú 2' },
  { codigo: 'FUENTE_CENTRAL', nombre: 'Fuente' },
  { codigo: 'COLISEO_FUNDADORES', nombre: 'Coliseo' },
  { codigo: 'AUDITORIO_PRINCIPAL', nombre: 'Auditorio' },
  { codigo: 'BIBLIOTECA_PARRISH', nombre: 'Biblioteca' },
  { codigo: 'CASA_ESTUDIO', nombre: 'Casa Estudio' },
  { codigo: 'CENTRO_MEDICO', nombre: 'Centro Médico' },
  { codigo: 'CENTRO_DEPORTIVO', nombre: 'Centro Deportivo' },
  { codigo: 'SALON_PROYECCIONES', nombre: 'Salón de Proyecciones' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [rol, setRol] = useState<'CLIENTE' | 'EMPRENDEDOR' | 'ADMIN'>('CLIENTE');

  // Datos de usuario
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');

  // Datos de emprendimiento
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [categoriaNegocio, setCategoriaNegocio] = useState('Comida Rápida');
  const [ubicacionCampus, setUbicacionCampus] = useState('');
  const [zonaCampusCodigo, setZonaCampusCodigo] = useState('ZONA_EMPRENDIMIENTOS');
  const [descripcionNegocio, setDescripcionNegocio] = useState('');
  const [tiempoBasePrepMin, setTiempoBasePrepMin] = useState(15);

  // Clave de Administrador
  const [adminKey, setAdminKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(correo)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);

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
      ...(rol === 'ADMIN' && {
        adminKey,
      }),
    });

    if (!res.success) {
      setError(res.error || 'Error al registrar la cuenta');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-uninorte-red to-red-800 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-red-900/20">
            U
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Crear Cuenta en <span className="text-uninorte-red">UniPide</span>
          </h1>
          <p className="text-xs text-gray-500">
            Únete a la comunidad de estudiantes y emprendimientos del campus Uninorte
          </p>
        </div>

        {/* Selector de Rol Touch-Friendly */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-gray-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setRol('CLIENTE')}
            className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              rol === 'CLIENTE'
                ? 'bg-white text-uninorte-red shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cliente</span>
          </button>

          <button
            type="button"
            onClick={() => setRol('EMPRENDEDOR')}
            className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              rol === 'EMPRENDEDOR'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Emprendedor</span>
          </button>

          <button
            type="button"
            onClick={() => setRol('ADMIN')}
            className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              rol === 'ADMIN'
                ? 'bg-white text-red-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Datos Personales */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                1. Datos del Estudiante / Usuario
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Celular / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="300 123 4567"
                      className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Sección exclusiva para ADMIN */}
            {rol === 'ADMIN' && (
              <div className="pt-3 border-t border-gray-100 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-uninorte-red" />
                  <span>2. Autorización de Administrador</span>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-xs text-red-800">
                  El rol de Administrador gestiona aprobaciones y métricas globales de UniPide. Requiere la clave maestra de autorización.
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Clave Maestra de Administrador
                  </label>
                  <input
                    type="password"
                    required
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Clave de autorización (ej. uninorte2026)"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Sección para EMPRENDEDOR */}
            {rol === 'EMPRENDEDOR' && (
              <div className="pt-3 border-t border-gray-100 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Store className="w-4 h-4 text-amber-600" />
                  <span>2. Datos de tu Emprendimiento</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nombre del Negocio
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreNegocio}
                    onChange={(e) => setNombreNegocio(e.target.value)}
                    placeholder="Ej. Sweet Brownies Uninorte"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={categoriaNegocio}
                      onChange={(e) => setCategoriaNegocio(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-uninorte-red outline-none transition"
                    >
                      <option value="Comida Rápida">Comida Rápida</option>
                      <option value="Postres & Dulces">Postres & Dulces</option>
                      <option value="Bebidas & Café">Bebidas & Café</option>
                      <option value="Accesorios & Merch">Accesorios & Merch</option>
                      <option value="Ropa & Moda">Ropa & Moda</option>
                      <option value="Papelería & Stickers">Papelería & Stickers</option>
                      <option value="Servicios">Servicios</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Bloque / Zona Base
                    </label>
                    <select
                      value={zonaCampusCodigo}
                      onChange={(e) => setZonaCampusCodigo(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-uninorte-red outline-none transition"
                    >
                      {CAMPUS_ZONES.map((z) => (
                        <option key={z.codigo} value={z.codigo}>
                          {z.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ubicación Específica en Campus
                  </label>
                  <input
                    type="text"
                    required
                    value={ubicacionCampus}
                    onChange={(e) => setUbicacionCampus(e.target.value)}
                    placeholder="Ej. Kiosco 2, Pasillo Bloque F o Bancas de la Fuente"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                    <span>Tiempo Promedio de Espera / Preparación *</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ⏱️ {tiempoBasePrepMin} min aprox.
                    </span>
                  </label>
                  <select
                    value={tiempoBasePrepMin}
                    onChange={(e) => setTiempoBasePrepMin(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-uninorte-red outline-none transition font-medium"
                  >
                    <option value={5}>5 minutos (Entrega inmediata / Productos listos)</option>
                    <option value={10}>10 minutos (Entrega rápida)</option>
                    <option value={15}>15 minutos (Tiempo estándar)</option>
                    <option value={20}>20 minutos (Preparación al momento)</option>
                    <option value={25}>25 minutos (Platos elaborados / Horneado)</option>
                    <option value={30}>30 minutos (Pedidos personalizados)</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Este tiempo se calculará automáticamente junto a la distancia entre bloques al hacer pedidos.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Descripción del Emprendimiento
                  </label>
                  <textarea
                    rows={2}
                    value={descripcionNegocio}
                    onChange={(e) => setDescripcionNegocio(e.target.value)}
                    placeholder="Describe qué vendes, especialidades..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-uninorte-red outline-none transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-uninorte-red hover:bg-uninorte-darkRed text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>
                    {rol === 'ADMIN'
                      ? 'Registrar Administrador Oficial'
                      : rol === 'EMPRENDEDOR'
                      ? 'Registrar Mi Negocio'
                      : 'Completar Registro'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-bold text-uninorte-red hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
