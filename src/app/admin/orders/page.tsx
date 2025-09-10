'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useAdminForms } from '@/hooks/useAdminForms';
import OrderFilters from './components/OrderFilters';
import OrderTableRow from './components/OrderTableRow';
import OrderCard from './components/OrderCard';
import FormTableRow from './components/FormTableRow';
import FormCard from './components/FormCard';
import Pagination from './components/Pagination';
import SearchBar from './components/SearchBar';

export default function AdminOrdersPage() {
  const { user, loading: authLoading, logout } = useAdminAuth();
  const { orders, loading, error, totalPages, currentPage, total, fetchOrders } = useAdminOrders();
  const { forms, loading: formsLoading, error: formsError, totalPages: formsTotalPages, currentPage: formsCurrentPage, total: formsTotal, fetchForms } = useAdminForms();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'forms'>('orders');
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const handlePageChange = (page: number) => {
    if (activeTab === 'orders') {
      fetchOrders(page, statusFilter, searchTerm);
    } else {
      fetchForms(page, statusFilter, searchTerm);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    if (activeTab === 'orders') {
      fetchOrders(1, status, searchTerm);
    } else {
      fetchForms(1, status, searchTerm);
    }
  };

  const handleTabChange = (tab: 'orders' | 'forms') => {
    setActiveTab(tab);
    setStatusFilter('all');
    setSearchTerm('');
    if (tab === 'orders') {
      fetchOrders(1, 'all', '');
    } else {
      fetchForms(1, 'all', '');
    }
  };

  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
    if (activeTab === 'orders') {
      fetchOrders(1, statusFilter, search);
    } else {
      fetchForms(1, statusFilter, search);
    }
  }, [activeTab, statusFilter, fetchOrders, fetchForms]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-olive/5">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-olive">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-olive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-serif text-olive">
                {activeTab === 'orders' ? 'Gestione Ordini' : 'Gestione Preventivi'}
              </h1>
              <p className="text-nocciola mt-1">
                Totale: {activeTab === 'orders' ? total : formsTotal} {activeTab === 'orders' ? 'ordini' : 'preventivi'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-olive/10">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-olive text-olive'
                    : 'border-transparent text-nocciola hover:text-olive hover:border-olive/50'
                }`}
              >
                Ordini ({total})
              </button>
              <button
                onClick={() => handleTabChange('forms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'forms'
                    ? 'border-olive text-olive'
                    : 'border-transparent text-nocciola hover:text-olive hover:border-olive/50'
                }`}
              >
                Preventivi ({formsTotal})
              </button>
            </nav>
          </div>
        </div>

        <SearchBar
          onSearch={handleSearch}
          placeholder={
            activeTab === 'orders' 
              ? "Cerca ordini per ID, nome cliente, email..." 
              : "Cerca preventivi per ID, nome cliente, email, telefono..."
          }
          loading={activeTab === 'orders' ? loading : formsLoading}
        />

        <OrderFilters 
          statusFilter={statusFilter}
          onStatusChange={handleStatusFilter}
        />

        {/* Lista Ordini/Preventivi */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
          <div className="p-6 border-b border-olive/10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-serif text-olive">
                {activeTab === 'orders' ? 'Ordini' : 'Preventivi'}
              </h2>
              <button
                onClick={() => activeTab === 'orders' ? fetchOrders(1, statusFilter, searchTerm) : fetchForms(1, statusFilter, searchTerm)}
                disabled={activeTab === 'orders' ? loading : formsLoading}
                className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50"
              >
                {(activeTab === 'orders' ? loading : formsLoading) ? 'Caricamento...' : 'Aggiorna'}
              </button>
            </div>
          </div>

          {((activeTab === 'orders' && error) || (activeTab === 'forms' && formsError)) && (
            <div className="p-6 bg-red-50 border-b border-red-200 text-red-700">
              {activeTab === 'orders' ? error : formsError}
            </div>
          )}

          {activeTab === 'orders' ? (
            // Ordini Tab
            loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-nocciola">Caricamento ordini...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-nocciola">
                Nessun ordine trovato.
              </div>
            ) : (
              <>
                {/* Tabella Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-olive/5 border-b border-olive/10">
                        <th className="text-left py-4 px-6 font-semibold text-olive">ID</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Cliente</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Email</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Totale</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Pagamento</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Spedizione</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Data</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <OrderTableRow
                          key={order.id}
                          order={order}
                          onRowClick={(orderId) => router.push(`/admin/orders/${orderId}`)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards Mobile */}
                <div className="md:hidden">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onCardClick={(orderId) => router.push(`/admin/orders/${orderId}`)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )
          ) : (
            // Preventivi/Forms Tab
            formsLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-nocciola">Caricamento preventivi...</p>
              </div>
            ) : forms.length === 0 ? (
              <div className="p-8 text-center text-nocciola">
                Nessun preventivo trovato.
              </div>
            ) : (
              <>
                {/* Tabella Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-olive/5 border-b border-olive/10">
                        <th className="text-left py-4 px-6 font-semibold text-olive">ID</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Cliente</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Email</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Telefono</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Provincia</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Stato</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Data</th>
                        <th className="text-left py-4 px-6 font-semibold text-olive">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.map((form) => (
                        <FormTableRow
                          key={form.id}
                          form={form}
                          onRowClick={(formId) => router.push(`/admin/forms/${formId}`)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards Mobile */}
                <div className="md:hidden">
                  {forms.map((form) => (
                    <FormCard
                      key={form.id}
                      form={form}
                      onCardClick={(formId) => router.push(`/admin/forms/${formId}`)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={formsCurrentPage}
                  totalPages={formsTotalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
}