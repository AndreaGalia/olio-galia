'use client';

import Link from 'next/link';
import { useT } from '@/hooks/useT';

interface SubscribeNotAvailableProps {
  slug: string;
}

export default function SubscribeNotAvailable({ slug }: SubscribeNotAvailableProps) {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-sabbia-chiaro flex items-center justify-center px-6">
      <div className="text-center max-w-sm mx-auto space-y-6">
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
          {t.subscription?.notAvailable || 'Abbonamento non disponibile'}
        </p>
        <Link
          href={`/products/${slug}`}
          className="inline-block font-serif termina-11 tracking-[0.2em] uppercase text-black underline underline-offset-2 hover:text-olive transition-colors"
        >
          {t.subscription?.backToProduct || 'Torna al prodotto'}
        </Link>
      </div>
    </div>
  );
}
