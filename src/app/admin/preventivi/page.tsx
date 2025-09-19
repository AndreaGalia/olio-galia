'use client';

import { useRouter } from 'next/navigation';
import { useAdminData } from '@/hooks/useAdminData';
import AdminLayout from '@/components/admin/AdminLayout';
import SearchFilters from '@/components/admin/SearchFilters';
import StatusBadge from '@/components/admin/StatusBadge';
import Pagination from '@/components/admin/Pagination';
import EmptyState from '@/components/admin/EmptyState';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import type { FormSummary } from '@/types/admin';

const formStatusOptions = [
  { value: 'all', label: 'Tutti gli stati' },
  { value: 'pending', label: 'In attesa' },
  { value: 'quote_sent', label: 'Preventivo inviato' },
  { value: 'paid', label: 'Pagato' },
  { value: 'in_preparazione', label: 'In preparazione' },
  { value: 'shipped', label: 'Spedito' },
  { value: 'confermato', label: 'Confermato' },
  { value: 'delivered', label: 'Consegnato' },
  { value: 'cancelled', label: 'Annullato' },
];

export default function AdminPreventiviPage() {
  const router = useRouter();
  const {
    data: forms,
    loading,
    error,
    totalPages,
    filters,
    setFilters,
    refresh
  } = useAdminData<FormSummary>({
    endpoint: '/api/admin/preventivi'
  });

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/admin/preventivi/create')}
        className="px-2 sm:px-4 py-2 bg-gradient-to-r from-salvia to-olive text-white rounded-lg hover:from-olive hover:to-salvia transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0 flex items-center space-x-1"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nuovo</span>
      </button>
      <button
        onClick={() => router.push('/admin/orders')}
        className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        Ordini
      </button>
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="px-2 sm:px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
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
      title="Gestione Preventivi"
      subtitle="Visualizza e gestisci tutti i preventivi"
      headerActions={headerActions}
    >
      <SearchFilters
        searchTerm={filters.search || ''}
        onSearchChange={handleSearchChange}
        statusFilter={filters.status || 'all'}
        onStatusChange={handleStatusChange}
        onRefresh={refresh}
        isLoading={loading}
        searchPlaceholder="Cerca per nome cliente, email, ID preventivo..."
        statusOptions={formStatusOptions}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Caricamento preventivi..." />
        ) : forms.length === 0 ? (
          <EmptyState
            icon={
              <svg className="mx-auto h-12 w-12 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Nessun preventivo trovato"
            description={
              filters.search || (filters.status && filters.status !== 'all')
                ? 'Prova a modificare i filtri di ricerca'
                : 'Non ci sono preventivi al momento'
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
                        Preventivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Totale
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                        Stato
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
                    {forms.map((form) => (
                      <tr key={form.id} className="hover:bg-olive/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-olive">{form.orderId}</div>
                            <div className="text-sm text-nocciola">{form.itemCount} prodotti</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{form.customerName}</div>
                            <div className="text-sm text-nocciola">{form.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-olive">
                            €{(form.finalTotal || form.total).toFixed(2)}
                          </div>
                          {form.finalTotal && form.finalTotal !== form.total && (
                            <div className="text-xs text-nocciola line-through">
                              €{form.total.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={form.status} type="form" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-nocciola">
                          {new Date(form.created).toLocaleDateString('it-IT')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/forms/${form.id}`)}
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
                {forms.map((form) => (
                  <div key={form.id} className="p-4 border-b border-olive/10 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-medium text-olive">{form.orderId}</h3>
                        <p className="text-xs text-nocciola">{form.itemCount} prodotti</p>
                      </div>
                      <StatusBadge status={form.status} type="form" />
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{form.customerName}</p>
                        <p className="text-xs text-nocciola">{form.customerEmail}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-bold text-olive">
                            €{(form.finalTotal || form.total).toFixed(2)}
                          </span>
                          {form.finalTotal && form.finalTotal !== form.total && (
                            <span className="text-xs text-nocciola line-through ml-2">
                              €{form.total.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-nocciola">
                          {new Date(form.created).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => router.push(`/admin/forms/${form.id}`)}
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