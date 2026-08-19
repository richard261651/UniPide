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
        uninorte: {
          50: '#FEEBE7',   // Nivel 1: Fondo suave de selección / Badges
          100: '#FBC6BB',  // Nivel 2: Bordes y detalles sutiles
          200: '#F9A190',  // Nivel 3: Acentuación intermedia / Hover de links
          300: '#F77C64',  // Nivel 4: Coral vibrante / Hover de botones
          400: '#F56649',  // Nivel 5: Color Primario de Acción Oficial
          500: '#F56649',
          600: '#E05337',
          700: '#C94026',
          800: '#A3301B',
          900: '#802514',
          red: '#F56649',       // Color Oficial de Marca
          redLight: '#FEEBE7',  // Fondo Pastel de Selección
          redBorder: '#FBC6BB', // Borde Pastel Relevante
          redHover: '#F77C64',  // Hover de Botón Primario
          darkRed: '#C94026',   // Rojo Oscuro Oficial para Hovers y Gradiantes
          gold: '#EAA228',      // Ámbar Cálido
          amber: '#EAA228',
          dark: '#1F222E',
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
