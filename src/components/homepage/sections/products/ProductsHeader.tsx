// components/sections/products/ProductsHeader.tsx
"use client";
import { useT } from '@/hooks/useT';

export function ProductsHeader() {
  const { t } = useT();

  return (
    <div className="text-center mb-16 sm:mb-20">
      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-olive/15 to-salvia/15 backdrop-blur-sm text-olive px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-olive/20">
        <div className="w-2.5 h-2.5 bg-gradient-to-r from-olive to-salvia rounded-full animate-pulse"></div>
        {t.products.badge}
      </div>
      
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-olive mb-8 leading-tight">
        {t.products.title.line1}
        <span className="block">
          {t.products.title.line2}
        </span>
      </h2>
      
      <p className="text-xl text-nocciola max-w-3xl mx-auto leading-relaxed mb-4">
        {t.products.description}
      </p>
      
      <div className="flex justify-center items-center gap-4 text-sm text-nocciola/80">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-olive rounded-full"></div>
          {t.products.features.handPicked}
        </div>
        <div className="w-px h-4 bg-nocciola/30"></div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-salvia rounded-full"></div>
          {t.products.features.coldPressed}
        </div>
        <div className="w-px h-4 bg-nocciola/30"></div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-nocciola rounded-full"></div>
          {t.products.features.sicilian}
        </div>
      </div>
    </div>
  );
}