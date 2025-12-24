'use client';

import { useT } from '@/hooks/useT';

interface PaymentCanceledBannerProps {
  show: boolean;
  onClose: () => void;
  onRetry: () => void;
  loading: boolean;
  showRetryButton: boolean;
}

export default function PaymentCanceledBanner({
  show,
  onClose,
  onRetry,
  loading,
  showRetryButton
}: PaymentCanceledBannerProps) {
  const { t } = useT();

  if (!show) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl pt-8">
      <div className="bg-white border-l-4 border-olive p-4 sm:p-5 mb-6 animate-fadeIn">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-olive/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-olive mb-1">
              {t.cartPage.paymentCanceled?.title || 'Pagamento non completato'}
            </h3>
            <p className="text-sm sm:text-base text-nocciola mb-4">
              {t.cartPage.paymentCanceled?.message || 'Il tuo ordine non è stato processato. I prodotti sono ancora nel carrello e puoi riprovare quando vuoi.'}
            </p>

            {/* Bottone Riprova */}
            {showRetryButton && (
              <button
                onClick={onRetry}
                disabled={loading}
                className="bg-olive text-beige px-6 py-3 font-medium transition-all duration-300 border border-olive/20 hover:bg-olive/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading
                  ? (t.cartPage.paymentCanceled?.retrying || 'Caricamento...')
                  : (t.cartPage.paymentCanceled?.retry || 'Riprova il pagamento')
                }
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-nocciola hover:text-olive transition-colors p-1"
            aria-label="Chiudi banner"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
