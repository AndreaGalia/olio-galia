'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useT } from '@/hooks/useT';
import PortalAccessStatus from '@/components/manageSubscriptionPage/PortalAccessStatus';

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

        window.location.href = data.url;
      } catch {
        setStatus('error');
        setErrorMsg(sub?.accessError || 'Link non valido o scaduto');
      }
    };

    verifyToken();
  }, [token, sub]);

  return <PortalAccessStatus status={status} errorMsg={errorMsg} />;
}

function LoadingFallback() {
  return <PortalAccessStatus status="loading" />;
}

export default function PortalAccessPage() {
  return (
    <div className="min-h-screen bg-sabbia-chiaro">
      <div className="container mx-auto px-6 sm:px-12 lg:px-16 xl:px-24 max-w-lg py-12 lg:py-20">
        <Suspense fallback={<LoadingFallback />}>
          <PortalAccessContent />
        </Suspense>
      </div>
    </div>
  );
}
