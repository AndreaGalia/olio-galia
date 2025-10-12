import React, { useState } from 'react';
import type { DailySales } from '@/types/admin';

interface SalesChartProps {
  data: DailySales[];
  loading?: boolean;
}

export default function SalesChart({ data, loading = false }: SalesChartProps) {
  const [viewMode, setViewMode] = useState<'orders' | 'revenue'>('revenue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
        <h2 className="text-xl font-serif text-olive mb-4">📈 Vendite Ultimi 7 Giorni</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
        <h2 className="text-xl font-serif text-olive mb-4">📈 Vendite Ultimi 7 Giorni</h2>
        <p className="text-nocciola text-sm text-center py-8">
          Nessun dato disponibile.
        </p>
      </div>
    );
  }

  const values = data.map((d) => (viewMode === 'orders' ? d.orders : d.revenue));
  const maxValue = Math.max(...values, 1);
  const chartHeight = 200;
  const chartWidth = 100; // percentuale
  const barWidth = chartWidth / data.length - 2;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-olive">📈 Vendite Ultimi 7 Giorni</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('revenue')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'revenue'
                ? 'bg-olive text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Fatturato
          </button>
          <button
            onClick={() => setViewMode('orders')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'orders'
                ? 'bg-olive text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ordini
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative" style={{ height: chartHeight + 40 }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 w-12 flex flex-col justify-between text-xs text-gray-500 text-right pr-2">
          <span>{viewMode === 'orders' ? maxValue : formatCurrency(maxValue)}</span>
          <span>
            {viewMode === 'orders'
              ? Math.round(maxValue / 2)
              : formatCurrency(maxValue / 2)}
          </span>
          <span>0</span>
        </div>

        {/* Chart bars */}
        <div className="absolute left-14 right-0 top-0 bottom-10 flex items-end justify-around gap-2">
          {data.map((item, index) => {
            const value = viewMode === 'orders' ? item.orders : item.revenue;
            const height = (value / maxValue) * chartHeight;
            const isToday = index === data.length - 1;

            return (
              <div key={item.date} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full flex items-end justify-center">
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isToday
                        ? 'bg-gradient-to-t from-salvia to-olive'
                        : 'bg-gradient-to-t from-olive/60 to-olive/40 group-hover:from-olive group-hover:to-salvia'
                    }`}
                    style={{ height: `${height}px` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity z-10">
                      {viewMode === 'orders'
                        ? `${value} ordini`
                        : formatCurrency(value)}
                      <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>

                {/* X-axis label */}
                <span className="text-xs text-gray-500 mt-2 whitespace-nowrap">
                  {formatDate(item.date)}
                  {isToday && (
                    <span className="ml-1 text-olive font-semibold">•</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* X-axis line */}
        <div className="absolute left-14 right-0 bottom-8 h-px bg-gray-200"></div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-olive/10 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Totale Periodo</p>
          <p className="text-lg font-semibold text-olive">
            {viewMode === 'orders'
              ? `${data.reduce((sum, d) => sum + d.orders, 0)} ordini`
              : formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Media Giornaliera</p>
          <p className="text-lg font-semibold text-salvia">
            {viewMode === 'orders'
              ? `${Math.round(data.reduce((sum, d) => sum + d.orders, 0) / data.length)} ordini`
              : formatCurrency(
                  data.reduce((sum, d) => sum + d.revenue, 0) / data.length
                )}
          </p>
        </div>
      </div>
    </div>
  );
}
