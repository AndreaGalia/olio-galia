"use client";

import { useT } from '@/hooks/useT';

export default function DoveTrovarciHero() {
  const { t } = useT();
  const d = t.doveTrovarciPage;

  return (
    <section className="bg-sabbia-chiaro pt-16 pb-8 lg:pt-24 lg:pb-12">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-4">
          {d.badge}
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: '1.1', letterSpacing: '0.15em' }}>
          {d.title.line1} {d.title.line2}
        </h1>
        <p className="garamond-13 mt-5 max-w-xl">
          {d.description}
        </p>
      </div>
    </section>
  );
}
