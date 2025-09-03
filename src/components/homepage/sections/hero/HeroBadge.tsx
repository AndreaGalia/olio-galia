// components/sections/hero/HeroBadge.tsx
"use client";
import { useT } from '@/hooks/useT';

interface HeroBadgeProps {
  isVisible: boolean;
}

export function HeroBadge({ isVisible }: HeroBadgeProps) {
  const { t } = useT();

  return (
    <div className={`inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-olive/20 via-salvia/10 to-olive/20 backdrop-blur-md text-olive px-3 py-2 md:px-4 md:py-3 rounded-full text-xs md:text-sm font-medium shadow-xl border border-olive/30 hover:scale-105 transition-all duration-300 ${isVisible ? 'slide-in-left' : ''}`}>
      <div className="relative">
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gradient-to-r from-olive to-salvia rounded-full animate-pulse" />
        <div className="absolute inset-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-gradient-to-r from-olive to-salvia rounded-full animate-ping opacity-30" />
      </div>
      <span>{t.hero.badge}</span>
      <div className="w-1 h-4 md:h-6 bg-gradient-to-b from-olive to-transparent rounded" />
    </div>
  );
}