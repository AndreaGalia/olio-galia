// components/sections/products/ProductsCTA.tsx
"use client";
import Link from "next/link";
import { useT } from '@/hooks/useT';

export function ProductsCTA() {
  const { t } = useT();

  return (
    <div className="text-center mt-20 sm:mt-24">
      <Link
        href="/products"
        className="inline-block bg-olive text-beige px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm font-medium transition-all duration-300 border border-olive/20 uppercase tracking-wider"
      >
        {t.products.cta.button}
      </Link>
      <p className="text-sm sm:text-base text-olive mt-6 max-w-md mx-auto">
        {t.products.cta.description}
      </p>
    </div>
  );
}