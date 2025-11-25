// components/sections/hero/HeroButtons.tsx
"use client";
import Link from 'next/link';
import { useT } from '@/hooks/useT';

interface HeroButtonsProps {
  isVisible: boolean;
}

export function HeroButtons({ isVisible }: HeroButtonsProps) {
  const { t } = useT();

  return (
    <div className={`flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start ${isVisible ? 'fade-in-up' : ''}`} style={{animationDelay: '0.5s'}}>
      <Link 
        href="/products"
        className="group relative bg-gradient-to-r from-olive via-salvia to-olive bg-size-200 bg-pos-0 hover:bg-pos-100 text-beige px-6 py-3 md:px-8 md:py-4 rounded-full font-medium transition-all duration-500 hover:shadow-2xl hover:scale-110 flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg overflow-hidden"
      >  
        <span className="relative z-10">{t.hero.buttons.discover}</span>
        <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 relative z-10" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-r from-salvia via-nocciola to-olive opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Link>

    </div>
  );
}