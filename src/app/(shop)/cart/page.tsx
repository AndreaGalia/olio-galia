"use client";

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

export default function CartPage() {
  const { cart, getTotalItems } = useCart();
  const { products, loading, error } = useProducts();
  const { settings } = useSettings();
  const { t } = useT();
  
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
          <span className="bg-olive text-beige px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
            {totalItems} {itemCountLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sezione sinistra: prodotti + bottone Torino */}
          <div className="lg:col-span-2">
            {/* Lista prodotti */}
            <div className="space-y-4 mb-6">
              {cart.map((cartItem) => {
                const product = products.find((p: Product) => p.id === cartItem.id);
                if (!product) return null;

                return (
                  <CartItem
                    key={cartItem.id}
                    cartItem={cartItem}
                    product={product}
                  />
                );
              })}
            </div>

            {/* Bottone checkout Torino sotto i prodotti - mostra solo se abilitato dall'admin */}
            {settings.torino_checkout_enabled && <CheckoutTorinoButton />}
          </div>

          {/* Riepilogo ordine */}
          <div className="lg:col-span-1">
            <OrderSummary
              total={total}
              savings={savings}
              totalItems={totalItems}
              itemLabel={itemLabel}
              onCheckout={() => handleCheckout(cart)}
              needsInvoice={needsInvoice}
              setNeedsInvoice={setNeedsInvoice}
              checkoutLoading={checkoutLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}