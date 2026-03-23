// components/sections/hero/HeroStats.tsx
"use client";
import { useT } from '@/hooks/useT';
import { JustifiedWord } from '@/components/ui/JustifiedWord';

interface HeroStatsProps {
  isVisible: boolean;
}

export function HeroStats({ isVisible }: HeroStatsProps) {
  const { t } = useT();

  return (
    <div
      className={`w-full pt-3 md:pt-5 border-t border-sabbia-chiaro/20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: '0.8s' }}
    >
      <div className="max-w-[160px] mx-auto space-y-1">
        <JustifiedWord text={t.hero.stats.line1} className="btn-outline font-serif text-beige" />
        <JustifiedWord text={t.hero.stats.line2} className="btn-outline font-serif text-beige" />
      </div>
    </div>
  );
}
