// hooks/useCheckoutHandler.ts
import { useState } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { useLocale } from '@/contexts/LocaleContext';
import { CartItem } from '@/types/cart';
import { ShippingZone } from '@/types/shipping';

export function useCheckoutHandler() {
  const { startCheckout, loading: checkoutLoading, error: checkoutError, clearError } = useCheckout();
  const { locale } = useLocale();
  const [needsInvoice, setNeedsInvoice] = useState<boolean>(false);
  const [showCheckoutError, setShowCheckoutError] = useState<boolean>(false);

  const handleCheckout = async (cart: CartItem[], shippingZone?: ShippingZone) => {
    if (cart.length === 0) return;

    clearError();
    setShowCheckoutError(false);

    try {
      await startCheckout(cart, needsInvoice, shippingZone, locale);
    } catch (err) {
      setShowCheckoutError(true);
    }
  };

  const handleCloseError = () => setShowCheckoutError(false);
  const handleRetryCheckout = () => {
    setShowCheckoutError(false);
    clearError();
  };

  return {
    needsInvoice,
    setNeedsInvoice,
    showCheckoutError,
    checkoutLoading,
    checkoutError,
    handleCheckout,
    handleCloseError,
    handleRetryCheckout
  };
}