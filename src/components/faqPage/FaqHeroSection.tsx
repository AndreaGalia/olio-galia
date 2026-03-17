"use client";

import { useT } from '@/hooks/useT';

export default function FaqHeroSection() {
  const { t } = useT();

  return (
    <section className="bg-homepage-bg pt-10 pb-6 sm:pt-12 sm:pb-8 lg:pt-16 lg:pb-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-black leading-tight">
          {t.faq.title.line1} {t.faq.title.line2}
        </h1>

      </div>
    </section>
  );
}
