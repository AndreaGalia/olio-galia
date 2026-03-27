import Link from 'next/link';
import { useT } from '@/hooks/useT';
import CartBreadcrumb from './CartBreadcrumb';

export default function CartEmptyState() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 pt-10">
        <CartBreadcrumb />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: '1.3', letterSpacing: '0.15em' }}
            className="text-black mb-4"
          >
            {t.cartPage.empty.title}
          </h1>

          <p className="text-black/60 mb-12 text-sm max-w-md mx-auto">
            {t.cartPage.empty.description}
          </p>

          <Link
            href="/products"
            className="inline-block px-12 py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase hover:bg-olive hover:text-beige transition-all duration-300"
          >
            {t.cartPage.empty.button}
          </Link>
        </div>
      </div>
    </div>
  );
}
