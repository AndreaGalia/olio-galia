// components/sections/hero/HeroBottle.tsx
"use client";
import { useT } from '@/hooks/useT';

interface HeroBottleProps {
  isVisible: boolean;
}

export function HeroBottle({ isVisible }: HeroBottleProps) {
  const { t } = useT();

  return (
    <>
      {/* Bottiglia principale */}
      <div className="relative z-20 group">
        <div className="relative">
          <img
            src="/bottle-oil.png"
            alt={`${t.hero.title.line3} Bottle`}
            className={`w-56 sm:w-64 md:w-80 lg:w-96 xl:w-[480px] drop-shadow-2xl group-hover:scale-110 transition-all duration-700 ease-out ${isVisible ? 'fade-in-scale' : ''}`}
          />

          {/* Riflesso dinamico */}
          <div className="absolute top-1/4 left-1/3 w-4 h-20 md:w-6 md:h-32 bg-gradient-to-b from-white/50 via-white/30 to-transparent rounded-full blur-sm animate-shimmer" />
        </div>
      </div>
    </>
  );
}