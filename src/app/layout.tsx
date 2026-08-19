import type { Metadata, Viewport } from 'next';
import { Questrial } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const questrial = Questrial({ weight: '400', subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#C8102E',
};

export const metadata: Metadata = {
  title: 'UniPide | Marketplace de Emprendimientos Uninorte',
  description:
    'Pide comida, postres, bebidas y accesorios con UniPide, el marketplace de emprendimientos estudiantiles dentro del campus de la Universidad del Norte en Barranquilla.',
  keywords: [
    'UniPide',
    'Uninorte',
    'Marketplace',
    'Emprendimientos',
    'Universidad del Norte',
    'Barranquilla',
    'Comida campus',
    'Domicilios Uninorte',
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UniPide',
  },
  manifest: '/manifest.json',
  icons: {
    icon: 'https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg',
    shortcut: 'https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg',
    apple: 'https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth antialiased">
      <body className={`${questrial.className} min-h-screen flex flex-col bg-[#FAF8F5] text-slate-900 overflow-x-hidden selection:bg-red-500 selection:text-white tracking-wide`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1 pb-20 md:pb-8">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
