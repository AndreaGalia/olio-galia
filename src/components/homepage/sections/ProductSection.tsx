// components/sections/ProductsSection.tsx
"use client";
import { useProducts } from '@/hooks/useProducts';
import { ProductsBackground } from './products/ProductsBackground';
import { ProductsHeader } from './products/ProductsHeader';
import { ProductsInfo } from './products/ProductsInfo';
import { ProductsCTA } from './products/ProductsCTA';
import { ProductsBanner } from './products/ProductsBanner';
import ProductsGrid from '@/components/productsPage/ProductsGrid';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useT } from '@/hooks/useT';
import { useAddToCart } from '@/hooks/useAddToCart';
import ProductsPageBanner from '@/components/productsPage/ProductsPageBanner';

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

  // Filtra solo prodotti in evidenza (featured) e limita a 3
  const featuredProducts = products.filter(p => p.metadata?.featured === true).slice(0, 3);

  return (
    <>
      <section className="relative bg-homepage-bg py-20 sm:py-24 lg:py-32 overflow-hidden">
        <ProductsBackground />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <ProductsHeader />

          <ProductsGrid
            products={featuredProducts}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      <ProductsBanner />

      <section className="relative bg-homepage-bg py-20 sm:py-24 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <ProductsInfo />
        </div>
      </section>

      <ProductsPageBanner />

      <section className="relative bg-homepage-bg pt-12 sm:pt-16 lg:pt-20 pb-20 sm:pb-24 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <ProductsCTA />
        </div>
      </section>
    </>
  );
}