import { useT } from '@/hooks/useT';
import WhatsAppButton from './WhatsAppButton';
import ReceiptButton from './ReceiptButton';
import { SuccessHeroSectionProps } from '@/types/checkoutSuccessTypes';

export default function SuccessHeroSection({
  sessionId,
  orderDetails,
  invoiceStatus,
  receiptStatus
}: SuccessHeroSectionProps) {
  const { t } = useT();

  return (
    <div className="text-center mb-16">
      {/* Titolo principale */}
      <h1 className="text-5xl md:text-6xl font-serif text-olive mb-6 tracking-tight">
        {t.checkoutSuccess.hero.title}
      </h1>
      
      {/* Sottotitolo */}
      <div className="max-w-2xl mx-auto mb-8">
        <p className="text-2xl md:text-3xl text-salvia mb-4 font-light">
          {t.checkoutSuccess.hero.subtitle}
        </p>
        <p className="text-lg text-nocciola leading-relaxed">
          {t.checkoutSuccess.hero.description}
        </p>
      </div>

      {/* Azioni: WhatsApp e Ricevuta */}
      {orderDetails?.paymentIntent && (
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center mb-8">
          <WhatsAppButton
            orderDetails={orderDetails}
            sessionId={orderDetails.paymentIntent}
          />

          {receiptStatus.hasReceipt && (
            <ReceiptButton
              receiptStatus={receiptStatus}
              invoiceStatus={invoiceStatus}
            />
          )}
        </div>
      )}
    </div>
  );
}