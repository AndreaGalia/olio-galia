'use client';

interface FAQSettingsProps {
  order: string;
  isActive?: boolean;
  onOrderChange: (value: string) => void;
  onActiveChange?: (value: boolean) => void;
  labels: {
    title: string;
    orderLabel: string;
    orderPlaceholder: string;
    orderHint: string;
    activeLabel?: string;
  };
  showActiveToggle?: boolean;
}

export default function FAQSettings({
  order,
  isActive,
  onOrderChange,
  onActiveChange,
  labels,
  showActiveToggle = false,
}: FAQSettingsProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
      <h2 className="text-xl font-serif text-olive mb-6">{labels.title}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-nocciola mb-2">
            {labels.orderLabel}
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => onOrderChange(e.target.value)}
            className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
            placeholder={labels.orderPlaceholder}
            min="1"
          />
          <p className="mt-1 text-xs text-gray-500">{labels.orderHint}</p>
        </div>

        {showActiveToggle && onActiveChange && labels.activeLabel && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => onActiveChange(e.target.checked)}
              className="w-4 h-4 text-olive border-olive/20 rounded focus:ring-olive cursor-pointer"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-nocciola cursor-pointer">
              {labels.activeLabel}
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
