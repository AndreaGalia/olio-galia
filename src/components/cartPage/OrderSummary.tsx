import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import { useShippingCost } from '@/hooks/useShippingCost';
import { ShippingZone } from '@/types/shipping';
import FreeShippingIndicator from './FreeShippingIndicator';

interface ShopConfig {
  freeShippingThreshold: number;
  shippingCosts: {
    eu: number;
    world: number;
  };
}

interface OrderSummaryProps {
  total: number;
  savings: number;
  totalItems: number;
  itemLabel: string;
  onCheckout: () => void;
  needsInvoice: boolean;
  setNeedsInvoice: (value: boolean) => void;
  checkoutLoading: boolean;
  stripeCheckoutDisabled?: boolean;
  selectedShippingZone: ShippingZone | null;
  totalGrams: number;
  hasAllWeights: boolean;
}

export default function OrderSummary({
  total,
  savings,
  totalItems,
  itemLabel,
  onCheckout,
  needsInvoice,
  setNeedsInvoice,
  checkoutLoading,
  stripeCheckoutDisabled = false,
  selectedShippingZone,
  totalGrams,
  hasAllWeights
}: OrderSummaryProps) {
  const { clearCart, cart } = useCart();
  const { t, translate } = useT();
  const { locale } = useLocale();

  // Calcola il costo di spedizione se una zona è stata selezionata
  const shippingCost = useShippingCost(
    selectedShippingZone,
    totalGrams,
    total,
    hasAllWeights,
    locale
  );

  // Calcola il totale finale includendo la spedizione
  const finalTotal = selectedShippingZone
    ? total + shippingCost.costEur
    : total;

  const [shopConfig, setShopConfig] = useState<ShopConfig>({
    freeShippingThreshold: 100,
    shippingCosts: { eu: 8.90, world: 25.00 }
  });

  useEffect(() => {
    fetch('/api/shop-config')
      .then(res => res.json())
      .then(config => {
        setShopConfig({
          freeShippingThreshold: config.freeShippingThreshold || 100,
          shippingCosts: config.shippingCosts || { eu: 8.90, world: 25.00 }
        });
      })
      .catch(() => {
        // Mantieni valori di default
      });
  }, []);

  return (
    <div className="p-6 sticky top-4">
      <h2 className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-6">
        {t.cartPage.summary.title}
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm text-black/70">
          <span>{t.cartPage.summary.subtotal?.replace('{count}', totalItems.toString()).replace('{itemLabel}', itemLabel) || `Subtotale (${totalItems} ${itemLabel})`}</span>
          <span>€{total.toFixed(2)}</span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-olive text-sm">
            <span>{t.cartPage.summary.totalSavings}</span>
            <span>-€{savings.toFixed(2)}</span>
          </div>
        )}

        {/* Costo spedizione */}
        {selectedShippingZone ? (
          <div className="flex justify-between text-sm text-black/70">
            <span>{t.cartPage.summary.shipping}</span>
            <span className={shippingCost.isFree ? "text-olive" : "text-black"}>
              {shippingCost.isFree ? t.cartPage.summary.free : `€${shippingCost.costEur.toFixed(2)}`}
            </span>
          </div>
        ) : (
          <p className="text-xs text-black/40 italic">
            {t.cartPage.summary.shippingCalculatedLater}
          </p>
        )}

        <div className="border-t border-black/10"></div>

        <div className="flex justify-between text-black font-medium text-base">
          <span>{t.cartPage.summary.total}</span>
          <span>€{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkbox per fattura */}
      <div className="border-t border-black/10 pt-4 mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={needsInvoice}
            onChange={(e) => setNeedsInvoice(e.target.checked)}
            className="mt-1 border-black/20 text-olive focus:ring-olive focus:ring-offset-0"
          />
          <div>
            <span className="text-black/70 text-xs block tracking-wide">
              {t.cartPage.invoice.title}
            </span>
            <span className="text-black/40 text-xs">
              {t.cartPage.invoice.description}
            </span>
          </div>
        </label>
      </div>

      <div className="space-y-4">
        {/* Mostra bottone Stripe solo se disponibile */}
        {!stripeCheckoutDisabled && (
          <button
            onClick={onCheckout}
            disabled={checkoutLoading || cart.length === 0}
            className="w-full py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {checkoutLoading ? t.cartPage.summary.processing : t.cartPage.summary.checkout}
          </button>
        )}

        <Link
          href="/products"
          className="w-full block text-center text-xs tracking-[0.15em] uppercase text-black/50 underline underline-offset-2 hover:text-black transition-colors"
        >
          {t.cartPage.summary.continueShopping}
        </Link>
      </div>

      {needsInvoice && (
        <p className="mt-4 text-xs text-black/40">
          {t.cartPage.invoice.checkoutNote}
        </p>
      )}

      <div className="mt-6 pt-4 border-t border-black/10">
        <button
          onClick={clearCart}
          className="w-full cursor-pointer text-center text-xs tracking-[0.15em] uppercase text-black/30 hover:text-black transition-colors py-2"
        >
          {t.cartPage.summary.clearCart}
        </button>
      </div>
    </div>
  );
}
