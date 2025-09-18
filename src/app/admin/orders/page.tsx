'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface OrderSummary {
  id: string;
  sessionId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  paymentStatus: string;
  shippingStatus: string;
  created: string;
  itemCount: number;
}

export default function AdminOrdersPage() {
  const { user, loading: authLoading, logout } = useAdminAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, currentPage, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel recupero degli ordini');
      }

      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.totalPages);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('Errore recupero ordini:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'shipping': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delivered': return 'text-green-700 bg-green-100 border-green-300';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagato';
      case 'shipping': return 'In spedizione';
      case 'shipped': return 'Spedito';
      case 'delivered': return 'Consegnato';
      case 'pending': return 'In attesa';
      case 'cancelled': return 'Annullato';
      default: return status;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

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
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-serif text-olive truncate">Gestione Ordini</h1>
              <p className="text-nocciola mt-1 text-sm sm:text-base truncate">Visualizza e gestisci tutti gli ordini</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtri e Ricerca */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Ricerca */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cerca ordini per nome cliente, email, ID ordine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-olive/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Filtro Status */}
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
              >
                <option value="all">Tutti gli stati</option>
                <option value="paid">Pagato</option>
                <option value="shipping">In spedizione</option>
                <option value="shipped">Spedito</option>
                <option value="delivered">Consegnato</option>
                <option value="pending">In attesa</option>
                <option value="cancelled">Annullato</option>
              </select>
              
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="px-6 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Aggiorna</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Lista Ordini */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-olive">Caricamento ordini...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-olive">Nessun ordine trovato</h3>
              <p className="mt-1 text-sm text-nocciola">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca' 
                  : 'Non ci sono ordini al momento'
                }
              </p>
            </div>
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.paymentStatus)}`}>
                            {getStatusText(order.paymentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.shippingStatus)}`}>
                            {getStatusText(order.shippingStatus)}
                          </span>
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.paymentStatus)}`}>
                          {getStatusText(order.paymentStatus)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.shippingStatus)}`}>
                          {getStatusText(order.shippingStatus)}
                        </span>
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

              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-olive/5 border-t border-olive/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-nocciola">
                      Pagina {currentPage} di {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-olive/20 rounded hover:bg-olive hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Precedente
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-olive/20 rounded hover:bg-olive hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Successiva
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}