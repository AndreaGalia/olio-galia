import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCart from '@/components/FloatingCart';
import { CartProvider } from '@/contexts/CartContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
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
  title: 'Olio Galia',
  description: '100% Olio Extravergine da Cassaro, Sicilia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/mew4ocs.css" />
      </head>
      <body className={`${roboto.variable}`}>
        <LocaleProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <FloatingCart />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}