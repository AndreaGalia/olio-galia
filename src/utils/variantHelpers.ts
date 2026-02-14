import type { Product, ProductVariant } from '@/types/products';

const VARIANT_SEPARATOR = '::';

/**
 * Parse a cart item ID into productId and optional variantId.
 * Format: "productId::variantId" or just "productId"
 */
export function parseCartItemId(id: string): { productId: string; variantId?: string } {
  const parts = id.split(VARIANT_SEPARATOR);
  return {
    productId: parts[0],
    variantId: parts.length > 1 ? parts[1] : undefined,
  };
}

/**
 * Build a composite cart item ID from productId and optional variantId.
 */
export function buildCartItemId(productId: string, variantId?: string): string {
  if (variantId) {
    return `${productId}${VARIANT_SEPARATOR}${variantId}`;
  }
  return productId;
}

/**
 * Resolved product/variant data for display.
 */
export interface ResolvedProductData {
  price: string;
  originalPrice?: string;
  inStock: boolean;
  stockQuantity: number;
  images: string[];
  stripeProductId?: string;
  stripePriceId?: string;
  color?: string;
}

/**
 * Get the variant's data if variantId is provided, otherwise fall back to base product.
 */
export function getVariantOrProduct(
  product: Product,
  variantId?: string
): ResolvedProductData {
  if (variantId && product.variants) {
    const variant = product.variants.find(v => v.variantId === variantId);
    if (variant) {
      return {
        price: variant.price,
        originalPrice: variant.originalPrice,
        inStock: variant.inStock,
        stockQuantity: variant.stockQuantity,
        images: variant.images.length > 0 ? variant.images : product.images,
        stripeProductId: variant.stripeProductId,
        stripePriceId: variant.stripePriceId,
        color: variant.color,
      };
    }
  }

  return {
    price: product.price,
    originalPrice: product.originalPrice,
    inStock: product.inStock,
    stockQuantity: product.stockQuantity,
    images: product.images,
    stripeProductId: product.stripeProductId,
    stripePriceId: product.stripePriceId,
    color: product.color,
  };
}

/**
 * Get price range for a product with variants.
 * Used in ProductCard to show "da €X.XX" when variants have different prices.
 */
export function getPriceRange(product: Product): { min: number; max: number; hasRange: boolean } {
  if (!product.variants || product.variants.length === 0) {
    const price = parseFloat(product.price);
    return { min: price, max: price, hasRange: false };
  }

  const prices = product.variants.map(v => parseFloat(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    min,
    max,
    hasRange: min !== max,
  };
}
