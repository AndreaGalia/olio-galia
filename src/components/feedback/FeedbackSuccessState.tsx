'use client';

import { useT } from '@/hooks/useT';

interface Props {
  onExplore: () => void;
  onHome: () => void;
}

export default function FeedbackSuccessState({ onExplore, onHome }: Props) {
  const { translate } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg flex items-center justify-center px-6">
      <div className="bg-beige border border-olive/20 p-10 max-w-md w-full text-center">
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-6">
          {translate('feedback.success.title')}
        </p>
        <p className="garamond-13 mb-8">{translate('feedback.success.message')}</p>
        <button
          onClick={onExplore}
          className="w-full py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-olive text-beige hover:bg-sabbia hover:text-olive transition-all duration-200 cursor-pointer mb-4"
        >
          {translate('feedback.success.exploreProducts')}
        </button>
        <button
          onClick={onHome}
          className="font-serif termina-8 tracking-wider text-black underline underline-offset-2 hover:text-olive transition-colors cursor-pointer"
        >
          {translate('feedback.success.backToHome')}
        </button>
      </div>
    </div>
  );
}
