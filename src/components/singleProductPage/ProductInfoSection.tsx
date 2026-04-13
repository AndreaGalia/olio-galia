'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BulkProposalSection } from '@/components/BulkProposalModal';
import { useCart } from '@/contexts/CartContext';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import VariantSelector from './VariantSelector';
import ProductAccordion from './ProductAccordion';
import ProductStory from './productStory/ProductStory';
import { buildCartItemId, getVariantOrProduct } from '@/utils/variantHelpers';
import type { Product, ProductVariant } from '@/types/products';
import type { RecurringPriceMap } from '@/types/subscription';

interface ProductInfoSectionProps {
  product: Product;
  isOutOfStock: boolean;
  onVariantChange?: (variant: ProductVariant | null) => void;
}

export default function ProductInfoSection({
  product,
  isOutOfStock,
  onVariantChange,
}: ProductInfoSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [reviewCount, setReviewCount] = useState<number | null>(null);

  const { addToCart } = useCart();
  const { t } = useT();
  const { locale } = useLocale();

  const hasVariants = product.variants && product.variants.length > 0;

  // Init variant
  useEffect(() => {
    if (hasVariants && product.variants) {
      const first = product.variants.find((v) => v.inStock) || product.variants[0];
      setSelectedVariant(first);
      onVariantChange?.(first);
    }
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch review count
  useEffect(() => {
    fetch(`/api/products/${product.slug}/feedbacks?page=1&limit=1&rating=all&locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.stats) setReviewCount(data.stats.total);
      })
      .catch(() => {});
  }, [product.slug, locale]);

  const resolved = getVariantOrProduct(product, selectedVariant?.variantId);
  const effectiveOutOfStock = hasVariants
    ? !resolved.inStock || resolved.stockQuantity === 0
    : isOutOfStock;

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);
    onVariantChange?.(variant);
  };

  const handleAddToCart = () => {
    if (effectiveOutOfStock || isAdded) return;
    addToCart(buildCartItemId(product.id, selectedVariant?.variantId), quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const scrollToReviews = () => {
    const el = document.getElementById('product-reviews-section');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 100, behavior: 'smooth' });
  };

  const hasFeatures = product.features && product.features.length > 0;
  const hasNutritionalInfo = product.nutritionalInfo && Object.keys(product.nutritionalInfo).length > 0;
  const hasAwards = product.awards && product.awards.length > 0;
  const hasOrigin = product.origin || product.harvest || product.processing;

  return (
    <div className="space-y-5">

      {/* 1 — Category */}
      {product.categoryDisplay && (
        <p className="text-[11px] tracking-[0.2em] uppercase text-black/40">
          {product.categoryDisplay}
        </p>
      )}

      {/* 2 — Product name */}
      <div>
        <h1
          className={effectiveOutOfStock ? 'opacity-60' : ''}
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: '1.3', letterSpacing: '0.15em' }}
        >
          {product.name}
        </h1>
        {product.size && (
          <p className="mt-1 text-xs tracking-wider text-black/40">{product.size}</p>
        )}
      </div>

      {/* 3 — Reviews count */}
      {reviewCount !== null && reviewCount > 0 && (
        <button
          onClick={scrollToReviews}
          className="text-xs tracking-wider text-black/40 underline underline-offset-2 hover:text-black transition-colors cursor-pointer text-left"
        >
          {reviewCount} {locale === 'it' ? 'recensioni' : 'reviews'}
        </button>
      )}

      {/* 4 — Price */}
      <div className={`flex items-baseline gap-3 ${effectiveOutOfStock ? 'opacity-60' : ''}`}>
        {resolved.originalPrice && resolved.originalPrice !== 'null' && (
          <span className="text-sm text-black/40 line-through">€{resolved.originalPrice}</span>
        )}
        <span className="text-2xl font-light text-black tracking-wide">€{resolved.price}</span>
        {effectiveOutOfStock && (
          <span className="text-xs tracking-widest uppercase text-red-500 ml-1">
            {t.productDetailPage.stockNotAvaible}
          </span>
        )}
      </div>

      {/* 5 — Short italic tagline (details field) */}
      {product.details && (
        <p className="text-sm text-black/60 italic leading-relaxed border-t border-black/8 pt-5">
          {product.details}
        </p>
      )}

      {/* 6 — Long description */}
      {product.longDescription && (
        <p className="text-sm text-black/70 leading-relaxed">
          {product.longDescription}
        </p>
      )}

      {/* 7 — Variant selector */}
      {hasVariants && product.variants && (
        <div className="border-t border-black/8 pt-5">
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            variantLabel={product.variantLabel}
            onVariantChange={handleVariantChange}
            disabled={effectiveOutOfStock && !product.variants.some((v) => v.inStock)}
          />
        </div>
      )}

      {/* 8 — Quantity */}
      <div className={`flex items-center gap-4 border-t border-black/8 pt-5 ${effectiveOutOfStock ? 'opacity-40 pointer-events-none' : ''}`}>
        <span className="text-[11px] tracking-[0.15em] uppercase text-black/50">
          {t.productDetailPage.product.quantity}
        </span>
        <div className="flex items-center border border-black/15">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 flex items-center justify-center text-sm hover:bg-black/5 transition-colors cursor-pointer select-none"
          >
            −
          </button>
          <span className="w-9 h-9 flex items-center justify-center text-sm border-x border-black/10">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(resolved.stockQuantity, quantity + 1))}
            className="w-9 h-9 flex items-center justify-center text-sm hover:bg-black/5 transition-colors cursor-pointer select-none"
            disabled={quantity >= resolved.stockQuantity}
          >
            +
          </button>
        </div>
      </div>

      {/* 9 — Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={effectiveOutOfStock || isAdded}
        className={`w-full py-4 text-[11px] tracking-[3.4px] uppercase transition-all duration-200 cursor-pointer disabled:cursor-not-allowed border border-olive ${
          isAdded
            ? 'bg-sabbia text-olive'
            : effectiveOutOfStock
              ? 'bg-sabbia/40 text-black/30 border-olive/30'
              : 'bg-olive text-beige hover:bg-sabbia hover:text-olive'
        }`}
      >
        {isAdded
          ? (locale === 'it' ? 'Aggiunto al carrello ✓' : 'Added to cart ✓')
          : (locale === 'it' ? 'Aggiungi al carrello' : 'Add to cart')}
      </button>

      {/* 10 — Bulk proposal */}
      <BulkProposalSection productName={product.name} />

      {/* 11 — Subscribe CTA */}
      {(product as Product & { isSubscribable?: boolean; stripeRecurringPriceIds?: RecurringPriceMap }).isSubscribable && (
        <div className="border-t border-black/8 pt-5">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-black/40 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <p className="text-[11px] tracking-[0.15em] uppercase text-black mb-1">
                {t.subscription?.ctaBanner || 'Abbonati e Risparmia'}
              </p>
              <p className="text-xs text-black/50 mb-2">
                {t.subscription?.ctaBannerDesc || 'Ricevi questo prodotto con regolarità.'}
              </p>
              <Link
                href={`/products/${product.slug}/subscribe`}
                className="text-[11px] tracking-[0.15em] uppercase text-black/60 hover:text-black transition-colors underline underline-offset-2"
              >
                {t.subscription?.ctaButton || "Scopri l'abbonamento"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 12 — Accordions */}
      <div className="pt-3">
        {(hasFeatures || product.bestFor) && (
          <ProductAccordion title={t.productDetailPage.product.characteristics}>
            {hasFeatures && (
              <ul className="space-y-1.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-black/30 mt-0.5">—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
            {product.bestFor && (
              <p className={`text-black/50 ${hasFeatures ? 'mt-3' : ''}`}>
                <span className="text-black/70">
                  {locale === 'it' ? 'Ideale per:' : 'Best for:'}
                </span>{' '}
                {product.bestFor}
              </p>
            )}
          </ProductAccordion>
        )}

        {hasOrigin && (
          <ProductAccordion title={t.productDetailPage.product.origin}>
            <dl className="space-y-2">
              {product.origin && (
                <div className="flex gap-4">
                  <dt className="min-w-[90px] text-black/50">{locale === 'it' ? 'Provenienza' : 'Origin'}</dt>
                  <dd>{product.origin}</dd>
                </div>
              )}
              {product.harvest && (
                <div className="flex gap-4">
                  <dt className="min-w-[90px] text-black/50">{locale === 'it' ? 'Raccolta' : 'Harvest'}</dt>
                  <dd>{product.harvest}</dd>
                </div>
              )}
              {product.processing && (
                <div className="flex gap-4">
                  <dt className="min-w-[90px] text-black/50">{locale === 'it' ? 'Lavorazione' : 'Processing'}</dt>
                  <dd>{product.processing}</dd>
                </div>
              )}
            </dl>
          </ProductAccordion>
        )}

        {hasNutritionalInfo && (
          <ProductAccordion title={t.productDetailPage.product.nutritionalInfo}>
            <p className="mb-3 text-[11px] tracking-widest uppercase text-black/40">
              {t.productDetailPage.product.nutritionalPer100g}
            </p>
            <dl className="space-y-1.5">
              {Object.entries(product.nutritionalInfo!).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-black/5 pb-1.5">
                  <dt className="capitalize text-black/60">{key}</dt>
                  <dd className="text-black">{value}</dd>
                </div>
              ))}
            </dl>
          </ProductAccordion>
        )}

        {hasAwards && (
          <ProductAccordion title={t.productDetailPage.product.awards}>
            <ul className="space-y-1.5">
              {product.awards.map((award, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-black/30">★</span>
                  <span>{award}</span>
                </li>
              ))}
            </ul>
          </ProductAccordion>
        )}

        {product.productStory?.sections?.length && (
          <ProductStory story={product.productStory} />
        )}

        <div className="border-t border-olive/20" />
      </div>
    </div>
  );
}
