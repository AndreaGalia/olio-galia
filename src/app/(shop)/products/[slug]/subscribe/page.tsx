"use client";
import { use } from "react";
import { useProductBySlug } from '@/hooks/useProductBySlug';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import NotFoundState from "@/components/singleProductPage/NotFoundState";
import BreadcrumbNavigation from "@/components/singleProductPage/BreadcrumbNavigation";
import ProductImageGallery from "@/components/singleProductPage/ProductImageGallery";
import SubscribeProductInfo from "@/components/subscriptionPage/SubscribeProductInfo";
import SubscribeNotAvailable from "@/components/subscriptionPage/SubscribeNotAvailable";
import SubscriptionForm from "@/components/subscriptionPage/SubscriptionForm";
import { useT } from "@/hooks/useT";

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
    return <SubscribeNotAvailable slug={slug} />;
  }

  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <div className="lg:grid lg:grid-cols-2 lg:items-start">

        {/* Left: sticky image */}
        <div className="h-[120vw] sm:h-[85vw] lg:sticky lg:top-0 lg:h-screen">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
            isOutOfStock={false}
          />
        </div>

        {/* Right: product info + subscription form */}
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-20 max-w-xl lg:max-w-none mx-auto lg:mx-0">
          <BreadcrumbNavigation productName={product.name} />

          <div className="mt-10 space-y-5">
            <SubscribeProductInfo product={product} />
            <div className="border-t border-olive/20" />
            <SubscriptionForm product={product} />
          </div>
        </div>

      </div>
    </div>
  );
}
