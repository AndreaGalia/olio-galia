// hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import type { Product, BaseProduct, ProductTranslations, Category } from '@/types/products';

interface ProductsResponse {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ProductResponse {
  product: Product | undefined;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useProducts(): ProductsResponse {
  const { locale } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carica i dati base dei prodotti
      const baseResponse = await fetch('/api/products/base');
      if (!baseResponse.ok) {
        throw new Error('Failed to fetch base products');
      }
      const baseData = await baseResponse.json();
      
      // Carica le traduzioni per la lingua corrente
      const translationsResponse = await fetch(`/api/products/translations/${locale}`);
      if (!translationsResponse.ok) {
        throw new Error(`Failed to fetch ${locale} translations`);
      }
      const translations = await translationsResponse.json();
      
      // Combina i dati base con le traduzioni
      const translatedProducts: Product[] = baseData.products.map((baseProduct: BaseProduct) => {
        const translation = translations.products.find((t: ProductTranslations & { id: string }) => t.id === baseProduct.id);
        
        if (!translation) {
          console.warn(`Translation not found for product ${baseProduct.id} in locale ${locale}`);
          // Fallback sui dati base se la traduzione non esiste
          return {
            ...baseProduct,
            name: baseProduct.slug,
            description: '',
            longDescription: '',
            details: '',
            categoryDisplay: baseProduct.category,
            badge: '',
            features: [],
            bestFor: '',
            origin: '',
            harvest: '',
            processing: '',
            awards: []
          } as Product;
        }
        
        return {
          ...baseProduct,
          ...translation
        } as Product;
      });
      
      setProducts(translatedProducts);
      setCategories(translations.categories || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [locale]); // Ricarica quando cambia la lingua

  return { 
    products, 
    categories,
    loading, 
    error,
    refetch: fetchProducts
  };
}

// Hook per un singolo prodotto
export function useProduct(productId: string): ProductResponse {
  const { products, loading, error } = useProducts();
  const product = products.find(p => p.id === productId);
  
  return {
    product,
    loading,
    error,
    notFound: !loading && !error && !product
  };
}