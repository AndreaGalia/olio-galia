'use client';

import type { SalesEstimate, ProductCost } from '@/types/scenario';

interface SalesEstimateInputProps {
  salesEstimates: SalesEstimate[];
  productCosts: ProductCost[];
  onChange: (estimates: SalesEstimate[]) => void;
}

export default function SalesEstimateInput({
  salesEstimates,
  productCosts,
  onChange,
}: SalesEstimateInputProps) {
  const handleUpdate = (productId: string, quantity: number) => {
    const existing = salesEstimates.find((se) => se.productId === productId);
    const product = productCosts.find((pc) => pc.id === productId);

    if (!product) return;

    if (existing) {
      // Aggiorna esistente
      onChange(
        salesEstimates.map((se) =>
          se.productId === productId
            ? { ...se, estimatedQuantity: quantity }
            : se
        )
      );
    } else {
      // Aggiungi nuovo
      const newEstimate: SalesEstimate = {
        productId,
        productName: product.productName,
        estimatedQuantity: quantity,
      };
      onChange([...salesEstimates, newEstimate]);
    }
  };

  const getEstimateQuantity = (productId: string): number => {
    const estimate = salesEstimates.find((se) => se.productId === productId);
    return estimate?.estimatedQuantity || 0;
  };

  if (productCosts.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm text-gray-500">
          Aggiungi prima i costi dei prodotti per poter inserire le stime di
          vendita.
        </p>
      </div>
    );
  }

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
              Stime di vendita
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Inserisci per ogni prodotto quante unità stimi di vendere. Puoi basarti sui dati storici o su previsioni di mercato.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {productCosts.map((pc) => {
          const estimatedQty = getEstimateQuantity(pc.id);
          const availableQty = pc.quantity;
          const percentageSold = availableQty > 0
            ? ((estimatedQty / availableQty) * 100).toFixed(1)
            : '0';

          return (
            <div key={pc.id} className="bg-white border border-olive/20 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-semibold text-olive">
                    {pc.productName}
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Disponibilità: <span className="font-medium text-nocciola">{availableQty} unità</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Quantità Stimata Vendita
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="0"
                    max={availableQty}
                    value={estimatedQty || ''}
                    onChange={(e) =>
                      handleUpdate(pc.id, parseInt(e.target.value) || 0)
                    }
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive flex-1"
                    placeholder="Inserisci quantità..."
                  />
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    / {availableQty} unità
                  </span>
                </div>
              </div>

              {/* Barra progresso */}
              {estimatedQty > 0 && (
                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Percentuale vendita stimata</span>
                    <span className="font-semibold">{percentageSold}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        parseFloat(percentageSold) > 100
                          ? 'bg-red-500'
                          : parseFloat(percentageSold) >= 80
                          ? 'bg-green-500'
                          : parseFloat(percentageSold) >= 50
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min(100, parseFloat(percentageSold))}%`,
                      }}
                    />
                  </div>
                  {parseFloat(percentageSold) > 100 && (
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ Attenzione: la stima supera la disponibilità
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Riepilogo */}
      <div className="bg-gradient-to-r from-beige to-sabbia/50 rounded-xl p-6 shadow-sm border border-olive/10">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="font-medium text-olive uppercase tracking-wide text-sm">
              Totale Unità da Vendere:
            </span>
            <span className="text-3xl font-bold text-olive">
              {salesEstimates.reduce((sum, se) => sum + se.estimatedQuantity, 0)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t border-olive/10">
            <span>Totale Unità Disponibili:</span>
            <span className="font-semibold text-nocciola">
              {productCosts.reduce((sum, pc) => sum + pc.quantity, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
