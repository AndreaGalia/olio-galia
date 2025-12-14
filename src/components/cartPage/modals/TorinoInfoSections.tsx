"use client";

import { useT } from "@/hooks/useT";

export default function TorinoInfoSections() {
  const { t } = useT();

  return (
    <>
      {/* Free shipping info */}
      <div className="bg-white/60 p-4 mb-6 border border-nocciola/20">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-olive/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-olive/20">
            <svg className="w-3 h-3 text-olive" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-medium text-olive mb-1">{t.torinoCheckout.modal.freeShippingInfo.title}</p>
            <p>{t.torinoCheckout.modal.freeShippingInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-olive/5 p-4 mb-6 border border-olive/10">
        <p className="text-sm text-gray-700">
          {t.torinoCheckout.modal.paymentInfo}
        </p>
      </div>
    </>
  );
}