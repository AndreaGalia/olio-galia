import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCart from '@/components/FloatingCart';
import { CartProvider } from '@/contexts/CartContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { ShippingConfigProvider } from '@/contexts/ShippingConfigContext';
import { Roboto } from 'next/font/google';
import localFont from 'next/font/local';
import { Analytics } from "@vercel/analytics/next"

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

const sweetSans = localFont({
  src: [
    {
      path: './../../public/fonts/SweetSansPro-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './../../public/fonts/SweetSansPro-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-sweet-sans',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.it'),
  title: 'Olio Galia',
  description: '100% Olio Extravergine da Cassaro, Sicilia',
  icons: {
    icon: process.env.NEXT_PUBLIC_FAVICON_URL || '/favicon.ico',
    shortcut: process.env.NEXT_PUBLIC_FAVICON_URL || '/favicon.ico',
    apple: process.env.NEXT_PUBLIC_APPLE_TOUCH_ICON_URL || '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link rel="stylesheet" href="https://use.typekit.net/mew4ocs.css" />
      </head>
      <body className={`${roboto.variable}`}>
        <LocaleProvider>
          <ShippingConfigProvider>
            <CartProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <FloatingCart />
            </CartProvider>
          </ShippingConfigProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}