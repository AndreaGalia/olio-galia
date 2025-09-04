"use client";
import { useT } from '@/hooks/useT';
import { useState } from 'react';
import { FAQ, FAQCategories } from '@/types/faq';
import BackgroundDecorations from './faq/BackgroundDecorations';
import FAQHeader from './faq/FAQHeader';
import CategoryPills from './faq/CategoryPills';
import FAQItem from './faq/FAQItem';
import ContactSection from './faq/ContactSection';

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { t } = useT();

  // Costruzione dinamica delle FAQ dalle traduzioni
  const faqs: FAQ[] = t.faq.questions.map((faqData, index) => ({
    id: index + 1,
    question: faqData.question,
    answer: faqData.answer,
    category: t.faq.categories[faqData.category as keyof typeof t.faq.categories]
  }));

  // Estrazione delle categorie uniche
  const categories = [...new Set(faqs.map(faq => faq.category))];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(t.contactPage.whatsappMessage);
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <section className="relative bg-gradient-to-br from-sabbia to-beige py-16 sm:py-20 lg:py-24 overflow-hidden">
      <BackgroundDecorations />

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
        <FAQHeader 
          badge={t.faq.badge}
          title={t.faq.title}
          description={t.faq.description}
        />

        <CategoryPills categories={categories} />

        {/* FAQ Items */}
        <div className="space-y-4 sm:space-y-6">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isActive={activeIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>

        <ContactSection 
          contact={t.faq.contact}
          onWhatsAppClick={handleWhatsAppClick}
        />
      </div>
    </section>
  );
}