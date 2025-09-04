import Link from 'next/link';
import { useT } from '@/hooks/useT';
import CartBreadcrumb from './CartBreadcrumb';

export default function CartEmptyState() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      <CartBreadcrumb />

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-12">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-white/60 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-16 h-16 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-olive mb-4">
            {t.cartPage.empty.title}
          </h1>
          <p className="text-nocciola mb-8 text-lg">
            {t.cartPage.empty.description}
          </p>
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-olive to-salvia text-beige rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {t.cartPage.empty.button}
          </Link>
        </div>
      </div>
    </div>
  );
}