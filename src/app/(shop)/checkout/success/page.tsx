// app/checkout/success/page.tsx
'use client';

import { Suspense } from 'react';
import { useT } from '@/hooks/useT';
import CheckoutSuccessContent from './CheckoutSuccessContent';

function CheckoutSuccessLoading() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-olive text-2xl font-serif">{t.checkoutSuccess.loading.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}