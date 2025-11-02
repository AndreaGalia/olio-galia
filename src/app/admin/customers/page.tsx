'use client';

import { useRouter } from 'next/navigation';
import { useAdminData } from '@/hooks/useAdminData';
import AdminLayout from '@/components/admin/AdminLayout';
import SearchFilters from '@/components/admin/SearchFilters';
import Pagination from '@/components/admin/Pagination';
import EmptyState from '@/components/admin/EmptyState';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { CustomerWithStats } from '@/types/customerTypes';
import { getCustomerSourceLabel } from '@/utils/formatters';
import { useState } from 'react';

const sortOptions = [
  { value: 'createdAt', label: 'Data registrazione' },
  { value: 'name', label: 'Nome' },
  { value: 'totalOrders', label: 'Numero ordini' },
  { value: 'totalSpent', label: 'Totale speso' },
];

export default function AdminCustomersPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'name' | 'totalOrders' | 'totalSpent' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    data: customers,
    loading,
    error,
    totalPages,
    filters,
    setFilters,
    refresh
  } = useAdminData<CustomerWithStats>({
    endpoint: '/api/admin/customers',
    dependencies: [sortBy, sortOrder]
  });

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/admin/customers/create')}
        className="px-2 sm:px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        + Nuovo Cliente
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

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'name' | 'totalOrders' | 'totalSpent' | 'createdAt');
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout
      title="Gestione Clienti"
      subtitle="Visualizza e gestisci tutti i tuoi clienti"
      headerActions={headerActions}
    >
      <div className="mb-6">
        <SearchFilters
          searchTerm={filters.search || ''}
          onSearchChange={handleSearchChange}
          onRefresh={refresh}
          isLoading={loading}
          searchPlaceholder="Cerca clienti per nome, email, telefono..."
        />

        {/* Sort Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Ordina per:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleSortOrder}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 cursor-pointer"
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

      {loading && <LoadingSpinner />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Errore nel caricamento dei clienti</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && customers && customers.length === 0 && (
        <EmptyState
          title="Nessun cliente trovato"
          description={
            filters.search
              ? "Nessun cliente corrisponde ai criteri di ricerca"
              : "Non ci sono ancora clienti registrati"
          }
          action={
            <button
              onClick={() => router.push('/admin/customers/create')}
              className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
            >
              Aggiungi Cliente
            </button>
          }
        />
      )}

      {!loading && !error && customers && customers.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-beige">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Contatti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Indirizzo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ordini
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Totale Speso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Registrato il
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr
                    key={customer._id?.toString()}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/customers/${customer._id?.toString()}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-olive rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getCustomerSourceLabel(customer.metadata.source)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      {customer.phone && (
                        <div className="text-xs text-gray-500">{customer.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {customer.address ? (
                        <div className="text-sm text-gray-900">
                          <div>{customer.address.street}</div>
                          <div className="text-xs text-gray-500">
                            {customer.address.postalCode} {customer.address.city}, {customer.address.country}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/D</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-olive text-white">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.metadata.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/customers/${customer._id?.toString()}`);
                        }}
                        className="text-olive hover:text-salvia cursor-pointer"
                      >
                        Dettagli →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {customers.map((customer) => (
              <div
                key={customer._id?.toString()}
                onClick={() => router.push(`/admin/customers/${customer._id?.toString()}`)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-olive rounded-full flex items-center justify-center text-white font-semibold">
                      {customer.firstName[0]}{customer.lastName[0]}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{customer.email}</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-olive text-white">
                    {customer.totalOrders} ordini
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  {customer.phone && (
                    <div className="text-gray-600">📞 {customer.phone}</div>
                  )}
                  {customer.address && (
                    <div className="text-gray-600">
                      📍 {customer.address.city}, {customer.address.country}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(customer.metadata.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && customers && customers.length > 0 && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </AdminLayout>
  );
}
