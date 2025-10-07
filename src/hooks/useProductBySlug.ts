import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';
import type { Product } from '@/types/products';

interface ProductResponse {
  product: Product | undefined;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

// Interfaccia estesa per il prodotto con tutti gli slug
interface ProductWithAllSlugs extends Product {
  allSlugs?: {
    it: string;
    en: string;
  };
}

export function useProductBySlug(slug: string): ProductResponse {
  const { locale } = useLocale();
  const router = useRouter();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [productWithSlugs, setProductWithSlugs] = useState<ProductWithAllSlugs | null>(null);

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

        // Salva il prodotto con tutti gli slug solo alla prima fetch
        if (!productWithSlugs) {
          setProductWithSlugs(data.product);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, locale]);

  // Effect separato per gestire il cambio lingua
  useEffect(() => {
    // Se abbiamo il prodotto con tutti gli slug e la locale è cambiata
    if (productWithSlugs?.allSlugs) {
      const correctSlug = productWithSlugs.allSlugs[locale as keyof typeof productWithSlugs.allSlugs];

      // Se lo slug nell'URL non corrisponde allo slug corretto per la locale corrente
      if (correctSlug && slug !== correctSlug) {
        // Naviga allo slug corretto
        router.replace(`/products/${correctSlug}`);
      }
    }
  }, [locale, slug, productWithSlugs, router]);

  return {
    product,
    loading,
    error,
    notFound
  };
}