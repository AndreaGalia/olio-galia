"use client";

import { useT } from "@/hooks/useT";

interface DeliveryZoneSummaryProps {
  total: number;
  savings: number;
  totalItems: number;
  itemLabel: string;
}

export default function DeliveryZoneSummary({ total, savings, totalItems, itemLabel }: DeliveryZoneSummaryProps) {
  const { t } = useT();

  return (
    <div className="bg-beige/30 border border-olive/10 sticky top-4">
      {/* Header - Riepilogo */}
      <div className="bg-olive p-3 text-beige border-b border-olive/20">
        <h2 className="font-serif text-lg sm:text-xl mb-0.5">{t.deliveryZone.summary.title}</h2>
        <p className="text-beige/80 text-xs">
          {t.deliveryZone.summary.subtitle}
        </p>
      </div>

      {/* Riepilogo ordine */}
      <div className="p-3 sm:p-4">
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm text-nocciola gap-3">
            <span className="text-xs">Subtotale ({totalItems} {itemLabel})</span>
            <span className="font-semibold whitespace-nowrap">€{total.toFixed(2)}</span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium gap-3">
              <span className="text-xs">Risparmio</span>
              <span className="whitespace-nowrap">-€{savings.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-olive/10 pt-2.5 mt-2.5">
            <div className="flex justify-between text-olive font-bold text-base gap-3">
              <span className="text-sm">Totale</span>
              <span className="whitespace-nowrap">€{total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-nocciola mt-1 leading-tight">
              + Spedizione
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
