'use client';

import { useState, useEffect, useRef } from 'react';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import StarDisplay from './StarDisplay';

interface Review {
  _id: string;
  productName: string;
  rating: number;
  comment: string;
  customerName: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

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

interface ReviewsResponse {
  success: boolean;
  feedbacks: Review[];
  stats: ReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface ProductReviewsProps {
  productSlug: string;
}

export default function ProductReviews({ productSlug }: ProductReviewsProps) {
  const { t, translate } = useT();
  const { locale } = useLocale();
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '5',
          rating: selectedRating,
          locale: locale,
        });

        const response = await fetch(`/api/products/${productSlug}/feedbacks?${params}`);
        const data: ReviewsResponse = await response.json();

        if (data.success) {
          setReviews(data.feedbacks);
          setStats(data.stats);
          setTotalPages(data.pagination.totalPages);
        } else {
          setError(t.productReviews.error);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(t.productReviews.error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productSlug, currentPage, selectedRating, locale, t.productReviews.error]);

  // Reset page quando cambia il filtro o la lingua
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRating, locale]);

  // Scroll alla sezione quando cambia pagina (non al primo caricamento)
  useEffect(() => {
    if (currentPage > 1 && reviewsRef.current && !loading) {
      // Offset di 100px sopra la sezione per una migliore visibilità
      const yOffset = -100;
      const element = reviewsRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [currentPage, loading]);

  // Formatta la data in base al locale corrente
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeCode = locale === 'it' ? 'it-IT' : 'en-GB';
    return date.toLocaleDateString(localeCode, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Genera i numeri di pagina da mostrare
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7; // Numero massimo di pulsanti da mostrare

    if (totalPages <= maxPagesToShow) {
      // Se ci sono poche pagine, mostrale tutte
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logica per molte pagine: mostra prima, ultima, e pagine vicine alla corrente
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        // Mostra: 1 2 3 4 5 ... 10
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        // Mostra: 1 ... 6 7 8 9 10
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Mostra: 1 ... 4 5 6 ... 10
        pages.push(1);
        pages.push('...');
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Se non ci sono recensioni
  if (!loading && stats && stats.total === 0) {
    return (
      <div className="bg-beige rounded-2xl p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-olive mb-4">
          {t.productReviews.title}
        </h2>
        <p className="text-nocciola text-lg mb-2">{t.productReviews.noReviews}</p>
        <p className="text-nocciola text-sm">{t.productReviews.beFirst}</p>
      </div>
    );
  }

  return (
    <div ref={reviewsRef} className="bg-gradient-to-br from-beige to-sabbia rounded-2xl p-6 sm:p-10 shadow-lg">
      {/* Header con statistiche */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-olive mb-6">
          {t.productReviews.title}
        </h2>

        {stats && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6">
            {/* Media e totale */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl sm:text-5xl font-bold text-olive">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <div>
                    <StarDisplay rating={stats.averageRating} size="lg" />
                    <p className="text-sm text-nocciola mt-1">
                      {translate('productReviews.totalReviews', { count: stats.total.toString() })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Distribuzione stelle */}
              <div className="w-full sm:w-auto space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star as keyof typeof stats.distribution];
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="text-olive font-medium w-3">{star}</span>
                      <span className="text-olive">★</span>
                      <div className="w-24 sm:w-32 h-2 bg-sabbia rounded-full overflow-hidden">
                        <div
                          className="h-full bg-olive rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-nocciola text-xs w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filtro stelle */}
            <div>
              <label className="block text-sm font-medium text-olive mb-3">
                {t.productReviews.filter.label}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRating('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRating === 'all'
                      ? 'bg-olive text-white shadow-md'
                      : 'bg-white text-nocciola hover:bg-olive/10'
                  }`}
                >
                  {t.productReviews.filter.all}
                </button>
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star.toString())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      selectedRating === star.toString()
                        ? 'bg-olive text-white shadow-md'
                        : 'bg-white text-nocciola hover:bg-olive/10'
                    }`}
                  >
                    <span>{star}</span>
                    <span className="text-xs">★</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-olive border-t-transparent"></div>
          <p className="mt-4 text-nocciola">{t.productReviews.loading}</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Lista recensioni */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id.toString()}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Header recensione */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-olive text-lg">
                      {review.isAnonymous ? t.productReviews.review.anonymous : review.customerName}
                    </span>
                    {review.isAnonymous && (
                      <span className="text-xs bg-nocciola/20 text-nocciola px-2 py-1 rounded-full">
                        Anonimo
                      </span>
                    )}
                  </div>
                  <StarDisplay rating={review.rating} size="sm" />
                </div>
                <time className="text-sm text-nocciola whitespace-nowrap">
                  {formatDate(review.createdAt)}
                </time>
              </div>

              {/* Commento */}
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>

              {/* Badge acquisto verificato */}
              <div className="mt-4 pt-4 border-t border-sabbia">
                <span className="inline-flex items-center gap-1 text-xs text-olive font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t.productReviews.review.verified}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginazione */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-nocciola">
            {translate('productReviews.pagination.page', {
              current: currentPage.toString(),
              total: totalPages.toString(),
            })}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white text-olive font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-olive hover:text-white transition-colors"
            >
              {t.productReviews.pagination.previous}
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white text-olive font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-olive hover:text-white transition-colors"
            >
              {t.productReviews.pagination.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
