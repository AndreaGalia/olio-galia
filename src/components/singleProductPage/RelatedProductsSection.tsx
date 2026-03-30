'use client';

import { useT } from '@/hooks/useT';
import RelatedProductCard from './RelatedProductCard';
import type { Product } from '@/types/products';

interface RelatedProductsSectionProps {
  products: Product[];
}

export default function RelatedProductsSection({ products }: RelatedProductsSectionProps) {
  const { t } = useT();

  if (!products.length) return null;

  return (
    <div className="border-t border-olive/20 pt-6 mb-16">
      <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-6">
        {t.productDetailPage.product.relatedProducts}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
        {products.map((product) => (
          <RelatedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
