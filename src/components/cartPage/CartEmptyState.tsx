import Link from 'next/link';
import { useT } from '@/hooks/useT';
import CartBreadcrumb from './CartBreadcrumb';

export default function CartEmptyState() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg">
      <CartBreadcrumb />

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <svg className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 text-olive/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-olive mb-4">
            {t.cartPage.empty.title}
          </h1>

          <p className="text-nocciola mb-12 text-base sm:text-lg max-w-md mx-auto">
            {t.cartPage.empty.description}
          </p>

          <Link
            href="/products"
            className="inline-block px-12 py-4 bg-olive text-beige transition-all duration-300 font-medium text-base sm:text-lg border border-olive/20 uppercase tracking-wider hover:bg-salvia"
          >
            {t.cartPage.empty.button}
          </Link>
        </div>
      </div>
    </div>
  );
}