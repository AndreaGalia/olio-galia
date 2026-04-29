'use client';

import { useState } from 'react';
import { useSubscriptionCheckout } from '@/hooks/useSubscriptionCheckout';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import {
  SubscriptionInterval,
  ShippingZone,
  SubscriptionQuantity,
  SUBSCRIPTION_INTERVALS,
  SHIPPING_ZONES,
  RecurringPriceMap,
  QuantityPriceMap,
} from '@/types/subscription';
import type { Product } from '@/types/products';

interface SubscriptionFormProps {
  product: Product;
}

export default function SubscriptionForm({ product }: SubscriptionFormProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<SubscriptionQuantity>(1);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<SubscriptionInterval | null>(null);
  const { startSubscription, loading, error, clearError } = useSubscriptionCheckout();
  const { t } = useT();
  const { locale } = useLocale();

  const label = (item: { labelIt: string; labelEn: string }) =>
    locale === 'en' ? item.labelEn : item.labelIt;

  const productAny = product as Product & {
    stripeRecurringPriceIds?: RecurringPriceMap;
    subscriptionPrices?: QuantityPriceMap;
  };

  const hasNewFormat = !!productAny.subscriptionPrices;
  const legacyPriceMap = productAny.stripeRecurringPriceIds;

  const getPrice = (qty: SubscriptionQuantity, zone: ShippingZone, interval: SubscriptionInterval): number | null => {
    if (hasNewFormat) {
      const entry = productAny.subscriptionPrices?.[qty]?.[zone]?.[interval];
      if (entry && typeof entry === 'object' && entry.amount) return entry.amount;
    }
    return null;
  };

  const isAvailable = (qty: SubscriptionQuantity, zone: ShippingZone, interval: SubscriptionInterval): boolean => {
    if (hasNewFormat) {
      const entry = productAny.subscriptionPrices?.[qty]?.[zone]?.[interval];
      if (entry && typeof entry === 'object' && entry.priceId) return true;
    }
    if (qty === 1 && legacyPriceMap) {
      const priceId = legacyPriceMap[zone]?.[interval];
      if (priceId && priceId.trim()) return true;
    }
    return false;
  };

  const hasLegacyPrices = !!legacyPriceMap && Object.values(legacyPriceMap).some(zone => {
    if (!zone) return false;
    return Object.values(zone).some(id => id && id.trim());
  });

  const hasNewFormatQty = (qty: SubscriptionQuantity): boolean => {
    const qtyMap = productAny.subscriptionPrices?.[qty];
    if (!qtyMap) return false;
    return Object.values(qtyMap).some(zones => {
      if (!zones) return false;
      return Object.values(zones).some(entry => entry && typeof entry === 'object' && entry.priceId);
    });
  };

  const availableQuantities: number[] = (() => {
    const qtys: number[] = [];
    if (hasNewFormat && productAny.subscriptionPrices) {
      for (const key of Object.keys(productAny.subscriptionPrices)) {
        const n = Number(key);
        if (!isNaN(n) && hasNewFormatQty(n)) qtys.push(n);
      }
    }
    if (hasLegacyPrices && !qtys.includes(1)) qtys.push(1);
    return qtys.sort((a, b) => a - b);
  })();

  const availableZones = SHIPPING_ZONES.filter(zone => {
    if (hasNewFormat) {
      const zoneMap = productAny.subscriptionPrices?.[selectedQuantity]?.[zone.value];
      if (zoneMap && Object.values(zoneMap).some(entry => entry && typeof entry === 'object' && entry.priceId)) return true;
    }
    if (selectedQuantity === 1 && legacyPriceMap) {
      const zoneMap = legacyPriceMap[zone.value];
      if (zoneMap && Object.values(zoneMap).some(id => id && id.trim())) return true;
    }
    return false;
  });

  const availableIntervals = SUBSCRIPTION_INTERVALS.filter(interval => {
    if (!selectedZone) return false;
    return isAvailable(selectedQuantity, selectedZone, interval.value);
  });

  const selectedPrice = selectedZone && selectedInterval
    ? getPrice(selectedQuantity, selectedZone, selectedInterval)
    : null;

  const minPrice = (() => {
    let min: number | null = null;
    for (const zone of availableZones) {
      for (const interval of SUBSCRIPTION_INTERVALS) {
        const price = getPrice(selectedQuantity, zone.value, interval.value);
        if (price !== null && (min === null || price < min)) min = price;
      }
    }
    return min;
  })();

  const handleSubmit = async () => {
    if (!selectedZone || !selectedInterval) return;
    clearError();
    try {
      await startSubscription(product.id, selectedZone, selectedInterval, selectedQuantity);
    } catch {
      // gestito dal hook
    }
  };

  const sub = t.subscription;
  const formatPrice = (amount: number) => `€${amount.toFixed(2).replace('.00', '')}`;
  const showQuantityStep = availableQuantities.length >= 1;

  return (
    <div className="space-y-6">

      {/* Price summary */}
      {minPrice !== null && (
        <div>
          {selectedPrice !== null ? (
            <div className="flex items-baseline gap-3">
              <span className="font-serif termina-22 text-black tracking-wide">
                {formatPrice(selectedPrice)}
              </span>
              <span className="font-serif termina-8 tracking-wider uppercase text-black">
                / {label(SUBSCRIPTION_INTERVALS.find(i => i.value === selectedInterval!)!)}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-serif termina-8 tracking-[0.15em] uppercase text-black">
                {sub?.startingFrom || 'A partire da'}
              </span>
              <span className="font-serif termina-22 text-black tracking-wide">
                {formatPrice(minPrice)}
              </span>
            </div>
          )}
          <p className="font-serif termina-8 text-black mt-1">
            {sub?.shippingIncluded || 'Spedizione inclusa'}
          </p>
        </div>
      )}

      {/* Step 1 — Quantità */}
      {showQuantityStep && (
        <div className="space-y-3">
          <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
            {sub?.quantityTitle || 'Quantità'}
          </p>
          <div className="flex gap-2">
            {availableQuantities.map(qty => (
              <button
                key={qty}
                type="button"
                onClick={() => {
                  setSelectedQuantity(qty);
                  setSelectedZone(null);
                  setSelectedInterval(null);
                }}
                className={`px-5 py-2.5 border font-serif termina-11 transition-all duration-200 cursor-pointer ${
                  selectedQuantity === qty
                    ? 'border-olive bg-olive text-beige'
                    : 'border-olive/20 text-black hover:border-olive/40'
                }`}
              >
                {qty === 1
                  ? (sub?.qty1 || '1 pz')
                  : `${qty} ${locale === 'en' ? 'pcs' : 'pz'}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Zona spedizione */}
      <div className="space-y-3">
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
          {sub?.zoneTitle || 'Zona di spedizione'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {availableZones.map(zone => (
            <button
              key={zone.value}
              type="button"
              onClick={() => {
                setSelectedZone(zone.value);
                setSelectedInterval(null);
              }}
              className={`py-3 px-4 border font-serif termina-8 tracking-wider uppercase transition-all duration-200 cursor-pointer text-left ${
                selectedZone === zone.value
                  ? 'border-olive bg-olive text-beige'
                  : 'border-olive/20 text-black hover:border-olive/40'
              }`}
            >
              {label(zone)}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3 — Frequenza */}
      <div className={`space-y-3 transition-opacity duration-300 ${!selectedZone ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
          {sub?.intervalTitle || 'Frequenza di consegna'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(selectedZone ? availableIntervals : SUBSCRIPTION_INTERVALS).map(interval => {
            const price = selectedZone ? getPrice(selectedQuantity, selectedZone, interval.value) : null;
            return (
              <button
                key={interval.value}
                type="button"
                onClick={() => setSelectedInterval(interval.value)}
                className={`py-3 px-4 border text-left transition-all duration-200 cursor-pointer ${
                  selectedInterval === interval.value
                    ? 'border-olive bg-olive text-beige'
                    : 'border-olive/20 text-black hover:border-olive/40'
                }`}
              >
                <span className="block font-serif termina-8 tracking-wider uppercase">
                  {label(interval)}
                </span>
                {price !== null && (
                  <span className={`block font-serif termina-8 mt-0.5 ${
                    selectedInterval === interval.value ? 'text-beige/70' : 'text-black'
                  }`}>
                    {formatPrice(price)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="font-serif termina-8 tracking-wider text-red-600">
          {error}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={!selectedZone || !selectedInterval || loading}
        className={`w-full py-4 font-serif termina-11 tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
          loading
            ? 'bg-black/20 text-black/40'
            : !selectedZone || !selectedInterval
              ? 'bg-sabbia/40 text-black/30'
              : 'bg-sabbia text-black hover:bg-olive hover:text-beige'
        }`}
      >
        {loading
          ? (sub?.processing || 'Elaborazione...')
          : selectedPrice !== null
            ? `${sub?.subscribeButton || 'Abbonati ora'} — ${formatPrice(selectedPrice)}`
            : (sub?.subscribeButton || 'Abbonati ora')}
      </button>

      {/* Shipping note */}
      <p className="garamond-13">
        {sub?.shippingNote || "La spedizione è inclusa nel prezzo dell'abbonamento. Riceverai il prodotto direttamente a casa tua con la frequenza selezionata."}
      </p>

    </div>
  );
}
