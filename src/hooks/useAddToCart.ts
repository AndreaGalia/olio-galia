
// hooks/useAddToCart.ts

import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/products";

interface UseAddToCartProps {
  products: Product[];
}

export const useAddToCart = ({ products }: UseAddToCartProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (productId: string, quantity: number = 1) => {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      console.warn(`Prodotto con ID ${productId} non trovato`);
      return false;
    }
    
    if (!product.inStock || product.stockQuantity < quantity) {
      console.warn(`Prodotto non disponibile o quantità insufficiente`);
      return false;
    }
    
    addToCart(productId, quantity);
    return true;
  };

  return { handleAddToCart };
};