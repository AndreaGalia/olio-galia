"use client";

import { useT } from "@/hooks/useT";
import { useSettings } from "@/hooks/useSettings";

interface DeliveryZoneSelectorProps {
  onSelectZone: (zone: 'torino' | 'italia') => void;
}

export default function DeliveryZoneSelector({ onSelectZone }: DeliveryZoneSelectorProps) {
  const { t } = useT();
  const { settings } = useSettings();

  return (
    <>
      <h3 className="font-serif text-2xl lg:text-3xl text-olive text-center mb-3">
        {t.deliveryZone.selector.title}
      </h3>
      <p className="text-base text-nocciola text-center mb-8">
        {t.deliveryZone.selector.subtitle}
      </p>

      {/* Bottoni di scelta */}
      <div className={`grid grid-cols-1 ${settings?.torino_checkout_enabled ? 'md:grid-cols-2' : ''} gap-4 max-w-4xl mx-auto`}>
        {/* Bottone Torino */}
        {settings?.torino_checkout_enabled && (
          <button
            onClick={() => onSelectZone('torino')}
            className="w-full bg-olive/5 border-2 border-olive p-4 sm:p-6 text-left"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-olive flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-lg sm:text-xl lg:text-2xl text-olive font-bold mb-1 sm:mb-2">
                  {t.deliveryZone.selector.torino.title}
                </div>
                <div className="text-sm sm:text-base text-nocciola">
                  {t.deliveryZone.selector.torino.description}
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Bottone Italia/Europa */}
        <button
          onClick={() => onSelectZone('italia')}
          className="w-full bg-beige/30 border-2 border-olive/20 p-4 sm:p-6 text-left"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-nocciola flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-lg sm:text-xl lg:text-2xl text-olive font-bold mb-1 sm:mb-2">
                {t.deliveryZone.selector.italia.title}
              </div>
              <div className="text-sm sm:text-base text-nocciola">
                {t.deliveryZone.selector.italia.description}
              </div>
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
