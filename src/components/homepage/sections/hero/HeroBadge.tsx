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
      </div>
      <span>{t.hero.badge}</span>
    </div>
  );
}