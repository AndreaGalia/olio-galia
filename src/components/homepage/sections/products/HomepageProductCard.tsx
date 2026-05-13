"use client";
import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/products";
import { buildCartItemId } from "@/utils/variantHelpers";
import { useT } from "@/hooks/useT";
import HomepageProductCardImage from "./HomepageProductCardImage";
import HomepageProductCardFooter from "./HomepageProductCardFooter";

interface HomepageProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  compact?: boolean;
}

export default function HomepageProductCard({ product, onAddToCart, compact = false }: HomepageProductCardProps) {
  const { t } = useT();
  const [isAdding, setIsAdding] = useState(false);

  const isWaitingList = !!(product as any).isWaitingList;

  const isOutOfStock = product.variants && product.variants.length > 0
    ? !product.variants.some(v => v.inStock && v.stockQuantity > 0)
    : !product.inStock || product.stockQuantity === 0;

  const handleAddToCart = () => {
    if (isAdding || isOutOfStock) return;
    const defaultVariant = product.variants?.find(v => v.inStock) || product.variants?.[0];
    const cartId = buildCartItemId(product.id, defaultVariant?.variantId);
    onAddToCart(cartId);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 2500);
  };

  return (
    <div className="group">
      {/* Immagine + info → navigano alla pagina prodotto */}
      <Link href={`/products/${product.slug}`} className="block">
        <HomepageProductCardImage product={product} isOutOfStock={isOutOfStock} isWaitingList={isWaitingList} />
        <HomepageProductCardFooter product={product} isWaitingList={isWaitingList} />
      </Link>

      {/* ADD TO CART — solo per prodotti normali non esauriti */}
      {!isWaitingList && !isOutOfStock && (
        <button
          onClick={handleAddToCart}
          className="w-full mt-2 py-2.5 text-center font-serif termina-card tracking-[1px] sm:tracking-[3.4px] uppercase whitespace-nowrap cursor-pointer transition-all duration-200 active:scale-95 border border-olive bg-olive text-beige hover:bg-sabbia hover:text-olive"
        >
          {isAdding
            ? t.addToCartButton.added
            : compact
              ? (<>
                  <span className="lg:hidden">{t.addToCartButton.addToCart}</span>
                  <span className="hidden lg:inline">{t.addToCartButton.addToCartFull}</span>
                </>)
              : t.addToCartButton.addToCartFull
          }
        </button>
      )}

    </div>
  );
}
