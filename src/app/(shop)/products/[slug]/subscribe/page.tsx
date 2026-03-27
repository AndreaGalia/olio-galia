"use client";
import { use } from "react";
import { useProductBySlug } from '@/hooks/useProductBySlug';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import NotFoundState from "@/components/singleProductPage/NotFoundState";
import BreadcrumbNavigation from "@/components/singleProductPage/BreadcrumbNavigation";
import ProductImageGallery from "@/components/singleProductPage/ProductImageGallery";
import SubscriptionForm from "@/components/subscriptionPage/SubscriptionForm";
import { useT } from "@/hooks/useT";
import Link from "next/link";

interface SubscribePageProps {
  params: Promise<{ slug: string }>;
}

export default function SubscribePage({ params }: SubscribePageProps) {
  const { slug } = use(params);
  const { product, loading, error, notFound } = useProductBySlug(slug);
  const { t } = useT();

  if (loading) return <LoadingSpinner message={t.productDetailPage?.loading || 'Caricamento...'} />;
  if (error) return <ErrorMessage error={error} />;
  if (notFound) return <NotFoundState />;
  if (!product) return null;

  const isSubscribable = (product as typeof product & { isSubscribable?: boolean }).isSubscribable;

  if (!isSubscribable) {
    return (
      <div className="min-h-screen bg-sabbia-chiaro flex items-center justify-center px-6">
        <div className="text-center max-w-sm mx-auto space-y-6">
          <p className="text-[11px] tracking-[0.2em] uppercase text-black/40">
            {t.subscription?.notAvailable || 'Abbonamento non disponibile'}
          </p>
          <Link
            href={`/products/${slug}`}
            className="inline-block text-xs tracking-[0.2em] uppercase text-black underline underline-offset-2 hover:text-olive transition-colors"
          >
            {t.subscription?.backToProduct || 'Torna al prodotto'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sabbia-chiaro">

      {/* Same two-column layout as product page */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start">

        {/* Left: sticky image */}
        <div className="h-[120vw] sm:h-[85vw] lg:sticky lg:top-0 lg:h-screen">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
            isOutOfStock={false}
          />
        </div>

        {/* Right: info + form */}
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-20 max-w-xl lg:max-w-none mx-auto lg:mx-0">
          <BreadcrumbNavigation productName={product.name} />

          <div className="mt-10 space-y-5">
            {/* Category */}
            {product.categoryDisplay && (
              <p className="text-[11px] tracking-[0.2em] uppercase text-black/40">
                {product.categoryDisplay}
              </p>
            )}

            {/* Product name */}
            <div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: '1.3', letterSpacing: '0.15em' }}>
                {product.name}
              </h1>
              {product.size && (
                <p className="mt-1 text-xs tracking-wider text-black/40">{product.size}</p>
              )}
            </div>

            {/* Subscription label */}
            <p className="text-xs tracking-[0.15em] uppercase text-olive">
              {t.subscription?.subscriptionBadge || 'Abbonamento'}
            </p>

            {/* Short description */}
            {product.description && (
              <p className="text-sm text-black/60 leading-relaxed border-t border-black/10 pt-5">
                {product.description}
              </p>
            )}

            {/* Divider */}
            <div className="border-t border-black/10" />

            {/* Subscription form */}
            <SubscriptionForm product={product} />
          </div>
        </div>

      </div>
    </div>
  );
}
