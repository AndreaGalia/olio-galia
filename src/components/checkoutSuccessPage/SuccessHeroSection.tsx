import { useT } from '@/hooks/useT';
import WhatsAppButton from './WhatsAppButton';
import ReceiptButton from './ReceiptButton';
import { SuccessHeroSectionProps } from '@/types/checkoutSuccessTypes';

export default function SuccessHeroSection({
  sessionId,
  orderDetails,
  invoiceStatus,
  receiptStatus,
}: SuccessHeroSectionProps) {
  const { t } = useT();

  return (
    <section className="pt-16 pb-8 lg:pt-24 lg:pb-12">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-4">
          {t.checkoutSuccess.hero.subtitle}
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: '1.1', letterSpacing: '0.15em' }}>
          {t.checkoutSuccess.hero.title}
        </h1>
        <p className="mt-5 text-sm text-black/60 leading-relaxed max-w-xl">
          {t.checkoutSuccess.hero.description}
        </p>

        {orderDetails?.paymentIntent && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
    </section>
  );
}
