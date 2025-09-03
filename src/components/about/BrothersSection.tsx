// components/about/BrothersSection.tsx
"use client";
import { useState } from 'react';
import { BrothersSectionProps } from '@/types/about';
import styles from '../../styles/AboutPage.module.css';
import BrotherCard from './BrotherCard';

export default function BrothersSection({ 
  brothers, 
  title, 
  subtitle, 
  achievements, 
  variant = "full" 
}: BrothersSectionProps) {
  const [activeBrother, setActiveBrother] = useState<number>(0);

  return (
    <div className={`${variant === "full" ? "py-16 sm:py-20" : "mb-12"}`}>
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <h2 className={`${variant === "full" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"} ${styles.fontSerif} ${styles.textOlive} text-center mb-4`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-lg ${styles.textNocciola} text-center mb-12 max-w-3xl mx-auto`}>
            {subtitle}
          </p>
        )}

        {/* Selector Mobile */}
        <div className="flex justify-center mb-8 lg:hidden">
          <div className="flex bg-white rounded-full p-2 shadow-lg">
            {brothers.map((brother, index) => (
              <button
                key={brother.id}
                onClick={() => setActiveBrother(index)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeBrother === index 
                    ? `${styles.bgOlive} ${styles.textBeige} shadow-md` 
                    : `${styles.textNocciola} ${styles.hoverTextOlive}`
                }`}
              >
                {brother.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop - Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {brothers.map((brother, index) => (
            <BrotherCard 
              key={brother.id}
              brother={brother}
              achievements={achievements}
              variant={variant}
            />
          ))}
        </div>

        {/* Mobile - Singolo fratello */}
        <div className="lg:hidden">
          <BrotherCard 
            brother={brothers[activeBrother]}
            achievements={achievements}
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
}