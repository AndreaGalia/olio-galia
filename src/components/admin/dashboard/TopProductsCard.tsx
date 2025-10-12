import React from 'react';
import type { TopProduct } from '@/types/admin';

interface TopProductsCardProps {
  products: TopProduct[];
  loading?: boolean;
}

export default function TopProductsCard({ products, loading = false }: TopProductsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
        <h2 className="text-xl font-serif text-olive mb-4">🏆 Top Prodotti</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive"></div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
        <h2 className="text-xl font-serif text-olive mb-4">🏆 Top Prodotti</h2>
        <p className="text-nocciola text-sm text-center py-8">
          Nessun prodotto venduto ancora.
        </p>
      </div>
    );
  }

  const maxQuantity = Math.max(...products.map((p) => p.quantity));

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
      <h2 className="text-xl font-serif text-olive mb-4">🏆 Top 5 Prodotti</h2>
      <div className="space-y-4">
        {products.map((product, index) => {
          const percentage = (product.quantity / maxQuantity) * 100;
          return (
            <div key={product.productId} className="group">
              <div className="flex items-center gap-3 mb-2">
                {/* Posizione */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-yellow-400 text-yellow-900'
                      : index === 1
                      ? 'bg-gray-300 text-gray-800'
                      : index === 2
                      ? 'bg-orange-400 text-orange-900'
                      : 'bg-olive/20 text-olive'
                  }`}
                >
                  {index + 1}
                </div>

                {/* Immagine prodotto */}
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="w-10 h-10 rounded-lg object-cover border border-olive/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-olive/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-olive"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                )}

                {/* Nome e stats */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {product.productName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {product.quantity} venduti
                    </span>
                    <span className="font-semibold text-olive">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra progresso */}
              <div className="ml-9 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-olive to-salvia transition-all duration-500 ease-out group-hover:from-salvia group-hover:to-olive"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
