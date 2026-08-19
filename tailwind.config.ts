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
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#f86b6b',
          500: '#ee3838',
          600: '#dc2222',
          700: '#C8102E', // Rojo Uninorte Oficial
          800: '#A01A1E',
          900: '#7A1316',
          950: '#450808',
          red: '#C8102E',      // Rojo Uninorte Oficial
          darkRed: '#A01A1E',  // Rojo Intenso
          gold: '#E5A93C',     // Dorado Cálido
          amber: '#F59E0B',
          dark: '#0F172A',
          asphalt: '#0F172A',
          graphite: '#334155',
          fog: '#E2E8F0',
          linen: '#FAFAFA',
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
