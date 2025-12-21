"use client";

import { ShippingZone } from '@/types/shipping';
import { useT } from '@/hooks/useT';
import ShippingZoneSelector from './ShippingZoneSelector';

interface ShippingSelectionFlowProps {
  value: ShippingZone | null;
  onChange: (zone: ShippingZone | null) => void;
}

export default function ShippingSelectionFlow({ value, onChange }: ShippingSelectionFlowProps) {
  const { t } = useT();

  return (
    <div className="space-y-6">
      {/* Selettore Zone */}
      <ShippingZoneSelector
        selectedZone={value}
        onSelectZone={onChange}
      />

      {/* Conferma Visiva quando zona selezionata */}
      {value && (
        <div className="animate-fadeIn bg-olive/5 border-2 border-olive/20 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            {/* Check icon grande */}
            <div className="w-10 h-10 bg-olive flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-beige" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Testo conferma */}
            <div className="flex-1">
              <h4 className="font-medium text-olive mb-1">
                {t.cartPage.shippingSelection.zoneSelected || 'Zona di spedizione selezionata'}
              </h4>
              <p className="text-sm text-nocciola">
                {t.cartPage.shippingSelection.zones[value].name}
              </p>
            </div>

            {/* Bottone modifica */}
            <button
              onClick={() => onChange(null)}
              className="text-sm text-olive hover:text-olive/70 transition-colors underline flex-shrink-0"
              aria-label="Modifica zona"
            >
              {t.cartPage.shippingSelection.summary?.edit || 'Modifica'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
