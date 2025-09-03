import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingCart from '@/components/FloatingCart';
import { CartProvider } from '@/contexts/CartContext';
import { LocaleProvider } from '@/contexts/LocaleContext';

export const metadata = {
  title: 'Olio Galia',
  description: '100% Olio Extravergine da Cassaro, Sicilia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
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