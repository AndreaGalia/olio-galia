// components/sections/HeroSection.tsx
"use client";
import { useState, useEffect } from 'react';
import { HeroBackground } from './HeroBackground';
import { HeroBadge } from './HeroBadge';
import { HeroTitle } from './HeroTitle';
import { HeroDescription } from './HeroDescription';
import { HeroButtons } from './HeroButtons';
import { HeroStats } from './HeroStats';
import { HeroBottle } from './HeroBottle';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className={`${styles.heroSection} relative bg-gradient-to-br from-sabbia to-beige min-h-[60vh] md:min-h-[70vh] lg:min-h-[85vh] xl:min-h-screen flex items-center overflow-hidden py-8 md:py-12 lg:py-16`}>
      <HeroBackground mousePosition={mousePosition} />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* Contenuto testuale */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
            <HeroBadge isVisible={isVisible} />
            <HeroTitle isVisible={isVisible} />
            <HeroDescription isVisible={isVisible} />
            <HeroButtons isVisible={isVisible} />
            <HeroStats isVisible={isVisible} />
          </div>

          {/* Sezione bottiglia */}
          <div className="relative flex justify-center order-1 lg:order-2 py-4 md:py-6 lg:py-8">
            <HeroBottle isVisible={isVisible} />
          </div>
        </div>
      </div>
    </section>
  );
}