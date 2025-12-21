// hooks/useCheckout.ts
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { ShippingZone } from '@/types/shipping';

interface CartItem {
  id: string;
  quantity: number;
}

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (
    items: CartItem[],
    needsInvoice: boolean = false,
    shippingZone?: ShippingZone
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Chiamata API per creare la sessione checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          needsInvoice,
          shippingZone, // Passa solo la zona
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il checkout');
      }

      // Carica Stripe e reindirizza
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      
      if (!stripe) {
        throw new Error('Impossibile caricare Stripe');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Errore di reindirizzamento');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto durante il checkout';
      setError(errorMessage);
      throw err; // Rilancia l'errore per permettere al componente di gestirlo
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    startCheckout,
    loading,
    error,
    clearError,
  };
};