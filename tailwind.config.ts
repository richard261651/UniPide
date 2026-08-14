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
          700: '#b81717',
          800: '#991717',
          900: '#7f1919',
          950: '#450808',
          red: '#A01A1E',
          darkRed: '#7A1316',
          gold: '#E5A93C',
          amber: '#D97706',
          dark: '#18181B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
