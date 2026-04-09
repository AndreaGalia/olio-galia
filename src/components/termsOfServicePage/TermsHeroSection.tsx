"use client";

import { useT } from '@/hooks/useT';

export default function TermsHeroSection() {
  const { t } = useT();

  return (
    <section className="bg-sabbia-chiaro pt-16 pb-8 lg:pt-24 lg:pb-12">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-4">
          {t.termsOfService.subtitle}
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: '1.1', letterSpacing: '0.15em' }}>
          {t.termsOfService.title}
        </h1>
        <p className="mt-5 text-sm text-black/60 leading-relaxed max-w-xl">
          {t.termsOfService.lastUpdate}
        </p>
      </div>
    </section>
  );
}
