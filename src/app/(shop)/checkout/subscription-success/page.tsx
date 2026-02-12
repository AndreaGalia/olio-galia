'use client';

import Link from 'next/link';
import { useT } from '@/hooks/useT';

export default function SubscriptionSuccessPage() {
  const { t } = useT();
  const sub = t.subscription;

  return (
    <div className="min-h-screen bg-homepage-bg">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-olive mb-4 sm:mb-6 tracking-tight">
            {sub?.successTitle || 'Abbonamento Attivato!'}
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-xl sm:text-2xl md:text-3xl text-salvia mb-3 sm:mb-4 font-light">
              {sub?.successSubtitle || 'Grazie per la tua fiducia'}
            </p>
            <p className="text-base sm:text-lg text-nocciola leading-relaxed">
              {sub?.successDescription || 'Il tuo abbonamento è stato attivato con successo. Riceverai il prodotto alla frequenza selezionata.'}
            </p>
          </div>
        </div>

        {/* Email info banner */}
        <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="bg-white border-l-4 border-olive p-4 sm:p-5 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-olive/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-olive mb-1">
                  {sub?.emailConfirmationTitle || 'Controlla la tua email'}
                </h3>
                <p className="text-sm sm:text-base text-nocciola">
                  {sub?.successEmailInfo || 'Riceverai una email di conferma con tutti i dettagli del tuo abbonamento e il link per gestirlo.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-serif text-olive text-center mb-8 sm:mb-12">
            {sub?.nextSteps || 'Prossimi passi'}
          </h2>

          <div className="relative">
            {/* Linea di connessione */}
            <div className="absolute left-8 md:left-1/2 md:transform md:-translate-x-0.5 w-1 h-full bg-olive opacity-30"></div>

            <div className="space-y-8 sm:space-y-12">
              {/* Step 1 - Conferma email */}
              <div className="relative flex items-start md:items-center">
                <div className="flex md:hidden w-16 h-16 flex-shrink-0 bg-olive border border-olive/20 items-center justify-center z-10">
                  <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 pl-6 md:pl-0 md:text-right md:pr-8">
                  <h3 className="text-lg sm:text-xl font-serif text-olive mb-2">
                    {sub?.step1Title || 'Conferma via email'}
                  </h3>
                  <p className="text-sm sm:text-base text-nocciola mb-2 md:mb-0">
                    {sub?.step1 || 'Conferma via email con i dettagli dell\'abbonamento'}
                  </p>
                  <span className="inline-block md:hidden text-xs sm:text-sm bg-olive text-beige px-3 py-1 border border-olive/20 mt-2">
                    {sub?.stepCompleted || 'Completato'}
                  </span>
                </div>
                <div className="hidden md:flex w-16 h-16 bg-olive border border-olive/20 items-center justify-center z-10">
                  <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="hidden md:flex flex-1 pl-8">
                  <span className="text-sm bg-olive text-beige px-3 py-1 border border-olive/20">
                    {sub?.stepCompleted || 'Completato'}
                  </span>
                </div>
              </div>

              {/* Step 2 - Preparazione */}
              <div className="relative flex items-start md:items-center">
                <div className="flex md:hidden w-16 h-16 flex-shrink-0 bg-salvia border border-salvia/20 items-center justify-center z-10">
                  <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="flex-1 pl-6 md:hidden">
                  <h3 className="text-lg sm:text-xl font-serif text-olive mb-2">
                    {sub?.step2Title || 'Preparazione ordine'}
                  </h3>
                  <p className="text-sm sm:text-base text-nocciola mb-2">
                    {sub?.step2 || 'Preparazione e spedizione del primo ordine'}
                  </p>
                  <span className="inline-block text-xs sm:text-sm bg-salvia text-beige px-3 py-1 border border-salvia/20">
                    {sub?.stepInProgress || 'In corso'}
                  </span>
                </div>
                <div className="hidden md:flex md:items-center flex-1 justify-end pr-8">
                  <span className="text-sm bg-salvia text-beige px-3 py-1 border border-salvia/20">
                    {sub?.stepInProgress || 'In corso'}
                  </span>
                </div>
                <div className="hidden md:flex md:flex-shrink-0 w-16 h-16 bg-salvia border border-salvia/20 items-center justify-center z-10">
                  <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="hidden md:flex md:flex-col flex-1 pl-8">
                  <h3 className="text-xl font-serif text-olive mb-2">
                    {sub?.step2Title || 'Preparazione ordine'}
                  </h3>
                  <p className="text-nocciola">
                    {sub?.step2 || 'Preparazione e spedizione del primo ordine'}
                  </p>
                </div>
              </div>

              {/* Step 3 - Rinnovo automatico */}
              <div className="relative flex items-start md:items-center">
                <div className="flex md:hidden w-16 h-16 flex-shrink-0 bg-nocciola/30 border border-nocciola/20 items-center justify-center z-10">
                  <svg className="w-8 h-8 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1 pl-6 md:pl-0 md:text-right md:pr-8">
                  <h3 className="text-lg sm:text-xl font-serif text-olive mb-2">
                    {sub?.step3Title || 'Rinnovo automatico'}
                  </h3>
                  <p className="text-sm sm:text-base text-nocciola mb-2 md:mb-0">
                    {sub?.step3 || 'Rinnovo automatico alla frequenza scelta'}
                  </p>
                  <span className="inline-block md:hidden text-xs sm:text-sm bg-nocciola/20 text-nocciola px-3 py-1 border border-nocciola/20 mt-2">
                    {sub?.stepPending || 'Programmato'}
                  </span>
                </div>
                <div className="hidden md:flex w-16 h-16 bg-nocciola/30 border border-nocciola/20 items-center justify-center z-10">
                  <svg className="w-8 h-8 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="hidden md:flex flex-1 pl-8">
                  <span className="text-sm bg-nocciola/20 text-nocciola px-3 py-1 border border-nocciola/20">
                    {sub?.stepPending || 'Programmato'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-white border border-olive/10 p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-serif text-olive mb-4 sm:mb-6">
              {sub?.ctaTitle || 'Gestisci il tuo abbonamento'}
            </h3>
            <p className="text-nocciola mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              {sub?.ctaDescription || 'Puoi modificare o gestire il tuo abbonamento in qualsiasi momento tramite il link nella tua email di conferma.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/manage-subscription"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-olive text-beige transition-all duration-300 font-medium text-base sm:text-lg border border-olive/20 uppercase tracking-wider hover:bg-salvia"
              >
                {sub?.manageSubscription || 'Gestisci Abbonamento'}
              </Link>
              <Link
                href="/products"
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-olive text-olive hover:bg-olive hover:text-beige transition-all duration-300 font-medium text-base sm:text-lg uppercase tracking-wider"
              >
                {sub?.continueShopping || 'Continua lo Shopping'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
