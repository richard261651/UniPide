import React from 'react';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';

export default function Footer() {
 return (
 <footer className="bg-[#1F222E] text-slate-100 border-t border-slate-800 mt-auto pb-16 md:pb-0">
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
 <span className="font-black text-white text-xl tracking-tight">
 Uni<span className="text-[#F56649]">Pide</span>
 </span>
 </Link>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Plataforma oficial de pedidos para los emprendimientos de la Universidad del Norte. Creada y liderada por <strong>Richard Guzmán (CEO)</strong>.
          </p>
 <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
 <MapPin className="w-3.5 h-3.5 text-[#F56649]" />
 <span>Campus Km 5 Vía Puerto Colombia</span>
 </div>
 </div>

 {/* Columna 2: Navegación */}
 <div className="space-y-3">
 <h4 className="text-xs font-black uppercase tracking-widest text-[#F56649]">Explorar</h4>
 <ul className="space-y-2 text-xs text-slate-300">
 <li>
 <Link href="/" className="hover:text-white hover:underline transition">
 Inicio y Ofertas
 </Link>
 </li>
 <li>
 <Link href="/nosotros" className="hover:text-white transition font-bold text-amber-300">
 Sobre UniPide / Nosotros
 </Link>
 </li>
 <li>
 <Link href="/negocios" className="hover:text-white hover:underline transition">
 Todos los Emprendimientos
 </Link>
 </li>
 <li>
 <Link href="/negocios?cat=Tecnolog%C3%ADa%20%26%20Gadgets" className="hover:text-white hover:underline transition font-bold text-sky-300">
 Tecnología & Gadgets
 </Link>
 </li>
 <li>
 <Link href="/negocios?cat=Comida%20R%C3%A1pida" className="hover:text-white hover:underline transition">
 Comida Rápida
 </Link>
 </li>
 <li>
 <Link href="/negocios?cat=Postres%20%26%20Dulces" className="hover:text-white hover:underline transition">
 Postres & Dulces
 </Link>
 </li>
 </ul>
 </div>

 {/* Columna 3: Emprendedores */}
 <div className="space-y-3">
 <h4 className="text-xs font-black uppercase tracking-widest text-[#F56649]">Emprendedores</h4>
 <ul className="space-y-2 text-xs text-slate-300">
 <li>
 <Link href="/register" className="hover:text-white hover:underline transition">
 Registrar mi Negocio
 </Link>
 </li>
 <li>
 <Link href="/emprendedor" className="hover:text-white hover:underline transition">
 Portal de Gestión
 </Link>
 </li>
 <li>
 <Link href="/login" className="hover:text-white hover:underline transition">
 Acceso Emprendedores
 </Link>
 </li>
 </ul>
 </div>

 {/* Columna 4: Legal & Info */}
 <div className="space-y-3">
 <h4 className="text-xs font-black uppercase tracking-widest text-[#F56649]">Comunidad & Ayuda</h4>
 <ul className="space-y-2 text-xs text-slate-300">
 <li>
 <Link href="/pqrs" className="hover:text-white transition font-bold text-white">
 Radicar PQRS (Quejas & Sugerencias)
 </Link>
 </li>
 <li>
 <Link href="/pedidos" className="hover:text-white hover:underline transition">
 Mis Pedidos
 </Link>
 </li>
 </ul>
 <div className="pt-2 text-[11px] text-slate-400">
 Diseñado con <Heart className="w-3 h-3 text-[#F56649] inline mx-0.5 fill-[#F56649]" /> para Uninorte.
 </div>
 </div>
 </div>

 <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© {new Date().getFullYear()} UniPide — Creado por <strong>Richard Guzmán (CEO)</strong>.</p>
 <p>Entregas en campus • Pagos contra entrega / Nequi</p>
 </div>
 </div>
 </footer>
 );
}
