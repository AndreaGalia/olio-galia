"use client";

import { useT } from "@/hooks/useT";

interface CheckoutButtonProps {
  onClick: () => void;
  totalItems: number;
  disabled?: boolean;
  minimal?: boolean;
}

export default function CheckoutButton({ onClick, totalItems, disabled = false, minimal = false }: CheckoutButtonProps) {
  const { t } = useT();

  if (minimal) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t.torinoCheckout.button.subtitle}
      </button>
    );
  }

  return (
    <div className="border-t border-black/10 pt-4">
      <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-3">
        {t.torinoCheckout.button.title}
      </p>
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t.torinoCheckout.button.subtitle}
      </button>
    </div>
  );
}
