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

        <div className="mt-8 flex flex-col gap-3 max-w-sm">
          <Link
            href="/"
            className="w-full py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-olive text-beige hover:bg-sabbia hover:text-olive transition-all duration-200 cursor-pointer text-center block"
          >
            {t.checkoutSuccess.expired.backToHome}
          </Link>
          <Link
            href="/products"
            className="w-full py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-sabbia text-olive hover:bg-olive hover:text-beige transition-all duration-200 cursor-pointer text-center block"
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
