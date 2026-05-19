'use client';

import { useT } from '@/hooks/useT';

interface Props {
  error: string;
  onBack: () => void;
}

export default function FeedbackErrorState({ error, onBack }: Props) {
  const { translate } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg flex items-center justify-center px-6">
      <div className="bg-beige border border-olive/20 p-10 max-w-md w-full text-center">
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-6">
          {translate('feedback.error.invalidToken').split('.')[0]}
        </p>
        <p className="garamond-13 mb-8 whitespace-pre-line">{error}</p>
        <button
          onClick={onBack}
          className="w-full py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-olive text-beige hover:bg-sabbia hover:text-olive transition-all duration-200 cursor-pointer"
        >
          {translate('feedback.alreadySubmitted.backButton')}
        </button>
      </div>
    </div>
  );
}
