import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NewsletterPopup from '@/components/layout/NewsletterPopup';
import { CartProvider } from '@/contexts/CartContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { ShippingConfigProvider } from '@/contexts/ShippingConfigContext';
import { Roboto, Libre_Baskerville } from 'next/font/google';
import localFont from 'next/font/local';
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from '@next/third-parties/google'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-libre-baskerville',
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
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="stylesheet" href="https://use.typekit.net/mew4ocs.css" />
      </head>
      <body className={`${roboto.variable} ${libreBaskerville.variable}`}>
        <LocaleProvider>
          <ShippingConfigProvider>
            <CartProvider>
              <Navbar />
              <main className="pt-12 sm:pt-[4.375rem]">{children}</main>
              <Footer />
              <NewsletterPopup />
            </CartProvider>
          </ShippingConfigProvider>
        </LocaleProvider>
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}