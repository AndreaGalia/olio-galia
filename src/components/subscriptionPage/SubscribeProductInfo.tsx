'use client';

import type { Product } from '@/types/products';
import { useT } from '@/hooks/useT';

interface SubscribeProductInfoProps {
  product: Product;
}

export default function SubscribeProductInfo({ product }: SubscribeProductInfoProps) {
  const { t } = useT();

  return (
    <div className="space-y-5">
      {/* Category */}
      {product.categoryDisplay && (
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
          {product.categoryDisplay}
        </p>
      )}

      {/* Product name + size */}
      <div>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: '1.3', letterSpacing: '0.15em' }}>
          {product.name}
        </h1>
        {product.size && (
          <p className="mt-1 font-serif termina-8 tracking-wider text-black">
            {product.size}
          </p>
        )}
      </div>

      {/* Subscription badge */}
      <p className="font-serif termina-11 tracking-[0.15em] uppercase text-olive">
        {t.subscription?.subscriptionBadge || 'Abbonamento'}
      </p>

      {/* Short description */}
      {product.description && (
        <p className="garamond-13 border-t border-olive/20 pt-5">
          {product.description}
        </p>
      )}
    </div>
  );
}
