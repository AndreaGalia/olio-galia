"use client";

import { useT } from '@/hooks/useT';
import Link from 'next/link';
import styles from '../../../styles/AboutPage.module.css';

export default function TermsOfServicePage() {
  const { t } = useT();
  const content = t.termsOfService;

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
            {/* 1. Informazioni sulla Società */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.companyInfo.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.companyInfo.content}
              </p>
              <ul className="space-y-2 text-nocciola">
                <li className="flex items-start gap-2">
                  <span className="text-olive mt-1">•</span>
                  <span>Sede legale: {process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Sicilia, Italia'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-olive mt-1">•</span>
                  <span>Partita IVA: {process.env.NEXT_PUBLIC_VAT_NUMBER || 'N/A'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-olive mt-1">•</span>
                  <span>Email: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@oliogalia.com'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-olive mt-1">•</span>
                  <span>Telefono: {process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '+39 XXX XXX XXXX'}</span>
                </li>
              </ul>
            </div>

            {/* 2. Conclusione del Contratto */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.contractFormation.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.contractFormation.content}
              </p>
              <ul className="space-y-2 text-nocciola">
                {content.sections.contractFormation.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Prezzi */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.prices.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.prices.content}
              </p>
              <p className="text-nocciola leading-relaxed">
                {content.sections.prices.shipping}
              </p>
            </div>

            {/* 4. Modalità di Pagamento */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.payment.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.payment.content}
              </p>
              <ul className="space-y-2 text-nocciola mb-4">
                {content.sections.payment.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-beige/20 border border-olive/10 p-4">
                <p className="text-sm text-nocciola">
                  🔒 {content.sections.payment.security}
                </p>
              </div>
            </div>

            {/* 5. Spedizioni e Consegne */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.shipping.title}
              </h2>
              <h3 className={`${styles.fontSerif} ${styles.textOlive} text-lg mb-3`}>
                {content.sections.shipping.timeframes.title}
              </h3>
              <ul className="space-y-2 text-nocciola mb-4">
                {content.sections.shipping.timeframes.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-nocciola leading-relaxed mb-3">
                {content.sections.shipping.tracking}
              </p>
              <p className="text-nocciola leading-relaxed">
                {content.sections.shipping.issues}
              </p>
            </div>

            {/* 6. Diritto di Recesso */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.withdrawal.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.withdrawal.content}
              </p>
              <h3 className={`${styles.fontSerif} ${styles.textOlive} text-lg mb-3`}>
                {content.sections.withdrawal.procedure.title}
              </h3>
              <ul className="space-y-2 text-nocciola mb-6">
                {content.sections.withdrawal.procedure.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-beige/20 border border-olive/10 p-4">
                <h4 className="font-semibold text-olive mb-2">
                  {content.sections.withdrawal.exclusions.title}
                </h4>
                <p className="text-sm text-nocciola">
                  {content.sections.withdrawal.exclusions.content}
                </p>
              </div>
            </div>

            {/* 7. Resi e Rimborsi */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.returns.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.returns.content}
              </p>
              <ul className="space-y-2 text-nocciola mb-4">
                {content.sections.returns.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-nocciola leading-relaxed">
                {content.sections.returns.procedure}
              </p>
            </div>

            {/* 8. Garanzia di Conformità */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.warranty.title}
              </h2>
              <p className="text-nocciola leading-relaxed">
                {content.sections.warranty.content}
              </p>
            </div>

            {/* 9. Limitazioni di Responsabilità */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.liability.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.liability.content}
              </p>
              <ul className="space-y-2 text-nocciola">
                {content.sections.liability.list.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-olive mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 10. Proprietà Intellettuale */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.intellectualProperty.title}
              </h2>
              <p className="text-nocciola leading-relaxed">
                {content.sections.intellectualProperty.content}
              </p>
            </div>

            {/* 11. Privacy e Protezione Dati */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.privacy.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.privacy.content}
              </p>
              <Link
                href="/privacy-policy"
                className="inline-block text-olive hover:text-salvia underline transition-colors duration-300"
              >
                Leggi la Privacy Policy →
              </Link>
            </div>

            {/* 12. Risoluzione delle Controversie */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.disputes.title}
              </h2>
              <p className="text-nocciola leading-relaxed mb-4">
                {content.sections.disputes.content}
              </p>
              <p className="text-sm text-nocciola leading-relaxed">
                {content.sections.disputes.odr}
              </p>
            </div>

            {/* 13. Modifiche ai Termini */}
            <div className="bg-white/50 border border-olive/10 p-6 sm:p-8">
              <h2 className={`${styles.fontSerif} ${styles.textOlive} text-xl sm:text-2xl mb-4`}>
                {content.sections.modifications.title}
              </h2>
              <p className="text-nocciola leading-relaxed">
                {content.sections.modifications.content}
              </p>
            </div>

            {/* 14. Contatti */}
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
