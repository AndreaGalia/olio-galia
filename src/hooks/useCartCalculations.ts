// hooks/useCartCalculations.ts
import { useMemo } from 'react';
import { CartItem } from '@/types/cart';
import { Product } from '@/types/products';

export function useCartCalculations(cart: CartItem[], products: Product[]) {
  return useMemo(() => {
    const total = cart.reduce((total, cartItem) => {
      const product = products.find((p: Product) => p.id === cartItem.id);
      if (product) {
        return total + (parseFloat(product.price) * cartItem.quantity);
      }
      return total;
    }, 0);

    const savings = cart.reduce((savings, cartItem) => {
      const product = products.find((p: Product) => p.id === cartItem.id);
      if (product && product.originalPrice && product.originalPrice !== 'null') {
        const currentPrice = parseFloat(product.price);
        const originalPrice = parseFloat(product.originalPrice);
        return savings + ((originalPrice - currentPrice) * cartItem.quantity);
      }
      return savings;
    }, 0);

    return { total, savings };
  }, [cart, products]);
}