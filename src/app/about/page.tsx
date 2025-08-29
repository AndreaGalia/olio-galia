"use client";
import { useT } from '@/hooks/useT';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [activeBrother, setActiveBrother] = useState(0);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useT();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Costruzione dinamica dei dati dai file di traduzione
  const brothers = t.aboutPage.brothers.profiles.map((profile, index) => ({
    id: index + 1,
    name: profile.name,
    role: profile.role,
    age: profile.age,
    description: profile.description,
    speciality: profile.speciality,
    photo: `/${profile.name.toLowerCase().replace(' ', '-')}.jpg`,
    quote: profile.quote,
    details: profile.details,
    achievements: profile.achievements
  }));

  const timeline = t.aboutPage.timeline.events;

  const values = t.aboutPage.values.items.map((item, index) => {
    const colors = ['olive', 'salvia', 'nocciola', 'salvia'];
    const icons = [
      (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
      ),
      (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      )
    ];

    return {
      icon: icons[index],
      title: item.title,
      description: item.description,
      color: colors[index]
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige via-sabbia to-beige">
      
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Sfondo decorativo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-8 w-32 h-32 rounded-full bg-olive animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-salvia animate-bounce-slow"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-nocciola animate-float"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center">
            <div className={`inline-flex items-center gap-3 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6 ${isVisible ? 'slide-in-up' : ''}`}>
              <div className="w-2 h-2 bg-olive rounded-full animate-pulse"></div>
              {t.aboutPage.hero.badge}
            </div>
            
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-serif text-olive mb-6 leading-tight ${isVisible ? 'slide-in-up' : ''}`} style={{animationDelay: '0.1s'}}>
              {t.aboutPage.hero.title.main}
              <span className="block italic text-salvia text-3xl sm:text-4xl lg:text-5xl mt-2">
                {t.aboutPage.hero.title.subtitle}
              </span>
            </h1>
            
            <p className={`text-xl text-nocciola max-w-4xl mx-auto leading-relaxed ${isVisible ? 'slide-in-up' : ''}`} style={{animationDelay: '0.2s'}}>
              {t.aboutPage.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Storia */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-serif text-olive text-center mb-12">
            {t.aboutPage.timeline.title}
          </h2>

          {/* Timeline Desktop */}
          <div className="hidden md:block relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-olive via-salvia to-olive"></div>
            
            {timeline.map((item, index) => (
              <div 
                key={index} 
                className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                onMouseEnter={() => setActiveTimeline(index)}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${activeTimeline === index ? 'ring-2 ring-olive/30' : ''}`}>
                    <div className="text-2xl font-serif text-salvia mb-2">{item.year}</div>
                    <h3 className="text-xl font-serif text-olive mb-3">{item.title}</h3>
                    <p className="text-nocciola text-sm leading-relaxed mb-3">{item.description}</p>
                    <p className="text-xs text-nocciola/70 italic">{item.details}</p>
                  </div>
                </div>
                
                {/* Punto centrale */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-olive rounded-full border-4 border-beige shadow-lg z-10">
                  <div className="w-full h-full bg-gradient-to-br from-olive to-salvia rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Mobile */}
          <div className="md:hidden space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="relative pl-8">
                <div className="absolute left-2 top-2 w-3 h-3 bg-olive rounded-full"></div>
                <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-olive/30"></div>
                
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="text-xl font-serif text-salvia mb-1">{item.year}</div>
                  <h3 className="text-lg font-serif text-olive mb-2">{item.title}</h3>
                  <p className="text-nocciola text-sm leading-relaxed mb-2">{item.description}</p>
                  <p className="text-xs text-nocciola/70 italic">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* I Tre Fratelli */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-olive/5 to-salvia/5">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-serif text-olive text-center mb-4">
            {t.aboutPage.brothers.title}
          </h2>
          <p className="text-lg text-nocciola text-center mb-12 max-w-3xl mx-auto">
            {t.aboutPage.brothers.subtitle}
          </p>

          {/* Selector Mobile */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="flex bg-white rounded-full p-2 shadow-lg">
              {brothers.map((brother, index) => (
                <button
                  key={brother.id}
                  onClick={() => setActiveBrother(index)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeBrother === index 
                      ? 'bg-olive text-beige shadow-md' 
                      : 'text-nocciola hover:text-olive'
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
              <div 
                key={brother.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group"
              >
                {/* Foto placeholder */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-olive/20 to-salvia/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-16 h-16 text-olive/60" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs text-center text-nocciola/60 italic">
                    Foto: {brother.photo}
                  </p>
                  
                  {/* Badge età */}
                  <div className="absolute -top-2 -right-2 bg-salvia text-beige px-2 py-1 rounded-full text-xs font-bold shadow-md">
                    {brother.age}
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="text-xl font-serif text-olive group-hover:text-salvia transition-colors duration-300">
                    {brother.name}
                  </h3>
                  
                  <div className="text-sm font-medium text-salvia bg-salvia/10 px-3 py-1 rounded-full inline-block">
                    {brother.role}
                  </div>
                  
                  <p className="text-sm text-nocciola leading-relaxed">
                    {brother.description}
                  </p>
                  
                  <div className="text-xs text-nocciola/80 italic border-t border-olive/10 pt-3">
                    {brother.speciality}
                  </div>
                  
                  <p className="text-xs text-nocciola leading-relaxed">
                    {brother.details}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-olive">{t.aboutPage.brothers.achievements}</div>
                    {brother.achievements.map((achievement, i) => (
                      <div key={i} className="text-xs text-nocciola bg-olive/5 px-2 py-1 rounded">
                        {achievement}
                      </div>
                    ))}
                  </div>
                  
                  <blockquote className="text-sm text-olive italic bg-olive/5 p-3 rounded-lg border-l-4 border-olive">
                    "{brother.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile - Singolo fratello */}
          <div className="lg:hidden">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center space-y-4">
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-olive/20 to-salvia/20 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-olive/60" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs text-center text-nocciola/60 italic mt-2">
                    Foto: {brothers[activeBrother].photo}
                  </p>
                  
                  <div className="absolute -top-2 -right-2 bg-salvia text-beige px-2 py-1 rounded-full text-xs font-bold shadow-md">
                    {brothers[activeBrother].age}
                  </div>
                </div>

                <h3 className="text-2xl font-serif text-olive">
                  {brothers[activeBrother].name}
                </h3>
                
                <div className="text-sm font-medium text-salvia bg-salvia/10 px-3 py-1 rounded-full inline-block">
                  {brothers[activeBrother].role}
                </div>
                
                <p className="text-sm text-nocciola leading-relaxed">
                  {brothers[activeBrother].description}
                </p>
                
                <div className="text-xs text-nocciola/80 italic border-t border-olive/10 pt-3">
                  {brothers[activeBrother].speciality}
                </div>
                
                <p className="text-xs text-nocciola leading-relaxed">
                  {brothers[activeBrother].details}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-olive">{t.aboutPage.brothers.achievements}</div>
                  <div className="grid grid-cols-1 gap-1">
                    {brothers[activeBrother].achievements.map((achievement, i) => (
                      <div key={i} className="text-xs text-nocciola bg-olive/5 px-2 py-1 rounded">
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>
                
                <blockquote className="text-sm text-olive italic bg-olive/5 p-4 rounded-lg border-l-4 border-olive">
                  "{brothers[activeBrother].quote}"
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* I Nostri Valori */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-serif text-olive text-center mb-4">
            {t.aboutPage.values.title}
          </h2>
          <p className="text-lg text-nocciola text-center mb-12 max-w-3xl mx-auto">
            {t.aboutPage.values.subtitle}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="text-center space-y-4 group hover:scale-105 transition-transform duration-300"
              >
                <div className={`w-16 h-16 bg-${value.color}/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`text-${value.color}`}>
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-lg font-serif text-olive group-hover:text-salvia transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-sm text-nocciola leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistiche Aziendali */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-olive/10 to-salvia/10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-serif text-olive font-bold">30</div>
              <div className="text-sm text-nocciola font-medium">{t.aboutPage.stats.hectares}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-serif text-olive font-bold">3000</div>
              <div className="text-sm text-nocciola font-medium">{t.aboutPage.stats.plants}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-serif text-olive font-bold">15k</div>
              <div className="text-sm text-nocciola font-medium">{t.aboutPage.stats.liters}</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-serif text-olive font-bold">12</div>
              <div className="text-sm text-nocciola font-medium">{t.aboutPage.stats.countries}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-olive mb-6">
            {t.aboutPage.cta.title}
          </h2>
          <p className="text-lg text-nocciola mb-8 max-w-2xl mx-auto">
            {t.aboutPage.cta.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={"/products"}
              className="bg-gradient-to-r from-olive to-salvia text-beige px-8 py-4 rounded-full text-lg font-medium hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3">
                {t.aboutPage.cta.catalog}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </Link>
            
            <button className="border-2 border-olive text-olive px-8 py-4 rounded-full text-lg font-medium hover:bg-olive hover:text-beige transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3">
              {t.aboutPage.cta.contact}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .slide-in-up { 
          animation: slideInUp 0.8s ease-out forwards; 
          opacity: 0; 
        }
        .animate-float { 
          animation: float 4s ease-in-out infinite; 
        }
        .animate-bounce-slow { 
          animation: bounceSlow 3s ease-in-out infinite; 
        }
        
        /* Colori personalizzati per Tailwind */
        .text-olive { color: #556B2F; }
        .text-salvia { color: #789262; }
        .text-sabbia { color: #D6C7A1; }
        .text-beige { color: #ECE8DF; }
        .text-nocciola { color: #B2A98C; }
        
        .bg-olive { background-color: #556B2F; }
        .bg-salvia { background-color: #789262; }
        .bg-sabbia { background-color: #D6C7A1; }
        .bg-beige { background-color: #ECE8DF; }
        .bg-nocciola { background-color: #B2A98C; }
        
        .bg-olive\/5 { background-color: rgba(85, 107, 47, 0.05); }
        .bg-olive\/10 { background-color: rgba(85, 107, 47, 0.1); }
        .bg-olive\/20 { background-color: rgba(85, 107, 47, 0.2); }
        .bg-salvia\/5 { background-color: rgba(120, 146, 98, 0.05); }
        .bg-salvia\/10 { background-color: rgba(120, 146, 98, 0.1); }
        .bg-salvia\/20 { background-color: rgba(120, 146, 98, 0.2); }
        .bg-nocciola\/20 { background-color: rgba(178, 169, 140, 0.2); }
        
        .border-olive { border-color: #556B2F; }
        .border-olive\/10 { border-color: rgba(85, 107, 47, 0.1); }
        .border-olive\/30 { border-color: rgba(85, 107, 47, 0.3); }
        
        .ring-olive\/30 { --tw-ring-color: rgba(85, 107, 47, 0.3); }
        
        .from-olive { --tw-gradient-from: #556B2F; }
        .to-salvia { --tw-gradient-to: #789262; }
        .via-salvia { --tw-gradient-via: #789262; }
        .from-olive\/5 { --tw-gradient-from: rgba(85, 107, 47, 0.05); }
        .to-salvia\/5 { --tw-gradient-to: rgba(120, 146, 98, 0.05); }
        .from-olive\/10 { --tw-gradient-from: rgba(85, 107, 47, 0.1); }
        .to-salvia\/10 { --tw-gradient-to: rgba(120, 146, 98, 0.1); }
        .from-beige { --tw-gradient-from: #ECE8DF; }
        .via-sabbia { --tw-gradient-via: #D6C7A1; }
        .to-beige { --tw-gradient-to: #ECE8DF; }
        
        .hover\:text-olive:hover { color: #556B2F; }
        .hover\:text-salvia:hover { color: #789262; }
        .hover\:bg-olive:hover { background-color: #556B2F; }
        .hover\:bg-beige:hover { background-color: #ECE8DF; }
        
        .font-serif { font-family: "Cormorant Garamond", serif; }
        
        @media (prefers-reduced-motion: reduce) {
          * { 
            animation-duration: 0.01ms !important; 
            animation-iteration-count: 1 !important; 
          }
        }
      `}</style>
    </div>
  );
}