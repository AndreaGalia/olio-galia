// components/sections/products/ProductsHeader.tsx
"use client";
import { useT } from '@/hooks/useT';

export function ProductsHeader() {
  const { t } = useT();

  return (
    <div className="text-left mb-16 sm:mb-20">
      <h1 className="text-black mb-3">{t.products.title.line1}</h1>
      <h2 className="text-black">{t.products.title.line2}</h2>
    </div>
  );
}