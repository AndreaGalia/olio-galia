"use client";

import { useT } from "@/hooks/useT";

export default function TorinoInfoSections() {
  const { t } = useT();

  return (
    <div className="border-t border-black/10 pt-4 mb-6 space-y-2">
      <p className="text-xs text-black/60">
        <span className="font-medium text-black">{t.torinoCheckout.modal.freeShippingInfo.title}</span>
        {' — '}
        {t.torinoCheckout.modal.freeShippingInfo.description}
      </p>
      <p className="text-xs text-black/40">
        {t.torinoCheckout.modal.paymentInfo}
      </p>
    </div>
  );
}
