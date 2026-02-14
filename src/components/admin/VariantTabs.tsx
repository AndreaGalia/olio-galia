interface VariantTabsProps {
  variants: any[];
  activeIndex: number;
  onSelectTab: (index: number) => void;
  onRemoveVariant: (index: number) => void;
  onAddVariant: () => void;
}

export default function VariantTabs({
  variants,
  activeIndex,
  onSelectTab,
  onRemoveVariant,
  onAddVariant,
}: VariantTabsProps) {
  return (
    <div className="flex items-center border-b border-purple-200 overflow-x-auto">
      {variants.map((variant, index) => (
        <div key={index} className="relative flex items-center flex-shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab(index)}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeIndex === index
                ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {variant.translations?.it?.name || `Variante ${index + 1}`}
          </button>
          {variants.length > 1 && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Rimuovere la variante "${variant.translations?.it?.name || index + 1}"?`)) {
                  onRemoveVariant(index);
                }
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
              title="Rimuovi variante"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAddVariant}
        className="ml-2 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50 border border-purple-300 rounded transition-colors flex-shrink-0"
        title="Aggiungi variante"
      >
        + Aggiungi Variante
      </button>
    </div>
  );
}
