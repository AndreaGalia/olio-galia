"use client";
import { use } from "react";
import { useProducts } from '@/hooks/useProducts';
import { useProductBySlug } from '@/hooks/useProductBySlug';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import NotFoundState from "@/components/singleProductPage/NotFoundState";
import { useT } from "@/hooks/useT";
import BreadcrumbNavigation from "@/components/singleProductPage/BreadcrumbNavigation";
import ProductImageGallery from "@/components/singleProductPage/ProductImageGallery";
import ProductInfoSection from "@/components/singleProductPage/ProductInfoSection";
import ProductDetailsCards from "@/components/singleProductPage/ProductDetailsCards";
import RelatedProductsSection from "@/components/singleProductPage/RelatedProductsSection";
import CustomHTMLRenderer from "@/components/singleProductPage/CustomHTMLRenderer";
import ProductReviews from "@/components/reviews/ProductReviews";
import { StructuredData, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';


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

  // Verifica se il prodotto ha HTML personalizzato (con optional chaining sicuro)
  const hasCustomHTML = Boolean(product.customHTML?.trim());

  // Genera structured data per SEO
  const productSchema = generateProductSchema(product, 'it');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: t.productDetailPage.breadcrumb?.products || 'Prodotti', url: '/products' },
    { name: product.name, url: `/products/${slug}` }
  ], 'it');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* Structured Data per SEO */}
      <StructuredData data={productSchema} />
      <StructuredData data={breadcrumbSchema} />

      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation productName={product.name} />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">

        {/* Layout standard - SEMPRE VISIBILE */}
        <>
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
        </>

        {/* HTML Personalizzato - SE PRESENTE, VIENE AGGIUNTO SOTTO */}
        {hasCustomHTML && (
          <>
            {/* Badge avviso HTML personalizzato (visibile solo in sviluppo) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                🎨 <strong>Contenuto Aggiuntivo:</strong> Questo prodotto ha contenuto HTML personalizzato.
              </div>
            )}

            {/* Separatore visivo */}
            <div className="my-12 border-t-2 border-olive/20"></div>

            <CustomHTMLRenderer
              html={product.customHTML || ''}
              className="mb-16"
            />
          </>
        )}

        {/* Separatore visivo prima delle recensioni */}
        <div className="my-12 border-t-2 border-olive/20"></div>

        {/* Recensioni prodotto */}
        <div className="mb-16">
          <ProductReviews productSlug={slug} />
        </div>

        {/* Prodotti correlati (sempre visibili) */}
        <RelatedProductsSection products={relatedProducts} />

      </div>
    </div>
  );
}