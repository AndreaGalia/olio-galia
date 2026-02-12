// hooks/useSubscriptionCheckout.ts
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { SubscriptionInterval, ShippingZone } from '@/types/subscription';

export const useSubscriptionCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSubscription = async (
    productId: string,
    shippingZone: ShippingZone,
    interval: SubscriptionInterval
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, shippingZone, interval }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la creazione dell\'abbonamento');
      }

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
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    startSubscription,
    loading,
    error,
    clearError,
  };
};
