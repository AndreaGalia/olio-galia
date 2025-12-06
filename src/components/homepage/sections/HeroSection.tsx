// components/sections/HeroSection.tsx
"use client";
import { useState, useEffect } from 'react';
import { VideoBackground } from './hero/VideoBackground';
import { HeroContent } from './hero/HeroContent';
import { HeroStats } from './hero/HeroStats';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Video Background con overlay */}
      <VideoBackground videoUrl="/videos/uliveti_sicilia.mp4" />

      {/* Main Content - Centrato */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center min-h-screen">

          {/* Hero Content (Badge + Title + Description + Button) */}
          <HeroContent isVisible={isVisible} />

          {/* Stats Section */}
          <div className="w-full max-w-3xl mt-12 md:mt-16">
            <HeroStats isVisible={isVisible} />
          </div>

        </div>
      </div>

    </section>
  );
}