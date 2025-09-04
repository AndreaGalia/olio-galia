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
    <div className="relative group">
      {/* Badge "Fattura Inclusa" se presente */}
      {invoiceStatus.hasInvoice && (
        <div className="absolute -top-3 -right-2 z-20">
          <div className="bg-gradient-to-r from-olive to-salvia text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse font-medium">
            {t.checkoutSuccess.badges.invoiceIncluded}
          </div>
        </div>
      )}
      
      <button
        onClick={handleDownload}
        disabled={receiptStatus.checking}
        className="group relative cursor-pointer overflow-hidden flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-olive to-salvia hover:from-salvia hover:to-olive disabled:from-nocciola disabled:to-nocciola text-white rounded-2xl shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60 font-semibold text-lg min-w-[280px] border border-olive/20"
      >
        {/* Effetto shimmer di sfondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        {/* Icona principale */}
        <div className="relative z-10 flex-shrink-0">
          {receiptStatus.checking ? (
            <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <div className="relative">
              <svg className="w-7 h-7 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              
              {/* Effetti sparkle con colori del tema */}
              <div className="absolute -top-2 -left-2 w-2 h-2 bg-sabbia rounded-full animate-pulse opacity-80"></div>
              <div className="absolute -bottom-1 -right-3 w-1.5 h-1.5 bg-beige rounded-full animate-pulse delay-300 opacity-60"></div>
              <div className="absolute top-0 -right-4 w-1 h-1 bg-nocciola rounded-full animate-pulse delay-150 opacity-70"></div>
            </div>
          )}
        </div>

        {/* Contenuto testuale */}
        <div className="relative z-10 flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="leading-tight">
              {receiptStatus.checking ? t.checkoutSuccess.hero.documentsChecking : 
               invoiceStatus.hasInvoice ? t.checkoutSuccess.hero.documents : t.checkoutSuccess.hero.receipt}
            </span>
            
            {/* Icona esterna */}
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          
          {!receiptStatus.checking && (
            <span className="text-xs opacity-80 font-normal">
              {invoiceStatus.hasInvoice ? 
                t.checkoutSuccess.hero.receiptAndInvoiceIncluded : 
                t.checkoutSuccess.hero.opensNewWindow}
            </span>
          )}
        </div>

        {/* Effetto hover overlay */}
        <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
      </button>
    </div>
  );
}