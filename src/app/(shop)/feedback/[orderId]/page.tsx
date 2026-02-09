'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StarRating from '@/components/feedback/StarRating';
import { useT } from '@/hooks/useT';

interface OrderInfo {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderType: 'order' | 'quote';
  items: Array<{
    productId?: string | null;
    name: string;
    quantity: number;
  }>;
}

interface UniqueProduct {
  productId?: string | null;
  productName: string;
  quantity: number;
}

interface ProductFeedback {
  productId?: string | null;
  productName: string;
  rating: number;
  comment: string;
}

interface FeedbackExistsResponse {
  exists: boolean;
  feedbacks?: Array<{
    productName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  allProductsFeedback: boolean;
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.orderId as string;
  const { translate } = useT();
  const successDivRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<FeedbackExistsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uniqueProducts, setUniqueProducts] = useState<UniqueProduct[]>([]);
  const [productFeedbacks, setProductFeedbacks] = useState<Record<string, ProductFeedback>>({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const maxCommentLength = 500;

  // Scroll to top on success
  useEffect(() => {
    if (success && successDivRef.current) {
      successDivRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [success]);

  // Carica informazioni ordine e verifica se esiste già un feedback
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Verifica token e carica info ordine
        const orderResponse = await fetch('/api/feedback/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok || !orderData.success) {
          setError(orderData.error || translate('feedback.error.invalidToken'));
          setLoading(false);
          return;
        }

        setOrderInfo(orderData.order);

        // Raggruppa prodotti uguali (stesso nome = stesso prodotto)
        const productsMap = new Map<string, { productId?: string | null; quantity: number }>();
        orderData.order.items.forEach((item: { productId?: string | null; name: string; quantity: number }) => {
          const existing = productsMap.get(item.name);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            productsMap.set(item.name, {
              productId: item.productId || null,
              quantity: item.quantity,
            });
          }
        });

        const uniqueProds: UniqueProduct[] = Array.from(productsMap.entries()).map(([name, data]) => ({
          productId: data.productId,
          productName: name,
          quantity: data.quantity,
        }));

        setUniqueProducts(uniqueProds);

        // Inizializza feedback vuoti per ogni prodotto
        const initialFeedbacks: Record<string, ProductFeedback> = {};
        uniqueProds.forEach(prod => {
          initialFeedbacks[prod.productName] = {
            productId: prod.productId,
            productName: prod.productName,
            rating: 0,
            comment: '',
          };
        });
        setProductFeedbacks(initialFeedbacks);

        // Verifica se esiste già un feedback per questo ordine
        const feedbackResponse = await fetch(`/api/feedback/${orderData.order.orderId}`);
        const feedbackData = await feedbackResponse.json();

        setExistingFeedback(feedbackData);
        setLoading(false);
      } catch (err) {
        console.error('Errore nel caricamento:', err);
        setError(translate('feedback.error.loadingError'));
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleRatingChange = useCallback((productName: string, rating: number) => {
    setProductFeedbacks(prev => ({
      ...prev,
      [productName]: {
        ...prev[productName],
        rating,
      },
    }));
  }, []);

  const handleCommentChange = useCallback((productName: string, comment: string) => {
    setProductFeedbacks(prev => ({
      ...prev,
      [productName]: {
        ...prev[productName],
        comment,
      },
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderInfo) {
      setError(translate('feedback.error.orderNotFound'));
      return;
    }

    // Valida tutti i feedback
    const feedbackArray = Object.values(productFeedbacks);
    const errors: string[] = [];

    feedbackArray.forEach(fb => {
      if (fb.rating === 0) {
        errors.push(translate('feedback.form.error.selectRating', { productName: fb.productName }));
      }
      if (!fb.comment || fb.comment.trim().length === 0) {
        errors.push(translate('feedback.form.error.addComment', { productName: fb.productName }));
      }
      if (fb.comment.length > maxCommentLength) {
        errors.push(translate('feedback.form.error.commentTooLong', { productName: fb.productName }));
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        orderId: orderInfo.orderId,
        customerEmail: orderInfo.customerEmail,
        customerName: orderInfo.customerName,
        isAnonymous: isAnonymous,
        orderType: orderInfo.orderType,
        feedbacks: feedbackArray.map(fb => ({
          productId: fb.productId || null,
          productName: fb.productName,
          rating: fb.rating,
          comment: fb.comment.trim(),
        })),
      };

      const response = await fetch('/api/feedback/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || translate('feedback.error.submitError'));
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Errore nell\'invio:', err);
      setError(translate('feedback.error.submitError'));
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-homepage-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-olive mx-auto mb-4"></div>
          <p className="text-olive font-serif text-xl">{translate('feedback.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !orderInfo) {
    return (
      <div className="min-h-screen bg-homepage-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-olive mb-4 uppercase">{translate('feedback.error.invalidToken').split('.')[0]}</h1>
          <p className="text-gray-700 mb-6 whitespace-pre-line">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-olive text-white px-6 py-3 rounded-lg hover:bg-salvia transition-colors font-serif uppercase"
          >
            {translate('feedback.alreadySubmitted.backButton')}
          </button>
        </div>
      </div>
    );
  }

  // Feedback già inviato
  if (existingFeedback?.exists) {
    return (
      <div className="min-h-screen bg-homepage-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-olive mb-4 uppercase">{translate('feedback.alreadySubmitted.title')}</h1>
            <p className="text-gray-700 mb-6">{translate('feedback.alreadySubmitted.message')}</p>
          </div>

          {existingFeedback.feedbacks && existingFeedback.feedbacks.length > 0 && (
            <div className="space-y-4 mb-6">
              {existingFeedback.feedbacks.map((fb, index) => (
                <div key={index} className="bg-beige rounded-lg p-4">
                  <h3 className="font-semibold text-olive mb-2">{fb.productName}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl text-olive">
                      {'★'.repeat(fb.rating)}
                      {'☆'.repeat(5 - fb.rating)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm italic">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="bg-olive text-white px-6 py-3 rounded-lg hover:bg-salvia transition-colors font-serif uppercase"
            >
              {translate('feedback.alreadySubmitted.backButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div ref={successDivRef} className="min-h-screen bg-homepage-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-olive mb-4 uppercase">{translate('feedback.success.title')}</h1>
          <p className="text-gray-700 mb-6">
            {translate('feedback.success.message')}
          </p>
          <button
            onClick={() => router.push('/products')}
            className="bg-olive text-white px-6 py-3 rounded-lg hover:bg-salvia transition-colors font-serif uppercase mb-3 w-full"
          >
            {translate('feedback.success.exploreProducts')}
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-olive hover:text-salvia transition-colors font-serif uppercase"
          >
            {translate('feedback.success.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  // Form feedback per ogni prodotto
  return (
    <div className="min-h-screen bg-homepage-bg py-6 sm:py-12 px-3 sm:px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-olive text-white p-6 sm:p-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-serif uppercase mb-2">{translate('feedback.form.title')}</h1>
            <p className="text-beige text-sm sm:text-base">{translate('feedback.form.subtitle')}</p>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* Order Info */}
            {orderInfo && (
              <div className="bg-beige rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="font-serif text-olive text-base sm:text-lg uppercase mb-3 sm:mb-4">
                  {translate(`feedback.form.orderInfo.${orderInfo.orderType}`)} #{orderInfo.orderNumber.slice(-8).toUpperCase()}
                </h2>
                <p className="text-gray-700 mb-2 text-sm sm:text-base">
                  <strong>{translate('feedback.form.orderInfo.customer')}</strong> {orderInfo.customerName}
                </p>
                <p className="text-gray-700 text-sm sm:text-base">
                  <strong>{translate('feedback.form.orderInfo.productsToReview')}</strong> {uniqueProducts.length}
                </p>
              </div>
            )}

            {/* Feedback Forms */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 sm:space-y-8">
                {uniqueProducts.map((product, index) => (
                  <div key={product.productName} className="border-2 border-sabbia rounded-lg p-4 sm:p-6 shadow-sm">
                    {/* Product Header */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-sabbia">
                      <div className="flex-1">
                        <h3 className="font-serif text-olive text-lg sm:text-xl uppercase">{product.productName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {translate('feedback.form.quantity', { count: product.quantity.toString() })}
                        </p>
                      </div>
                      <span className="text-2xl sm:text-3xl text-olive font-bold ml-2">
                        {translate('feedback.form.productNumber', { number: (index + 1).toString() })}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="mb-6 sm:mb-8">
                      <label className="block font-serif text-olive text-base sm:text-lg uppercase mb-4 sm:mb-5 text-center">
                        {translate('feedback.form.rating.label')}
                      </label>
                      <div className="flex justify-center py-2">
                        <StarRating
                          value={productFeedbacks[product.productName]?.rating || 0}
                          onChange={(rating) => handleRatingChange(product.productName, rating)}
                          disabled={submitting}
                        />
                      </div>
                      {productFeedbacks[product.productName]?.rating > 0 && (
                        <p className="text-center mt-3 sm:mt-4 text-sm sm:text-base text-gray-700 font-medium">
                          {translate(`feedback.form.rating.satisfaction.${productFeedbacks[product.productName].rating}`)}
                        </p>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      <label htmlFor={`comment-${product.productName}`} className="block font-serif text-olive text-base sm:text-lg uppercase mb-3">
                        {translate('feedback.form.comment.label')}
                      </label>
                      <textarea
                        id={`comment-${product.productName}`}
                        value={productFeedbacks[product.productName]?.comment || ''}
                        onChange={(e) => handleCommentChange(product.productName, e.target.value)}
                        disabled={submitting}
                        maxLength={maxCommentLength}
                        rows={5}
                        className="w-full px-4 py-3 border-2 border-sabbia rounded-lg focus:border-olive focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-base leading-relaxed"
                        placeholder={translate('feedback.form.comment.placeholder', { productName: product.productName })}
                        required
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs sm:text-sm text-gray-500">{translate('feedback.form.comment.minChars')}</p>
                        <p className={`text-xs sm:text-sm ${
                          (productFeedbacks[product.productName]?.comment?.length || 0) > maxCommentLength - 50
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-500'
                        }`}>
                          {translate('feedback.form.comment.maxChars', {
                            current: (productFeedbacks[product.productName]?.comment?.length || 0).toString(),
                            max: maxCommentLength.toString()
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                  <p className="font-semibold text-sm sm:text-base">{translate('feedback.form.error.title')}</p>
                  <p className="whitespace-pre-line text-sm sm:text-base">{error}</p>
                </div>
              )}

              {/* Anonymous Checkbox */}
              <div className="mt-6 sm:mt-8 bg-beige border-2 border-sabbia rounded-lg p-4 sm:p-5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    disabled={submitting}
                    className="mt-1 w-5 h-5 text-olive border-2 border-olive rounded focus:ring-2 focus:ring-olive focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-olive font-semibold text-sm sm:text-base block mb-1">
                      {translate('feedback.form.anonymous.label')}
                    </span>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {translate('feedback.form.anonymous.description')}
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 sm:mt-8 bg-olive text-white py-4 sm:py-5 px-6 rounded-lg font-serif uppercase text-base sm:text-lg hover:bg-salvia active:bg-salvia transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg touch-manipulation min-h-[56px]"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{translate('feedback.form.submitting')}</span>
                  </>
                ) : (
                  <>
                    <span>{translate('feedback.form.submit', { count: uniqueProducts.length.toString() })}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-600 mt-4 sm:mt-6 text-xs sm:text-sm px-4">
          {translate('feedback.footer.note')}
        </p>
      </div>
    </div>
  );
}
