'use client';

import { useState } from 'react';
import { useT } from '@/hooks/useT';

type FormStatus = 'idle' | 'loading' | 'error';

interface Props {
  onSuccess: () => void;
}

export default function ManageSubscriptionForm({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
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
        throw new Error(data.error || "Errore nella ricerca dell'abbonamento");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <svg
          className="w-4 h-4 text-black/30 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-black/50 leading-relaxed">
          {sub?.portalEmailFallback ||
            "Non trovi l'email? Inserisci la tua email per ricevere un nuovo link di accesso."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] tracking-[0.2em] uppercase text-black/40 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            required
            placeholder={sub?.emailPlaceholder || 'La tua email di abbonamento'}
            className="w-full px-4 py-3 border border-olive/20 focus:border-olive/40 bg-transparent outline-none transition-colors text-sm"
          />
        </div>

        {error && (
          <div className="p-3 border border-olive/20 bg-sabbia/40 text-sm text-black/60 animate-fadeIn">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="w-full py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-olive hover:text-beige disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {sub?.sendingLink || 'Invio in corso...'}
            </>
          ) : (
            sub?.sendLink || 'Invia link'
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-olive/20">
        <p className="text-[11px] tracking-[0.1em] text-black/40 text-center leading-relaxed">
          {sub?.manageNote ||
            "Riceverai un'email con un link sicuro per accedere al portale. Il link è valido per 15 minuti."}
        </p>
      </div>
    </div>
  );
}
