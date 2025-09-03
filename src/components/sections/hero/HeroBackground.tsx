// components/sections/hero/HeroBackground.tsx
"use client";

interface HeroBackgroundProps {
  mousePosition: { x: number; y: number };
}

export function HeroBackground({ mousePosition }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0">
      {/* Gradiente dinamico che segue il mouse */}
      <div 
        className="absolute inset-0 opacity-30 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)`
        }}
      />
      
      {/* Particelle fluttuanti */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-olive/20 rounded-full animate-float"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
      </div>

      {/* Forme geometriche animate */}
      <div className="absolute top-20 left-16 w-24 h-24 md:w-32 md:h-32 bg-olive/5 rounded-full animate-pulse-slow" />
      <div className="absolute bottom-32 right-20 w-20 h-20 md:w-24 md:h-24 bg-salvia/8 rounded-full animate-bounce-slow" />
      <div className="absolute top-1/2 left-1/4 w-12 h-12 md:w-16 md:h-16 bg-nocciola/6 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
      
      {/* Pattern SVG dinamico */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="oliveBranch" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M20,50 Q30,30 40,50 Q50,70 60,50" stroke="currentColor" strokeWidth="1" fill="none" className="text-olive animate-draw" />
            <circle cx="25" cy="45" r="2" fill="currentColor" className="text-salvia animate-pulse" />
            <circle cx="35" cy="55" r="1.5" fill="currentColor" className="text-nocciola animate-pulse" style={{animationDelay: '0.5s'}} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#oliveBranch)" />
      </svg>
    </div>
  );
}