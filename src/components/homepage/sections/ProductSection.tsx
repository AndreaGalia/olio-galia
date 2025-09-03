// components/sections/ProductsSection.tsx
"use client";
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { ProductsBackground } from './products/ProductsBackground';
import { ProductsHeader } from './products/ProductsHeader';
import { ProductsInfo } from './products/ProductsInfo';
import { ProductsCTA } from './products/ProductsCTA';
import ProductsGrid from '@/components/productsPage/ProductsGrid';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useT } from '@/hooks/useT';

export default function ProductsSection() {
  const { addToCart } = useCart();
  const { t } = useT();
  const { products, loading, error } = useProducts();

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.inStock && product.stockQuantity > 0) {
      addToCart(productId, 1);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message={t.productsPage.loading} />;
  }

  // Error state
  if (error) {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <section className="relative bg-gradient-to-br from-beige via-beige/80 to-olive/5 py-20 sm:py-24 lg:py-32 overflow-hidden">
      <ProductsBackground />
      
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <ProductsHeader />
        
        <ProductsGrid 
          products={products}
          onAddToCart={handleAddToCart}
        />
        
        <ProductsInfo />
        <ProductsCTA />
      </div>
    </section>
  );
}