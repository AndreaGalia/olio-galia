'use client';

import { useState, useEffect } from 'react';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import StarDisplay from '@/components/reviews/StarDisplay';

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

interface ProductReviewsSummaryCardProps {
  productSlug: string;
}

export default function ProductReviewsSummaryCard({ productSlug }: ProductReviewsSummaryCardProps) {
  const { t, translate } = useT();
  const { locale } = useLocale();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '1',
          rating: 'all',
          locale: locale,
        });

        const response = await fetch(`/api/products/${productSlug}/feedbacks?${params}`);
        const data = await response.json();

        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching review stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [productSlug, locale]);

  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('product-reviews-section');
    if (reviewsSection) {
      const yOffset = -100;
      const y = reviewsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const getPercentage = (count: number): number => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  if (loading) {
    return (
      <div className="border-t border-olive/20 pt-5">
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
          {t.productReviews.loading}
        </p>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="border-t border-olive/20 pt-5">
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2">
          {t.productReviews.title}
        </p>
        <p className="garamond-13">{t.productReviews.noReviews}</p>
      </div>
    );
  }

  return (
    <div className="border-t border-olive/20 pt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">
          {t.productReviews.title}
        </p>
        <button
          onClick={scrollToReviews}
          className="font-serif termina-8 tracking-wider text-black underline underline-offset-2 hover:text-black transition-colors cursor-pointer"
        >
          {t.productReviews.viewAll}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Media */}
        <div className="shrink-0">
          <span
            className="text-black block"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {stats.averageRating.toFixed(1)}
          </span>
          <div className="mt-1.5">
            <StarDisplay rating={stats.averageRating} size="sm" />
            <p className="font-serif termina-8 tracking-[0.1em] uppercase text-black mt-1">
              {translate('productReviews.totalReviews', { count: stats.total.toString() })}
            </p>
          </div>
        </div>

        {/* Distribuzione */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.distribution[rating as keyof typeof stats.distribution];
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-2.5">
                <span className="font-serif termina-8 text-black w-3 shrink-0">{rating}</span>
                <span className="garamond-13 text-black shrink-0">★</span>
                <div className="flex-1 h-[2px] bg-olive/10">
                  <div
                    className="h-full bg-olive transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="font-serif termina-8 text-black w-8 text-right shrink-0">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
