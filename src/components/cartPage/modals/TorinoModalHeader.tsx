"use client";

import { useT } from "@/hooks/useT";

interface TorinoModalHeaderProps {
  onClose: () => void;
  isLoading?: boolean;
}

export default function TorinoModalHeader({ onClose, isLoading = false }: TorinoModalHeaderProps) {
  const { t } = useT();

  return (
    <div className="border-b border-nocciola/30 pb-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-olive mb-2">
            {t.torinoCheckout.modal.title}
          </h2>
          <div className="w-16 h-0.5 bg-olive"></div>
        </div>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="w-8 h-8 bg-olive/10 hover:bg-olive/20 flex items-center justify-center transition-colors group disabled:opacity-50 disabled:cursor-not-allowed border border-olive/20"
        >
          <svg className="w-4 h-4 text-olive transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}