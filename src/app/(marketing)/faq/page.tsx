import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import FaqHeroSection from '@/components/faqPage/FaqHeroSection';
import FaqListSection from '@/components/faqPage/FaqListSection';

export const metadata: Metadata = generatePageMetadata(
  'Domande Frequenti',
  "Trova le risposte alle domande più comuni sui nostri oli extravergini, la produzione e i servizi offerti da Olio Galia.",
  '/faq',
  'it',
  ['faq', 'domande frequenti', 'olio extravergine', 'olio galia', 'sicilia']
);

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-homepage-bg">
      <FaqHeroSection />
      <FaqListSection />
    </div>
  );
}
