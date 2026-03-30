'use client';

import Link from 'next/link';
import { useT } from '@/hooks/useT';

export default function ManageSubscriptionBreadcrumb() {
  const { t } = useT();
  const sub = t.subscription;

  return (
    <div className="py-4 border-b border-olive/20">
      <div className="container mx-auto px-6 sm:px-12 lg:px-16 xl:px-24 max-w-7xl">
        <nav className="flex items-center gap-2 text-xs tracking-wider">
          <Link href="/" className="text-black/40 hover:text-olive transition-colors uppercase">
            Home
          </Link>
          <span className="text-black/30">/</span>
          <span className="text-black/70 uppercase">
            {sub?.manageTitle || 'Gestisci Abbonamento'}
          </span>
        </nav>
      </div>
    </div>
  );
}
