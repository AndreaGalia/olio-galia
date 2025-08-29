"use client";
import { useT } from '@/hooks/useT';
import { useState } from 'react';

export default function AboutSection() {
  const [activeBrother, setActiveBrother] = useState(0);
  const { t, translate } = useT();

  const brothers = [
    {
      id: 1,
      name: t.about.brothers.marco.name,
      role: t.about.brothers.marco.role,
      description: t.about.brothers.marco.description,
      speciality: t.about.brothers.marco.speciality,
      photo: "/marco-galia.jpg",
      quote: t.about.brothers.marco.quote
    },
    {
      id: 2,
      name: t.about.brothers.giuseppe.name,
      role: t.about.brothers.giuseppe.role,
      description: t.about.brothers.giuseppe.description,
      speciality: t.about.brothers.giuseppe.speciality,
      photo: "/giuseppe-galia.jpg",
      quote: t.about.brothers.giuseppe.quote
    },
    {
      id: 3,
      name: t.about.brothers.antonio.name,
      role: t.about.brothers.antonio.role,
      description: t.about.brothers.antonio.description,
      speciality: t.about.brothers.antonio.speciality,
      photo: "/antonio-galia.jpg",
      quote: t.about.brothers.antonio.quote
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-beige via-sabbia to-beige py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Elementi decorativi di sfondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-8 w-32 h-32 rounded-full bg-olive"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-salvia"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-nocciola"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 rounded-full bg-olive/60"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Header della sezione */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-olive rounded-full"></div>
            {t.about.badge}
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-olive mb-6 leading-tight">
            {t.about.title.line1}
            <span className="block italic text-salvia">{t.about.title.line2}</span>
          </h2>
          
          <p className="text-lg text-nocciola max-w-3xl mx-auto leading-relaxed">
            {t.about.intro}
          </p>
        </div>

        {/* Storia dell'azienda */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 mb-12 sm:mb-16 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-serif text-olive">
                {t.about.history.title}
              </h3>
              
              <div className="space-y-4 text-nocciola leading-relaxed">
                <p>{t.about.history.paragraph1}</p>
                <p>{t.about.history.paragraph2}</p>
                <p>{t.about.history.paragraph3}</p>
              </div>

              {/* Statistiche famiglia */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-olive/20">
                <div className="text-center">
                  <div className="text-2xl font-serif text-olive font-bold">{t.about.history.stats.years}</div>
                  <div className="text-sm text-nocciola">{t.about.history.stats.yearsLabel}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-serif text-olive font-bold">{t.about.history.stats.generations}</div>
                  <div className="text-sm text-nocciola">{t.about.history.stats.generationsLabel}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-serif text-olive font-bold">{t.about.history.stats.family}</div>
                  <div className="text-sm text-nocciola">{t.about.history.stats.familyLabel}</div>
                </div>
              </div>
            </div>

            {/* Immagine storica placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-olive/10 to-salvia/10 rounded-2xl p-8 text-center">
                <div className="w-full h-64 bg-olive/20 rounded-xl mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-olive/40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-nocciola italic">
                  {t.about.history.imageCaption}
                  <br />
                  <span className="text-xs">{t.about.history.imageNote}</span>
                </p>
              </div>
              
              {/* Badge vintage */}
              <div className="absolute -top-4 -right-4 bg-salvia text-beige px-3 py-2 rounded-full text-xs font-bold shadow-lg rotate-12">
                Est. 1950
              </div>
            </div>

          </div>
        </div>

        {/* I tre fratelli */}
        <div className="mb-12">
          <h3 className="text-2xl sm:text-3xl font-serif text-olive text-center mb-8 sm:mb-12">
            {t.about.brothers.title}
          </h3>

          {/* Selector fratelli - Mobile */}
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

          {/* Desktop - Tutti e tre visibili */}
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
                    {translate('about.brothers.imageNote', { photo: brother.photo })}
                  </p>
                  
                  {/* Badge ruolo */}
                  <div className="absolute -top-2 -right-2 bg-salvia text-beige px-2 py-1 rounded-full text-xs font-bold shadow-md rotate-12">
                    {index + 1}°
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <h4 className="text-xl font-serif text-olive group-hover:text-salvia transition-colors duration-300">
                    {brother.name}
                  </h4>
                  
                  <div className="text-sm font-medium text-salvia bg-salvia/10 px-3 py-1 rounded-full inline-block">
                    {brother.role}
                  </div>
                  
                  <p className="text-sm text-nocciola leading-relaxed">
                    {brother.description}
                  </p>
                  
                  <div className="text-xs text-nocciola/80 italic border-t border-olive/10 pt-3">
                    {brother.speciality}
                  </div>
                  
                  <blockquote className="text-sm text-olive italic bg-olive/5 p-3 rounded-lg border-l-4 border-olive">
                    "{brother.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile - Un fratello alla volta */}
          <div className="lg:hidden">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center space-y-4">
                {/* Foto placeholder */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-olive/20 to-salvia/20 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-olive/60" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs text-center text-nocciola/60 italic mt-2">
                    {translate('about.brothers.imageNote', { photo: brothers[activeBrother].photo })}
                  </p>
                </div>

                <h4 className="text-2xl font-serif text-olive">
                  {brothers[activeBrother].name}
                </h4>
                
                <div className="text-sm font-medium text-salvia bg-salvia/10 px-3 py-1 rounded-full inline-block">
                  {brothers[activeBrother].role}
                </div>
                
                <p className="text-sm text-nocciola leading-relaxed">
                  {brothers[activeBrother].description}
                </p>
                
                <div className="text-xs text-nocciola/80 italic border-t border-olive/10 pt-3">
                  {brothers[activeBrother].speciality}
                </div>
                
                <blockquote className="text-sm text-olive italic bg-olive/5 p-4 rounded-lg border-l-4 border-olive">
                  "{brothers[activeBrother].quote}"
                </blockquote>
              </div>
            </div>
          </div>
        </div>

        {/* Valori aziendali */}
        <div className="bg-gradient-to-r from-olive/10 to-salvia/10 rounded-2xl p-6 sm:p-8 lg:p-10 mb-12">
          <h3 className="text-2xl sm:text-3xl font-serif text-olive text-center mb-8">
            {t.about.values.title}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-olive/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-olive" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h4 className="text-lg font-serif text-olive">{t.about.values.quality.title}</h4>
              <p className="text-sm text-nocciola">
                {t.about.values.quality.description}
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-salvia/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-salvia" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-serif text-olive">{t.about.values.family.title}</h4>
              <p className="text-sm text-nocciola">
                {t.about.values.family.description}
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-nocciola/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-nocciola" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-serif text-olive">{t.about.values.tradition.title}</h4>
              <p className="text-sm text-nocciola">
                {t.about.values.tradition.description}
              </p>
            </div>

          </div>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-olive to-salvia text-beige px-8 sm:px-10 py-4 rounded-full text-lg font-medium hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-3">
            {t.about.cta}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}