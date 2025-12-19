"use client";

import { useT } from '@/hooks/useT';
import Link from 'next/link';
import styles from '../../../styles/AboutPage.module.css';

export default function CookiePolicyPage() {
  const { t } = useT();
  const content = t.cookiePolicy;

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
            {/* 1. Cosa sono i Cookie */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.whatAreCookies.title}
              </h2>
              <p className="text-nocciola leading-relaxed">
                {content.sections.whatAreCookies.content}
              </p>
            </div>

            {/* 2. Tipologie di Cookie */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-6`}>
                {content.sections.cookieTypes.title}
              </h2>

              {/* Cookie Tecnici */}
              <div className="mb-6">
                <h3 className={`${styles.fontSerif} ${styles.textOlive} text-lg sm:text-xl mb-3`}>
                  {content.sections.cookieTypes.technical.title}
                </h3>
                <p className="text-nocciola leading-relaxed mb-3">
                  {content.sections.cookieTypes.technical.description}
                </p>
                <ul className="space-y-2 text-nocciola mb-3">
                  {content.sections.cookieTypes.technical.list.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-olive mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-nocciola/70 italic">
                  {content.sections.cookieTypes.technical.note}
                </p>
              </div>

              {/* Cookie Analytics */}
              <div className="mb-6">
                <h3 className={`${styles.fontSerif} ${styles.textOlive} text-lg sm:text-xl mb-3`}>
                  {content.sections.cookieTypes.analytics.title}
                </h3>
                <p className="text-nocciola leading-relaxed mb-3">
                  {content.sections.cookieTypes.analytics.description}
                </p>
                <ul className="space-y-2 text-nocciola mb-3">
                  {content.sections.cookieTypes.analytics.list.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-olive mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-nocciola/70 italic">
                  {content.sections.cookieTypes.analytics.note}
                </p>
              </div>

              {/* Cookie di Terze Parti */}
              <div>
                <h3 className={`${styles.fontSerif} ${styles.textOlive} text-lg sm:text-xl mb-3`}>
                  {content.sections.cookieTypes.thirdParty.title}
                </h3>
                <p className="text-nocciola leading-relaxed mb-3">
                  {content.sections.cookieTypes.thirdParty.description}
                </p>
                <ul className="space-y-2 text-nocciola">
                  {content.sections.cookieTypes.thirdParty.list.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-olive mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Come Gestire i Cookie */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.cookieManagement.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.cookieManagement.content}
              </p>
              <h3 className={`${styles.fontSerif} ${styles.textOlive} text-lg mb-3`}>
                {content.sections.cookieManagement.browsers.title}
              </h3>
              <ul className="space-y-2 text-nocciola mb-4">
                {content.sections.cookieManagement.browsers.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-beige/20 border border-olive/10 p-4">
                <p className="text-sm text-nocciola italic">
                  ⚠️ {content.sections.cookieManagement.note}
                </p>
              </div>
            </div>

            {/* 4. Elenco Cookie Utilizzati */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.cookieList.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-6">
                {content.sections.cookieList.description}
              </p>

              {/* Cookie Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-olive/20">
                      <th className="py-3 px-4 text-olive font-semibold">Nome</th>
                      <th className="py-3 px-4 text-olive font-semibold">Tipo</th>
                      <th className="py-3 px-4 text-olive font-semibold">Finalità</th>
                      <th className="py-3 px-4 text-olive font-semibold">Durata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.sections.cookieList.items.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-olive/10">
                        <td className="py-3 px-4 text-nocciola font-mono text-sm">{item.name}</td>
                        <td className="py-3 px-4 text-nocciola">{item.type}</td>
                        <td className="py-3 px-4 text-nocciola">{item.purpose}</td>
                        <td className="py-3 px-4 text-nocciola">{item.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Consenso ai Cookie */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.consent.title}
              </h2>
              <p className="text-nocciola leading-relaxed">
                {content.sections.consent.content}
              </p>
            </div>

            {/* 6. Aggiornamenti */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.updates.title}
              </h2>
              <p className="text-nocciola leading-relaxed">
                {content.sections.updates.content}
              </p>
            </div>

            {/* 7. Contatti */}
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
