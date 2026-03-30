'use client';

import { useState, useEffect, useRef } from 'react';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import ReviewsStats from './ReviewsStats';
import ReviewCard from './ReviewCard';
import ReviewsPagination from './ReviewsPagination';

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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRating, locale]);

  useEffect(() => {
    if (currentPage > 1 && reviewsRef.current && !loading) {
      const yOffset = -100;
      const element = reviewsRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [currentPage, loading]);

  if (!loading && stats && stats.total === 0) {
    return (
      <div id="product-reviews-section" className="border-t border-olive/20 py-8 text-center">
        <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-4">
          {t.productReviews.title}
        </p>
        <p className="text-sm text-black/60 leading-relaxed">{t.productReviews.noReviews}</p>
        <p className="mt-1 text-xs text-black/40">{t.productReviews.beFirst}</p>
      </div>
    );
  }

  return (
    <div id="product-reviews-section" ref={reviewsRef} className="border-t border-olive/20 pt-6">

      {/* Titolo sezione */}
      <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-4">
        {t.productReviews.title}
      </p>

      {/* Statistiche + filtri */}
      {stats && (
        <ReviewsStats
          stats={stats}
          selectedRating={selectedRating}
          onRatingChange={setSelectedRating}
          translate={translate}
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="py-12 text-center">
          <p className="text-[11px] tracking-[0.2em] uppercase text-black/40">
            {t.productReviews.loading}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border border-olive/20 p-4 mb-6">
          <p className="text-sm text-black/60">{error}</p>
        </div>
      )}

      {/* Lista recensioni */}
      {!loading && !error && reviews.length > 0 && (
        <div>
          {reviews.map((review, idx) => (
            <ReviewCard key={review._id.toString()} review={review} isFirst={idx === 0} />
          ))}
        </div>
      )}

      {/* Paginazione */}
      {!loading && !error && totalPages > 1 && (
        <ReviewsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          translate={translate}
        />
      )}
    </div>
  );
}
