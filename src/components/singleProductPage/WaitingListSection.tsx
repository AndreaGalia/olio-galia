'use client';
import { useState } from 'react';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';

interface WaitingListSectionProps {
  productId: string;
}

type Status = 'idle' | 'loading' | 'success' | 'already_subscribed' | 'error';

export default function WaitingListSection({ productId }: WaitingListSectionProps) {
  const { t } = useT();
  const { locale } = useLocale();
  const wl = t.waitingList;

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email: email.trim(), locale }),
      });

      if (res.status === 409) {
        setStatus('already_subscribed');
        return;
      }

      if (!res.ok) {
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  // — Stato success —
  if (status === 'success') {
    return (
      <div className="border-t border-olive/20 pt-6">
        <div className="border border-olive/20 bg-beige px-6 py-8 text-center space-y-2">
          <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
            {wl.form.successTitle}
          </p>
          <p className="garamond-13">{wl.form.successMessage}</p>
        </div>
      </div>
    );
  }

  // — Form principale —
  return (
    <div className="border-t border-olive/20 pt-6">

      {/* Label + descrizione */}
      <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-3">
        {wl.badge}
      </p>
      <p className="garamond-13 mb-6">
        {wl.form.description}
      </p>

      {/* Form — stacked su mobile, side-by-side da sm */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder={wl.form.emailPlaceholder}
          required
          style={{ fontSize: '16px' }}
          className="w-full px-4 py-4 border border-olive/20 bg-transparent focus:border-olive/60 focus:outline-none placeholder:text-black/40"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-4 font-serif termina-11 tracking-[3.4px] uppercase transition-all duration-200 cursor-pointer disabled:cursor-not-allowed border border-olive bg-olive text-beige hover:bg-sabbia hover:text-olive disabled:bg-sabbia/40 disabled:text-black/30"
        >
          {status === 'loading' ? wl.form.submitting : wl.form.submitButton}
        </button>
      </form>

      {/* Messaggi di stato */}
      {status === 'already_subscribed' && (
        <p className="garamond-13 text-black/60 mt-3">{wl.form.alreadySubscribed}</p>
      )}
      {status === 'error' && (
        <p className="garamond-13 text-black/60 mt-3">{wl.form.error}</p>
      )}
    </div>
  );
}
