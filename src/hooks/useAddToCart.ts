
// hooks/useAddToCart.ts

import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/products";
import { parseCartItemId, getVariantOrProduct } from "@/utils/variantHelpers";

interface UseAddToCartProps {
  products: Product[];
}

export const useAddToCart = ({ products }: UseAddToCartProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (cartItemId: string, quantity: number = 1) => {
    const { productId, variantId } = parseCartItemId(cartItemId);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return false;
    }

    const resolved = getVariantOrProduct(product, variantId);
    if (!resolved.inStock || resolved.stockQuantity < quantity) {
      return false;
    }

    addToCart(cartItemId, quantity);
    return true;
  };

  return { handleAddToCart };
};