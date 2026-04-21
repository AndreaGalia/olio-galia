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
      <div className="border border-olive/20 p-4 mb-6 animate-fadeIn">
        <div className="flex items-start gap-3">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif termina-11 tracking-[0.15em] uppercase text-black mb-2">
              {t.cartPage.paymentCanceled?.title || 'Pagamento non completato'}
            </h3>
            <p className="garamond-13 mb-4">
              {t.cartPage.paymentCanceled?.message || 'Il tuo ordine non è stato processato. I prodotti sono ancora nel carrello e puoi riprovare quando vuoi.'}
            </p>

            {/* Bottone Riprova */}
            {showRetryButton && (
              <button
                onClick={onRetry}
                disabled={loading}
                className="w-full py-4 bg-sabbia text-black font-serif termina-11 tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:opacity-40 disabled:cursor-not-allowed"
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
            className="flex-shrink-0 text-black/30 hover:text-black transition-colors p-1"
            aria-label="Chiudi banner"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
