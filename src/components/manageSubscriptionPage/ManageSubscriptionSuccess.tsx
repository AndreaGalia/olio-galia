'use client';

import { useT } from '@/hooks/useT';

interface Props {
  onReset: () => void;
}

export default function ManageSubscriptionSuccess({ onReset }: Props) {
  const { t } = useT();
  const sub = t.subscription;

  return (
    <div className="text-center space-y-5 animate-fadeIn py-2">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-olive/10">
        <svg
          className="h-6 w-6 text-black"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>

      <h2
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          lineHeight: '1.3',
          letterSpacing: '0.15em',
        }}
      >
        {sub?.portalEmailSent || "Ti abbiamo inviato un'email con il link di accesso"}
      </h2>

      <p className="text-sm text-black/50 leading-relaxed">
        {sub?.portalEmailNote || 'Il link è valido per 15 minuti e può essere usato una sola volta.'}
      </p>

      <button
        onClick={onReset}
        className="text-xs tracking-wider text-black/40 underline underline-offset-2 hover:text-black transition-colors cursor-pointer uppercase"
      >
        {sub?.sendAnotherLink || 'Invia un altro link'}
      </button>
    </div>
  );
}
