'use client';

import Link from 'next/link';
import { useT } from '@/hooks/useT';

interface Props {
  status: 'loading' | 'error';
  errorMsg?: string;
}

export default function PortalAccessStatus({ status, errorMsg }: Props) {
  const { t } = useT();
  const sub = t.subscription;

  if (status === 'loading') {
    return (
      <div className="text-center space-y-6 animate-fadeIn">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-olive/10">
          <div className="w-6 h-6 border-2 border-olive/20 border-t-olive rounded-full animate-spin" />
        </div>
        <h1
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            lineHeight: '1.3',
            letterSpacing: '0.15em',
          }}
        >
          {sub?.accessLoading || 'Accesso al portale in corso...'}
        </h1>
        <p className="text-sm text-black/50 leading-relaxed">
          {sub?.accessLoadingDesc ||
            'Verifica del link in corso, sarai reindirizzato automaticamente.'}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6 animate-fadeIn">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-sabbia border border-olive/20">
        <svg
          className="h-6 w-6 text-black/40"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h1
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
          lineHeight: '1.3',
          letterSpacing: '0.15em',
        }}
      >
        {errorMsg || sub?.accessError || 'Link non valido o scaduto'}
      </h1>
      <p className="text-sm text-black/50 leading-relaxed max-w-xs mx-auto">
        {sub?.accessErrorDesc ||
          'Questo link non è più valido. Richiedi un nuovo link di accesso.'}
      </p>
      <Link
        href="/manage-subscription"
        className="inline-block mt-2 px-8 py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 hover:bg-olive hover:text-beige border border-olive/20"
      >
        {sub?.requestNewLink || 'Richiedi nuovo link'}
      </Link>
    </div>
  );
}
