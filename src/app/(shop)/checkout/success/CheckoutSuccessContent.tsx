'use client';

import { useSearchParams } from 'next/navigation';

import { useOrderPolling } from '@/hooks/useOrderPolling';
import { useInvoiceStatus } from '@/hooks/useInvoiceStatus';
import { useReceiptStatus } from '@/hooks/useReceiptStatus';
import { useCartCleanup } from '@/hooks/useCartCleanup';

import SuccessHeroSection from '@/components/checkoutSuccessPage/SuccessHeroSection';
import TimelineProcess from '@/components/checkoutSuccessPage/TimelineProcess';
import CallToAction from '@/components/checkoutSuccessPage/CallToAction';
import OrderSummaryDisplay from '@/components/checkoutSuccessPage/OrderSummaryDisplay';
import ExpiredAccessMessage from '@/components/checkoutSuccessPage/ExpiredAccessMessage';

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { order, loading, error, expired } = useOrderPolling(sessionId);
  const invoiceStatus = useInvoiceStatus(sessionId);
  const receiptStatus = useReceiptStatus(sessionId);

  useCartCleanup(sessionId);

  if (expired) {
    return <ExpiredAccessMessage />;
  }

  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <SuccessHeroSection
        sessionId={sessionId}
        orderDetails={order}
        invoiceStatus={invoiceStatus}
        receiptStatus={receiptStatus}
      />
      <OrderSummaryDisplay
        orderDetails={order}
        loading={loading}
      />
      <TimelineProcess currentStep="confirmation" />
      <CallToAction />
    </div>
  );
}
