'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useT } from '@/hooks/useT';
import Link from 'next/link';

function PortalAccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { t } = useT();
  const sub = t.subscription;

  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg(sub?.accessError || 'Link non valido o scaduto');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/portal-access?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setErrorMsg(data.error || sub?.accessError || 'Link non valido o scaduto');
          return;
        }

        // Redirect to Stripe portal
        window.location.href = data.url;
      } catch {
        setStatus('error');
        setErrorMsg(sub?.accessError || 'Link non valido o scaduto');
      }
    };

    verifyToken();
  }, [token, sub]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-olive/10">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-olive/20 border-t-olive rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-olive">
            {sub?.accessLoading || 'Accesso al portale in corso...'}
          </h1>
          <p className="text-sm sm:text-base text-nocciola">
            {sub?.accessLoadingDesc || 'Verifica del link in corso, sarai reindirizzato automaticamente.'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-50">
            <svg className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-olive">
            {errorMsg || sub?.accessError || 'Link non valido o scaduto'}
          </h1>
          <p className="text-sm sm:text-base text-nocciola max-w-md mx-auto">
            {sub?.accessErrorDesc || 'Questo link non è più valido. Richiedi un nuovo link di accesso.'}
          </p>
          <Link
            href="/manage-subscription"
            className="inline-block mt-4 px-6 sm:px-8 py-3 sm:py-4 bg-olive text-beige font-medium hover:bg-salvia transition-all duration-300 border border-olive/20 uppercase tracking-wider"
          >
            {sub?.requestNewLink || 'Richiedi nuovo link'}
          </Link>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-olive/10">
        <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-olive/20 border-t-olive rounded-full animate-spin" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-serif text-olive">
        Accesso al portale in corso...
      </h1>
    </div>
  );
}

export default function PortalAccessPage() {
  return (
    <div className="min-h-screen bg-homepage-bg">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 max-w-lg">
        <Suspense fallback={<LoadingFallback />}>
          <PortalAccessContent />
        </Suspense>
      </div>
    </div>
  );
}
