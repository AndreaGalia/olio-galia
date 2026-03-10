import { Metadata } from 'next';
import AboutSection from "@/components/homepage/sections/AboutSection";
import FAQSection from "@/components/homepage/sections/FAQSection";
import HeroSection from "@/components/homepage/sections/HeroSection";
import OlivaSection from "@/components/homepage/sections/OlivaSection";
import CasaSection from "@/components/homepage/sections/CasaSection";
import ProductsSection from "@/components/homepage/sections/ProductSection";
import { UlivetoSection } from "@/components/homepage/sections/UlivetoSection";
import ProductsPageBanner from "@/components/productsPage/ProductsPageBanner";
import { generateBaseMetadata } from '@/lib/seo/metadata';
import { StructuredData, generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo/structured-data';

// Genera metadata per SEO
export const metadata: Metadata = generateBaseMetadata('it');

export default function HomePage() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema('it');

  return (
    <>
      {/* Structured Data per SEO */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

      <HeroSection />
      <ProductsSection />
      <UlivetoSection />
      <OlivaSection />
      <CasaSection />
      <AboutSection />
    </>
  );
}