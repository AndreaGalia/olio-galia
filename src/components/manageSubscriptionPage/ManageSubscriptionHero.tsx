'use client';

import { useT } from '@/hooks/useT';

export default function ManageSubscriptionHero() {
  const { t } = useT();
  const sub = t.subscription;

  return (
    <div className="text-center lg:text-left mb-8 lg:mb-0">
      <h1
        style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          lineHeight: '1.3',
          letterSpacing: '0.15em',
        }}
      >
        {sub?.manageTitle || 'Gestisci il tuo Abbonamento'}
      </h1>
      <p className="text-sm text-black/50 leading-relaxed max-w-sm mx-auto lg:mx-0 mt-4">
        {sub?.portalEmailIntro ||
          'Il link per gestire il tuo abbonamento si trova nelle email di conferma e rinnovo.'}
      </p>
    </div>
  );
}
