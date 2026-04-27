'use client';

import { useT } from '@/hooks/useT';
import HomepageProductCard from '@/components/homepage/sections/products/HomepageProductCard';
import { useAddToCart } from '@/hooks/useAddToCart';
import type { Product } from '@/types/products';

interface RelatedProductsSectionProps {
  products: Product[];
}

export default function RelatedProductsSection({ products }: RelatedProductsSectionProps) {
  const { t } = useT();
  const { handleAddToCart } = useAddToCart({ products });

  if (!products.length) return null;

  return (
    <div className="border-t border-olive/20 pt-6 mb-16">
      <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-6">
        {t.productDetailPage.product.relatedProducts}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        {products.map((product) => (
          <HomepageProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            compact
          />
        ))}
      </div>
    </div>
  );
}
