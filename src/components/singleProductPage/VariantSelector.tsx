import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import type { ProductVariant } from '@/types/products';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  variantLabel?: { it: string; en: string };
  onVariantChange: (variant: ProductVariant) => void;
  disabled?: boolean;
}

export default function VariantSelector({
  variants,
  selectedVariant,
  variantLabel,
  onVariantChange,
  disabled = false,
}: VariantSelectorProps) {
  const { t, translate } = useT();
  const { locale } = useLocale();

  const label = variantLabel?.[locale] || t.productDetailPage.variants?.label || 'Variante';
  const selectText = translate('productDetailPage.variants.select', { label }) || `Seleziona ${label}`;
  const outOfStockText = t.productDetailPage.variants?.outOfStock || 'Esaurito';

  const getVariantName = (variant: ProductVariant) => {
    return variant.translations[locale]?.name || variant.translations.it?.name || variant.variantId;
  };

  const getVariantDescription = (variant: ProductVariant) => {
    return variant.translations[locale]?.description || variant.translations.it?.description;
  };

  const selectedDescription = selectedVariant ? getVariantDescription(selectedVariant) : null;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-olive">{selectText}</label>

      {/* Mobile: native select */}
      <div className="block sm:hidden">
        <select
          value={selectedVariant?.variantId || ''}
          onChange={(e) => {
            const variant = variants.find(v => v.variantId === e.target.value);
            if (variant) onVariantChange(variant);
          }}
          disabled={disabled}
          className="w-full px-4 py-3 border border-olive/20 bg-white text-olive text-base focus:ring-2 focus:ring-olive/20 focus:border-olive disabled:opacity-50"
        >
          {variants.map((variant) => {
            const name = getVariantName(variant);
            const suffix = !variant.inStock ? ` (${outOfStockText})` : '';
            return (
              <option
                key={variant.variantId}
                value={variant.variantId}
                disabled={!variant.inStock}
              >
                {name}{suffix}
              </option>
            );
          })}
        </select>
      </div>

      {/* Desktop: toggle buttons */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {variants.map((variant) => {
          const name = getVariantName(variant);
          const isSelected = selectedVariant?.variantId === variant.variantId;
          const isDisabled = disabled || !variant.inStock;

          return (
            <button
              key={variant.variantId}
              type="button"
              onClick={() => !isDisabled && onVariantChange(variant)}
              disabled={isDisabled}
              className={`px-4 py-2.5 border text-sm font-medium transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'border-olive bg-olive text-beige'
                  : isDisabled
                    ? 'border-olive/10 bg-gray-50 text-nocciola/40 cursor-not-allowed'
                    : 'border-olive/20 bg-white text-olive hover:border-olive hover:bg-olive/5'
                }
              `}
            >
              {variant.color && (
                <span
                  className="inline-block w-3 h-3 rounded-full mr-2 border border-olive/20"
                  style={{ backgroundColor: variant.color }}
                />
              )}
              {name}
              {!variant.inStock && (
                <span className="ml-2 text-xs opacity-60">({outOfStockText})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Variant description */}
      {selectedDescription && (
        <p className="text-sm text-nocciola mt-2">{selectedDescription}</p>
      )}
    </div>
  );
}
