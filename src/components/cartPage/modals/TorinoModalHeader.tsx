"use client";

import { useT } from "@/hooks/useT";

interface TorinoModalHeaderProps {
  onClose: () => void;
  isLoading?: boolean;
}

export default function TorinoModalHeader({ onClose, isLoading = false }: TorinoModalHeaderProps) {
  const { t } = useT();

  return (
    <div className="border-b border-black/10 pb-5 mb-6 flex items-center justify-between">
      <h2 className="text-[11px] tracking-[0.25em] uppercase text-black/60">
        {t.torinoCheckout.modal.title}
      </h2>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="w-7 h-7 border border-black/15 flex items-center justify-center transition-colors hover:border-black/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Chiudi"
      >
        <svg className="w-3 h-3 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
