'use client';

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

interface ReviewCardProps {
  review: Review;
  isFirst: boolean;
}

export default function ReviewCard({ review, isFirst }: ReviewCardProps) {
  const { t } = useT();
  const { locale } = useLocale();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeCode = locale === 'it' ? 'it-IT' : 'en-GB';
    return date.toLocaleDateString(localeCode, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const extractVariantName = (productName: string): string | null => {
    const idx = productName.indexOf(' - ');
    if (idx === -1) return null;
    return productName.substring(idx + 3);
  };

  const variantName = extractVariantName(review.productName);

  return (
    <div className={`py-6 ${!isFirst ? 'border-t border-olive/20' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="font-serif termina-11 tracking-[0.1em] uppercase text-black">
              {review.isAnonymous ? t.productReviews.review.anonymous : review.customerName}
            </span>
            {variantName && (
              <span className="font-serif termina-8 tracking-[0.1em] uppercase text-black border border-olive/20 px-2 py-0.5">
                {variantName}
              </span>
            )}
          </div>
          <StarDisplay rating={review.rating} size="sm" />
        </div>
        <time className="font-serif termina-8 tracking-[0.1em] text-black whitespace-nowrap shrink-0">
          {formatDate(review.createdAt)}
        </time>
      </div>

      {/* Commento */}
      <p className="garamond-13">{review.comment}</p>

      {/* Badge verificato */}
      <p className="mt-3 font-serif termina-8 tracking-[0.15em] uppercase text-black">
        {t.productReviews.review.verified}
      </p>
    </div>
  );
}
