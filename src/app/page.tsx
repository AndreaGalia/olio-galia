import AboutSection from "@/components/homepage/sections/AboutSection";
import FAQSection from "@/components/homepage/sections/FAQSection";
import HeroSection from "@/components/homepage/sections/HeroSection";
import ProductsSection from "@/components/homepage/sections/ProductSection";

export default function HomePage() {
  return (
    <>
    <HeroSection />
    <ProductsSection />
    <AboutSection />
    <FAQSection />
    </>
  );
}