'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface CartStats {
  totalEvents: number;
  last7DaysCount: number;
  last30DaysCount: number;
}

interface TopProduct {
  productId: string;
  productName: string;
  totalAdds: number;
  totalQuantity: number;
}

interface CartEvent {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  price: number;
  quantity: number;
  timestamp: string;
}

export default function CartAnalyticsPage() {
  const [stats, setStats] = useState<CartStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentEvents, setRecentEvents] = useState<CartEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cart-analytics');
      if (!res.ok) throw new Error('Errore fetch');
      const data = await res.json();
      setStats(data.stats);
      setTopProducts(data.topProducts);
      setRecentEvents(data.recentEvents);
    } catch (err) {
      console.error('Errore caricamento cart analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maxAdds = topProducts.length > 0 ? topProducts[0].totalAdds : 1;

  return (
    <AdminLayout
      title="Analisi Carrello"
      subtitle="Prodotti aggiunti al carrello dagli utenti"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Aggiunte Totali', value: stats?.totalEvents ?? '—' },
          { label: 'Ultimi 7 giorni', value: stats?.last7DaysCount ?? '—' },
          { label: 'Ultimi 30 giorni', value: stats?.last30DaysCount ?? '—' },
        ].map(card => (
          <div
            key={card.label}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10"
          >
            <p className="text-sm text-nocciola mb-1">{card.label}</p>
            {loading ? (
              <div className="h-8 w-16 bg-olive/10 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-serif text-olive">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Top Prodotti + Recenti side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Prodotti */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
          <h2 className="text-xl font-serif text-olive mb-5">Top Prodotti nel Carrello</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive" />
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-nocciola text-sm text-center py-8">Nessun dato ancora.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => {
                const percentage = (product.totalAdds / maxAdds) * 100;
                return (
                  <div key={product.productId} className="group">
                    <div className="flex items-center gap-3 mb-2">
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {product.productName}
                        </p>
                        <p className="text-xs text-nocciola">
                          {product.totalAdds} aggiunte · {product.totalQuantity} unità totali
                        </p>
                      </div>
                    </div>
                    <div className="ml-9 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-olive to-salvia transition-all duration-500 group-hover:from-salvia group-hover:to-olive"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Eventi Recenti */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-serif text-olive">Ultimi Eventi</h2>
            <button
              onClick={fetchData}
              disabled={loading}
              className="text-xs text-salvia hover:text-olive transition-colors disabled:opacity-50 cursor-pointer"
            >
              Aggiorna
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive" />
            </div>
          ) : recentEvents.length === 0 ? (
            <p className="text-nocciola text-sm text-center py-8">Nessun evento ancora.</p>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {recentEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-3 py-2 border-b border-olive/5 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.productName}
                      {event.variantId && (
                        <span className="ml-1 text-xs text-nocciola">({event.variantId})</span>
                      )}
                    </p>
                    <p className="text-xs text-nocciola">{formatDate(event.timestamp)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-olive">
                      x{event.quantity}
                    </p>
                    <p className="text-xs text-nocciola">
                      €{(event.price * event.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
