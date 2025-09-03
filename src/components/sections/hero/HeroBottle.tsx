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
      {/* Effetti di sfondo dinamici */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-olive/5 via-salvia/10 to-olive/5 rounded-full animate-spin-very-slow" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 border-2 border-olive/20 rounded-full animate-pulse-slow" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] border border-salvia/10 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
      </div>

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
          
          {/* Particelle magiche */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-olive to-salvia rounded-full opacity-0 group-hover:opacity-100 animate-sparkle"
              style={{
                top: `${25 + i * 8}%`,
                left: `${15 + (i % 2) * 70}%`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Elementi floating decorativi */}
      <div className="absolute top-8 md:top-12 right-6 md:right-8 animate-float-complex">
        <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-olive to-salvia rounded-full shadow-lg" />
      </div>
      <div className="absolute bottom-12 md:bottom-16 left-6 md:left-8 animate-float-complex" style={{animationDelay: '1s'}}>
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gradient-to-br from-salvia to-nocciola rounded-full shadow-lg" />
      </div>
      <div className="absolute top-1/3 -right-2 md:-right-4 animate-bounce-gentle" style={{animationDelay: '0.5s'}}>
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-olive/60 rounded-full" />
      </div>
    </>
  );
}