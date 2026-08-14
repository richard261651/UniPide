import React from 'react';
import Link from 'next/link';
import { MapPin, Heart, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-20 border-t border-gray-800 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Columna 1: Info Plataforma */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-uninorte-red flex items-center justify-center text-white font-black text-sm">
                U
              </div>
              <span className="font-extrabold text-white text-base">
                Uninorte<span className="text-uninorte-red">Emprende</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Plataforma digital universitaria para impulsar, conectar y comprar en los emprendimientos de estudiantes de la Universidad del Norte.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="w-4 h-4 text-uninorte-red shrink-0" />
              <span>Km 5 Vía Puerto Colombia, Barranquilla</span>
            </div>
          </div>

          {/* Columna 2: Categorías */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Categorías Populares
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/negocios?cat=Comida+R%C3%A1pida" className="hover:text-white transition">
                  🍔 Comida Rápida & Almuerzos
                </Link>
              </li>
              <li>
                <Link href="/negocios?cat=Postres+%26+Dulces" className="hover:text-white transition">
                  🍰 Postres, Galletas & Brownies
                </Link>
              </li>
              <li>
                <Link href="/negocios?cat=Bebidas+%26+Caf%C3%A9" className="hover:text-white transition">
                  ☕ Café Frío & Smoothies
                </Link>
              </li>
              <li>
                <Link href="/negocios?cat=Accesorios+%26+Merch" className="hover:text-white transition">
                  🎨 Stickers, Tote Bags & Merch
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Para Emprendedores */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Emprendedores Uninorte
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-white transition">
                  🚀 Registra tu negocio gratis
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  📊 Acceso a tu portal de ventas
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Comunidad 100% verificada
                </span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto y Soporte */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Soporte Institucional
            </h4>
            <p className="text-xs text-gray-400 mb-2">
              ¿Tienes dudas o necesitas ayuda con un pedido?
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-uninorte-red" />
                <span>emprendimientos@uninorte.edu.co</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-uninorte-red" />
                <span>Ext. Campus: 3500</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Marketplace Uninorte. Hecho con ❤️ para la comunidad de la Universidad del Norte.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Términos de Servicio</span>
            <span>•</span>
            <span>Campus Barranquilla</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
