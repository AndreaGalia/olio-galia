"use client";

import { ShippingZone } from '@/types/shipping';
import { useT } from '@/hooks/useT';

interface ShippingZoneSelectorProps {
  selectedZone: ShippingZone | null;
  onSelectZone: (zone: ShippingZone) => void;
}

const ZONES: ShippingZone[] = ['italia', 'europa', 'america', 'mondo'];

export default function ShippingZoneSelector({ selectedZone, onSelectZone }: ShippingZoneSelectorProps) {
  const { t } = useT();

  return (
    <div className="space-y-6">
      {/* Header con separatore (Opzione A) */}
      <div className="pb-4 border-b-2 border-olive/20">
        <h3 className="text-xl sm:text-2xl font-serif text-olive mb-3">
          {t.cartPage.shippingSelection.zoneSelector.title}
        </h3>
        <p className="text-sm sm:text-base text-nocciola">
          {t.cartPage.shippingSelection.zoneSelector.description}
        </p>
      </div>

      {/* Grid di zone - Mobile-first ottimizzato */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
        {ZONES.map((zoneId) => {
          const isSelected = selectedZone === zoneId;
          const zoneData = t.cartPage.shippingSelection.zones[zoneId];

          return (
            <button
              key={zoneId}
              onClick={() => onSelectZone(zoneId)}
              className={`
                relative bg-white border transition-all duration-300
                p-6 sm:p-5 text-left cursor-pointer
                min-h-[140px] sm:min-h-[160px]
                ${isSelected
                  ? 'border-olive border-2 bg-olive/5'
                  : 'border-olive/10 hover:border-olive/30 hover:bg-olive/5'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`Seleziona zona ${zoneData.name}`}
            >
              {/* Indicatore selezione - Visibile e chiaro */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-olive flex items-center justify-center">
                  <svg className="w-4 h-4 text-beige" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Contenuto zona */}
              <div className="space-y-3">
                {/* Nome zona - Più grande su mobile */}
                <h4 className={`font-bold text-base sm:text-lg ${isSelected ? 'text-olive' : 'text-olive/80'}`}>
                  {zoneData.name}
                </h4>

                {/* Descrizione - Più leggibile */}
                <p className="text-sm text-nocciola leading-relaxed">
                  {zoneData.description}
                </p>

                {/* Tempo di consegna - Icona più visibile */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-olive/70 mt-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{zoneData.deliveryTime}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Nota informativa - Solo se zona selezionata */}
      {selectedZone && (
        <div className="mt-4 p-4 bg-olive/5 border border-olive/10">
          <p className="text-xs sm:text-sm text-nocciola">
            {t.cartPage.shippingSelection.zoneSelector.deliveryTimeNote}
          </p>
        </div>
      )}
    </div>
  );
}
