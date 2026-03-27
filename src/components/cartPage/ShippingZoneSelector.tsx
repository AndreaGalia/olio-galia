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
    <div className="space-y-3">
      <p className="text-[11px] tracking-[0.2em] uppercase text-black/50">
        {t.cartPage.shippingSelection.zoneSelector.title}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {ZONES.map((zoneId) => {
          const isSelected = selectedZone === zoneId;
          const zoneData = t.cartPage.shippingSelection.zones[zoneId];

          return (
            <button
              key={zoneId}
              onClick={() => onSelectZone(zoneId)}
              className={`py-3 px-4 border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-olive bg-olive text-beige'
                  : 'border-black/15 text-black hover:border-olive/40'
              }`}
              aria-pressed={isSelected}
              aria-label={`Seleziona zona ${zoneData.name}`}
            >
              <span className="block text-xs tracking-wider uppercase">{zoneData.name}</span>
              <span className={`block text-xs mt-0.5 ${isSelected ? 'text-beige/70' : 'text-black/40'}`}>
                {zoneData.deliveryTime}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
