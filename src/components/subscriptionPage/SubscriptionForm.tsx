'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSubscriptionCheckout } from '@/hooks/useSubscriptionCheckout';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import {
  SubscriptionInterval,
  ShippingZone,
  SUBSCRIPTION_INTERVALS,
  SHIPPING_ZONES,
  RecurringPriceMap,
} from '@/types/subscription';
import type { Product } from '@/types/products';

interface SubscriptionFormProps {
  product: Product;
}

export default function SubscriptionForm({ product }: SubscriptionFormProps) {
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<SubscriptionInterval | null>(null);
  const [stripePrices, setStripePrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(true);
  const { startSubscription, loading, error, clearError } = useSubscriptionCheckout();
  const { t } = useT();
  const { locale } = useLocale();
  const label = (item: { labelIt: string; labelEn: string }) => locale === 'en' ? item.labelEn : item.labelIt;

  const priceMap = (product as Product & { stripeRecurringPriceIds?: RecurringPriceMap }).stripeRecurringPriceIds;

  // Raccogli tutti i price ID dal prodotto
  const allPriceIds = useCallback(() => {
    const ids: string[] = [];
    if (!priceMap) return ids;
    for (const zone of Object.values(priceMap)) {
      if (!zone) continue;
      for (const priceId of Object.values(zone)) {
        if (priceId && priceId.trim()) ids.push(priceId);
      }
    }
    return ids;
  }, [priceMap]);

  // Fetch prezzi da Stripe al mount
  useEffect(() => {
    const ids = allPriceIds();
    if (ids.length === 0) {
      setPricesLoading(false);
      return;
    }

    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/subscription-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceIds: ids }),
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: Record<string, number> = {};
          for (const [id, info] of Object.entries(data.prices)) {
            mapped[id] = (info as { amount: number }).amount;
          }
          setStripePrices(mapped);
        }
      } catch {
        // fallback silenzioso
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPrices();
  }, [allPriceIds]);

  // Helper: prezzo per una coppia zona/intervallo
  const getPrice = (zone: ShippingZone, interval: SubscriptionInterval): number | null => {
    const priceId = priceMap?.[zone]?.[interval];
    if (!priceId) return null;
    return stripePrices[priceId] ?? null;
  };

  // Prezzo minimo globale
  const minPrice = (() => {
    let min: number | null = null;
    if (!priceMap) return null;
    for (const zoneKey of Object.keys(priceMap) as ShippingZone[]) {
      const zoneMap = priceMap[zoneKey];
      if (!zoneMap) continue;
      for (const intervalKey of Object.keys(zoneMap) as SubscriptionInterval[]) {
        const priceId = zoneMap[intervalKey];
        if (!priceId) continue;
        const amount = stripePrices[priceId];
        if (amount !== undefined && (min === null || amount < min)) {
          min = amount;
        }
      }
    }
    return min;
  })();

  // Prezzo selezionato
  const selectedPrice = selectedZone && selectedInterval ? getPrice(selectedZone, selectedInterval) : null;

  // Filtra solo zone con almeno un Price ID configurato
  const availableZones = SHIPPING_ZONES.filter(zone => {
    const zoneMap = priceMap?.[zone.value];
    return zoneMap && Object.values(zoneMap).some(id => id && id.trim());
  });

  // Filtra solo intervalli disponibili per la zona selezionata
  const availableIntervals = SUBSCRIPTION_INTERVALS.filter(interval => {
    if (!selectedZone) return false;
    const priceId = priceMap?.[selectedZone]?.[interval.value];
    return priceId && priceId.trim();
  });

  const handleSubmit = async () => {
    if (!selectedZone || !selectedInterval) return;
    clearError();
    try {
      await startSubscription(product.id, selectedZone, selectedInterval);
    } catch {
      // errore gestito dal hook
    }
  };

  const sub = t.subscription;

  const formatPrice = (amount: number) => `€${amount.toFixed(2).replace('.00', '')}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Prezzo in evidenza */}
      {!pricesLoading && minPrice !== null && (
        <div className="bg-white border border-olive/10 p-4 sm:p-5 text-center animate-fadeIn">
          {selectedPrice !== null ? (
            <>
              <p className="text-xs sm:text-sm text-nocciola mb-1">{sub?.selectedPrice || 'Prezzo selezionato'}</p>
              <p className="text-3xl sm:text-4xl font-bold text-olive">{formatPrice(selectedPrice)}</p>
              <p className="text-sm text-nocciola mt-1">/{label(SUBSCRIPTION_INTERVALS.find(i => i.value === selectedInterval!)!)}</p>
            </>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-nocciola mb-1">{sub?.startingFrom || 'A partire da'}</p>
              <p className="text-3xl sm:text-4xl font-bold text-olive">{formatPrice(minPrice)}</p>
              <p className="text-sm text-nocciola mt-1">/{sub?.perDelivery || 'consegna'}</p>
            </>
          )}
        </div>
      )}

      {/* Step 1 - Zona spedizione */}
      <div className={`border transition-all duration-300 ${
        selectedZone ? 'bg-beige border-olive/20' : 'bg-olive/5 border-olive border-2'
      }`}>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 ${
              selectedZone ? 'bg-olive' : 'bg-olive/20'
            }`}>
              {selectedZone ? (
                <svg className="w-4 h-4 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-olive text-xs sm:text-sm font-bold">1</span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-serif text-olive uppercase">
              {sub?.zoneTitle || 'Zona di spedizione'}
            </h3>
            {selectedZone && (
              <span className="ml-auto text-sm text-nocciola">
                {label(SHIPPING_ZONES.find(z => z.value === selectedZone)!)}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-nocciola mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-olive flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {sub?.shippingIncluded || 'Spedizione inclusa nel prezzo'}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {availableZones.map(zone => (
              <button
                key={zone.value}
                type="button"
                onClick={() => {
                  setSelectedZone(zone.value);
                  setSelectedInterval(null);
                }}
                className={`p-3 sm:p-4 border transition-all duration-300 cursor-pointer text-left ${
                  selectedZone === zone.value
                    ? 'border-olive bg-olive/5 border-2'
                    : 'border-olive/20 hover:border-olive/40 bg-white'
                }`}
              >
                <span className="font-medium text-olive text-sm sm:text-base">{label(zone)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2 - Intervallo */}
      <div className={`border transition-all duration-300 ${
        !selectedZone
          ? 'bg-white border-olive/10 opacity-50'
          : selectedInterval
            ? 'bg-beige border-olive/20'
            : 'bg-olive/5 border-olive border-2'
      }`}>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 ${
              selectedInterval ? 'bg-olive' : selectedZone ? 'bg-olive/20' : 'bg-olive/10'
            }`}>
              {selectedInterval ? (
                <svg className="w-4 h-4 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className={`text-xs sm:text-sm font-bold ${selectedZone ? 'text-olive' : 'text-olive/40'}`}>2</span>
              )}
            </div>
            <h3 className={`text-base sm:text-lg font-serif uppercase ${selectedZone ? 'text-olive' : 'text-olive/40'}`}>
              {sub?.intervalTitle || 'Frequenza di consegna'}
            </h3>
            {selectedInterval && (
              <span className="ml-auto text-sm text-nocciola">
                {label(SUBSCRIPTION_INTERVALS.find(i => i.value === selectedInterval)!)}
              </span>
            )}
          </div>

          {selectedZone && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 animate-fadeIn">
              {availableIntervals.map(interval => {
                const price = getPrice(selectedZone, interval.value);
                return (
                  <button
                    key={interval.value}
                    type="button"
                    onClick={() => setSelectedInterval(interval.value)}
                    className={`p-3 sm:p-4 border transition-all duration-300 cursor-pointer text-left ${
                      selectedInterval === interval.value
                        ? 'border-olive bg-olive/5 border-2'
                        : 'border-olive/20 hover:border-olive/40 bg-white'
                    }`}
                  >
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${selectedInterval === interval.value ? 'text-olive' : 'text-nocciola'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-olive text-sm sm:text-base block">{label(interval)}</span>
                    {price !== null && (
                      <span className="text-xs text-nocciola mt-1 block">{formatPrice(price)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Errore */}
      {error && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 text-sm animate-fadeIn">
          {error}
        </div>
      )}

      {/* Bottone Abbonati */}
      <button
        onClick={handleSubmit}
        disabled={!selectedZone || !selectedInterval || loading}
        className="w-full py-3 sm:py-4 bg-olive text-beige font-medium text-base sm:text-lg hover:bg-salvia transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-olive/20 uppercase tracking-wider flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-beige" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {sub?.processing || 'Elaborazione...'}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {selectedPrice !== null
              ? `${sub?.subscribeButton || 'Abbonati Ora'} - ${formatPrice(selectedPrice)}`
              : (sub?.subscribeButton || 'Abbonati Ora')
            }
          </>
        )}
      </button>

      {/* Info spedizione inclusa */}
      <div className="bg-white border-l-4 border-olive p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-olive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="text-xs sm:text-sm text-nocciola">
            {sub?.shippingNote || 'La spedizione è inclusa nel prezzo dell\'abbonamento. Riceverai il prodotto direttamente a casa tua con la frequenza selezionata.'}
          </p>
        </div>
      </div>
    </div>
  );
}
