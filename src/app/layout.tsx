import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Marketplace Uninorte | Emprendimientos Universitarios',
  description:
    'Pide comida, postres, bebidas y accesorios de los emprendimientos de estudiantes dentro del campus de la Universidad del Norte en Barranquilla.',
  keywords: [
    'Uninorte',
    'Marketplace',
    'Emprendimientos',
    'Universidad del Norte',
    'Barranquilla',
    'Comida campus',
    'Domicilios Uninorte',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
