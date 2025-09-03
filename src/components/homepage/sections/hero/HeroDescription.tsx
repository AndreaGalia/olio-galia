// components/sections/hero/HeroDescription.tsx
"use client";
import { useT } from '@/hooks/useT';

interface HeroDescriptionProps {
  isVisible: boolean;
}

export function HeroDescription({ isVisible }: HeroDescriptionProps) {
  const { t } = useT();

  return (
    <div className={`space-y-3 md:space-y-4 max-w-2xl mx-auto lg:mx-0 ${isVisible ? 'fade-in-up' : ''}`} style={{animationDelay: '0.4s'}}>
      <p className="text-lg sm:text-xl md:text-2xl text-nocciola leading-relaxed font-light">
        {t.hero.description.main}
      </p>
      <p className="text-base md:text-lg text-nocciola/80 leading-relaxed">
        {t.hero.description.secondary}
      </p>
    </div>
  );
}