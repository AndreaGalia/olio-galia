// app/checkout/success/page.tsx
import { Suspense } from 'react';
import CheckoutSuccessContent from './CheckoutSuccessContent';

function CheckoutSuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-olive/20 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-olive text-lg">Caricamento...</p>
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