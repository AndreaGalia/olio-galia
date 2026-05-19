'use client';

import { useT } from '@/hooks/useT';
import FeedbackOrderInfo from './FeedbackOrderInfo';
import FeedbackProductCard from './FeedbackProductCard';
import type { OrderInfo, UniqueProduct, ProductFeedback } from './types';

interface Props {
  orderInfo: OrderInfo;
  uniqueProducts: UniqueProduct[];
  productFeedbacks: Record<string, ProductFeedback>;
  onRatingChange: (productName: string, rating: number) => void;
  onCommentChange: (productName: string, comment: string) => void;
  isAnonymous: boolean;
  onAnonymousChange: (value: boolean) => void;
  submitting: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  maxCommentLength: number;
}

export default function FeedbackForm({
  orderInfo,
  uniqueProducts,
  productFeedbacks,
  onRatingChange,
  onCommentChange,
  isAnonymous,
  onAnonymousChange,
  submitting,
  error,
  onSubmit,
  maxCommentLength,
}: Props) {
  const { translate } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg py-10 sm:py-16 px-6 sm:px-12">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-3">
            {translate('feedback.form.title')}
          </p>
          <p className="garamond-13">{translate('feedback.form.subtitle')}</p>
        </div>

        {/* Order Info */}
        <FeedbackOrderInfo orderInfo={orderInfo} productCount={uniqueProducts.length} />

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="space-y-8">
            {uniqueProducts.map((product, index) => (
              <FeedbackProductCard
                key={product.productName}
                product={product}
                index={index}
                feedback={productFeedbacks[product.productName]}
                onRatingChange={onRatingChange}
                onCommentChange={onCommentChange}
                submitting={submitting}
                maxCommentLength={maxCommentLength}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-8 p-5 border-l-2 border-olive bg-beige">
              <p className="font-serif termina-8 tracking-wider uppercase text-black mb-1">
                {translate('feedback.form.error.title')}
              </p>
              <p className="garamond-13 whitespace-pre-line">{error}</p>
            </div>
          )}

          {/* Anonymous Checkbox */}
          <div className="mt-8 border border-olive/20 p-5 bg-beige">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => onAnonymousChange(e.target.checked)}
                disabled={submitting}
                className="mt-1 w-4 h-4 accent-olive disabled:opacity-50 cursor-pointer"
              />
              <div>
                <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-1">
                  {translate('feedback.form.anonymous.label')}
                </p>
                <p className="garamond-13">{translate('feedback.form.anonymous.description')}</p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full mt-8 py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive transition-all duration-200 touch-manipulation min-h-[56px] flex items-center justify-center gap-3 ${
              submitting
                ? 'bg-sabbia/40 text-black/30 border-olive/30 cursor-not-allowed'
                : 'bg-olive text-beige hover:bg-sabbia hover:text-olive cursor-pointer'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                <span>{translate('feedback.form.submitting')}</span>
              </>
            ) : (
              <span>{translate('feedback.form.submit', { count: uniqueProducts.length.toString() })}</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center garamond-13 mt-8 px-4">
          {translate('feedback.footer.note')}
        </p>
      </div>
    </div>
  );
}
