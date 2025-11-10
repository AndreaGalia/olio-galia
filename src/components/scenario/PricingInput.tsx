'use client';

import type { ProductPricing, ProductCost, SalesEstimate } from '@/types/scenario';

interface PricingInputProps {
  productPricing: ProductPricing[];
  productCosts: ProductCost[];
  salesEstimates: SalesEstimate[];
  onChange: (pricing: ProductPricing[]) => void;
  currency?: string;
}

export default function PricingInput({
  productPricing,
  productCosts,
  salesEstimates,
  onChange,
  currency = '€',
}: PricingInputProps) {
  const handleUpdate = (productId: string, price: number) => {
    const existing = productPricing.find((pp) => pp.productId === productId);
    const product = productCosts.find((pc) => pc.id === productId);

    if (!product) return;

    const priceInCents = Math.round(price * 100);

    if (existing) {
      // Aggiorna esistente
      onChange(
        productPricing.map((pp) =>
          pp.productId === productId
            ? { ...pp, sellingPrice: priceInCents }
            : pp
        )
      );
    } else {
      // Aggiungi nuovo
      const newPricing: ProductPricing = {
        productId,
        productName: product.productName,
        sellingPrice: priceInCents,
      };
      onChange([...productPricing, newPricing]);
    }
  };

  const getPrice = (productId: string): number => {
    const pricing = productPricing.find((pp) => pp.productId === productId);
    return pricing ? pricing.sellingPrice / 100 : 0;
  };

  const formatAmount = (amountInCents: number) => {
    return (amountInCents / 100).toFixed(2);
  };

  const calculateMetrics = (productId: string) => {
    const cost = productCosts.find((pc) => pc.id === productId);
    const pricing = productPricing.find((pp) => pp.productId === productId);
    const estimate = salesEstimates.find((se) => se.productId === productId);

    if (!cost || !pricing || !estimate) {
      return {
        unitProfit: 0,
        totalRevenue: 0,
        totalProfit: 0,
        margin: 0,
      };
    }

    const unitProfit = pricing.sellingPrice - cost.unitCost;
    const totalRevenue = pricing.sellingPrice * estimate.estimatedQuantity;
    const totalCost = cost.unitCost * estimate.estimatedQuantity;
    const totalProfit = totalRevenue - totalCost;
    const margin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      unitProfit,
      totalRevenue,
      totalProfit,
      margin: parseFloat(margin.toFixed(2)),
    };
  };

  if (productCosts.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm text-gray-500">
          Aggiungi prima i costi dei prodotti per poter inserire i prezzi di
          vendita.
        </p>
      </div>
    );
  }

  const totalRevenue = productCosts.reduce((sum, pc) => {
    const metrics = calculateMetrics(pc.id);
    return sum + metrics.totalRevenue;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Messaggio informativo */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-blue-700 font-medium">
              Prezzi di vendita
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Imposta i prezzi di vendita per ogni prodotto. Vedrai in tempo reale il margine di profitto e il ricavo stimato.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {productCosts.map((pc) => {
          const price = getPrice(pc.id);
          const metrics = calculateMetrics(pc.id);
          const estimate = salesEstimates.find(
            (se) => se.productId === pc.id
          );

          return (
            <div key={pc.id} className="bg-white border border-olive/20 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-semibold text-olive">
                    {pc.productName}
                  </h5>
                  <p className="text-xs text-gray-600 mt-1">
                    Costo unitario: <span className="font-medium text-nocciola">{currency} {formatAmount(pc.unitCost)}</span>
                  </p>
                  {estimate && (
                    <p className="text-xs text-gray-600">
                      Quantità stimata: <span className="font-medium text-nocciola">{estimate.estimatedQuantity} unità</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Prezzo di Vendita ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price || ''}
                  onChange={(e) =>
                    handleUpdate(pc.id, parseFloat(e.target.value) || 0)
                  }
                  onFocus={(e) => {
                    if (e.target.value === '0' || e.target.value === '0.00') {
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="Inserisci prezzo..."
                />
              </div>

              {/* Metriche */}
              {price > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-olive/10">
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Guadagno/Unità</p>
                    <p
                      className={`font-semibold text-sm ${
                        metrics.unitProfit > 0
                          ? 'text-green-600'
                          : metrics.unitProfit < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {currency} {formatAmount(metrics.unitProfit)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Margine</p>
                    <p
                      className={`font-semibold text-sm ${
                        metrics.margin > 0
                          ? 'text-green-600'
                          : metrics.margin < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {metrics.margin}%
                    </p>
                  </div>
                  {estimate && (
                    <>
                      <div className="bg-gradient-to-br from-beige to-sabbia/30 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">
                          Ricavo Totale Stimato
                        </p>
                        <p className="font-semibold text-sm text-olive">
                          {currency} {formatAmount(metrics.totalRevenue)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-salvia/20 to-salvia/10 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">
                          Profitto Totale Stimato
                        </p>
                        <p
                          className={`font-semibold text-sm ${
                            metrics.totalProfit > 0
                              ? 'text-green-600'
                              : metrics.totalProfit < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {currency} {formatAmount(metrics.totalProfit)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Warning per prezzi troppo bassi */}
              {price > 0 && metrics.unitProfit <= 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg mt-3">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Il prezzo di vendita è uguale o inferiore al costo
                    unitario. Non genererai profitto!
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Riepilogo */}
      {productPricing.length > 0 && (
        <div className="bg-gradient-to-r from-beige to-sabbia/50 rounded-xl p-6 shadow-sm border border-olive/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="font-medium text-olive uppercase tracking-wide text-sm">
              Ricavo Totale Stimato:
            </span>
            <span className="text-3xl font-bold text-olive">
              {currency} {formatAmount(totalRevenue)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
