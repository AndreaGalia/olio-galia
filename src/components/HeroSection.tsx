"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '@/hooks/useT';

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useT();

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
    <section className="relative bg-gradient-to-br from-sabbia to-beige min-h-[60vh] md:min-h-[70vh] lg:min-h-[85vh] xl:min-h-screen flex items-center overflow-hidden py-8 md:py-12 lg:py-16">
      {/* Sfondo dinamico parallax */}
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

        {/* Forme geometriche animate - ridotte su schermi medi */}
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

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* Contenuto testuale ottimizzato */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
            
            {/* Badge premium con effetti */}
            <div className={`inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-olive/20 via-salvia/10 to-olive/20 backdrop-blur-md text-olive px-3 py-2 md:px-4 md:py-3 rounded-full text-xs md:text-sm font-medium shadow-xl border border-olive/30 hover:scale-105 transition-all duration-300 ${isVisible ? 'slide-in-left' : ''}`}>
              <div className="relative">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gradient-to-r from-olive to-salvia rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-gradient-to-r from-olive to-salvia rounded-full animate-ping opacity-30" />
              </div>
              <span>{t.hero.badge}</span>
              <div className="w-1 h-4 md:h-6 bg-gradient-to-b from-olive to-transparent rounded" />
            </div>

            {/* Titolo con dimensioni responsive ottimizzate */}
            <div className="space-y-1 md:space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif leading-[0.9] text-olive relative">
                <div className="overflow-hidden">
                  <span className={`block ${isVisible ? 'slide-up' : ''}`} style={{animationDelay: '0.1s'}}>
                    <span className="relative">
                      {t.hero.title.line1}
                      <div className="absolute -inset-2 bg-gradient-to-r from-olive/10 to-transparent rounded-lg blur-xl -z-10" />
                    </span>
                  </span>
                </div>
                <div className="overflow-hidden">
                  <span className={`block ${isVisible ? 'slide-up' : ''}`} style={{animationDelay: '0.2s'}}>
                    <span className="relative hover:text-salvia transition-colors duration-500">
                      {t.hero.title.line2}
                    </span>
                  </span>
                </div>
                <div className="overflow-hidden">
                  <span className={`block italic relative ${isVisible ? 'slide-up' : ''}`} style={{animationDelay: '0.3s'}}>
                    <span className="text-transparent bg-gradient-to-r from-salvia via-olive via-salvia to-olive bg-clip-text animate-gradient-x">
                      {t.hero.title.line3}
                    </span>
                    <div className="absolute -bottom-1 md:-bottom-2 left-1/2 lg:left-0 transform -translate-x-1/2 lg:translate-x-0 h-1 bg-gradient-to-r from-olive via-salvia to-olive rounded expand-line-gradient" />
                  </span>
                </div>
              </h1>
            </div>

            {/* Descrizione ottimizzata */}
            <div className={`space-y-3 md:space-y-4 max-w-2xl mx-auto lg:mx-0 ${isVisible ? 'fade-in-up' : ''}`} style={{animationDelay: '0.4s'}}>
              <p className="text-lg sm:text-xl md:text-2xl text-nocciola leading-relaxed font-light">
                {t.hero.description.main}
              </p>
              <p className="text-base md:text-lg text-nocciola/80 leading-relaxed">
                {t.hero.description.secondary}
              </p>
            </div>

            {/* CTA buttons ottimizzati per dimensioni */}
            <div className={`flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start ${isVisible ? 'fade-in-up' : ''}`} style={{animationDelay: '0.5s'}}>
              <Link href="/products"
                className="group relative bg-gradient-to-r from-olive via-salvia to-olive bg-size-200 bg-pos-0 hover:bg-pos-100 text-beige px-6 py-3 md:px-8 md:py-4 rounded-full font-medium transition-all duration-500 hover:shadow-2xl hover:scale-110 flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg overflow-hidden">  
                <span className="relative z-10">{t.hero.buttons.discover}</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-salvia via-nocciola to-olive opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Link>
              
              <button className="group relative text-olive border-2 border-olive px-6 py-3 md:px-8 md:py-4 rounded-full font-medium hover:bg-olive hover:text-beige transition-all duration-500 flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg backdrop-blur-sm hover:shadow-xl hover:scale-105 overflow-hidden">
                <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>{t.hero.buttons.watch}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-olive/10 to-salvia/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {/* Statistiche ottimizzate */}
            <div className={`grid grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-olive/20 ${isVisible ? 'fade-in-up' : ''}`} style={{animationDelay: '0.6s'}}>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-1 md:mb-2 text-olive">100%</div>
                <div className="text-xs md:text-sm text-nocciola font-medium">{t.hero.stats.natural}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-1 md:mb-2 text-olive">1950</div>
                <div className="text-xs md:text-sm text-nocciola font-medium">{t.hero.stats.since}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-1 md:mb-2 text-olive">3°</div>
                <div className="text-xs md:text-sm text-nocciola font-medium">{t.hero.stats.generation}</div>
              </div>
            </div>
          </div>

          {/* Sezione bottiglia ridimensionata */}
          <div className="relative flex justify-center order-1 lg:order-2 py-4 md:py-6 lg:py-8">
            
            {/* Effetti di sfondo dinamici ridotti */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-olive/5 via-salvia/10 to-olive/5 rounded-full animate-spin-very-slow" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 border-2 border-olive/20 rounded-full animate-pulse-slow" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] border border-salvia/10 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
            </div>

            {/* Bottiglia ridimensionata responsivamente */}
            <div className="relative z-20 group">
              <div className="relative">
                <img
                  src="/bottle-oil.png"
                  alt={`${t.hero.title.line3} Bottle`}
                  className={`w-56 sm:w-64 md:w-80 lg:w-96 xl:w-[480px] drop-shadow-2xl group-hover:scale-110 transition-all duration-700 ease-out ${isVisible ? 'fade-in-scale' : ''}`}
                />
                
                {/* Riflesso dinamico */}
                <div className="absolute top-1/4 left-1/3 w-4 h-20 md:w-6 md:h-32 bg-gradient-to-b from-white/50 via-white/30 to-transparent rounded-full blur-sm animate-shimmer" />
                
                {/* Particelle magiche ridotte */}
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

            {/* Elementi floating ridotti */}
            <div className="absolute top-8 md:top-12 right-6 md:right-8 animate-float-complex">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-olive to-salvia rounded-full shadow-lg" />
            </div>
            <div className="absolute bottom-12 md:bottom-16 left-6 md:left-8 animate-float-complex" style={{animationDelay: '1s'}}>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gradient-to-br from-salvia to-nocciola rounded-full shadow-lg" />
            </div>
            <div className="absolute top-1/3 -right-2 md:-right-4 animate-bounce-gentle" style={{animationDelay: '0.5s'}}>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-olive/60 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fadeInBounce {
          0% { opacity: 0; transform: scale(0.3) rotate(12deg); }
          50% { transform: scale(1.1) rotate(12deg); }
          100% { opacity: 1; transform: scale(1) rotate(12deg); }
        }
        
        @keyframes expandLineGradient {
          from { width: 0; }
          to { width: 6rem; }
        }
        
        @keyframes gradientX {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(5deg); }
          75% { transform: translateY(-5px) rotate(-5deg); }
        }
        
        @keyframes floatComplex {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(-15px) translateX(5px) scale(1.1); }
          50% { transform: translateY(-8px) translateX(-3px) scale(0.95); }
          75% { transform: translateY(-12px) translateX(2px) scale(1.05); }
        }
        
        @keyframes bounceGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes spinVerySlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { opacity: 0.5; transform: translateX(-5px); }
          50% { opacity: 1; transform: translateX(0px); }
          100% { opacity: 0.5; transform: translateX(5px); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: translateY(0px) scale(0); }
          50% { opacity: 1; transform: translateY(-10px) scale(1); }
        }
        
        @keyframes scrollIndicator {
          0% { opacity: 0; transform: translateY(-8px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(8px); }
        }
        
        @keyframes draw {
          from { stroke-dasharray: 100; stroke-dashoffset: 100; }
          to { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        
        .slide-in-left { animation: slideInLeft 0.8s ease-out forwards; }
        .slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; }
        .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
        .fade-in-scale { animation: fadeInScale 1s ease-out forwards; opacity: 0; }
        .fade-in-bounce { animation: fadeInBounce 1s ease-out forwards; opacity: 0; }
        .expand-line-gradient { animation: expandLineGradient 1.2s ease-out 0.8s forwards; width: 0; }
        .animate-gradient-x { animation: gradientX 3s ease infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-complex { animation: floatComplex 5s ease-in-out infinite; }
        .animate-bounce-gentle { animation: bounceGentle 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounceSlow 3s ease-in-out infinite; }
        .animate-spin-very-slow { animation: spinVerySlow 30s linear infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .animate-scroll-indicator { animation: scrollIndicator 2s infinite; }
        .animate-draw { animation: draw 3s ease-in-out infinite; }
        
        .bg-size-200 { background-size: 200% 100%; }
        .bg-pos-0 { background-position: 0% 0%; }
        .bg-pos-100 { background-position: 100% 0%; }
        
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
    </section>
  );
}