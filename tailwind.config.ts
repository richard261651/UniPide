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
        pastel: {
          red: '#D9534F',         // Rojo Coral Pastel
          redDark: '#C8433F',     // Rojo Coral Intenso
          cream: '#FAF7F2',       // Fondo Lino Pastel
          card: '#FFFFFF',        // Tarjeta Blanco Puro
          text: '#1E2022',        // Titulos Oscuros de Alta Legibilidad
          body: '#2D3136',        // Texto de Lectura Nítido
          border: '#E8E4DD',      // Borde Suave Pastel
          amber: '#FDE68A',       // Ámbar Pastel
          pink: '#FEE2E2',        // Rosado Pastel
          green: '#D1FAE5',       // Verde Menta Pastel
        },
        uninorte: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f38080',
          500: '#E05A47',
          600: '#D9534F', // Rojo Coral Pastel
          700: '#C8433F',
          800: '#a83230',
          900: '#8c2d2b',
          950: '#4d1413',
          red: '#D9534F',      // Rojo Coral Pastel
          darkRed: '#C8433F',  // Rojo Coral Oscuro
          gold: '#F59E0B',     // Ámbar Suave
          amber: '#F59E0B',
          dark: '#1E2022',
          asphalt: '#1E2022',
          graphite: '#2D3136',
          fog: '#E8E4DD',
          linen: '#FAF7F2',
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
