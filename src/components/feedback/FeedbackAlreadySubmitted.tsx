'use client';

import { useT } from '@/hooks/useT';
import type { ExistingFeedbackItem } from './types';

interface Props {
  feedbacks?: ExistingFeedbackItem[];
  onBack: () => void;
}

export default function FeedbackAlreadySubmitted({ feedbacks, onBack }: Props) {
  const { translate } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg flex items-center justify-center px-6">
      <div className="bg-beige border border-olive/20 p-10 max-w-2xl w-full">
        <div className="text-center mb-8">
          <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-4">
            {translate('feedback.alreadySubmitted.title')}
          </p>
          <p className="garamond-13">{translate('feedback.alreadySubmitted.message')}</p>
        </div>

        {feedbacks && feedbacks.length > 0 && (
          <div className="space-y-4 mb-8">
            {feedbacks.map((fb, index) => (
              <div key={index} className="border-t border-olive/20 pt-4">
                <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2">
                  {fb.productName}
                </p>
                <p className="garamond-13 mb-1">
                  {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                </p>
                <p className="garamond-13 italic">"{fb.comment}"</p>
              </div>
            ))}
          </div>
        )}

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
