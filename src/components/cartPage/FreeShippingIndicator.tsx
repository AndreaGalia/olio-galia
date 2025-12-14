import { useT } from '@/hooks/useT';

interface FreeShippingIndicatorProps {
  total: number;
  freeShippingThreshold: number;
}

export default function FreeShippingIndicator({ 
  total, 
  freeShippingThreshold 
}: FreeShippingIndicatorProps) {
  const { t, translate } = useT();
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);

  if (remainingForFreeShipping > 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-yellow-800 font-medium text-sm">{t.cartPage.freeShipping.title}</span>
        </div>
        <p className="text-yellow-800 text-sm">
          {translate('cartPage.freeShipping.remaining', { amount: remainingForFreeShipping.toFixed(2) })}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 mb-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-green-800 font-medium text-sm">
          {t.cartPage.freeShipping.qualified}
        </span>
      </div>
    </div>
  );
}