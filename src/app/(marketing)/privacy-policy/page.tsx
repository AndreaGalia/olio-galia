"use client";

import { useT } from '@/hooks/useT';
import Link from 'next/link';
import styles from '../../../styles/AboutPage.module.css';

export default function PrivacyPolicyPage() {
  const { t } = useT();
  const content = t.privacyPolicy;

  return (
    <div className={`min-h-screen ${styles.gradientBeigeViaSabbia}`}>
      {/* Hero Section */}
      <section className="relative py-10 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className={`${styles.fontSerif} ${styles.textOlive} mb-4 leading-tight text-2xl sm:text-4xl md:text-5xl lg:text-6xl`}>
              {content.title}
            </h1>
            <p className={`text-lg ${styles.textNocciola} mb-2`}>
              {content.subtitle}
            </p>
            <p className="text-sm text-nocciola/70">
              {content.lastUpdate}
            </p>
          </div>

          {/* Intro */}
          <div className="bg-beige/30 border border-olive/10 p-6 sm:p-8 mb-8">
            <p className="text-nocciola leading-relaxed">
              {content.intro}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6 sm:space-y-8">
            {/* 1. Titolare del Trattamento */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.dataController.title}
              </h2>
              <p className="text-nocciola leading-relaxed">
                {content.sections.dataController.content}
              </p>
            </div>

            {/* 2. Dati Raccolti */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.dataCollected.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.dataCollected.content}
              </p>
              <ul className="space-y-2 text-nocciola">
                {content.sections.dataCollected.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Finalità del Trattamento */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.purpose.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.purpose.content}
              </p>
              <ul className="space-y-2 text-nocciola">
                {content.sections.purpose.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Base Giuridica */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.legalBasis.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.legalBasis.content}
              </p>
              <ul className="space-y-2 text-nocciola">
                {content.sections.legalBasis.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Comunicazione dei Dati */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.dataSharing.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.dataSharing.content}
              </p>
              <ul className="space-y-2 text-nocciola">
                {content.sections.dataSharing.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Conservazione dei Dati */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.dataRetention.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.dataRetention.content}
              </p>
              <ul className="space-y-2 text-nocciola">
                {content.sections.dataRetention.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 7. Diritti dell'Interessato */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.userRights.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.userRights.content}
              </p>
              <ul className="space-y-2 text-nocciola">
                {content.sections.userRights.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 8. Sicurezza dei Dati */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.security.title}
              </h2>
              <p className="text-nocciola leading-relaxed">
                {content.sections.security.content}
              </p>
            </div>

            {/* 9. Modifiche alla Privacy Policy */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.changes.title}
              </h2>
              <p className="text-nocciola leading-relaxed">
                {content.sections.changes.content}
              </p>
            </div>

            {/* 10. Contatti */}
            <div className="bg-beige/30 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.contact.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-6">
                {content.sections.contact.content}
              </p>
              <Link
                href="/contact"
                className="inline-block bg-olive text-beige px-8 py-3 font-medium transition-all duration-300 border border-olive/20"
              >
                Contattaci
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block text-olive hover:text-salvia transition-colors duration-300"
            >
              ← Torna alla Homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
