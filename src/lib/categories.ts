import {
  Utensils,
  Cake,
  Coffee,
  Laptop,
  Palette,
  Shirt,
  PenTool,
  BookOpen,
  Sparkles,
  ClipboardList,
  LucideIcon,
} from 'lucide-react';

export interface BusinessCategory {
  id: string;
  name: string;
  iconName: string;
  icon: LucideIcon;
  description: string;
  popularItems?: string;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: 'comida-rapida',
    name: 'Comida Rápida',
    iconName: 'Utensils',
    icon: Utensils,
    description: 'Hamburguesas smash, perros calientes, empanadas, tequeños y snacks rápidos.',
    popularItems: 'Smash Burgers, Tequeños, Salchipapas',
  },
  {
    id: 'postres-dulces',
    name: 'Postres & Dulces',
    iconName: 'Cake',
    icon: Cake,
    description: 'Brownies artesanales, galletas recién horneadas, trufas, alfajores y gomitas.',
    popularItems: 'Brownies con helado, Galletas Red Velvet, Trufas',
  },
  {
    id: 'bebidas-cafe',
    name: 'Bebidas & Café',
    iconName: 'Coffee',
    icon: Coffee,
    description: 'Café frío (Cold Brew), frappes, té matcha, granizados y jugos naturales.',
    popularItems: 'Iced Vanilla Latte, Matcha Frappe, Té de Frutos Rojos',
  },
  {
    id: 'tecnologia-gadgets',
    name: 'Tecnología & Gadgets',
    iconName: 'Laptop',
    icon: Laptop,
    description: 'Cargadores portátiles, cables tipo C/Lightning, audífonos, forros de laptop y gadgets.',
    popularItems: 'Cargadores Rápidos, Cables Trensados, Powerbanks, Hubs USB-C',
  },
  {
    id: 'accesorios-merch',
    name: 'Accesorios & Merch',
    iconName: 'Palette',
    icon: Palette,
    description: 'Accesorios universitarios, pines, tote bags, stickers y merchandising único.',
    popularItems: 'Tote Bags Ilustradas, Pines Universitarios, Llaveros Custom',
  },
  {
    id: 'ropa-moda',
    name: 'Ropa & Moda',
    iconName: 'Shirt',
    icon: Shirt,
    description: 'Hoodies, camisetas oversized, gorras y prendas de vestir con estilo campus.',
    popularItems: 'Hoodies Oversized, Gorras Bordadas, Camisetas Vintage',
  },
  {
    id: 'papeleria-stickers',
    name: 'Papelería & Stickers',
    iconName: 'PenTool',
    icon: PenTool,
    description: 'Cuadernos, resaltadores, organizadores, termos y stickers impermeables.',
    popularItems: 'Stickers para Laptop, Planeadores Académicos, Resaltadores Pastel',
  },
  {
    id: 'libreria-libros',
    name: 'Librería & Libros',
    iconName: 'BookOpen',
    icon: BookOpen,
    description: 'Libros de texto, literatura universitaria, resúmenes e impresiones especializadas.',
    popularItems: 'Libros de Segunda Mano, Resúmenes para Parciales, Guías Académicas',
  },
  {
    id: 'belleza-cuidado',
    name: 'Belleza & Cuidado',
    iconName: 'Sparkles',
    icon: Sparkles,
    description: 'Skincare, bálsamos labiales, perfumes decants, accesorios para el cabello.',
    popularItems: 'Lip Gloss, Decants de Perfume, Cremas Hidratantes',
  },
  {
    id: 'servicios-tutorias',
    name: 'Servicios & Tutorías',
    iconName: 'ClipboardList',
    icon: ClipboardList,
    description: 'Tutorías académicas, asesoría en programas (Python, Excel, R), diseño y formateo de trabajos.',
    popularItems: 'Tutorías de Cálculo/Física, Asesoría en Excel, Diseño de Diapositivas',
  },
];

export const CATEGORY_NAMES = BUSINESS_CATEGORIES.map((c) => c.name);
