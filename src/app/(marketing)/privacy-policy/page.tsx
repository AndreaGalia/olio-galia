import type { Metadata } from 'next';
import PrivacyHeroSection from '@/components/privacyPolicyPage/PrivacyHeroSection';
import PrivacySectionsAccordion from '@/components/privacyPolicyPage/PrivacySectionsAccordion';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <PrivacyHeroSection />
      <PrivacySectionsAccordion />
    </div>
  );
}
