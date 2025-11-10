'use client';

import type { ScenarioCalculations } from '@/types/scenario';
import { formatCurrency, formatPercentage } from '@/lib/scenario/calculations';

interface RevenueCardProps {
  calculations: ScenarioCalculations;
  scenarioName?: string;
}

export default function RevenueCard({
  calculations,
  scenarioName,
}: RevenueCardProps) {
  const isProfitable = calculations.expectedProfit > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      {scenarioName && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-olive">
            Analisi Finanziaria
          </h3>
          <p className="text-gray-600 mt-1">{scenarioName}</p>
        </div>
      )}

      {/* Main Result Card */}
      <div
        className={`rounded-xl p-6 text-center shadow-lg ${
          isProfitable
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
            : 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300'
        }`}
      >
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide font-medium text-gray-600">
            Guadagno Stimato
          </p>
          <p
            className={`text-4xl md:text-5xl font-bold ${
              isProfitable ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(calculations.expectedProfit)}
          </p>
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Margine:</span>
              <span
                className={`font-bold ${
                  calculations.profitMargin > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatPercentage(calculations.profitMargin)}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">ROI:</span>
              <span
                className={`font-bold ${
                  calculations.roi > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatPercentage(calculations.roi)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Costi */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-red-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-xl">💸</span>
            </div>
            <h4 className="font-bold text-gray-800">Costi Totali</h4>
          </div>
          <p className="text-3xl font-bold text-red-600 mb-3">
            {formatCurrency(calculations.totalCosts)}
          </p>
          <div className="space-y-2 text-sm bg-red-50/50 rounded-lg p-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Costi Vari:</span>
              <span className="font-medium">
                {formatCurrency(calculations.totalVariousCosts)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Costi Prodotti:</span>
              <span className="font-medium">
                {formatCurrency(calculations.totalProductCosts)}
              </span>
            </div>
          </div>
        </div>

        {/* Ricavi */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <h4 className="font-bold text-gray-800">Fatturato Previsto</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-3">
            {formatCurrency(calculations.expectedRevenue)}
          </p>
          <div className="space-y-2 text-sm bg-blue-50/50 rounded-lg p-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Margine Lordo:</span>
              <span className="font-medium">
                {formatPercentage(calculations.profitMargin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ritorno Investimento:</span>
              <span className="font-medium">
                {formatPercentage(calculations.roi)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-beige to-sabbia/30 rounded-xl p-5 shadow-sm border border-olive/20">
        <h4 className="font-bold text-olive mb-3 flex items-center gap-2">
          <span>💡</span>
          <span>Analisi Scenario</span>
        </h4>
        <div className="space-y-2 text-sm">
          {isProfitable ? (
            <>
              <p className="text-green-700 bg-green-50 p-3 rounded-lg">
                ✅ <strong>Scenario Profittevole:</strong> Questo scenario
                genera un profitto positivo di{' '}
                {formatCurrency(calculations.expectedProfit)}.
              </p>
              {calculations.profitMargin >= 30 && (
                <p className="text-green-700 bg-green-50 p-3 rounded-lg">
                  ✅ <strong>Margine Eccellente:</strong> Il margine di profitto
                  del {formatPercentage(calculations.profitMargin)} è molto
                  buono.
                </p>
              )}
              {calculations.roi >= 50 && (
                <p className="text-green-700 bg-green-50 p-3 rounded-lg">
                  ✅ <strong>ROI Alto:</strong> Il ritorno sull'investimento del{' '}
                  {formatPercentage(calculations.roi)} è ottimo.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-red-700 bg-red-50 p-3 rounded-lg">
                ⚠️ <strong>Scenario in Perdita:</strong> Questo scenario genera
                una perdita di {formatCurrency(Math.abs(calculations.expectedProfit))}.
              </p>
              <p className="text-amber-700 bg-amber-50 p-3 rounded-lg">
                💡 <strong>Suggerimento:</strong> Considera di aumentare i
                prezzi di vendita o ridurre i costi per rendere lo scenario
                profittevole.
              </p>
            </>
          )}

          {calculations.expectedRevenue === 0 && (
            <p className="text-amber-700 bg-amber-50 p-3 rounded-lg">
              ⚠️ <strong>Nessuna Vendita:</strong> Non hai impostato stime di
              vendita o prezzi.
            </p>
          )}

          {calculations.profitMargin > 0 &&
            calculations.profitMargin < 15 && (
              <p className="text-amber-700 bg-amber-50 p-3 rounded-lg">
                ⚠️ <strong>Margine Basso:</strong> Il margine di profitto è
                inferiore al 15%. Potrebbe essere rischioso.
              </p>
            )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-olive/20">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Rapporto Costi / Ricavi
          </span>
          <span className="text-sm font-semibold text-olive">
            {calculations.totalCosts > 0
              ? `${((calculations.expectedRevenue / calculations.totalCosts) * 100).toFixed(0)}%`
              : '0%'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
          <div className="flex h-full">
            {/* Costs bar */}
            <div
              className="bg-red-500 h-full transition-all duration-500"
              style={{
                width:
                  calculations.totalCosts > 0 &&
                  calculations.expectedRevenue > 0
                    ? `${Math.min(
                        50,
                        (calculations.totalCosts /
                          (calculations.totalCosts +
                            calculations.expectedRevenue)) *
                          100
                      )}%`
                    : '50%',
              }}
            />
            {/* Profit bar */}
            {isProfitable && (
              <div
                className="bg-green-500 h-full transition-all duration-500"
                style={{
                  width:
                    calculations.totalCosts > 0 &&
                    calculations.expectedRevenue > 0
                      ? `${Math.min(
                          50,
                          (calculations.expectedProfit /
                            (calculations.totalCosts +
                              calculations.expectedRevenue)) *
                            100
                        )}%`
                      : '50%',
                }}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Costi: {formatCurrency(calculations.totalCosts)}</span>
          <span>Ricavi: {formatCurrency(calculations.expectedRevenue)}</span>
        </div>
      </div>
    </div>
  );
}
