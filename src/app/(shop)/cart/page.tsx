"use client";

import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { useT } from '@/hooks/useT';
import { useSettings } from '@/hooks/useSettings';

// Import degli hook personalizzati
import { useCartCalculations } from '@/hooks/useCartCalculations';
import { useCartLabels } from '@/hooks/useCartLabels';
import { useCheckoutHandler } from '@/hooks/useCheckoutHandler';

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

export default function CartPage() {
  const { cart, getTotalItems } = useCart();
  const { products, loading, error } = useProducts();
  const { settings } = useSettings();
  const { t } = useT();

  // State per la scelta della zona di consegna
  const [deliveryChoice, setDeliveryChoice] = useState<'torino' | 'italia' | null>(null);

  // Scroll automatico in alto quando il carrello diventa vuoto
  useEffect(() => {
    if (cart.length === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [cart.length]);

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
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* Modal per errori di checkout */}
      <CheckoutErrorModal
        isVisible={showCheckoutError}
        error={checkoutError || ''}
        onClose={handleCloseError}
        onRetry={handleRetryCheckout}
      />

      {/* Breadcrumb */}
      <CartBreadcrumb />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-olive">
            {t.cartPage.title}
          </h1>
          <span className="bg-olive text-beige px-3 py-1 text-sm font-bold whitespace-nowrap border border-olive/20">
            {totalItems} {itemCountLabel}
          </span>
        </div>

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
                onCheckout={() => handleCheckout(cart)}
                needsInvoice={needsInvoice}
                setNeedsInvoice={setNeedsInvoice}
                checkoutLoading={checkoutLoading}
                stripeCheckoutDisabled={false}
              />
            )}
          </div>
        </div>

        {/* Sezione Scelta Consegna - A tutta larghezza sotto il riepilogo */}
        {!stripeCheckoutAvailable && (
          <div className="mt-8">
            <div className="bg-beige/30 border border-olive/10 p-6 lg:p-8">
              {!deliveryChoice ? (
                // Schermata iniziale: scelta zona
                <DeliveryZoneSelector
                  onSelectZone={setDeliveryChoice}
                />
              ) : (
                // Schermata dopo la scelta
                <DeliveryZoneDetails
                  zone={deliveryChoice}
                  onBack={() => setDeliveryChoice(null)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}