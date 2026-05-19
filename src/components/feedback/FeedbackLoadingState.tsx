'use client';

import { useT } from '@/hooks/useT';

export default function FeedbackLoadingState() {
  const { translate } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border border-olive border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
          {translate('feedback.loading')}
        </p>
      </div>
    </div>
  );
}
