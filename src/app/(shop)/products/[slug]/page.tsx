"use client";
import { use } from "react";
import { useProductBySlug, useProducts } from '@/hooks/useProducts';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import NotFoundState from "@/components/singleProductPage/NotFoundState";
import { useT } from "@/hooks/useT";
import BreadcrumbNavigation from "@/components/singleProductPage/BreadcrumbNavigation";
import ProductImageGallery from "@/components/singleProductPage/ProductImageGallery";
import ProductInfoSection from "@/components/singleProductPage/ProductInfoSection";
import ProductDetailsCards from "@/components/singleProductPage/ProductDetailsCards";
import RelatedProductsSection from "@/components/singleProductPage/RelatedProductsSection";


interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params);
  
  // Hooks per i dati
  const { product, loading, error, notFound } = useProductBySlug(slug);
  const { products: allProducts } = useProducts();
  const { t } = useT();
  
  // Prodotti correlati (escluso il prodotto corrente)
  const relatedProducts = allProducts.filter((p) => p.slug !== slug);

  // Stati di caricamento, errore e prodotto non trovato
  if (loading) return <LoadingSpinner message={t.productDetailPage.loading} />;
  if (error) return <ErrorMessage error={error} />;
  if (notFound) return <NotFoundState />;
  if (!product) return null;

  // Verifica se il prodotto è esaurito
  const isOutOfStock = !product.inStock || product.stockQuantity === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation productName={product.name} />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
        
        {/* Sezione principale del prodotto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          
          {/* Galleria immagini */}
          <ProductImageGallery 
            images={product.images}
            productName={product.name}
            isOutOfStock={isOutOfStock}
          />

          {/* Informazioni prodotto */}
          <ProductInfoSection 
            product={product}
            isOutOfStock={isOutOfStock}
          />
        </div>

        {/* Schede dettagliate */}
        <ProductDetailsCards 
          product={product}
          isOutOfStock={isOutOfStock}
        />

        {/* Prodotti correlati */}
        <RelatedProductsSection products={relatedProducts} />

      </div>
    </div>
  );
}