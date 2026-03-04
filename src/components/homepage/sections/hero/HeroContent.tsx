// components/sections/hero/HeroContent.tsx
"use client";
import Link from 'next/link';
import { useT } from '@/hooks/useT';
import { JustifiedWord } from '@/components/ui/JustifiedWord';

interface HeroContentProps {
  isVisible: boolean;
}

export function HeroContent({ isVisible }: HeroContentProps) {
  const { t } = useT();

  return (
    <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 px-4 sm:px-6 w-full max-w-3xl mx-auto">

      {/* Title */}
      <div
        className={`w-full pb-6 font-serif text-sabbia-chiaro space-y-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0.1s' }}
      >
        <JustifiedWord text={t.hero.title.line1} className="text-base sm:text-2xl md:text-3xl lg:text-4xl" />
        <JustifiedWord text={t.hero.title.line2} className="text-base sm:text-2xl md:text-3xl lg:text-4xl" />
        {t.hero.title.line3 && (
          <JustifiedWord text={t.hero.title.line3} className="text-base sm:text-2xl md:text-3xl lg:text-4xl" />
        )}
      </div>

      {/* Description - Hidden if empty */}
      {(t.hero.description.main || t.hero.description.secondary) && (
        <div className={`space-y-3 md:space-y-4 w-full transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '0.4s' }}>
          {t.hero.description.main && (
            <p className="text-lg sm:text-xl md:text-2xl text-beige/90 leading-relaxed font-light">
              {t.hero.description.main}
            </p>
          )}
          {t.hero.description.secondary && (
            <p className="text-base md:text-lg text-beige/70 leading-relaxed">
              {t.hero.description.secondary}
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0.4s' }}>
        <Link
          href="/products"
          className="btn-outline font-serif inline-block border border-sabbia-chiaro text-sabbia-chiaro bg-transparent px-4 py-1.5 uppercase tracking-wider transition-all duration-300 hover:bg-sabbia-chiaro hover:text-olive"
        >
          {t.hero.buttons.discover}
        </Link>
      </div>

    </div>
  );
}
