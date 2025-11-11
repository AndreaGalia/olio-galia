'use client';

import { useRouter } from 'next/navigation';
import { useAdminData } from '@/hooks/useAdminData';
import AdminLayout from '@/components/admin/AdminLayout';
import SearchFilters from '@/components/admin/SearchFilters';
import StatusBadge from '@/components/admin/StatusBadge';
import Pagination from '@/components/admin/Pagination';
import EmptyState from '@/components/admin/EmptyState';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import type { OrderSummary } from '@/types/admin';

const orderStatusOptions = [
  { value: 'all', label: 'Tutti gli stati' },
  { value: 'paid', label: 'Pagato' },
  { value: 'shipping', label: 'In spedizione' },
  { value: 'shipped', label: 'Spedito' },
  { value: 'delivered', label: 'Consegnato' },
  { value: 'pending', label: 'In attesa' },
  { value: 'cancelled', label: 'Annullato' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const {
    data: orders,
    loading,
    error,
    totalPages,
    filters,
    setFilters,
    refresh
  } = useAdminData<OrderSummary>({
    endpoint: '/api/admin/orders'
  });

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/admin/preventivi')}
        className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        Preventivi
      </button>
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        Dashboard
      </button>
    </>
  );

  const handleSearchChange = (search: string) => {
    setFilters({ search });
  };

  const handleStatusChange = (status: string) => {
    setFilters({ status });
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleToggleStripe = () => {
    setFilters({ includeStripe: !filters.includeStripe });
  };

  const handleFeedbackFilterChange = (feedbackFilter: string) => {
    setFilters({ feedbackFilter });
  };

  return (
    <AdminLayout
      title="Gestione Ordini"
      subtitle="Visualizza e gestisci tutti gli ordini"
      headerActions={headerActions}
    >
      <SearchFilters
        searchTerm={filters.search || ''}
        onSearchChange={handleSearchChange}
        statusFilter={filters.status || 'all'}
        onStatusChange={handleStatusChange}
        feedbackFilter={filters.feedbackFilter || 'all'}
        onFeedbackFilterChange={handleFeedbackFilterChange}
        onRefresh={refresh}
        isLoading={loading}
        searchPlaceholder="Cerca ordini per nome cliente, email, ID ordine..."
        statusOptions={orderStatusOptions}
      />

      {filters.includeStripe && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800">
              Stai visualizzando anche gli ordini direttamente da Stripe non ancora salvati nel database
            </span>
          </div>
          <button
            onClick={handleToggleStripe}
            className="px-3 py-1 text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Nascondi ordini Stripe
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Caricamento ordini..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={
              <svg className="mx-auto h-12 w-12 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
            }
            title="Nessun ordine trovato"
            description={
              filters.search || (filters.status && filters.status !== 'all')
                ? 'Prova a modificare i filtri di ricerca'
                : filters.includeStripe
                  ? 'Non ci sono ordini disponibili'
                  : 'Non ci sono ordini salvati nel database'
            }
            action={
              !filters.includeStripe && !filters.search && (!filters.status || filters.status === 'all') ? (
                <button
                  onClick={handleToggleStripe}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Visualizza Ordini Stripe</span>
                </button>
              ) : null
            }
          />
        ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-olive/10">
                  <thead className="bg-olive/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Ordine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Totale
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Pagamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Spedizione
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Recensione
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-olive/10">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-olive/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-olive">{order.sessionId.slice(-8)}</div>
                            <div className="text-sm text-nocciola">{order.itemCount} prodotti</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-nocciola">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-olive">
                            €{order.total.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.paymentStatus} type="payment" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.shippingStatus} type="shipping" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.hasFeedback ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              Presente
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                              Assente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-nocciola">
                          {new Date(order.created).toLocaleDateString('it-IT')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                            className="text-olive hover:text-salvia transition-colors cursor-pointer"
                          >
                            Dettagli
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border-b border-olive/10 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-medium text-olive">{order.sessionId.slice(-8)}</h3>
                        <p className="text-xs text-nocciola">{order.itemCount} prodotti</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <StatusBadge status={order.paymentStatus} type="payment" />
                        <StatusBadge status={order.shippingStatus} type="shipping" />
                        {order.hasFeedback ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Recensione
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                            Nessuna recensione
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-nocciola">{order.customerEmail}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-bold text-olive">
                            €{order.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-nocciola">
                          {new Date(order.created).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="w-full mt-3 px-4 py-2 text-sm bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
                      >
                        Visualizza Dettagli
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
    </AdminLayout>
  );
}