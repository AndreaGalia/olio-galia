// components/sections/hero/HeroContent.tsx
"use client";
import Link from 'next/link';
import { useT } from '@/hooks/useT';

interface HeroContentProps {
  isVisible: boolean;
}

export function HeroContent({ isVisible }: HeroContentProps) {
  const { t } = useT();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 px-4 sm:px-6">

      {/* Title - 2 righe su mobile */}
      <h1 className={`pb-6 font-serif leading-tight text-sabbia-chiaro max-w-3xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0.1s' }}>
        <span className="block mb-1 md:mb-2 text-lg sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap">
          {t.hero.title.line1}
        </span>
        <span className="block text-base sm:text-xl md:text-2xl lg:text-3xl">
          {t.hero.title.line2}
        </span>
        {t.hero.title.line3 && (
          <span className="block text-lg sm:text-3xl md:text-4xl lg:text-5xl">
            {t.hero.title.line3}
          </span>
        )}
      </h1>

      {/* Description - Hidden if empty */}
      {(t.hero.description.main || t.hero.description.secondary) && (
        <div className={`space-y-3 md:space-y-4 max-w-2xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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

      {/* CTA Button - Completamente quadrato */}
      <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: '0.4s' }}>
        <Link
          href="/products"
          className="inline-block bg-sabbia-chiaro/90 backdrop-blur-sm hover:bg-sabbia-chiaro text-olive px-6 py-3 md:px-8 md:py-4 font-medium transition-all duration-300 hover:shadow-xl hover:scale-105 text-xs md:text-sm uppercase tracking-wider"
        >
          {t.hero.buttons.discover}
        </Link>
      </div>

    </div>
  );
}
