'use client';

import SubSuccessHeroSection from '@/components/subscriptionSuccessPage/SubSuccessHeroSection';
import SubSuccessEmailBanner from '@/components/subscriptionSuccessPage/SubSuccessEmailBanner';
import SubSuccessTimeline from '@/components/subscriptionSuccessPage/SubSuccessTimeline';
import SubSuccessCallToAction from '@/components/subscriptionSuccessPage/SubSuccessCallToAction';

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <SubSuccessHeroSection />
      <SubSuccessEmailBanner />
      <SubSuccessTimeline />
      <SubSuccessCallToAction />
    </div>
  );
}
