// hooks/useCartCalculations.ts
import { useMemo } from 'react';
import { CartItem } from '@/types/cart';
import { Product } from '@/types/products';
import { parseCartItemId, getVariantOrProduct } from '@/utils/variantHelpers';

export function useCartCalculations(cart: CartItem[], products: Product[]) {
  return useMemo(() => {
    const total = cart.reduce((total, cartItem) => {
      const { productId, variantId } = parseCartItemId(cartItem.id);
      const product = products.find((p: Product) => p.id === productId);
      if (product) {
        const resolved = getVariantOrProduct(product, variantId);
        return total + (parseFloat(resolved.price) * cartItem.quantity);
      }
      return total;
    }, 0);

    const savings = cart.reduce((savings, cartItem) => {
      const { productId, variantId } = parseCartItemId(cartItem.id);
      const product = products.find((p: Product) => p.id === productId);
      if (product) {
        const resolved = getVariantOrProduct(product, variantId);
        if (resolved.originalPrice && resolved.originalPrice !== 'null') {
          const currentPrice = parseFloat(resolved.price);
          const originalPrice = parseFloat(resolved.originalPrice);
          return savings + ((originalPrice - currentPrice) * cartItem.quantity);
        }
      }
      return savings;
    }, 0);

    return { total, savings };
  }, [cart, products]);
}
