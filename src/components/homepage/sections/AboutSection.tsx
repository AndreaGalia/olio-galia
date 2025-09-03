// components/AboutSection.tsx
"use client";
import BrothersSection from '@/components/about/BrothersSection';
import { HistorySection } from '@/components/about/HistorySection';
import { ValuesSection } from '@/components/about/ValuesSection';
import { useT } from '@/hooks/useT';
import { Brother, Value } from '@/types/about';
import styles from '../../../styles/AboutPage.module.css';

export default function AboutSection() {
  const { t } = useT();

  // Preparazione dati fratelli (versione compatta)
  const brothers: Brother[] = [
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

  // Preparazione dati valori
  const values: Value[] = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      title: t.about.values.quality.title,
      description: t.about.values.quality.description,
      color: 'olive'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      title: t.about.values.family.title,
      description: t.about.values.family.description,
      color: 'salvia'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
      ),
      title: t.about.values.tradition.title,
      description: t.about.values.tradition.description,
      color: 'nocciola'
    }
  ];

  return (
    <section className={`relative ${styles.gradientBeigeViaSabbia} py-16 sm:py-20 lg:py-24 overflow-hidden`}>
      {/* Elementi decorativi di sfondo */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-20 left-8 w-32 h-32 rounded-full ${styles.bgOlive}`}></div>
        <div className={`absolute bottom-32 right-16 w-24 h-24 rounded-full ${styles.bgSalvia}`}></div>
        <div className={`absolute top-1/3 right-1/4 w-16 h-16 rounded-full ${styles.bgNocciola}`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-20 h-20 rounded-full ${styles.bgOlive20}`}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Header della sezione */}
        <div className="text-center mb-12 sm:mb-16">
          <div className={`inline-flex items-center gap-2 ${styles.bgOlive10} ${styles.textOlive} px-4 py-2 rounded-full text-sm font-medium mb-6`}>
            <div className={`w-2 h-2 ${styles.bgOlive} rounded-full`}></div>
            {t.about.badge}
          </div>
          
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl ${styles.fontSerif} ${styles.textOlive} mb-6 leading-tight`}>
            {t.about.title.line1}
            <span className={`block italic ${styles.textSalvia}`}>{t.about.title.line2}</span>
          </h2>
          
          <p className={`text-lg ${styles.textNocciola} max-w-3xl mx-auto leading-relaxed`}>
            {t.about.intro}
          </p>
        </div>

        {/* Storia dell'azienda */}
        <HistorySection history={t.about.history} variant="compact" />

        {/* I tre fratelli */}
        <BrothersSection 
          brothers={brothers}
          title={t.about.brothers.title}
          variant="compact"
        />

        {/* Valori aziendali */}
        <div className={`${styles.gradientOlive10ToSalvia10} rounded-2xl p-6 sm:p-8 lg:p-10 mb-12`}>
          <ValuesSection 
            values={values}
            title={t.about.values.title}
            variant="compact"
          />
        </div>

        {/* Call to action */}
        <div className="text-center">
          <button className={`${styles.gradientOliveToSalvia} ${styles.textBeige} px-8 sm:px-10 py-4 rounded-full text-lg font-medium ${styles.ctaButton} inline-flex items-center gap-3`}>
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