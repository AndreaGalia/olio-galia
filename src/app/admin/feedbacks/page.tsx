'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SearchFilters from '@/components/admin/SearchFilters';
import Pagination from '@/components/admin/Pagination';
import EmptyState from '@/components/admin/EmptyState';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

interface FeedbackStats {
  total: number;
  avgRating: number;
  ratingDistribution: Record<number, number>;
  byType: Record<string, number>;
}

interface FeedbackItem {
  _id: string;
  orderId: string;
  productId?: string;
  productName: string;
  orderType: 'order' | 'quote';
  rating: number;
  comment: string;
  customerName: string;
  customerEmail: string;
  isAnonymous: boolean;
  createdAt: Date;
  orderInfo?: {
    orderNumber: string;
    orderDate: Date | null;
    itemCount: number;
  };
}

export default function AdminFeedbacksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderType, setOrderType] = useState<'all' | 'order' | 'quote'>('all');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [productName, setProductName] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Carica statistiche
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/admin/feedbacks/stats');
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Errore nel caricamento statistiche:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Carica prodotti disponibili
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await fetch('/api/admin/feedbacks/products');
        const data = await response.json();

        if (data.success) {
          setAvailableProducts(data.products);
        }
      } catch (err) {
        console.error('Errore nel caricamento prodotti:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Carica feedback
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          orderType,
          productName,
          sortBy,
          sortOrder,
        });

        if (minRating) {
          params.append('minRating', minRating.toString());
        }

        const response = await fetch(`/api/admin/feedbacks?${params}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Errore nel caricamento');
          return;
        }

        setFeedbacks(data.feedbacks);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error('Errore nel caricamento feedback:', err);
        setError('Errore nel caricamento dei feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [page, orderType, minRating, productName, sortBy, sortOrder]);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const renderStars = useCallback((rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-olive' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  }, []);

  const headerActions = (
    <button
      onClick={() => router.push('/admin/dashboard')}
      className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap"
    >
      Dashboard
    </button>
  );

  return (
    <AdminLayout
      title="Feedback Clienti"
      subtitle="Visualizza e analizza i feedback ricevuti"
      headerActions={headerActions}
    >
      {/* Statistiche */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Totale Feedback */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">Totale Feedback</p>
                <p className="text-3xl font-bold text-olive mt-2">{stats.total}</p>
              </div>
              <div className="text-olive">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Media Rating */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">Media Valutazione</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-3xl font-bold text-olive">{stats.avgRating.toFixed(1)}</p>
                  <span className="text-2xl text-olive">★</span>
                </div>
              </div>
              <div className="text-olive">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feedback Ordini */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">Da Ordini</p>
                <p className="text-3xl font-bold text-olive mt-2">{stats.byType.order || 0}</p>
              </div>
              <div className="text-olive">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feedback Preventivi */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">Da Preventivi</p>
                <p className="text-3xl font-bold text-olive mt-2">{stats.byType.quote || 0}</p>
              </div>
              <div className="text-olive">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="mb-6 bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Tipo Ordine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={orderType}
              onChange={(e) => {
                setOrderType(e.target.value as 'all' | 'order' | 'quote');
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
            >
              <option value="all">Tutti</option>
              <option value="order">Solo Ordini</option>
              <option value="quote">Solo Preventivi</option>
            </select>
          </div>

          {/* Prodotto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prodotto</label>
            <select
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setPage(1);
              }}
              disabled={productsLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent disabled:bg-gray-100"
            >
              <option value="all">Tutti i Prodotti</option>
              {availableProducts.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Minimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating Minimo</label>
            <select
              value={minRating || ''}
              onChange={(e) => {
                setMinRating(e.target.value ? parseInt(e.target.value) : null);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
            >
              <option value="">Tutti</option>
              <option value="5">5 stelle</option>
              <option value="4">4+ stelle</option>
              <option value="3">3+ stelle</option>
              <option value="2">2+ stelle</option>
              <option value="1">1+ stelle</option>
            </select>
          </div>

          {/* Ordina per */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordina per</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'rating')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent"
            >
              <option value="createdAt">Data</option>
              <option value="rating">Valutazione</option>
            </select>
          </div>

          {/* Ordine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordine</label>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {sortOrder === 'asc' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                  Crescente
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  Decrescente
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Errore nel caricamento dei feedback</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && feedbacks.length === 0 && (
        <EmptyState
          title="Nessun feedback trovato"
          description="Non ci sono ancora feedback con i filtri selezionati."
        />
      )}

      {!loading && !error && feedbacks.length > 0 && (
        <>
          {/* Lista Feedback */}
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(feedback.rating)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        feedback.orderType === 'order'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {feedback.orderType === 'order' ? 'Ordine' : 'Preventivo'}
                      </span>
                      {feedback.isAnonymous && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Anonimo
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {feedback.isAnonymous ? 'Cliente Anonimo' : feedback.customerName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feedback.isAnonymous
                        ? `${feedback.customerEmail.charAt(0)}***@${feedback.customerEmail.split('@')[1] || '***'}`
                        : feedback.customerEmail
                      }
                    </p>
                    {feedback.productName && (
                      <p className="text-sm text-olive font-medium mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        {feedback.productName}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {formatDate(feedback.createdAt)}
                  </div>
                </div>

                <p className="text-gray-700 mb-4 italic">"{feedback.comment}"</p>

                {feedback.orderInfo && (
                  <div className="text-sm text-gray-600 border-t border-gray-100 pt-3">
                    <span className="font-medium">Ordine #{feedback.orderInfo.orderNumber}</span>
                    {' · '}
                    <span>{feedback.orderInfo.itemCount} prodotti</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paginazione */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
