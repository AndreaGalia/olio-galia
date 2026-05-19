'use client';

import { useT } from '@/hooks/useT';
import StarRating from './StarRating';
import type { UniqueProduct, ProductFeedback } from './types';

interface Props {
  product: UniqueProduct;
  index: number;
  feedback: ProductFeedback;
  onRatingChange: (productName: string, rating: number) => void;
  onCommentChange: (productName: string, comment: string) => void;
  submitting: boolean;
  maxCommentLength: number;
}

export default function FeedbackProductCard({
  product,
  index,
  feedback,
  onRatingChange,
  onCommentChange,
  submitting,
  maxCommentLength,
}: Props) {
  const { translate } = useT();

  return (
    <div className="border border-olive/20 p-6 sm:p-8 bg-beige">

      {/* Product Header */}
      <div className="flex items-start justify-between pb-5 border-b border-olive/20 mb-6">
        <div className="flex-1">
          <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-1">
            {product.productName}
          </p>
          <p className="font-serif termina-8 tracking-wider uppercase text-black">
            {translate('feedback.form.quantity', { count: product.quantity.toString() })}
          </p>
        </div>
        <span className="font-serif termina-8 tracking-wider uppercase text-black ml-4">
          {translate('feedback.form.productNumber', { number: (index + 1).toString() })}
        </span>
      </div>

      {/* Rating */}
      <div className="mb-8">
        <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-5 text-center">
          {translate('feedback.form.rating.label')}
        </p>
        <div className="flex justify-center py-2">
          <StarRating
            value={feedback.rating}
            onChange={(rating) => onRatingChange(product.productName, rating)}
            disabled={submitting}
          />
        </div>
        {feedback.rating > 0 && (
          <p className="text-center mt-4 garamond-13">
            {translate(`feedback.form.rating.satisfaction.${feedback.rating}`)}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor={`comment-${product.productName}`}
          className="block font-serif termina-11 tracking-[0.2em] uppercase text-black mb-4"
        >
          {translate('feedback.form.comment.label')}
        </label>
        <textarea
          id={`comment-${product.productName}`}
          value={feedback.comment}
          onChange={(e) => onCommentChange(product.productName, e.target.value)}
          disabled={submitting}
          maxLength={maxCommentLength}
          rows={5}
          className="w-full px-4 py-3 border border-olive/20 focus:border-olive/40 focus:outline-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none garamond-13"
          placeholder={translate('feedback.form.comment.placeholder', { productName: product.productName })}
          required
        />
        <div className="flex justify-between items-center mt-2">
          <p className="font-serif termina-8 tracking-wider text-black">
            {translate('feedback.form.comment.minChars')}
          </p>
          <p className={`font-serif termina-8 tracking-wider ${
            feedback.comment.length > maxCommentLength - 50 ? 'text-red-600' : 'text-black'
          }`}>
            {translate('feedback.form.comment.maxChars', {
              current: feedback.comment.length.toString(),
              max: maxCommentLength.toString(),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
