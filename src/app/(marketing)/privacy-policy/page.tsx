import PrivacyHeroSection from '@/components/privacyPolicyPage/PrivacyHeroSection';
import PrivacySectionsAccordion from '@/components/privacyPolicyPage/PrivacySectionsAccordion';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <PrivacyHeroSection />
      <PrivacySectionsAccordion />
    </div>
  );
}
