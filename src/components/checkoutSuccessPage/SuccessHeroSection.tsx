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
      {/* Icona successo animata */}
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-olive to-salvia rounded-full flex items-center justify-center shadow-2xl animate-pulse">
          <svg className="w-16 h-16 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {/* Cerchi decorativi */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-4 h-4 bg-olive/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-3 h-3 bg-salvia/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-8 right-8 w-2 h-2 bg-nocciola/40 rounded-full animate-bounce delay-150"></div>
        <div className="absolute top-8 left-8 w-2 h-2 bg-nocciola/40 rounded-full animate-bounce delay-450"></div>
      </div>

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

      {/* ID Ordine, WhatsApp e Ricevuta */}
      {orderDetails?.paymentIntent && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8 flex-wrap">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-olive/10">
            <p className="text-sm text-nocciola/80 mb-1">{t.checkoutSuccess.hero.orderNumber}</p>
            <p className="text-xl font-serif text-olive font-semibold tracking-wider">
              #{orderDetails.paymentIntent.slice(-8).toUpperCase()}
            </p>
          </div>
          
          {orderDetails && (
            <WhatsAppButton 
              orderDetails={orderDetails} 
              sessionId={orderDetails.paymentIntent} 
            />
          )}

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