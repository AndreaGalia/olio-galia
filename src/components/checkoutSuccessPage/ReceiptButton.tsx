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
    <div className="relative w-full">
      {invoiceStatus.hasInvoice && (
        <div className="absolute -top-2 -right-2 z-20">
          <span className="font-serif termina-8 tracking-[0.1em] uppercase bg-olive text-beige px-2 py-1 border border-olive/20">
            {t.checkoutSuccess.badges.invoiceIncluded}
          </span>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={receiptStatus.checking}
        className={`w-full py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
          receiptStatus.checking
            ? 'bg-sabbia/40 text-black/30 border-olive/30'
            : 'bg-sabbia text-olive hover:bg-olive hover:text-beige'
        }`}
      >
        {receiptStatus.checking
          ? t.checkoutSuccess.hero.documentsChecking
          : invoiceStatus.hasInvoice
            ? t.checkoutSuccess.hero.documents
            : t.checkoutSuccess.hero.receipt}
      </button>
    </div>
  );
}
