'use client';

import { useState } from 'react';
import ManageSubscriptionBreadcrumb from '@/components/manageSubscriptionPage/ManageSubscriptionBreadcrumb';
import ManageSubscriptionHero from '@/components/manageSubscriptionPage/ManageSubscriptionHero';
import ManageSubscriptionForm from '@/components/manageSubscriptionPage/ManageSubscriptionForm';
import ManageSubscriptionSuccess from '@/components/manageSubscriptionPage/ManageSubscriptionSuccess';

export default function ManageSubscriptionPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-sabbia-chiaro flex flex-col">
      <ManageSubscriptionBreadcrumb />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl py-12">
          <div className="lg:grid lg:grid-cols-[1fr,1.1fr] lg:gap-20 lg:items-center">
            <ManageSubscriptionHero />
            <div className="border border-olive/20 p-6 sm:p-8">
              {sent ? (
                <ManageSubscriptionSuccess onReset={() => setSent(false)} />
              ) : (
                <ManageSubscriptionForm onSuccess={() => setSent(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
