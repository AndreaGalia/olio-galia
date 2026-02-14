import { useMemo } from 'react';
import { Product } from '@/types/products';
import { parseCartItemId } from '@/utils/variantHelpers';

interface CartItem {
  id: string;
  quantity: number;
}

export interface CartWeightInfo {
  totalGrams: number; // Peso totale in grammi
  totalKg: number; // Peso totale in kg (totalGrams / 1000)
  hasAllWeights: boolean; // true se tutti i prodotti nel carrello hanno peso configurato
  productsWithoutWeight: string[]; // Array di ID prodotti senza peso
}

/**
 * Hook per calcolare il peso totale del carrello
 *
 * Calcola il peso totale sommando (peso × quantità) per ogni prodotto.
 * Identifica anche i prodotti senza peso configurato per mostrare warning.
 *
 * @param cart - Carrello con ID e quantità
 * @param products - Lista completa prodotti (con dettagli peso)
 * @returns Informazioni sul peso totale del carrello
 *
 * @example
 * const { totalGrams, totalKg, hasAllWeights } = useCartWeight(cart, products);
 *
 * if (!hasAllWeights) {
 *   // Mostra warning: alcuni prodotti non hanno peso
 * }
 *
 * console.log(`Peso totale: ${totalKg.toFixed(2)} kg`);
 */
export function useCartWeight(
  cart: CartItem[],
  products: Product[]
): CartWeightInfo {
  return useMemo(() => {
    let totalGrams = 0;
    const productsWithoutWeight: string[] = [];

    for (const cartItem of cart) {
      const { productId } = parseCartItemId(cartItem.id);
      const product = products.find(p => p.id === productId);

      if (!product) {
        // Prodotto non trovato (unlikely, ma gestiamo il caso)
        continue;
      }

      if (product.weight && product.weight > 0) {
        // Peso in grammi × quantità
        totalGrams += product.weight * cartItem.quantity;
      } else {
        // Prodotto senza peso configurato
        productsWithoutWeight.push(product.id);
      }
    }

    return {
      totalGrams,
      totalKg: totalGrams / 1000,
      hasAllWeights: productsWithoutWeight.length === 0,
      productsWithoutWeight,
    };
  }, [cart, products]);
}
