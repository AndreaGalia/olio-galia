// components/sections/hero/HeroStats.tsx
"use client";
import { useT } from '@/hooks/useT';

interface HeroStatsProps {
  isVisible: boolean;
}

export function HeroStats({ isVisible }: HeroStatsProps) {
  const { t } = useT();

  return (
    <div className={`grid grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-olive/20 ${isVisible ? 'fade-in-up' : ''}`} style={{animationDelay: '0.6s'}}>
      <div className="text-center">
        <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-1 md:mb-2 text-olive">100%</div>
        <div className="text-xs md:text-sm text-nocciola font-medium">{t.hero.stats.natural}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-1 md:mb-2 text-olive">1950</div>
        <div className="text-xs md:text-sm text-nocciola font-medium">{t.hero.stats.since}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-1 md:mb-2 text-olive">3°</div>
        <div className="text-xs md:text-sm text-nocciola font-medium">{t.hero.stats.generation}</div>
      </div>
    </div>
  );
}