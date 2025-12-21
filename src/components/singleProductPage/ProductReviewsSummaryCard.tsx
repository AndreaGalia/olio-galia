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

  // Fetch solo le statistiche
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '1', // Minimo necessario
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

  // Scroll smooth alla sezione recensioni completa
  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('product-reviews-section');
    if (reviewsSection) {
      const yOffset = -100; // Offset per non nascondere dietro navbar
      const y = reviewsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Calcola la percentuale per ogni rating
  const getPercentage = (count: number): number => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white/90 border border-olive/10 p-5 sm:p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-nocciola text-sm">
            {t.productReviews?.loading || 'Caricamento recensioni...'}
          </div>
        </div>
      </div>
    );
  }

  // Nessuna recensione disponibile
  if (!stats || stats.total === 0) {
    return (
      <div className="bg-white/90 border border-olive/10 p-5 sm:p-6">
        <h3 className="text-lg font-serif text-olive mb-4">
          {t.productReviews?.title || 'Recensioni Clienti'}
        </h3>
        <div className="text-center py-6">
          <svg className="w-12 h-12 text-nocciola/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-nocciola text-sm">
            {t.productReviews?.noReviews || 'Nessuna recensione disponibile'}
          </p>
        </div>
      </div>
    );
  }

  // Recensioni disponibili - Mostra statistiche complete
  return (
    <div className="bg-white/90 border border-olive/10 p-5 sm:p-6">
      {/* Header compatto */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-serif text-olive">
          {t.productReviews?.title || 'Recensioni Clienti'}
        </h3>
        <button
          onClick={scrollToReviews}
          className="text-olive hover:text-salvia transition-colors text-sm flex items-center gap-1"
        >
          <span className="hidden sm:inline">Vedi tutte</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colonna sinistra: Media Rating */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-olive mb-1">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarDisplay rating={stats.averageRating} size="md" />
            <p className="text-xs text-nocciola mt-2">
              {stats.total} {stats.total === 1 ? 'recensione' : 'recensioni'}
            </p>
          </div>
        </div>

        {/* Colonna destra: Distribuzione compatta */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.distribution[rating as keyof typeof stats.distribution];
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-2">
                {/* Rating label */}
                <div className="flex items-center gap-0.5 w-8 text-xs text-nocciola">
                  <span>{rating}</span>
                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>

                {/* Progress bar */}
                <div className="flex-1 h-1.5 bg-beige/50 overflow-hidden">
                  <div
                    className="h-full bg-olive transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Percentage */}
                <span className="w-10 text-xs text-nocciola text-right">
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
