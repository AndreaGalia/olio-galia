'use client';

import { useState } from 'react';
import { useT } from '@/hooks/useT';
import Link from 'next/link';

type PageStatus = 'idle' | 'loading' | 'sent' | 'error';

export default function ManageSubscriptionPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<PageStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const { t } = useT();

  const sub = t.subscription;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(sub?.rateLimitError || 'Troppe richieste. Riprova tra qualche minuto.');
        }
        throw new Error(data.error || 'Errore nella ricerca dell\'abbonamento');
      }

      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-homepage-bg">
      {/* Breadcrumb */}
      <div className="bg-white/50 py-4">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-nocciola hover:text-olive transition-colors">Home</Link>
            <span className="text-nocciola/50">&rarr;</span>
            <span className="text-olive font-medium">{sub?.manageTitle || 'Gestisci Abbonamento'}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-lg py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-olive/10 mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-olive mb-3 sm:mb-4 tracking-tight">
            {sub?.manageTitle || 'Gestisci il tuo Abbonamento'}
          </h1>
          <p className="text-base sm:text-lg text-nocciola leading-relaxed max-w-md mx-auto">
            {sub?.portalEmailIntro || 'Il link per gestire il tuo abbonamento si trova nelle email di conferma e rinnovo.'}
          </p>
        </div>

        {/* Card principale */}
        <div className="bg-white border border-olive/10 p-5 sm:p-6 lg:p-8">
          {status === 'sent' ? (
            <div className="text-center space-y-4 sm:space-y-6 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-olive/10 mb-2">
                <svg className="h-7 w-7 sm:h-8 sm:w-8 text-olive" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-olive">
                {sub?.portalEmailSent || 'Ti abbiamo inviato un\'email con il link di accesso'}
              </h2>
              <p className="text-sm sm:text-base text-nocciola">
                {sub?.portalEmailNote || 'Il link è valido per 15 minuti e può essere usato una sola volta.'}
              </p>
              <button
                onClick={() => { setStatus('idle'); setEmail(''); }}
                className="mt-4 text-sm text-olive underline hover:text-salvia transition-colors cursor-pointer"
              >
                {sub?.sendLink || 'Invia un altro link'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-4 sm:mb-6">
                <svg className="w-5 h-5 text-olive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm sm:text-base text-nocciola">
                  {sub?.portalEmailFallback || 'Non trovi l\'email? Inserisci la tua email per ricevere un nuovo link di accesso.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-olive mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                    required
                    placeholder={sub?.emailPlaceholder || 'La tua email di abbonamento'}
                    className="w-full px-4 py-3 border border-olive/20 focus:ring-2 focus:ring-olive/20 focus:border-olive transition-colors"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm animate-fadeIn">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="w-full py-3 sm:py-4 bg-olive text-beige font-medium hover:bg-salvia transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-olive/20 uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-beige" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {sub?.sendingLink || 'Invio in corso...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {sub?.sendLink || 'Invia link'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-olive/10">
                <p className="text-xs text-nocciola text-center">
                  {sub?.manageNote || 'Riceverai un\'email con un link sicuro per accedere al portale di gestione del tuo abbonamento. Il link è valido per 15 minuti.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
