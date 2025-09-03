// components/sections/hero/HeroTitle.tsx
"use client";
import { useT } from '@/hooks/useT';

interface HeroTitleProps {
  isVisible: boolean;
}

export function HeroTitle({ isVisible }: HeroTitleProps) {
  const { t } = useT();

  return (
    <div className="space-y-1 md:space-y-2">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif leading-[0.9] text-olive relative">
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
          <span className={`block italic relative ${isVisible ? 'slide-up' : ''}`} style={{animationDelay: '0.3s'}}>
            <span className="text-transparent bg-gradient-to-r from-salvia via-olive via-salvia to-olive bg-clip-text animate-gradient-x">
              {t.hero.title.line3}
            </span>
            <div className="absolute -bottom-1 md:-bottom-2 left-1/2 lg:left-0 transform -translate-x-1/2 lg:translate-x-0 h-1 bg-gradient-to-r from-olive via-salvia to-olive rounded expand-line-gradient" />
          </span>
        </div>
      </h1>
    </div>
  );
}