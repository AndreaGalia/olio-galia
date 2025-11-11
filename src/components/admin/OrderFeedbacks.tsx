'use client';

import { useState, useEffect } from 'react';

interface Feedback {
  id: string;
  productId: string | null;
  productName: string;
  rating: number;
  comment: string;
  customerEmail: string;
  customerName: string;
  isAnonymous: boolean;
  orderType: 'order' | 'quote';
  createdAt: string;
}

interface OrderFeedbacksProps {
  orderId: string;
  orderType?: 'order' | 'quote';
}

export default function OrderFeedbacks({ orderId, orderType = 'order' }: OrderFeedbacksProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, [orderId]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/orders/${orderId}/feedbacks`);

      if (!response.ok) {
        throw new Error('Errore nel recupero dei feedback');
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
    } catch (error) {
      console.error('Errore nel recupero dei feedback:', error);
      setError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
        <span className="ml-2 text-sm font-semibold text-olive">{rating}/5</span>
      </div>
    );
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mr-3"></div>
          <p className="text-olive">Caricamento recensioni...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-200">
        <div className="flex items-center text-red-600">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mr-3 sm:mr-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif text-olive font-semibold">
              Recensioni Cliente
            </h2>
            <p className="text-sm text-nocciola">
              {feedbacks.length} {feedbacks.length === 1 ? 'recensione' : 'recensioni'} •
              Media: {getAverageRating()}/5
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="p-4 bg-gradient-to-r from-sabbia/20 to-beige/20 rounded-xl border border-nocciola/10"
          >
            {/* Header con prodotto e rating */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-olive text-sm sm:text-base truncate">
                  {feedback.productName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-nocciola">
                    {feedback.isAnonymous ? (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                          Anonimo
                        </span>
                      </>
                    ) : (
                      <>{feedback.customerName}</>
                    )}
                  </p>
                  <span className="text-xs text-nocciola/50">•</span>
                  <p className="text-xs text-nocciola">
                    {new Date(feedback.createdAt).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {renderStars(feedback.rating)}
              </div>
            </div>

            {/* Commento */}
            {feedback.comment && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-olive/10">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {feedback.comment}
                </p>
              </div>
            )}

            {/* Email (sempre visibile per admin) */}
            <div className="mt-3 pt-3 border-t border-nocciola/10">
              <p className="text-xs text-nocciola/70">
                Email cliente: <span className="font-mono font-medium text-olive">{feedback.customerEmail}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
