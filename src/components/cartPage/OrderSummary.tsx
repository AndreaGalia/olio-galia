import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useT } from '@/hooks/useT';
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
}

export default function OrderSummary({
  total,
  savings,
  totalItems,
  itemLabel,
  onCheckout,
  needsInvoice,
  setNeedsInvoice,
  checkoutLoading
}: OrderSummaryProps) {
  const { clearCart, cart } = useCart();
  const { t, translate } = useT();
  
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

  const { freeShippingThreshold, shippingCosts } = shopConfig;
  const displayShippingCost = total >= freeShippingThreshold ? 0 : shippingCosts.eu;
  const finalTotal = total + displayShippingCost;

  return (
    <div className="bg-white/90 rounded-2xl p-6 shadow-lg sticky top-4">
      <h2 className="text-xl font-serif text-olive mb-6">{t.cartPage.summary.title}</h2>
      
      {/* Free shipping indicator */}
      <FreeShippingIndicator 
        total={total} 
        freeShippingThreshold={freeShippingThreshold} 
      />
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-nocciola">
          <span>{translate('cartPage.summary.subtotal', { count: totalItems, itemLabel })}</span>
          <span>€{total.toFixed(2)}</span>
        </div>
        
        {savings > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>{t.cartPage.summary.totalSavings}</span>
            <span>-€{savings.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-nocciola">
          <span>{t.cartPage.summary.shipping}</span>
          <span className={displayShippingCost === 0 ? "text-green-600 font-medium" : "text-nocciola"}>
            {displayShippingCost === 0 ? t.cartPage.summary.free : `€${displayShippingCost.toFixed(2)}*`}
          </span>
        </div>
        
        {displayShippingCost > 0 && (
          <div className="text-xs text-nocciola/70 bg-blue-50 p-3 rounded-lg">
            {translate('cartPage.shippingNote', { worldPrice: shippingCosts.world.toFixed(2) })}
          </div>
        )}
        
        <hr className="border-olive/20" />
        
        <div className="flex justify-between text-olive font-bold text-xl">
          <span>{t.cartPage.summary.total}</span>
          <span>€{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkbox per fattura */}
      <div className="mb-4 p-4 bg-olive/5 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={needsInvoice}
            onChange={(e) => setNeedsInvoice(e.target.checked)}
            className="mt-1 rounded border-olive/30 text-olive focus:ring-olive focus:ring-offset-0"
          />
          <div>
            <span className="text-olive font-medium text-sm block">
              {t.cartPage.invoice.title}
            </span>
            <span className="text-nocciola text-xs">
              {t.cartPage.invoice.description}
            </span>
          </div>
        </label>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onCheckout}
          disabled={checkoutLoading || cart.length === 0}
          className="w-full cursor-pointer bg-gradient-to-r from-olive to-salvia text-beige py-4 rounded-full font-medium hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {checkoutLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-beige/30 border-t-beige rounded-full animate-spin"></div>
              {t.cartPage.summary.processing}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {t.cartPage.summary.checkout}
            </>
          )}
        </button>
        
        <Link 
          href="/products"
          className="w-full block text-center py-3 border border-olive text-olive rounded-full hover:bg-olive/5 transition-colors font-medium"
        >
          {t.cartPage.summary.continueShopping}
        </Link>
      </div>

      {needsInvoice && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-xs">
            {t.cartPage.invoice.checkoutNote}
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-olive/20">
        <button 
          onClick={clearCart}
          className="w-full cursor-pointer text-center text-red-500 hover:text-red-700 text-sm font-medium py-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          {t.cartPage.summary.clearCart}
        </button>
      </div>

      {/* Info spedizione */}
      <div className="mt-6 p-4 bg-olive/5 rounded-xl">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-olive mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-nocciola">
            <p className="font-medium text-olive mb-1">
              {displayShippingCost === 0 ? t.cartPage.shipping.free : t.cartPage.shipping.paid}
            </p>
            <p>{t.cartPage.shipping.delivery}</p>
          </div>
        </div>
      </div>

      {/* Sicurezza checkout */}
      <div className="mt-4 p-4 bg-green-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-green-800 font-medium text-sm">{t.cartPage.security.title}</span>
        </div>
        <p className="text-green-700 text-xs">
          {t.cartPage.security.description}
        </p>
      </div>
    </div>
  );
}