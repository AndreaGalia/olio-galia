// app/about/page.tsx
"use client";
import { useT } from '@/hooks/useT';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ValuesSection } from '@/components/about/ValuesSection';
import { TimelineSection } from '@/components/about/TimelineSection';
import { TimelineEvent, Value } from '@/types/about';
import styles from '../../../styles/AboutPage.module.css';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { t } = useT();

  useEffect(() => {
    setIsVisible(true);
  }, []);


  // Preparazione dati valori (versione estesa)
  const values: Value[] = t.aboutPage.values.items.map((item: any, index: number) => {
    const colors = ['olive', 'salvia', 'nocciola'];
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
    <div className={`min-h-screen ${styles.gradientBeigeViaSabbia}`}>
      
      {/* Hero Section */}
      <section className="relative py-10 sm:py-12 lg:py-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center">
            <div className={`inline-flex items-center gap-3 ${styles.bgOlive10} ${styles.textOlive} px-4 py-2 rounded-full text-sm font-medium mb-6 ${isVisible ? styles.slideInUp : ''}`}>
              <div className={`w-2 h-2 ${styles.bgOlive} rounded-full animate-pulse`}></div>
              {t.aboutPage.hero.badge}
            </div>
            
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl ${styles.fontSerif} ${styles.textOlive} mb-6 leading-tight ${isVisible ? styles.slideInUp : ''}`}
              style={{animationDelay: '0.1s'}}
            >
              {t.aboutPage.hero.title.main}
              <span className={`block text-4xl sm:text-5xl lg:text-6xl mt-2`}>
                {t.aboutPage.hero.title.subtitle}
              </span>
            </h1>
            
            <p 
              className={`text-xl ${styles.textNocciola} max-w-4xl mx-auto leading-relaxed ${isVisible ? styles.slideInUp : ''}`} 
              style={{animationDelay: '0.2s'}}
            >
              {t.aboutPage.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Storia */}
      <TimelineSection
        timeline={t.aboutPage.timeline.events as TimelineEvent[]}
        title={t.aboutPage.timeline.title}
      />

      {/* I Nostri Valori */}
      <section className="py-10 sm:py-12">
        <ValuesSection 
          values={values}
          title={t.aboutPage.values.title}
          subtitle={t.aboutPage.values.subtitle}
          variant="full"
        />
      </section>

      {/* Call to Action */}
      <section className="py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <h2 className={`text-3xl sm:text-4xl ${styles.fontSerif} ${styles.textOlive} mb-6`}>
            {t.aboutPage.cta.title}
          </h2>
          <p className={`text-lg ${styles.textNocciola} mb-8 max-w-2xl mx-auto`}>
            {t.aboutPage.cta.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className={`${styles.gradientOliveToSalvia} ${styles.textBeige} px-8 py-4 rounded-full text-lg font-medium ${styles.ctaButton} inline-flex items-center justify-center gap-3`}
            >
              {t.aboutPage.cta.catalog}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            
            <Link
              href="/contact"
              className={`border-2 ${styles.borderOlive} ${styles.textOlive} px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer inline-flex items-center justify-center gap-3`}
            >
              {t.aboutPage.cta.contact}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}