"use client";

import { ShippingZone } from '@/types/shipping';
import { useT } from '@/hooks/useT';
import { useShippingCost } from '@/hooks/useShippingCost';
import { useLocale } from '@/contexts/LocaleContext';

interface FloatingActionButtonProps {
  selectedShippingZone: ShippingZone | null;
  total: number;
  totalGrams: number;
  hasAllWeights: boolean;
  onScrollToShipping: () => void;
  onCheckout: () => void;
  checkoutLoading: boolean;
  stripeCheckoutAvailable: boolean;
}

export default function FloatingActionButton({
  selectedShippingZone,
  total,
  totalGrams,
  hasAllWeights,
  onScrollToShipping,
  onCheckout,
  checkoutLoading,
  stripeCheckoutAvailable
}: FloatingActionButtonProps) {
  const { t } = useT();
  const { locale } = useLocale();

  // Calcola costo spedizione se zona selezionata
  const shippingCost = useShippingCost(
    selectedShippingZone,
    totalGrams,
    total,
    hasAllWeights,
    locale
  );

  // Calcola totale finale
  const finalTotal = selectedShippingZone
    ? total + shippingCost.costEur
    : total;

  // Non mostrare se Stripe non disponibile o su desktop
  if (!stripeCheckoutAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden animate-fadeIn">
      <button
        onClick={selectedShippingZone ? onCheckout : onScrollToShipping}
        disabled={checkoutLoading}
        className="w-full bg-olive text-beige py-2 sm:py-3 px-4 text-xs sm:text-sm font-medium transition-colors duration-300 uppercase tracking-wider hover:bg-olive/90 flex items-center justify-center gap-2 border-t border-olive/20 disabled:opacity-50"
      >
        {checkoutLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t.cartPage.summary?.processing || 'Elaborazione...'}</span>
          </>
        ) : selectedShippingZone ? (
          <>
            <span>{t.cartPage.summary?.checkout || 'Procedi al Checkout'}</span>
            <span className="font-bold text-base sm:text-lg">€{finalTotal.toFixed(2)}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        ) : (
          <>
            <span>{t.cartPage.shippingSelection?.zoneRequired || 'Seleziona zona di spedizione'}</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
