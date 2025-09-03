"use client";
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { useT } from '@/hooks/useT';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ProductsHero from '@/components/productsPage/ProductsHero';
import CategoryFilter from '@/components/productsPage/CategoryFilter';
import ProductsGrid from '@/components/productsPage/ProductsGrid';
import BenefitsSection from '@/components/productsPage/BenefitsSection';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const { addToCart } = useCart();
  const { t } = useT();
  const { products, categories, loading, error } = useProducts();

  const allCategories = [
    { id: 'tutti', name: t.productsPage.categories.all, description: '' },
    ...categories
  ];

  const filteredProducts = selectedCategory === 'tutti' 
    ? products
    : products.filter(product => product.category === selectedCategory);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.inStock && product.stockQuantity > 0) {
      addToCart(productId, 1);
    }
  };

  if (loading) return <LoadingSpinner message={t.productsPage.loading} />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
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
      <BenefitsSection />
    </div>
  );
}