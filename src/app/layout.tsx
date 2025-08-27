import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';
import { CartProvider } from '@/contexts/CartContext';

export const metadata = {
  title: 'Olio Galia',
  description: '100% Olio Extravergine da Cassaro, Sicilia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <FloatingCart />
        </CartProvider>
      </body>
    </html>
  );
}