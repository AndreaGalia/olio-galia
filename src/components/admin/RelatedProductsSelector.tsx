'use client';

import { useState } from 'react';

export interface SelectableProduct {
  id: string;
  name: string;
  image?: string;
}

interface RelatedProductsSelectorProps {
  allProducts: SelectableProduct[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function RelatedProductsSelector({
  allProducts,
  selectedIds,
  onChange,
}: RelatedProductsSelectorProps) {
  const [search, setSearch] = useState('');

  const selectedProducts = selectedIds
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is SelectableProduct => Boolean(p));

  const availableProducts = allProducts.filter(
    p =>
      !selectedIds.includes(p.id) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const add = (id: string) => onChange([...selectedIds, id]);

  const remove = (id: string) => onChange(selectedIds.filter(sid => sid !== id));

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newIds = [...selectedIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    onChange(newIds);
  };

  const moveDown = (index: number) => {
    if (index === selectedIds.length - 1) return;
    const newIds = [...selectedIds];
    [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    onChange(newIds);
  };

  return (
    <div className="space-y-4">
      {/* Lista prodotti selezionati in ordine */}
      {selectedProducts.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selezionati ({selectedProducts.length}) — in ordine di visualizzazione
          </p>
          <div className="space-y-2">
            {selectedProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2 bg-olive/5 border border-olive/20 rounded-lg"
              >
                <span className="text-xs text-gray-400 w-5 text-center font-mono flex-shrink-0">
                  {index + 1}
                </span>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-olive/10 rounded flex-shrink-0" />
                )}
                <span className="flex-1 text-sm text-gray-800 truncate">{product.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="px-2 py-1 text-gray-500 hover:text-olive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Sposta su"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === selectedProducts.length - 1}
                    className="px-2 py-1 text-gray-500 hover:text-olive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Sposta giù"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="px-2 py-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Rimuovi"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ricerca e aggiunta prodotti */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Aggiungi prodotti correlati</p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per nome..."
          className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive mb-2 text-sm"
        />
        <div className="max-h-52 overflow-y-auto border border-olive/10 rounded-lg divide-y divide-olive/5">
          {availableProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              {allProducts.length === 0
                ? 'Caricamento prodotti...'
                : search
                ? 'Nessun prodotto trovato'
                : 'Tutti i prodotti sono già selezionati'}
            </p>
          ) : (
            availableProducts.map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => add(product.id)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-olive/5 text-left transition-colors"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-8 h-8 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 bg-olive/10 rounded flex-shrink-0" />
                )}
                <span className="flex-1 text-sm text-gray-700 truncate">{product.name}</span>
                <span className="text-olive text-xs flex-shrink-0">+ Aggiungi</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
