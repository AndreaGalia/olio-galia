'use client';

import { useState } from 'react';
import type { ProductCost } from '@/types/scenario';
import { calculateProductTotalCost } from '@/lib/scenario/calculations';

interface ProductCostInputProps {
  productCosts: ProductCost[];
  onChange: (costs: ProductCost[]) => void;
  currency?: string;
  showToast?: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function ProductCostInput({
  productCosts,
  onChange,
  currency = '€',
  showToast,
}: ProductCostInputProps) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    unitCost: 0,
    quantity: 1,
  });
  const [errors, setErrors] = useState<{ name?: string; unitCost?: string; quantity?: string }>({});

  const handleAdd = () => {
    const newErrors: { name?: string; unitCost?: string; quantity?: string } = {};

    if (!newProduct.name || newProduct.name.trim() === '') {
      newErrors.name = 'Inserisci il nome del prodotto';
    }

    if (newProduct.unitCost <= 0) {
      newErrors.unitCost = 'Inserisci un costo unitario valido';
    }

    if (newProduct.quantity <= 0) {
      newErrors.quantity = 'Inserisci una quantità valida';
    }

    // Verifica se prodotto già aggiunto (stesso nome)
    if (newProduct.name && productCosts.some((pc) => pc.productName.toLowerCase() === newProduct.name.trim().toLowerCase())) {
      newErrors.name = 'Prodotto già aggiunto. Modifica quello esistente o usa un nome diverso.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (showToast) {
        const firstError = newErrors.name || newErrors.unitCost || newErrors.quantity;
        showToast(firstError!, 'error');
      }
      return;
    }

    setErrors({});

    const unitCostInCents = Math.round(newProduct.unitCost * 100);
    const totalCost = calculateProductTotalCost(unitCostInCents, newProduct.quantity);

    const newProductCost: ProductCost = {
      id: `product-${Date.now()}`,
      productName: newProduct.name.trim(),
      unitCost: unitCostInCents,
      quantity: newProduct.quantity,
      totalCost,
    };

    onChange([...productCosts, newProductCost]);

    // Reset form
    setNewProduct({ name: '', unitCost: 0, quantity: 1 });
  };

  const handleRemove = (id: string) => {
    onChange(productCosts.filter((pc) => pc.id !== id));
  };

  const handleUpdate = (
    id: string,
    field: 'productName' | 'unitCost' | 'quantity',
    value: any
  ) => {
    onChange(
      productCosts.map((pc) => {
        if (pc.id !== id) return pc;

        const updatedName = field === 'productName' ? value.trim() : pc.productName;
        const updatedUnitCost =
          field === 'unitCost' ? Math.round(value * 100) : pc.unitCost;
        const updatedQuantity = field === 'quantity' ? value : pc.quantity;

        return {
          ...pc,
          productName: updatedName,
          unitCost: updatedUnitCost,
          quantity: updatedQuantity,
          totalCost: calculateProductTotalCost(
            updatedUnitCost,
            updatedQuantity
          ),
        };
      })
    );
  };

  const formatAmount = (amountInCents: number) => {
    return (amountInCents / 100).toFixed(2);
  };

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
              Costi dei prodotti
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Inserisci i prodotti che vendi, il loro costo unitario e la quantità disponibile. Questi dati saranno usati per calcolare i ricavi.
            </p>
          </div>
        </div>
      </div>

      {/* Lista costi prodotti esistenti */}
      {productCosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-olive">
              PRODOTTI AGGIUNTI ({productCosts.length})
            </h4>
            <span className="text-xs text-nocciola">
              Clicca per modificare
            </span>
          </div>

          {productCosts.map((pc) => (
            <div
              key={pc.id}
              className="bg-white border border-olive/20 rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <input
                  type="text"
                  value={pc.productName}
                  onChange={(e) =>
                    handleUpdate(pc.id, 'productName', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive font-medium text-olive flex-1 mr-3"
                  placeholder="Nome prodotto"
                />
                <button
                  onClick={() => handleRemove(pc.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium whitespace-nowrap"
                  title="Rimuovi prodotto"
                >
                  🗑️ Rimuovi
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Costo Unitario ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formatAmount(pc.unitCost)}
                    onChange={(e) =>
                      handleUpdate(
                        pc.id,
                        'unitCost',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantità
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pc.quantity}
                    onChange={(e) =>
                      handleUpdate(
                        pc.id,
                        'quantity',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Totale
                  </label>
                  <div className="w-full px-3 py-2 bg-beige/30 border border-olive/20 rounded-lg flex items-center">
                    <span className="font-semibold text-olive text-sm">
                      {currency} {formatAmount(pc.totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form aggiunta nuovo prodotto */}
      <div className="bg-gradient-to-br from-salvia/5 to-beige/30 border-2 border-dashed border-salvia/40 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-olive mb-4 flex items-center gap-2">
          <span className="text-lg">➕</span>
          AGGIUNGI NUOVO PRODOTTO
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="sm:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Prodotto *
            </label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => {
                setNewProduct({ ...newProduct, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                  : 'border-olive/30 focus:ring-olive/20 focus:border-olive'
              }`}
              placeholder="es. Olio EVO 5L, Olio EVO 1L..."
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">❌ {errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo Unitario ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newProduct.unitCost || ''}
              onChange={(e) => {
                setNewProduct({
                  ...newProduct,
                  unitCost: parseFloat(e.target.value),
                });
                if (errors.unitCost) setErrors({ ...errors, unitCost: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                errors.unitCost
                  ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                  : 'border-olive/30 focus:ring-olive/20 focus:border-olive'
              }`}
              placeholder="0.00"
            />
            {errors.unitCost && (
              <p className="text-xs text-red-600 mt-1">❌ {errors.unitCost}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantità *
            </label>
            <input
              type="number"
              min="1"
              value={newProduct.quantity || ''}
              onChange={(e) => {
                setNewProduct({
                  ...newProduct,
                  quantity: parseInt(e.target.value),
                });
                if (errors.quantity) setErrors({ ...errors, quantity: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                errors.quantity
                  ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                  : 'border-olive/30 focus:ring-olive/20 focus:border-olive'
              }`}
              placeholder="1"
            />
            {errors.quantity && (
              <p className="text-xs text-red-600 mt-1">❌ {errors.quantity}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-olive text-white rounded-lg hover:bg-salvia transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          ✓ Aggiungi Prodotto
        </button>
      </div>

      {/* Totale */}
      {productCosts.length > 0 && (
        <div className="bg-gradient-to-r from-beige to-sabbia/50 rounded-xl p-6 shadow-sm border border-olive/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-600 mb-1 uppercase tracking-wide">Totale Costi Prodotti</p>
              <p className="text-3xl font-bold text-olive">
                {currency} {formatAmount(productCosts.reduce((sum, pc) => sum + pc.totalCost, 0))}
              </p>
            </div>
            <div className="text-center sm:text-right text-sm text-nocciola">
              <p>{productCosts.length} {productCosts.length === 1 ? 'prodotto' : 'prodotti'} inserito/i</p>
              <p className="text-xs mt-1">
                {productCosts.reduce((sum, pc) => sum + pc.quantity, 0)} unità totali
              </p>
            </div>
          </div>
        </div>
      )}

      {productCosts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm text-gray-500">Nessun prodotto aggiunto</p>
          <p className="text-xs text-gray-400 mt-1">Inizia aggiungendo il primo prodotto!</p>
        </div>
      )}
    </div>
  );
}
