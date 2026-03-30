"use client";
import { use, useState, useCallback } from "react";
import { useProducts } from '@/hooks/useProducts';
import { useProductBySlug } from '@/hooks/useProductBySlug';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import NotFoundState from "@/components/singleProductPage/NotFoundState";
import { useT } from "@/hooks/useT";
import BreadcrumbNavigation from "@/components/singleProductPage/BreadcrumbNavigation";
import ProductImageGallery from "@/components/singleProductPage/ProductImageGallery";
import ProductInfoSection from "@/components/singleProductPage/ProductInfoSection";
import RelatedProductsSection from "@/components/singleProductPage/RelatedProductsSection";
import CustomHTMLRenderer from "@/components/singleProductPage/CustomHTMLRenderer";
import ProductReviews from "@/components/reviews/ProductReviews";
import { StructuredData, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import type { ProductVariant } from '@/types/products';


interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params);

  const { product, loading, error, notFound } = useProductBySlug(slug);
  const { products: allProducts } = useProducts();
  const { t } = useT();

  const [selectedVariantImages, setSelectedVariantImages] = useState<string[] | null>(null);

  const handleVariantChange = useCallback((variant: ProductVariant | null) => {
    if (variant && variant.images && variant.images.length > 0) {
      setSelectedVariantImages(variant.images);
    } else {
      setSelectedVariantImages(null);
    }
  }, []);

  const relatedProducts = allProducts.filter((p) => p.slug !== slug);

  if (loading) return <LoadingSpinner message={t.productDetailPage.loading} />;
  if (error) return <ErrorMessage error={error} />;
  if (notFound) return <NotFoundState />;
  if (!product) return null;

  const isOutOfStock = !product.inStock || product.stockQuantity === 0;
  const hasCustomHTML = !product.productStory?.sections?.length && Boolean(product.customHTML?.trim());

  const productSchema = generateProductSchema(product, 'it');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: t.productDetailPage.breadcrumb?.products || 'Prodotti', url: '/products' },
    { name: product.name, url: `/products/${slug}` }
  ], 'it');

  const displayImages = selectedVariantImages || product.images;

  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <StructuredData data={productSchema} />
      <StructuredData data={breadcrumbSchema} />

      {/* Hero: full-width two-column */}
      <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:items-start">

        {/* Left: Image slider — sticky, fills full viewport height on desktop */}
        <div className="aspect-[3/4] lg:aspect-auto lg:sticky lg:top-0 lg:h-screen">
          <ProductImageGallery
            images={displayImages}
            productName={product.name}
            isOutOfStock={isOutOfStock}
          />
        </div>

        {/* Right: Info — scrolls naturally */}
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-20 max-w-xl lg:max-w-none mx-auto lg:mx-0">
          <BreadcrumbNavigation productName={product.name} />
          <div className="mt-10">
            <ProductInfoSection
              product={product}
              isOutOfStock={isOutOfStock}
              onVariantChange={handleVariantChange}
            />
          </div>
        </div>

      </div>

      {/* Below-the-fold content */}
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-12">

        {/* Custom HTML — legacy fallback for products not yet migrated to productStory */}
        {hasCustomHTML && (
          <>
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-sm text-blue-800">
                <strong>Legacy HTML:</strong> Questo prodotto usa customHTML. Considera la migrazione a productStory.
              </div>
            )}
            <div className="my-12 border-t border-black/10" />
            <CustomHTMLRenderer html={product.customHTML || ''} className="mb-16" />
          </>
        )}

        {/* Reviews */}
        <div className="mb-16">
          <ProductReviews productSlug={slug} />
        </div>

        {/* Related products */}
        <RelatedProductsSection products={relatedProducts} />

      </div>
    </div>
  );
}
