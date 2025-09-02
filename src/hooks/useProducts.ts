// hooks/useProducts.ts
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
     
     // Chiamata all'API che combina dati base, traduzioni e stock da Stripe
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

 // Refresh veloce solo dei dati di stock (senza mostrare loading)
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
     // Non aggiorniamo l'error state per il refresh silenzioso
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
   refetch: fetchProducts,
   refreshStock
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
   notFound: !loading && !error && products.length > 0 && !product
 };
}

// Hook opzionale per un singolo prodotto con caricamento indipendente
export function useProductSingle(productId: string): ProductResponse {
 const { locale } = useLocale();
 const [product, setProduct] = useState<Product | undefined>(undefined);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [notFound, setNotFound] = useState(false);

 useEffect(() => {
   const fetchSingleProduct = async () => {
     if (!productId) return;

     try {
       setLoading(true);
       setError(null);
       setNotFound(false);
       
       const response = await fetch(`/api/products?locale=${locale}`);
       
       if (!response.ok) {
         throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
       }
       
       const data = await response.json();
       const foundProduct = data.products?.find((p: Product) => p.id === productId);
       
       if (foundProduct) {
         setProduct(foundProduct);
       } else {
         setNotFound(true);
       }
       
     } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
       setError(errorMessage);
       console.error('Error fetching single product:', err);
     } finally {
       setLoading(false);
     }
   };

   fetchSingleProduct();
 }, [productId, locale]);

 return {
   product,
   loading,
   error,
   notFound
 };
}