'use client';

import Link from 'next/link';
import { useT } from '@/hooks/useT';

export default function ExpiredAccessMessage() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-sabbia-chiaro flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-16">
      <div className="max-w-xl w-full">

        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-4">
          {t.checkoutSuccess.expired.title}
        </p>

        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: '1.2', letterSpacing: '0.1em' }}>
          {t.checkoutSuccess.expired.message}
        </h1>

        <div className="mt-8 border-t border-olive/20 pt-6 space-y-2">
          <p className="garamond-13">
            {t.checkoutSuccess.expired.emailInfo}
          </p>
          <p className="garamond-13">
            {t.checkoutSuccess.expired.security}
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="font-serif termina-11 tracking-[0.25em] uppercase px-6 py-3 bg-sabbia text-black hover:bg-olive hover:text-beige transition-all duration-300 cursor-pointer whitespace-nowrap text-center"
          >
            {t.checkoutSuccess.expired.backToHome}
          </Link>
          <Link
            href="/products"
            className="font-serif termina-11 tracking-[0.25em] uppercase px-6 py-3 border border-olive/20 text-black hover:bg-olive hover:text-beige hover:border-olive transition-all duration-300 cursor-pointer whitespace-nowrap text-center"
          >
            {t.checkoutSuccess.expired.exploreProducts}
          </Link>
        </div>

        <p className="mt-8 garamond-13 text-black/30">
          {t.checkoutSuccess.expired.footer}
        </p>
      </div>
    </div>
  );
}
