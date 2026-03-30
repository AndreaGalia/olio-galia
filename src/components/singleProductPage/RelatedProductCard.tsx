import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/products';

interface RelatedProductCardProps {
  product: Product;
}

export default function RelatedProductCard({ product }: RelatedProductCardProps) {
  const isOutOfStock = product.variants?.length
    ? !product.variants.some((v) => v.inStock && v.stockQuantity > 0)
    : !product.inStock || product.stockQuantity === 0;

  return (
    <div className={isOutOfStock ? 'opacity-50' : ''}>
      {/* Immagine */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative w-full aspect-[3/4] mb-4">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Link>

      {/* Nome */}
      <p className="text-[11px] tracking-[0.15em] uppercase text-olive leading-snug">
        {product.name}
      </p>

    </div>
  );
}
