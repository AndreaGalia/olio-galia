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
  const label = (item: { labelIt: string; labelEn: string }) => locale === 'en' ? item.labelEn : item.labelIt;

  const productAny = product as Product & {
    stripeRecurringPriceIds?: RecurringPriceMap;
    subscriptionPrices?: QuantityPriceMap;
  };

  const hasNewFormat = !!productAny.subscriptionPrices;
  const legacyPriceMap = productAny.stripeRecurringPriceIds;

  // Helper: ottieni il prezzo per una combinazione qty/zona/intervallo
  const getPrice = (qty: SubscriptionQuantity, zone: ShippingZone, interval: SubscriptionInterval): number | null => {
    if (hasNewFormat) {
      const entry = productAny.subscriptionPrices?.[qty]?.[zone]?.[interval];
      if (entry && typeof entry === 'object' && entry.amount) {
        return entry.amount;
      }
      return null;
    }
    // Vecchio formato: nessun amount salvato
    return null;
  };

  // Verifica se una combinazione è disponibile
  const isAvailable = (qty: SubscriptionQuantity, zone: ShippingZone, interval: SubscriptionInterval): boolean => {
    if (hasNewFormat) {
      const entry = productAny.subscriptionPrices?.[qty]?.[zone]?.[interval];
      if (entry && typeof entry === 'object' && entry.priceId) return true;
    }
    // Fallback legacy per qty=1
    if (qty === 1 && legacyPriceMap) {
      const priceId = legacyPriceMap[zone]?.[interval];
      if (priceId && priceId.trim()) return true;
    }
    return false;
  };

  // Qty=1 è disponibile tramite legacy?
  const hasLegacyPrices = !!legacyPriceMap && Object.values(legacyPriceMap).some(zone => {
    if (!zone) return false;
    return Object.values(zone).some(id => id && id.trim());
  });

  // Qty disponibile nel nuovo formato?
  const hasNewFormatQty = (qty: SubscriptionQuantity): boolean => {
    const qtyMap = productAny.subscriptionPrices?.[qty];
    if (!qtyMap) return false;
    return Object.values(qtyMap).some(zones => {
      if (!zones) return false;
      return Object.values(zones).some(entry => entry && typeof entry === 'object' && entry.priceId);
    });
  };

  // Auto-detect quantità disponibili dal dato
  const availableQuantities: number[] = (() => {
    const qtys: number[] = [];
    if (hasNewFormat && productAny.subscriptionPrices) {
      for (const key of Object.keys(productAny.subscriptionPrices)) {
        const n = Number(key);
        if (!isNaN(n) && hasNewFormatQty(n)) qtys.push(n);
      }
    }
    // Fallback legacy: aggiungi qty=1 se ha prezzi legacy e non è già presente
    if (hasLegacyPrices && !qtys.includes(1)) qtys.push(1);
    return qtys.sort((a, b) => a - b);
  })();

  // Zone disponibili per la quantità selezionata
  const availableZones = SHIPPING_ZONES.filter(zone => {
    // Cerca nel nuovo formato
    if (hasNewFormat) {
      const zoneMap = productAny.subscriptionPrices?.[selectedQuantity]?.[zone.value];
      if (zoneMap && Object.values(zoneMap).some(entry => entry && typeof entry === 'object' && entry.priceId)) {
        return true;
      }
    }
    // Fallback legacy per qty=1
    if (selectedQuantity === 1 && legacyPriceMap) {
      const zoneMap = legacyPriceMap[zone.value];
      if (zoneMap && Object.values(zoneMap).some(id => id && id.trim())) return true;
    }
    return false;
  });

  // Intervalli disponibili per la zona selezionata
  const availableIntervals = SUBSCRIPTION_INTERVALS.filter(interval => {
    if (!selectedZone) return false;
    return isAvailable(selectedQuantity, selectedZone, interval.value);
  });

  // Prezzo selezionato
  const selectedPrice = selectedZone && selectedInterval
    ? getPrice(selectedQuantity, selectedZone, selectedInterval)
    : null;

  // Prezzo minimo per la quantità corrente
  const minPrice = (() => {
    let min: number | null = null;
    for (const zone of availableZones) {
      for (const interval of SUBSCRIPTION_INTERVALS) {
        const price = getPrice(selectedQuantity, zone.value, interval.value);
        if (price !== null && (min === null || price < min)) {
          min = price;
        }
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
      // errore gestito dal hook
    }
  };

  const sub = t.subscription;
  const formatPrice = (amount: number) => `\u20AC${amount.toFixed(2).replace('.00', '')}`;

  const showQuantityStep = availableQuantities.length >= 1;

  // Step numbering
  const zoneStepNum = showQuantityStep ? 2 : 1;
  const intervalStepNum = showQuantityStep ? 3 : 2;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Prezzo in evidenza */}
      {minPrice !== null && (
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

      {/* Step Quantità (solo se più di 1 quantità disponibile) */}
      {showQuantityStep && (
        <div className="border border-olive/20 bg-beige transition-all duration-300">
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 bg-olive">
                <svg className="w-4 h-4 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-serif text-olive uppercase">
                {sub?.quantityTitle || 'Quantità'}
              </h3>
            </div>

            <div className="flex gap-0 rounded-lg overflow-hidden border border-olive/30">
              {availableQuantities.map((qty, idx) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => {
                    setSelectedQuantity(qty);
                    setSelectedZone(null);
                    setSelectedInterval(null);
                  }}
                  className={`flex-1 py-3 sm:py-4 transition-all duration-200 cursor-pointer text-center relative ${
                    selectedQuantity === qty
                      ? 'bg-olive text-beige font-bold shadow-inner'
                      : 'bg-white text-olive hover:bg-olive/5 font-medium'
                  } ${idx > 0 ? 'border-l border-olive/30' : ''}`}
                >
                  <span className="text-lg sm:text-xl block leading-none">{qty}</span>
                  <span className={`text-xs mt-0.5 block ${
                    selectedQuantity === qty ? 'text-beige/80' : 'text-nocciola'
                  }`}>
                    {qty === 1 ? (sub?.qty1 || '1 pz') : `${qty} ${locale === 'en' ? 'pcs' : 'pz'}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step Zona spedizione */}
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
                <span className="text-olive text-xs sm:text-sm font-bold">{zoneStepNum}</span>
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

      {/* Step Intervallo */}
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
                <span className={`text-xs sm:text-sm font-bold ${selectedZone ? 'text-olive' : 'text-olive/40'}`}>{intervalStepNum}</span>
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
                const price = getPrice(selectedQuantity, selectedZone, interval.value);
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
