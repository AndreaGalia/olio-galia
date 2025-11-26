"use client";
import { useT } from '@/hooks/useT';
import { useState, useEffect } from 'react';
import { FAQ, FAQDocument } from '@/types/faq';
import BackgroundDecorations from './faq/BackgroundDecorations';
import FAQHeader from './faq/FAQHeader';
import CategoryPills from './faq/CategoryPills';
import FAQItem from './faq/FAQItem';
import ContactSection from './faq/ContactSection';
import { useLocale } from '@/contexts/LocaleContext';
import { openEmail, openPhone, openWhatsApp } from '@/utils/contactActions';

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useT();
  const { locale } = useLocale();

  // Carica FAQ da database
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/faqs?locale=${locale}`);
        const data = await response.json();

        if (data.success && data.faqs.length > 0) {
          // Trasforma FAQDocument in FAQ[]
          const transformedFaqs: FAQ[] = data.faqs.map((faqDoc: FAQDocument, index: number) => ({
            id: index + 1,
            question: faqDoc.translations[locale].question,
            answer: faqDoc.translations[locale].answer,
            category: faqDoc.translations[locale].category,
          }));
          setFaqs(transformedFaqs);
        } else {
          // Fallback alle FAQ statiche dai JSON se DB vuoto
          const fallbackFaqs: FAQ[] = t.faq.questions.map((faqData, index) => ({
            id: index + 1,
            question: faqData.question,
            answer: faqData.answer,
            category: t.faq.categories[faqData.category as keyof typeof t.faq.categories]
          }));
          setFaqs(fallbackFaqs);
        }
      } catch (error) {
        // Fallback alle FAQ statiche dai JSON in caso di errore
        const fallbackFaqs: FAQ[] = t.faq.questions.map((faqData, index) => ({
          id: index + 1,
          question: faqData.question,
          answer: faqData.answer,
          category: t.faq.categories[faqData.category as keyof typeof t.faq.categories]
        }));
        setFaqs(fallbackFaqs);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [locale, t.faq.categories, t.faq.questions]);

  // Estrazione delle categorie uniche
  const categories = [...new Set(faqs.map(faq => faq.category))];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleEmailClick = () => {
    openEmail(t.faq.contact.info.emailAddress);
  };

  const handlePhoneClick = () => {
    openPhone(t.faq.contact.info.phoneNumber);
  };

  const handleWhatsAppClick = () => {
    openWhatsApp(
      process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || t.faq.contact.info.whatsappNumber,
      t.contactPage.whatsappMessage
    );
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-olive">{t.faq.loading}</p>
          </div>
        )}

        {/* FAQ Items */}
        {!loading && (
          <div className="space-y-4 sm:space-y-6">
            {faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isActive={activeIndex === index}
                  onToggle={() => toggleFAQ(index)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-nocciola">
                <p>{t.faq.noFAQ}</p>
              </div>
            )}
          </div>
        )}

        <ContactSection
          contact={t.faq.contact}
          onEmailClick={handleEmailClick}
          onPhoneClick={handlePhoneClick}
          onWhatsAppClick={handleWhatsAppClick}
        />
      </div>
    </section>
  );
}