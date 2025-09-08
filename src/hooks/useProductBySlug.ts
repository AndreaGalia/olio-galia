import { useState, useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import type { Product } from '@/types/products';

interface ProductResponse {
  product: Product | undefined;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useProductBySlug(slug: string): ProductResponse {
  const { locale } = useLocale();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        
        const response = await fetch(`/api/products/${slug}?locale=${locale}`);
        
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data.product);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, locale]);

  return {
    product,
    loading,
    error,
    notFound
  };
}