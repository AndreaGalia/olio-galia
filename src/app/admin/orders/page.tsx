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
        onRefresh={refresh}
        isLoading={loading}
        searchPlaceholder="Cerca ordini per nome cliente, email, ID ordine..."
        statusOptions={orderStatusOptions}
      />

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
                : 'Non ci sono ordini al momento'
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