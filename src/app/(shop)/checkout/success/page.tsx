'use client';

import { Suspense } from 'react';
import { useT } from '@/hooks/useT';
import CheckoutSuccessContent from './CheckoutSuccessContent';

function CheckoutSuccessLoading() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto pt-16 lg:pt-24">
        <div className="animate-pulse space-y-4">
          <div className="h-3 bg-olive/10 w-32" />
          <div className="h-8 bg-olive/10 w-64" />
          <div className="h-4 bg-olive/10 w-48 mt-5" />
        </div>
        <p className="mt-8 garamond-13 text-black">{t.checkoutSuccess.loading.text}</p>
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
