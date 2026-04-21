"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import { useSettings } from '@/hooks/useSettings';

// Import degli hook personalizzati
import { useCartCalculations } from '@/hooks/useCartCalculations';
import { useCartLabels } from '@/hooks/useCartLabels';
import { useCheckoutHandler } from '@/hooks/useCheckoutHandler';
import { useCartWeight } from '@/hooks/useCartWeight';
import { useShippingCost } from '@/hooks/useShippingCost';
import { useShippingConfig } from '@/contexts/ShippingConfigContext';
import { parseCartItemId, getVariantOrProduct } from '@/utils/variantHelpers';

// Import dei componenti
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import CartEmptyState from '@/components/cartPage/CartEmptyState';
import CheckoutErrorModal from '@/components/cartPage/CheckoutErrorModal';
import CartBreadcrumb from '@/components/cartPage/CartBreadcrumb';
import { Product } from '@/types/products';
import DeliveryZoneSelector from '@/components/cartPage/DeliveryZoneSelector';
import DeliveryZoneDetails from '@/components/cartPage/DeliveryZoneDetails';
import DeliveryZoneSummary from '@/components/cartPage/DeliveryZoneSummary';
import PaymentCanceledBanner from '@/components/cartPage/PaymentCanceledBanner';
import CheckoutWizard from '@/components/cartPage/CheckoutWizard';

function CartPageContent() {
  const searchParams = useSearchParams();
  const { cart, getTotalItems, selectedShippingZone, setSelectedShippingZone } = useCart();
  const { products, loading, error } = useProducts();
  const { settings } = useSettings();
  const { t } = useT();

  // State per la scelta della zona di consegna
  const [deliveryChoice, setDeliveryChoice] = useState<'torino' | 'italia' | null>(null);

  // State per il banner di pagamento cancellato
  const paymentCanceled = searchParams.get('payment_canceled') === 'true';
  const [showCancelBanner, setShowCancelBanner] = useState(paymentCanceled);

  // Scroll automatico in alto quando il carrello diventa vuoto
  useEffect(() => {
    if (cart.length === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [cart.length]);

  // Reset banner quando cambia il query param
  useEffect(() => {
    setShowCancelBanner(paymentCanceled);
  }, [paymentCanceled]);

  // Hook personalizzati
  const totalItems = getTotalItems();
  const { total, savings } = useCartCalculations(cart, products);
  const { itemCountLabel, itemLabel } = useCartLabels(totalItems);
  const {
    needsInvoice,
    setNeedsInvoice,
    showCheckoutError,
    checkoutLoading,
    checkoutError,
    handleCheckout,
    handleCloseError,
    handleRetryCheckout
  } = useCheckoutHandler();

  // Calcolo peso carrello e costo spedizione
  const { totalGrams, totalKg, hasAllWeights, productsWithoutWeight } = useCartWeight(cart, products);
  const { locale } = useLocale();
  const shippingCost = useShippingCost(
    selectedShippingZone,
    totalGrams,
    total,
    hasAllWeights,
    locale
  );

  // Configurazione spedizioni (per soglia Italia)
  const { config: shippingConfig } = useShippingConfig();

  // Verifica se il checkout Stripe è disponibile per i prodotti nel carrello
  const canUseStripeCheckout = () => {
    // Se Stripe è disabilitato globalmente, non può essere usato
    if (!settings.stripe_enabled) return false;

    // Verifica che tutti i prodotti nel carrello abbiano gli ID Stripe
    // (per varianti, controlla gli stripeIds della variante)
    return cart.every(cartItem => {
      const { productId, variantId } = parseCartItemId(cartItem.id);
      const product = products.find((p: Product) => p.id === productId);
      if (!product) return false;

      const resolved = getVariantOrProduct(product, variantId);
      return resolved.stripeProductId && resolved.stripePriceId;
    });
  };

  const stripeCheckoutAvailable = canUseStripeCheckout();

  // Funzione per scroll automatico a sezione shipping
  const handleScrollToShipping = () => {
    const section = document.getElementById('shipping-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Stati di caricamento, errore e carrello vuoto
  if (loading) return <LoadingSpinner message={t.cartPage.loading} />;
  if (error) return <ErrorMessage error={error} />;
  if (cart.length === 0) return <CartEmptyState />;

  // Contenuto principale del carrello
  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      {/* Modal per errori di checkout */}
      <CheckoutErrorModal
        isVisible={showCheckoutError}
        error={checkoutError || ''}
        onClose={handleCloseError}
        onRetry={handleRetryCheckout}
      />

      {/* Breadcrumb */}
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 pt-10">
        <CartBreadcrumb />
      </div>

      {/* Banner Pagamento Cancellato */}
      <PaymentCanceledBanner
        show={showCancelBanner && cart.length > 0}
        onClose={() => setShowCancelBanner(false)}
        onRetry={() => {
          if (selectedShippingZone) {
            handleCheckout(cart, selectedShippingZone);
          } else {
            const section = document.getElementById('shipping-section');
            section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        loading={checkoutLoading}
        showRetryButton={stripeCheckoutAvailable}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-8 sm:py-12">
        <div className="mb-8">
          <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
            {totalItems} {itemCountLabel}
          </p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: '1.3', letterSpacing: '0.15em' }}>
            {t.cartPage.title}
          </h1>
        </div>

        {/* Checkout Wizard - 3 Step Flow */}
        {stripeCheckoutAvailable ? (
          <CheckoutWizard
            cart={cart}
            products={products}
            total={total}
            savings={savings}
            totalItems={totalItems}
            itemLabel={itemLabel}
            selectedShippingZone={selectedShippingZone}
            setSelectedShippingZone={setSelectedShippingZone}
            totalGrams={totalGrams}
            hasAllWeights={hasAllWeights}
            needsInvoice={needsInvoice}
            setNeedsInvoice={setNeedsInvoice}
            checkoutLoading={checkoutLoading}
            handleCheckout={() => handleCheckout(cart, selectedShippingZone || undefined)}
          />
        ) : (
          // Sistema vecchio quando Stripe non disponibile
          <>
            <DeliveryZoneSummary
              total={total}
              savings={savings}
              totalItems={totalItems}
              itemLabel={itemLabel}
            />

            <div className="mt-8 border border-black/10 p-6 lg:p-8">
              {!deliveryChoice ? (
                <DeliveryZoneSelector onSelectZone={setDeliveryChoice} />
              ) : (
                <DeliveryZoneDetails
                  zone={deliveryChoice}
                  onBack={() => setDeliveryChoice(null)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CartPageLoading() {
  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="font-serif termina-11 tracking-wider uppercase text-black">Caricamento...</p>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartPageLoading />}>
      <CartPageContent />
    </Suspense>
  );
}
