'use client';

import { useState } from 'react';
import type { CostItem } from '@/types/scenario';

interface CostItemInputProps {
  costs: CostItem[];
  onChange: (costs: CostItem[]) => void;
  currency?: string;
  showToast?: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function CostItemInput({
  costs,
  onChange,
  currency = '€',
  showToast,
}: CostItemInputProps) {
  const [newCost, setNewCost] = useState<Partial<CostItem>>({
    name: '',
    amount: 0,
    description: '',
  });
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  const handleAdd = () => {
    const newErrors: { name?: string; amount?: string } = {};

    if (!newCost.name || newCost.name.trim() === '') {
      newErrors.name = 'Inserisci un nome per il costo';
    }

    if (!newCost.amount || newCost.amount <= 0) {
      newErrors.amount = 'Inserisci un importo valido maggiore di zero';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (showToast) {
        const firstError = newErrors.name || newErrors.amount;
        showToast(firstError!, 'error');
      }
      return;
    }

    setErrors({});

    const cost: CostItem = {
      id: `cost-${Date.now()}`,
      name: newCost.name!.trim(),
      amount: Math.round(newCost.amount! * 100),
      description: newCost.description?.trim() || '',
    };

    onChange([...costs, cost]);
    setNewCost({ name: '', amount: 0, description: '' });
  };

  const handleRemove = (id: string) => {
    onChange(costs.filter((c) => c.id !== id));
  };

  const handleUpdate = (id: string, field: keyof CostItem, value: any) => {
    onChange(
      costs.map((c) =>
        c.id === id
          ? {
              ...c,
              [field]:
                field === 'amount' ? Math.round(value * 100) : value,
            }
          : c
      )
    );
  };

  const formatAmount = (amountInCents: number) => {
    return (amountInCents / 100).toFixed(2);
  };

  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);

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
              Costi generali dell'azienda
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Inserisci tutti i costi operativi come dominio, hosting, pubblicità, packaging (bottiglie, etichette), spedizioni, ecc.
            </p>
          </div>
        </div>
      </div>

      {/* Lista costi esistenti */}
      {costs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-olive">
              COSTI AGGIUNTI ({costs.length})
            </h4>
            <span className="text-xs text-nocciola">
              Clicca per modificare
            </span>
          </div>

          {costs.map((cost) => (
            <div
              key={cost.id}
              className="bg-white border border-olive/20 rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nome Costo
                  </label>
                  <input
                    type="text"
                    value={cost.name}
                    onChange={(e) =>
                      handleUpdate(cost.id, 'name', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive text-sm"
                    placeholder="es. Hosting annuale"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Importo ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formatAmount(cost.amount)}
                    onChange={(e) =>
                      handleUpdate(cost.id, 'amount', parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <input
                    type="text"
                    value={cost.description || ''}
                    onChange={(e) =>
                      handleUpdate(cost.id, 'description', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive text-sm"
                    placeholder="Opzionale"
                  />
                </div>

                <div className="sm:col-span-1 flex items-end">
                  <button
                    onClick={() => handleRemove(cost.id)}
                    className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    title="Rimuovi costo"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form aggiunta nuovo costo */}
      <div className="bg-gradient-to-br from-salvia/5 to-beige/30 border-2 border-dashed border-salvia/40 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-olive mb-4 flex items-center gap-2">
          <span className="text-lg">➕</span>
          AGGIUNGI NUOVO COSTO
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
          <div className="sm:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Costo *
            </label>
            <input
              type="text"
              value={newCost.name || ''}
              onChange={(e) => {
                setNewCost({ ...newCost, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                  : 'border-olive/30 focus:ring-olive/20 focus:border-olive'
              }`}
              placeholder="es. Hosting, Dominio, Pubblicità..."
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">❌ {errors.name}</p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importo ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newCost.amount || ''}
              onChange={(e) => {
                setNewCost({
                  ...newCost,
                  amount: parseFloat(e.target.value),
                });
                if (errors.amount) setErrors({ ...errors, amount: undefined });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                errors.amount
                  ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                  : 'border-olive/30 focus:ring-olive/20 focus:border-olive'
              }`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-xs text-red-600 mt-1">❌ {errors.amount}</p>
            )}
          </div>

          <div className="sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione (opzionale)
            </label>
            <input
              type="text"
              value={newCost.description || ''}
              onChange={(e) =>
                setNewCost({ ...newCost, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
              placeholder="Aggiungi dettagli..."
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-olive text-white rounded-lg hover:bg-salvia transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          ✓ Aggiungi Costo
        </button>
      </div>

      {/* Totale */}
      {costs.length > 0 && (
        <div className="bg-gradient-to-r from-beige to-sabbia/50 rounded-xl p-6 shadow-sm border border-olive/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-600 mb-1 uppercase tracking-wide">Totale Costi Vari</p>
              <p className="text-3xl font-bold text-olive">
                {currency} {formatAmount(totalCosts)}
              </p>
            </div>
            <div className="text-center sm:text-right text-sm text-nocciola">
              <p>{costs.length} {costs.length === 1 ? 'costo' : 'costi'} inserito/i</p>
            </div>
          </div>
        </div>
      )}

      {costs.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-sm text-gray-500">Nessun costo aggiunto</p>
          <p className="text-xs text-gray-400 mt-1">Inizia aggiungendo il primo costo operativo!</p>
        </div>
      )}
    </div>
  );
}
