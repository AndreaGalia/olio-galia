'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useT } from '@/hooks/useT';
import FeedbackLoadingState from '@/components/feedback/FeedbackLoadingState';
import FeedbackErrorState from '@/components/feedback/FeedbackErrorState';
import FeedbackAlreadySubmitted from '@/components/feedback/FeedbackAlreadySubmitted';
import FeedbackSuccessState from '@/components/feedback/FeedbackSuccessState';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import type { OrderInfo, UniqueProduct, ProductFeedback, ExistingFeedbackItem } from '@/components/feedback/types';

interface FeedbackExistsResponse {
  exists: boolean;
  feedbacks?: ExistingFeedbackItem[];
  allProductsFeedback: boolean;
}

const MAX_COMMENT_LENGTH = 500;

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

  useEffect(() => {
    if (success && successDivRef.current) {
      successDivRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [success]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const orderResponse = await fetch('/api/feedback/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const orderData = await orderResponse.json();

        if (!orderResponse.ok || !orderData.success) {
          setError(orderData.error || translate('feedback.error.invalidToken'));
          setLoading(false);
          return;
        }

        setOrderInfo(orderData.order);

        // Raggruppa prodotti duplicati per nome
        const productsMap = new Map<string, { productId?: string | null; quantity: number }>();
        orderData.order.items.forEach((item: { productId?: string | null; name: string; quantity: number }) => {
          const existing = productsMap.get(item.name);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            productsMap.set(item.name, { productId: item.productId || null, quantity: item.quantity });
          }
        });

        const uniqueProds: UniqueProduct[] = Array.from(productsMap.entries()).map(([name, data]) => ({
          productId: data.productId,
          productName: name,
          quantity: data.quantity,
        }));
        setUniqueProducts(uniqueProds);

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

    if (token) fetchData();
  }, [token]);

  const handleRatingChange = useCallback((productName: string, rating: number) => {
    setProductFeedbacks(prev => ({
      ...prev,
      [productName]: { ...prev[productName], rating },
    }));
  }, []);

  const handleCommentChange = useCallback((productName: string, comment: string) => {
    setProductFeedbacks(prev => ({
      ...prev,
      [productName]: { ...prev[productName], comment },
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderInfo) {
      setError(translate('feedback.error.orderNotFound'));
      return;
    }

    const feedbackArray = Object.values(productFeedbacks);
    const errors: string[] = [];

    feedbackArray.forEach(fb => {
      if (fb.rating === 0) {
        errors.push(translate('feedback.form.error.selectRating', { productName: fb.productName }));
      }
      if (!fb.comment || fb.comment.trim().length === 0) {
        errors.push(translate('feedback.form.error.addComment', { productName: fb.productName }));
      }
      if (fb.comment.length > MAX_COMMENT_LENGTH) {
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

      const response = await fetch('/api/feedback/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderInfo.orderId,
          customerEmail: orderInfo.customerEmail,
          customerName: orderInfo.customerName,
          isAnonymous,
          orderType: orderInfo.orderType,
          feedbacks: feedbackArray.map(fb => ({
            productId: fb.productId || null,
            productName: fb.productName,
            rating: fb.rating,
            comment: fb.comment.trim(),
          })),
        }),
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

  if (loading) return <FeedbackLoadingState />;

  if (error && !orderInfo) {
    return <FeedbackErrorState error={error} onBack={() => router.push('/')} />;
  }

  if (existingFeedback?.exists) {
    return (
      <FeedbackAlreadySubmitted
        feedbacks={existingFeedback.feedbacks}
        onBack={() => router.push('/')}
      />
    );
  }

  if (success) {
    return (
      <div ref={successDivRef}>
        <FeedbackSuccessState
          onExplore={() => router.push('/products')}
          onHome={() => router.push('/')}
        />
      </div>
    );
  }

  return (
    <FeedbackForm
      orderInfo={orderInfo!}
      uniqueProducts={uniqueProducts}
      productFeedbacks={productFeedbacks}
      onRatingChange={handleRatingChange}
      onCommentChange={handleCommentChange}
      isAnonymous={isAnonymous}
      onAnonymousChange={setIsAnonymous}
      submitting={submitting}
      error={error}
      onSubmit={handleSubmit}
      maxCommentLength={MAX_COMMENT_LENGTH}
    />
  );
}
