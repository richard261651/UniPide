import type { Metadata, Viewport } from 'next';
import { Questrial } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WelcomeSplashScreen from '@/components/WelcomeSplashScreen';

const questrial = Questrial({ weight: '400', subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#C8102E',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://unipide.com'),
  title: 'UniPide | Marketplace de Emprendimientos Uninorte',
  description:
    'Plataforma oficial de pedidos para los emprendimientos de la Universidad del Norte. Creada y liderada por Richard Guzmán (CEO). Campus Km 5 Vía Puerto Colombia.',
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { url: 'https://res.cloudinary.com/dre8hlhdo/image/upload/v1787119598/icono_uuke26.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'UniPide | Marketplace de Emprendimientos Uninorte',
    description: 'Plataforma oficial de pedidos para los emprendimientos de la Universidad del Norte.',
    url: 'https://unipide.com',
    siteName: 'UniPide',
    images: [
      {
        url: 'https://res.cloudinary.com/dre8hlhdo/image/upload/w_512,h_512/v1787119598/icono_uuke26.png',
        width: 512,
        height: 512,
        alt: 'UniPide Logo',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://unipide.com/#organization',
        name: 'UniPide',
        alternateName: 'UniPide Uninorte',
        url: 'https://unipide.com',
        logo: 'https://unipide.com/icon-512.png',
        image: 'https://unipide.com/icon-512.png',
        description: 'Marketplace oficial de emprendimientos estudiantiles en el campus de la Universidad del Norte en Barranquilla.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Barranquilla',
          addressRegion: 'Atlántico',
          addressCountry: 'CO',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://unipide.com/#website',
        url: 'https://unipide.com',
        name: 'UniPide',
        description: 'Pide comida, postres, bebidas y productos en el campus Uninorte',
        publisher: {
          '@id': 'https://unipide.com/#organization',
        },
      },
    ],
  };

  return (
    <html lang="es" className="scroll-smooth antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${questrial.className} min-h-screen flex flex-col bg-[#FAF8F5] text-slate-900 overflow-x-hidden selection:bg-red-500 selection:text-white tracking-wide`}>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <WelcomeSplashScreen />
              <Navbar />
              <CartDrawer />
              <main className="flex-1 pb-20 md:pb-8">{children}</main>
              <Footer />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
