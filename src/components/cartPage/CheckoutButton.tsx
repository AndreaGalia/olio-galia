"use client";

import { useT } from "@/hooks/useT";

interface CheckoutButtonProps {
  onClick: () => void;
  totalItems: number;
  disabled?: boolean;
}

export default function CheckoutButton({ onClick, totalItems, disabled = false }: CheckoutButtonProps) {
  const { t, translate } = useT();
  
  const itemLabel = totalItems === 1 
    ? t.torinoCheckout.button.itemSingle 
    : t.torinoCheckout.button.itemPlural;

  return (
    <div className="mt-4">
      <div className="bg-olive/5 border border-olive/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-olive">📍</span>
            <span className="text-sm font-medium text-olive">{t.torinoCheckout.button.title}</span>
          </div>
          <span className="text-xs bg-olive/10 text-olive px-2 py-1 rounded-full">
            {t.torinoCheckout.button.freeShipping}
          </span>
        </div>
        
        <button
          onClick={onClick}
          disabled={disabled}
          className="w-full bg-olive hover:bg-salvia text-beige font-medium py-2.5 px-2 sm:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="whitespace-nowrap truncate">{t.torinoCheckout.button.subtitle}</span>
          {totalItems > 0 && (
            <span className="bg-beige/20 text-beige px-1 sm:px-2 py-0.5 rounded-full text-xs whitespace-nowrap flex-shrink-0">
              {translate('torinoCheckout.button.itemCount', {
                count: totalItems.toString(),
                itemLabel: itemLabel
              })}
            </span>
          )}
          <span className="text-xs opacity-80 flex-shrink-0">→</span>
        </button>
        
        {totalItems === 0 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            {t.torinoCheckout.button.emptyCartMessage}
          </p>
        )}
      </div>
    </div>
  );
}