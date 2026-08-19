import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        unipide: {
          primary: '#B43E1B',     // Terracota Oscuro (Color Primario Acción)
          primaryDark: '#933012', // Terracota Intenso
          asphalt: '#1F222E',     // Gris Asfalto Profundo (Navbar/Footer/Títulos)
          amber: '#EAA228',       // Ámbar Cálido (Acento/Estados)
          linen: '#F8F6F4',       // Blanco Lino / Hueso (Fondo General)
          card: '#FFFFFF',        // Blanco Puro (Tarjetas/Modales)
          graphite: '#4A4E5A',    // Gris Grafito (Texto de Lectura)
          fog: '#E5E2DC',         // Gris Niebla (Bordes y Divisores)
        },
        uninorte: {
          50: '#fef6f4',
          100: '#fdebe6',
          200: '#f9d5cb',
          300: '#f4b4a3',
          400: '#ea8167',
          500: '#dd5636',
          600: '#c73f21',
          700: '#B43E1B', // Terracota Oscuro
          800: '#933012',
          900: '#782b14',
          950: '#401307',
          red: '#B43E1B',      // Terracota Oscuro
          darkRed: '#933012',  // Terracota Intenso
          gold: '#EAA228',     // Ámbar Cálido
          amber: '#EAA228',    // Ámbar Cálido
          dark: '#1F222E',     // Gris Asfalto Profundo
          asphalt: '#1F222E',
          graphite: '#4A4E5A',
          fog: '#E5E2DC',
          linen: '#F8F6F4',
        },
      },
      fontFamily: {
        sans: ['Questrial', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
