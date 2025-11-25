// components/sections/hero/HeroTitle.tsx
"use client";
import { useT } from '@/hooks/useT';

interface HeroTitleProps {
  isVisible: boolean;
}

export function HeroTitle({ isVisible }: HeroTitleProps) {
  const { t } = useT();

  return (
    <div className="space-y-2 md:space-y-3">
      <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-tight md:leading-[1.1] text-olive relative">
        <div className="overflow-hidden">
          <span className={`block ${isVisible ? 'slide-up' : ''}`} style={{animationDelay: '0.1s'}}>
            <span className="relative">
              {t.hero.title.line1}
              <div className="absolute -inset-2 bg-gradient-to-r from-olive/10 to-transparent rounded-lg blur-xl -z-10" />
            </span>
          </span>
        </div>
        <div className="overflow-hidden">
          <span className={`block ${isVisible ? 'slide-up' : ''}`} style={{animationDelay: '0.2s'}}>
            <span className="relative hover:text-salvia transition-colors duration-500">
              {t.hero.title.line2}
            </span>
          </span>
        </div>
        <div className="overflow-hidden">
          <span className={`block ${isVisible ? 'slide-up' : ''}`} style={{animationDelay: '0.3s'}}>
            <span className="relative hover:text-salvia transition-colors duration-500">
              {t.hero.title.line3}
            </span>
          </span>
        </div>
      </h1>
    </div>
  );
}