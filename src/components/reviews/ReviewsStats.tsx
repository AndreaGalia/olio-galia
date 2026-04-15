'use client';

import { useT } from '@/hooks/useT';
import StarDisplay from './StarDisplay';

interface ReviewStats {
  total: number;
  averageRating: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewsStatsProps {
  stats: ReviewStats;
  selectedRating: string;
  onRatingChange: (rating: string) => void;
  translate: (key: string, params?: Record<string, string>) => string;
}

export default function ReviewsStats({ stats, selectedRating, onRatingChange, translate }: ReviewsStatsProps) {
  const { t } = useT();

  return (
    <div className="border-b border-olive/20 pb-8 mb-8">
      {/* Media e distribuzione */}
      <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-10 mb-6">

        {/* Numero grande + stelle */}
        <div className="shrink-0">
          <span
            className="text-black block"
            style={{ fontFamily: '"termina", sans-serif', fontSize: 'clamp(3.5rem, 10vw, 5rem)', lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {stats.averageRating.toFixed(1)}
          </span>
          <div className="mt-2">
            <StarDisplay rating={stats.averageRating} size="sm" />
            <p className="font-serif termina-11 tracking-[0.15em] uppercase text-black mt-2">
              {translate('productReviews.totalReviews', { count: stats.total.toString() })}
            </p>
          </div>
        </div>

        {/* Distribuzione stelle */}
        <div className="w-full sm:flex-1 space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star as keyof typeof stats.distribution];
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="font-serif termina-8 text-black w-3 shrink-0">{star}</span>
                <span className="garamond-13 text-black shrink-0">★</span>
                <div className="flex-1 h-[2px] bg-olive/10">
                  <div
                    className="h-full bg-olive transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="font-serif termina-8 text-black w-5 text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtro */}
      <div>
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-3">
          {t.productReviews.filter.label}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onRatingChange('all')}
            className={`px-3 py-1.5 font-serif termina-11 tracking-[0.15em] uppercase transition-colors cursor-pointer border ${
              selectedRating === 'all'
                ? 'border-olive bg-olive text-beige'
                : 'border-olive/20 text-black hover:border-olive/40 hover:text-black'
            }`}
          >
            {t.productReviews.filter.all}
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => onRatingChange(star.toString())}
              className={`px-3 py-1.5 font-serif termina-11 tracking-[0.15em] uppercase transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedRating === star.toString()
                  ? 'border-olive bg-olive text-beige'
                  : 'border-olive/20 text-black hover:border-olive/40 hover:text-black'
              }`}
            >
              <span>{star}</span>
              <span>★</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
