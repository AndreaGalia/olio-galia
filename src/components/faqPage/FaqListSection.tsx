"use client";

import { useState, useEffect } from 'react';
import { FAQ, FAQDocument } from '@/types/faq';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import FaqCategoryFilter from './FaqCategoryFilter';
import FaqList from './FaqList';
import FaqContactCta from './FaqContactCta';

export default function FaqListSection() {
  const { t } = useT();
  const { locale } = useLocale();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const getFallbackFaqs = (): FAQ[] =>
    t.faq.questions.map((q, i) => ({
      id: i + 1,
      question: q.question,
      answer: q.answer,
      category: t.faq.categories[q.category as keyof typeof t.faq.categories],
    }));

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/faqs?locale=${locale}`);
        const data = await response.json();

        if (data.success && data.faqs.length > 0) {
          const transformed: FAQ[] = data.faqs.map((doc: FAQDocument, i: number) => ({
            id: i + 1,
            question: doc.translations[locale].question,
            answer: doc.translations[locale].answer,
            category: doc.translations[locale].category,
          }));
          setFaqs(transformed);
        } else {
          setFaqs(getFallbackFaqs());
        }
      } catch {
        setFaqs(getFallbackFaqs());
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [locale]);

  const categories = [...new Set(faqs.map((f) => f.category))];

  const filteredFaqs = activeCategory
    ? faqs.filter((f) => f.category === activeCategory)
    : faqs;

  const handleToggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const handleCategorySelect = (category: string | null) => {
    setActiveCategory(category);
    setActiveIndex(null);
  };

  return (
    <section className="pb-16 sm:pb-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4" />
            <p className="text-black">{t.faq.loading}</p>
          </div>
        ) : (
          <>
            <FaqCategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              allLabel={t.faqPage.filter.all}
              onSelect={handleCategorySelect}
            />
            <FaqList
              faqs={filteredFaqs}
              activeIndex={activeIndex}
              noFaqLabel={t.faq.noFAQ}
              onToggle={handleToggle}
            />
          </>
        )}

        <FaqContactCta
          title={t.faqPage.contactCta.title}
          button={t.faqPage.contactCta.button}
        />

      </div>
    </section>
  );
}
