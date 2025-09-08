import { useState, useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import type { Product, Category } from '@/types/products';

interface ProductsResponse {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  refreshStock: () => void;
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
      
      const response = await fetch(`/api/products?locale=${locale}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setProducts(data.products || []);
      setCategories(data.categories || []);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStock = async () => {
    try {
      const response = await fetch(`/api/products?locale=${locale}`);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error refreshing stock:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [locale]);

  return { 
    products, 
    categories,
    loading, 
    error,
    refetch: fetchProducts,
    refreshStock
  };
}