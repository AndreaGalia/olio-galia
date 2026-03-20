"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { useT } from '@/hooks/useT';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ProductsHero from '@/components/productsPage/ProductsHero';
import CategoryFilter from '@/components/productsPage/CategoryFilter';
import ProductsGrid from '@/components/productsPage/ProductsGrid';
import { useAddToCart } from '@/hooks/useAddToCart';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'tutti');

  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'tutti');
  }, [searchParams]);

  const { t } = useT();
  const { products, categories, loading, error } = useProducts();

  const allCategories = [
    { id: 'tutti', name: t.productsPage.categories.all, description: '' },
    ...categories
  ];

  const filteredProducts = selectedCategory === 'tutti'
    ? products
    : products.filter(product =>
        product.categories?.includes(selectedCategory) ||
        product.category === selectedCategory
      );

  const { handleAddToCart } = useAddToCart({ products });

  if (loading) return <LoadingSpinner message={t.productsPage.loading} />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-homepage-bg">
      <ProductsHero />
      <CategoryFilter
        categories={allCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <ProductsGrid
        products={filteredProducts}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Caricamento..." />}>
      <ProductsContent />
    </Suspense>
  );
}
