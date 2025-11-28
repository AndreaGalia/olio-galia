'use client';

import { useSearchParams } from 'next/navigation';

// Import degli hook personalizzati
import { useOrderPolling } from '@/hooks/useOrderPolling';
import { useInvoiceStatus } from '@/hooks/useInvoiceStatus';
import { useReceiptStatus } from '@/hooks/useReceiptStatus';
import { useCartCleanup } from '@/hooks/useCartCleanup';

// Import dei componenti
import SuccessHeroSection from '@/components/checkoutSuccessPage/SuccessHeroSection';
import TimelineProcess from '@/components/checkoutSuccessPage/TimelineProcess';
import CallToAction from '@/components/checkoutSuccessPage/CallToAction';
import BackgroundDecorations from '@/components/checkoutSuccessPage/BackgroundDecorations';
import OrderSummaryDisplay from '@/components/checkoutSuccessPage/OrderSummaryDisplay';

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Polling per attendere che il webhook salvi l'ordine
  const { order, loading, error } = useOrderPolling(sessionId);

  // Status documenti
  const invoiceStatus = useInvoiceStatus(sessionId);
  const receiptStatus = useReceiptStatus(sessionId);

  // Pulizia del carrello
  useCartCleanup(sessionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <SuccessHeroSection
          sessionId={sessionId}
          orderDetails={order}
          invoiceStatus={invoiceStatus}
          receiptStatus={receiptStatus}
        />

        {/* Riepilogo Ordine */}
        <OrderSummaryDisplay
          orderDetails={order}
          loading={loading}
        />

        {/* Timeline Process */}
        <TimelineProcess currentStep="confirmation" />

        {/* Call to Action */}
        <CallToAction />

        {/* Decorazioni di sfondo */}
        <BackgroundDecorations />
      </div>
    </div>
  );
}