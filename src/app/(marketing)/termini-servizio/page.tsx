import type { Metadata } from 'next';
import TermsHeroSection from '@/components/termsOfServicePage/TermsHeroSection';
import TermsSectionsAccordion from '@/components/termsOfServicePage/TermsSectionsAccordion';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <TermsHeroSection />
      <TermsSectionsAccordion />
    </div>
  );
}
