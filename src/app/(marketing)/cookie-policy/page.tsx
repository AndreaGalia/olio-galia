import CookieHeroSection from '@/components/cookiePolicyPage/CookieHeroSection';
import CookieSectionsAccordion from '@/components/cookiePolicyPage/CookieSectionsAccordion';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <CookieHeroSection />
      <CookieSectionsAccordion />
    </div>
  );
}
