// components/sections/hero/HeroStats.tsx
"use client";
import { useT } from '@/hooks/useT';

interface HeroStatsProps {
  isVisible: boolean;
}

export function HeroStats({ isVisible }: HeroStatsProps) {
  const { t } = useT();

  return (
    <div className={`grid grid-cols-3 gap-3 md:gap-6 pt-3 md:pt-5 border-t border-sabbia-chiaro/20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: '0.8s' }}>
      <div className="text-center">
        <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-1 text-sabbia-chiaro">100%</div>
        <div className="text-xs text-sabbia-chiaro/70 font-medium uppercase tracking-wide">{t.hero.stats.natural}</div>
      </div>
      <div className="text-center">
        <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-1 text-sabbia-chiaro">1940</div>
        <div className="text-xs text-sabbia-chiaro/70 font-medium uppercase tracking-wide">{t.hero.stats.since}</div>
      </div>
      <div className="text-center">
        <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-1 text-sabbia-chiaro">3°</div>
        <div className="text-xs text-sabbia-chiaro/70 font-medium uppercase tracking-wide">{t.hero.stats.generation}</div>
      </div>
    </div>
  );
}