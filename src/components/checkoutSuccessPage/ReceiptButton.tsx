import { useT } from '@/hooks/useT';
import { ReceiptButtonProps } from '@/types/checkoutSuccessTypes';

export default function ReceiptButton({ receiptStatus, invoiceStatus }: ReceiptButtonProps) {
  const { t } = useT();

  const handleDownload = () => {
    if (receiptStatus.receiptUrl) {
      window.open(receiptStatus.receiptUrl, '_blank');
    }
  };

  return (
    <div className="relative">
      {/* Badge "Fattura Inclusa" se presente */}
      {invoiceStatus.hasInvoice && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className="bg-olive text-white text-xs px-2 py-1 border border-olive/20 font-medium">
            {t.checkoutSuccess.badges.invoiceIncluded}
          </div>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={receiptStatus.checking}
        className="cursor-pointer flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-olive text-white border border-olive/20 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 font-medium text-sm sm:text-base uppercase tracking-wider w-full sm:w-auto"
      >
        {/* Icona principale */}
        <div className="flex-shrink-0">
          {receiptStatus.checking ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white animate-spin"></div>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>

        {/* Contenuto testuale */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="truncate text-sm sm:text-base">
              {receiptStatus.checking ? t.checkoutSuccess.hero.documentsChecking :
               invoiceStatus.hasInvoice ? t.checkoutSuccess.hero.documents : t.checkoutSuccess.hero.receipt}
            </span>

            {/* Icona esterna */}
            {!receiptStatus.checking && (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}