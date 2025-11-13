'use client';

import { useRouter } from 'next/navigation';
import { useAdminData } from '@/hooks/useAdminData';
import AdminLayout from '@/components/admin/AdminLayout';
import SearchFilters from '@/components/admin/SearchFilters';
import Pagination from '@/components/admin/Pagination';
import EmptyState from '@/components/admin/EmptyState';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { SellerWithStats } from '@/types/sellerTypes';
import { useState } from 'react';

const sortOptions = [
  { value: 'totalSales', label: 'Fatturato' },
  { value: 'totalCommission', label: 'Commissioni' },
  { value: 'totalUnpaid', label: 'Da pagare' },
  { value: 'name', label: 'Nome' },
  { value: 'createdAt', label: 'Data registrazione' },
];

export default function AdminSellersPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'name' | 'totalSales' | 'totalCommission' | 'totalUnpaid' | 'createdAt'>('totalSales');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    data: sellers,
    loading,
    error,
    totalPages,
    filters,
    setFilters,
    refresh
  } = useAdminData<SellerWithStats>({
    endpoint: '/api/admin/sellers',
    dependencies: [sortBy, sortOrder]
  });

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/admin/sellers/create')}
        className="px-2 sm:px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        + Nuovo Venditore
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
    setSortBy(value as 'name' | 'totalSales' | 'totalCommission' | 'totalUnpaid' | 'createdAt');
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

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <AdminLayout
      title="Gestione Venditori"
      subtitle="Visualizza e gestisci tutti i tuoi venditori"
      headerActions={headerActions}
    >
      <div className="mb-6">
        <SearchFilters
          searchTerm={filters.search || ''}
          onSearchChange={handleSearchChange}
          onRefresh={refresh}
          isLoading={loading}
          searchPlaceholder="Cerca venditori per nome, email, telefono..."
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
          <p className="font-medium">Errore nel caricamento dei venditori</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && sellers && sellers.length === 0 && (
        <EmptyState
          title="Nessun venditore trovato"
          description={
            filters.search
              ? "Nessun venditore corrisponde ai criteri di ricerca"
              : "Non ci sono ancora venditori registrati"
          }
          action={
            <button
              onClick={() => router.push('/admin/sellers/create')}
              className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
            >
              Aggiungi Venditore
            </button>
          }
        />
      )}

      {!loading && !error && sellers && sellers.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-beige">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Venditore
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Contatti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Commissione %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Vendite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Fatturato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Commissioni
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Da Pagare
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sellers.map((seller) => (
                  <tr
                    key={seller._id?.toString()}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/sellers/${seller._id?.toString()}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-olive rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(seller.name)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {seller.name}
                          </div>
                          {!seller.metadata.isActive && (
                            <div className="text-xs text-red-500">
                              (Archiviato)
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{seller.email}</div>
                      <div className="text-xs text-gray-500">{seller.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-olive text-white">
                        {seller.commissionPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {seller.confirmedQuotesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(seller.totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(seller.totalCommission)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${seller.totalUnpaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(seller.totalUnpaid)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/sellers/${seller._id?.toString()}`);
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
            {sellers.map((seller) => (
              <div
                key={seller._id?.toString()}
                onClick={() => router.push(`/admin/sellers/${seller._id?.toString()}`)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-olive rounded-full flex items-center justify-center text-white font-semibold">
                      {getInitials(seller.name)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {seller.name}
                      </div>
                      <div className="text-xs text-gray-500">{seller.email}</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-olive text-white">
                    {seller.commissionPercentage}%
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600">📞 {seller.phone}</div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-gray-500">Fatturato:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(seller.totalSales)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Commissioni:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(seller.totalCommission)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Da pagare:</span>
                    <span className={`font-medium ${seller.totalUnpaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(seller.totalUnpaid)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 pt-2">
                    {seller.confirmedQuotesCount} vendite
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && sellers && sellers.length > 0 && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </AdminLayout>
  );
}
