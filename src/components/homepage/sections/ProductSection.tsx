// components/sections/ProductsSection.tsx
"use client";
import { useProducts } from '@/hooks/useProducts';
import { ProductsBackground } from './products/ProductsBackground';
import { ProductsHeader } from './products/ProductsHeader';
import ProductsSlider from './products/ProductsSlider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useT } from '@/hooks/useT';
import { useAddToCart } from '@/hooks/useAddToCart';

export default function ProductsSection() {
  const { t } = useT();
  const { products, loading, error } = useProducts();
  const { handleAddToCart } = useAddToCart({ products });

  // Loading state
  if (loading) {
    return <LoadingSpinner message={t.productsPage.loading} />;
  }

  // Error state
  if (error) {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  // Filtra solo prodotti in evidenza (featured)
  const featuredProducts = products.filter(p => p.metadata?.featured === true);

  return (
    <>
      <section className="relative bg-homepage-bg py-20 sm:py-24 lg:py-32 overflow-hidden">
        <ProductsBackground />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <ProductsHeader />

          <ProductsSlider
            products={featuredProducts}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

    </>
  );
}