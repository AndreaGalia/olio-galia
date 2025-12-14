"use client";

import { useT } from "@/hooks/useT";
import CheckoutTorinoButton from "./CheckoutTorinoButton";
import PreventivoCheckoutButton from "./PreventivoCheckoutButton";

interface DeliveryZoneDetailsProps {
  zone: 'torino' | 'italia';
  onBack: () => void;
}

export default function DeliveryZoneDetails({ zone, onBack }: DeliveryZoneDetailsProps) {
  const { t } = useT();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Bottone indietro */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-base text-olive hover:text-olive/70 transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>{t.deliveryZone.details.backButton}</span>
      </button>

      {zone === 'torino' ? (
        // Componente Torino
        <div className="bg-olive/5 border-2 border-olive p-6 lg:p-8">
          <div className="bg-olive text-beige px-4 py-2 inline-block mb-6 text-sm font-bold uppercase">
            {t.deliveryZone.details.torino.badge}
          </div>

          <h4 className="font-serif text-2xl lg:text-3xl text-olive font-bold mb-4">
            {t.deliveryZone.details.torino.title}
          </h4>

          <p className="text-base text-nocciola mb-6 leading-relaxed">
            {t.deliveryZone.details.torino.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 text-base text-olive">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{t.deliveryZone.details.torino.features.freeShipping}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-olive">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{t.deliveryZone.details.torino.features.fastDelivery}</span>
            </div>
            <div className="flex items-center gap-3 text-base text-olive">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{t.deliveryZone.details.torino.features.quoteByEmail}</span>
            </div>
          </div>

          <CheckoutTorinoButton minimal={true} />
        </div>
      ) : (
        // Componente Italia/Europa
        <div className="bg-beige/30 border-2 border-olive/20 p-6 lg:p-8">
          <div className="bg-nocciola text-beige px-4 py-2 inline-block mb-6 text-sm font-bold uppercase">
            {t.deliveryZone.details.italia.badge}
          </div>

          <h4 className="font-serif text-2xl lg:text-3xl text-olive font-bold mb-4">
            {t.deliveryZone.details.italia.title}
          </h4>

          <p className="text-base text-nocciola mb-6 leading-relaxed">
            {t.deliveryZone.details.italia.description}
          </p>

          {/* Processo */}
          <div className="bg-olive/5 border-l-4 border-olive p-5 mb-6">
            <p className="text-sm font-bold text-olive mb-4 uppercase tracking-wide">
              {t.deliveryZone.details.italia.processTitle}
            </p>
            <ol className="space-y-3 text-sm text-nocciola">
              <li className="flex gap-3">
                <span className="text-olive font-bold flex-shrink-0">1.</span>
                <span>{t.deliveryZone.details.italia.process.step1}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-olive font-bold flex-shrink-0">2.</span>
                <span>{t.deliveryZone.details.italia.process.step2}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-olive font-bold flex-shrink-0">3.</span>
                <span>{t.deliveryZone.details.italia.process.step3}</span>
              </li>
            </ol>
          </div>

          <PreventivoCheckoutButton />
        </div>
      )}
    </div>
  );
}
