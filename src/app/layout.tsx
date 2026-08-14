import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#C8102E',
};

export const metadata: Metadata = {
  title: 'RapiNorte | Marketplace de Emprendimientos Uninorte',
  description:
    'Pide comida, postres, bebidas y accesorios con RapiNorte, el marketplace de emprendimientos estudiantiles dentro del campus de la Universidad del Norte en Barranquilla.',
  keywords: [
    'RapiNorte',
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
    statusBarStyle: 'default',
    title: 'RapiNorte',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth antialiased">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-red-500 selection:text-white`}>
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
