import React from 'react';
import Link from 'next/link';
import { Zap, Heart, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Marca */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg"
                alt="UniPide Icon"
                className="w-8 h-8 rounded-lg object-contain shadow-xs"
              />
              <span className="font-black text-gray-900 text-xl tracking-tight">
                Uni<span className="text-uninorte-red">Pide</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              La plataforma oficial de pedidos para los emprendimientos de estudiantes de la
              Universidad del Norte en Barranquilla, Colombia.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-uninorte-red" />
              <span>Campus Km 5 Vía Puerto Colombia</span>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Explorar</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <Link href="/" className="hover:text-uninorte-red transition">
                  Inicio y Ofertas
                </Link>
              </li>
              <li>
                <Link href="/negocios" className="hover:text-uninorte-red transition">
                  Todos los Emprendimientos
                </Link>
              </li>
              <li>
                <Link href="/negocios?cat=Comida%20Rápida" className="hover:text-uninorte-red transition">
                  Comida Rápida
                </Link>
              </li>
              <li>
                <Link href="/negocios?cat=Postres%20%26%20Dulces" className="hover:text-uninorte-red transition">
                  Postres & Dulces
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Emprendedores */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Emprendedores</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <Link href="/register" className="hover:text-uninorte-red transition">
                  Registrar mi Negocio
                </Link>
              </li>
              <li>
                <Link href="/emprendedor" className="hover:text-uninorte-red transition">
                  Portal de Gestión
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-uninorte-red transition">
                  Acceso Emprendedores
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Legal & Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Comunidad & Ayuda</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <Link href="/pqrs" className="hover:text-uninorte-red transition font-semibold text-gray-700">
                  📋 Radicar PQRS (Quejas & Sugerencias)
                </Link>
              </li>
              <li>
                <Link href="/pedidos" className="hover:text-uninorte-red transition">
                  Mis Pedidos
                </Link>
              </li>
            </ul>
            <div className="pt-2 text-[11px] text-gray-400">
              Diseñado con <Heart className="w-3 h-3 text-uninorte-red inline mx-0.5 fill-uninorte-red" /> para Uninorte.
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} UniPide — Universidad del Norte.</p>
          <p>Entregas en campus • Pagos contra entrega / Nequi</p>
        </div>
      </div>
    </footer>
  );
}
