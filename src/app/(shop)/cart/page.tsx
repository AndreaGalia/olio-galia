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

// Import dei componenti
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import CartEmptyState from '@/components/cartPage/CartEmptyState';
import CheckoutErrorModal from '@/components/cartPage/CheckoutErrorModal';
import CartBreadcrumb from '@/components/cartPage/CartBreadcrumb';
import CartItem from '@/components/cartPage/CartItem';
import OrderSummary from '@/components/cartPage/OrderSummary';
import { Product } from '@/types/products';
import CheckoutTorinoButton from '@/components/cartPage/CheckoutTorinoButton';
import PreventivoCheckoutButton from '@/components/cartPage/PreventivoCheckoutButton';
import DeliveryZoneSelector from '@/components/cartPage/DeliveryZoneSelector';
import DeliveryZoneDetails from '@/components/cartPage/DeliveryZoneDetails';
import DeliveryZoneSummary from '@/components/cartPage/DeliveryZoneSummary';
import ShippingSelectionFlow from '@/components/cartPage/ShippingSelectionFlow';
import PaymentCanceledBanner from '@/components/cartPage/PaymentCanceledBanner';

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
    const cartProducts = cart.map(cartItem =>
      products.find((p: Product) => p.id === cartItem.id)
    ).filter(Boolean);

    // Se almeno un prodotto non ha stripeProductId o stripePriceId, Stripe non può essere usato
    return cartProducts.every(product =>
      product?.stripeProductId && product?.stripePriceId
    );
  };

  const stripeCheckoutAvailable = canUseStripeCheckout();

  // Stati di caricamento, errore e carrello vuoto
  if (loading) return <LoadingSpinner message={t.cartPage.loading} />;
  if (error) return <ErrorMessage error={error} />;
  if (cart.length === 0) return <CartEmptyState />;

  // Contenuto principale del carrello
  return (
    <div className="min-h-screen bg-homepage-bg">
      {/* Modal per errori di checkout */}
      <CheckoutErrorModal
        isVisible={showCheckoutError}
        error={checkoutError || ''}
        onClose={handleCloseError}
        onRetry={handleRetryCheckout}
      />

      {/* Breadcrumb */}
      <CartBreadcrumb />

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

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-olive">
            {t.cartPage.title}
          </h1>
          <span className="bg-olive text-beige px-3 py-1 text-sm font-bold whitespace-nowrap border border-olive/20">
            {totalItems} {itemCountLabel}
          </span>
        </div>

        {/* Banner Alert - Zona non selezionata */}
        {stripeCheckoutAvailable && !selectedShippingZone && (
          <div className="mb-6 bg-white border border-olive/20 p-4 sm:p-5 animate-fadeIn">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-olive/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Testo */}
              <div className="flex-1">
                <p className="text-olive font-medium text-sm sm:text-base">
                  {t.cartPage.shippingSelection?.zoneRequired || 'Seleziona la zona di spedizione per procedere al checkout'}
                </p>
              </div>

              {/* Freccia scroll */}
              <button
                onClick={() => {
                  const section = document.getElementById('shipping-section');
                  section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex-shrink-0 text-olive hover:text-olive/70 transition-colors"
                aria-label="Vai alla selezione zona"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Sezione sinistra: prodotti + bottone Torino */}
          <div className="lg:col-span-2 min-w-0">
            {/* Lista prodotti */}
            <div className="space-y-4 mb-6">
              {cart.map((cartItem) => {
                const product = products.find((p: Product) => p.id === cartItem.id);
                if (!product) return null;

                return (
                  <CartItem
                    key={product.stripeProductId || product.id}
                    cartItem={cartItem}
                    product={product}
                  />
                );
              })}
            </div>

            {/* Bottone checkout Torino sotto i prodotti - mostra solo se Stripe è disponibile e checkout Torino abilitato */}
            {settings.torino_checkout_enabled && stripeCheckoutAvailable && <CheckoutTorinoButton />}
          </div>

          {/* Riepilogo ordine */}
          <div className="lg:col-span-1 min-w-0">
            {!stripeCheckoutAvailable ? (
              // Visualizzazione speciale quando Stripe non è disponibile
              <DeliveryZoneSummary
                total={total}
                savings={savings}
                totalItems={totalItems}
                itemLabel={itemLabel}
              />
            ) : (
              // Visualizzazione normale con Stripe
              <OrderSummary
                total={total}
                savings={savings}
                totalItems={totalItems}
                itemLabel={itemLabel}
                onCheckout={() => handleCheckout(cart, selectedShippingZone || undefined)}
                needsInvoice={needsInvoice}
                setNeedsInvoice={setNeedsInvoice}
                checkoutLoading={checkoutLoading}
                stripeCheckoutDisabled={!selectedShippingZone}
                selectedShippingZone={selectedShippingZone}
                totalGrams={totalGrams}
                hasAllWeights={hasAllWeights}
              />
            )}
          </div>
        </div>

        {/* Sezione Scelta Consegna */}
        <div className="mt-8" id="shipping-section">
          <div className="bg-white border border-olive/10 p-6 lg:p-8">
            {stripeCheckoutAvailable ? (
              <>
                {/* Sistema zone per Stripe */}
                <ShippingSelectionFlow
                  value={selectedShippingZone}
                  onChange={setSelectedShippingZone}
                />

                {/* Preview costo spedizione - MIGLIORATO */}
                {selectedShippingZone && (
                  <div className="mt-8 bg-beige/50 border-2 border-olive p-5 sm:p-6 animate-fadeIn">
                    {/* Header con check mark */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-olive flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-beige" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-olive text-lg sm:text-xl font-serif">
                        {t.cartPage.shippingCost?.title || 'Anteprima Costo Spedizione'}
                      </h3>
                    </div>

                    {/* Zona selezionata */}
                    <div className="mb-4 p-3 bg-white border border-olive/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-nocciola">Zona selezionata:</span>
                        <span className="font-bold text-olive">
                          {t.cartPage.shippingSelection.zones[selectedShippingZone].name}
                        </span>
                      </div>
                    </div>

                    {/* Peso totale carrello (solo se NON Italia) */}
                    {selectedShippingZone !== 'italia' && (
                      <div className="flex justify-between mb-3 text-sm sm:text-base py-2 border-b border-olive/10">
                        <span className="text-nocciola">
                          {t.cartPage.shippingCost?.totalWeight || 'Peso totale'}
                        </span>
                        <span className="font-bold text-olive">
                          {totalKg.toFixed(2)} kg
                        </span>
                      </div>
                    )}

                    {/* Fascia peso */}
                    {shippingCost.tierLabel && (
                      <div className="flex justify-between mb-3 text-sm sm:text-base py-2 border-b border-olive/10">
                        <span className="text-nocciola">
                          {t.cartPage.shippingCost?.tier || 'Fascia peso'}
                        </span>
                        <span className="font-bold text-olive">{shippingCost.tierLabel}</span>
                      </div>
                    )}

                    {/* Costo - Più visibile */}
                    <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-olive">
                      <span className="font-bold text-olive text-base sm:text-lg">
                        {t.cartPage.shippingCost?.cost || 'Costo spedizione'}
                      </span>
                      <span className={`text-2xl sm:text-3xl font-bold ${shippingCost.isFree ? 'text-green-600' : 'text-olive'}`}>
                        {shippingCost.isFree
                          ? (t.cartPage.shippingCost?.free || 'GRATIS')
                          : `€${shippingCost.costEur.toFixed(2)}`
                        }
                      </span>
                    </div>

                    {/* Errore (prodotti senza peso) */}
                    {shippingCost.errorMessage && (
                      <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-400 text-yellow-800 text-sm">
                        {shippingCost.errorMessage}
                      </div>
                    )}

                    {/* Banner Italia: mancano X€ per spedizione gratis */}
                    {selectedShippingZone === 'italia' && !shippingCost.isFree && shippingConfig && (
                      <div className="mt-4 p-4 bg-olive/10 border border-olive/20 text-sm sm:text-base text-olive font-medium">
                        {(t.cartPage.shippingCost?.italyThreshold || 'Aggiungi €{amount} per spedizione gratuita!').replace(
                          '{amount}',
                          (shippingConfig.italyConfig.freeThreshold - total).toFixed(2)
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Sistema vecchio quando Stripe non disponibile
              <>
                {!deliveryChoice ? (
                  <DeliveryZoneSelector onSelectZone={setDeliveryChoice} />
                ) : (
                  <DeliveryZoneDetails
                    zone={deliveryChoice}
                    onBack={() => setDeliveryChoice(null)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageLoading() {
  return (
    <div className="min-h-screen bg-homepage-bg">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-olive text-2xl font-serif">Caricamento...</p>
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