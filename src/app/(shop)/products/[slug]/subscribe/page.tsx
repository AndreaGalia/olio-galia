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

  // Redirect se non subscribable
  const isSubscribable = (product as typeof product & { isSubscribable?: boolean }).isSubscribable;
  if (!isSubscribable) {
    return (
      <div className="min-h-screen bg-homepage-bg flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <svg className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 text-olive/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-olive mb-4">
            {t.subscription?.notAvailable || 'Abbonamento non disponibile per questo prodotto'}
          </h1>
          <Link
            href={`/products/${slug}`}
            className="inline-block px-8 py-4 bg-olive text-beige font-medium hover:bg-salvia transition-all duration-300 border border-olive/20 uppercase tracking-wider"
          >
            {t.subscription?.backToProduct || 'Torna al prodotto'}
          </Link>
        </div>
      </div>
    );
  }

  const sub = t.subscription;

  return (
    <div className="min-h-screen bg-homepage-bg">
      <BreadcrumbNavigation productName={product.name} />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-olive mb-4 tracking-tight">
            {sub?.pageTitle || 'Abbonati e Risparmia'}
          </h1>
          <p className="text-lg sm:text-xl text-nocciola max-w-2xl mx-auto leading-relaxed">
            {sub?.pageSubtitle || 'Ricevi il tuo prodotto preferito a casa tua con regolarità'}
          </p>
        </div>

        {/* Layout 2 colonne */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          {/* Immagine prodotto */}
          <ProductImageGallery
            images={product.images}
            productName={product.name}
            isOutOfStock={false}
          />

          {/* Info + Form */}
          <div className="space-y-6">
            {/* Product info card */}
            <div className="bg-white border border-olive/10 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-olive/10 text-olive px-2 sm:px-3 py-1 border border-olive/20 text-xs sm:text-sm font-medium">
                  {product.categoryDisplay}
                </span>
                <span className="bg-salvia text-beige px-2 sm:px-3 py-1 border border-salvia/20 text-xs sm:text-sm font-bold">
                  {sub?.subscriptionBadge || 'ABBONAMENTO'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-olive mb-2">{product.name}</h2>
              <p className="text-sm sm:text-base text-nocciola leading-relaxed">{product.description}</p>
            </div>

            <SubscriptionForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
