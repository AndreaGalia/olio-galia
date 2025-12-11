// components/sections/products/ProductsHeader.tsx
"use client";
import { useT } from '@/hooks/useT';

export function ProductsHeader() {
  const { t } = useT();

  return (
    <div className="text-center mb-16 sm:mb-20">
      <h2 className="font-serif text-olive mb-8 leading-tight">
        <span className="block mb-1 md:mb-2 text-lg sm:text-3xl md:text-4xl lg:text-5xl">
          {t.products.title.line1}
        </span>
        <span className="block text-base sm:text-xl md:text-2xl lg:text-3xl">
          {t.products.title.line2}
        </span>
      </h2>
    </div>
  );
}