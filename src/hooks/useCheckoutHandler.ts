// hooks/useCheckoutHandler.ts
import { useState } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { CartItem } from '@/types/cart';

export function useCheckoutHandler() {
  const { startCheckout, loading: checkoutLoading, error: checkoutError, clearError } = useCheckout();
  const [needsInvoice, setNeedsInvoice] = useState<boolean>(false);
  const [showCheckoutError, setShowCheckoutError] = useState<boolean>(false);

  const handleCheckout = async (cart: CartItem[]) => {
    if (cart.length === 0) return;
    
    clearError();
    setShowCheckoutError(false);
    
    try {
      await startCheckout(cart, needsInvoice);
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