import { useT } from '@/hooks/useT';

interface CheckoutErrorModalProps {
  isVisible: boolean;
  error: string;
  onClose: () => void;
  onRetry: () => void;
}

export default function CheckoutErrorModal({ 
  isVisible, 
  error, 
  onClose, 
  onRetry 
}: CheckoutErrorModalProps) {
  const { t } = useT();

  if (!isVisible || !error) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-olive">{t.cartPage.checkoutError.title}</h3>
        </div>
        
        <div className="mb-6 text-nocciola whitespace-pre-line">
          {error}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-olive text-olive rounded-full hover:bg-olive/5 transition-colors"
          >
            {t.cartPage.checkoutError.close}
          </button>
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-olive text-beige rounded-full hover:bg-olive/80 transition-colors"
          >
            {t.cartPage.checkoutError.retry}
          </button>
        </div>
      </div>
    </div>
  );
}