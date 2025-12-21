"use client";
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useT } from '@/hooks/useT';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ProductsHero from '@/components/productsPage/ProductsHero';
import CategoryFilter from '@/components/productsPage/CategoryFilter';
import ProductsGrid from '@/components/productsPage/ProductsGrid';
import { useAddToCart } from '@/hooks/useAddToCart';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const { t } = useT();
  const { products, categories, loading, error } = useProducts();

  const allCategories = [
    { id: 'tutti', name: t.productsPage.categories.all, description: '' },
    ...categories
  ];

  const filteredProducts = selectedCategory === 'tutti' 
    ? products
    : products.filter(product => product.category === selectedCategory);

    const { handleAddToCart } = useAddToCart({ products });

  if (loading) return <LoadingSpinner message={t.productsPage.loading} />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;

  return (
    <>
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
    </>
  );
}