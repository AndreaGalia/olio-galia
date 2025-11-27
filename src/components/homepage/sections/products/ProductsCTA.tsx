// components/sections/products/ProductsCTA.tsx
"use client";
import Link from "next/link";
import { useT } from '@/hooks/useT';

export function ProductsCTA() {
  const { t } = useT();

  return (
    <div className="text-center mt-20 sm:mt-24">
      <div className="inline-block p-1 rounded-full bg-gradient-to-r from-olive via-salvia to-nocciola">
        <Link
          href="/products"
          className="bg-white hover:bg-transparent hover:text-white px-12 py-5 rounded-full text-lg font-semibold transition-all duration-500 hover:scale-105 inline-flex items-center gap-4 group text-olive hover:shadow-2xl cursor-pointer"
        >
          {t.products.cta.button}
          <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
      <p className="text-sm text-nocciola/70 mt-6 max-w-md mx-auto">
        {t.products.cta.description}
      </p>
    </div>
  );
}