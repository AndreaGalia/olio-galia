'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface FormSummary {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  created: string;
  itemCount: number;
  finalTotal?: number;
}

export default function AdminPreventiviPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [forms, setForms] = useState<FormSummary[]>([]);
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
      fetchForms();
    }
  }, [user, currentPage, statusFilter, searchTerm]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/preventivi?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel recupero dei preventivi');
      }

      const data = await response.json();
      setForms(data.forms);
      setTotalPages(data.totalPages);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('Errore recupero preventivi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'quote_sent': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_preparazione': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'confermato': return 'text-green-700 bg-green-100 border-green-300';
      case 'delivered': return 'text-green-700 bg-green-100 border-green-300';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'In attesa';
      case 'quote_sent': return 'Preventivo inviato';
      case 'paid': return 'Pagato';
      case 'in_preparazione': return 'In preparazione';
      case 'shipped': return 'Spedito';
      case 'confermato': return 'Confermato';
      case 'delivered': return 'Consegnato';
      case 'cancelled': return 'Annullato';
      default: return status;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchForms();
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
              <h1 className="text-xl sm:text-3xl font-serif text-olive truncate">Gestione Preventivi</h1>
              <p className="text-nocciola mt-1 text-sm sm:text-base truncate">Visualizza e gestisci tutti i preventivi</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
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
                  placeholder="Cerca per nome cliente, email, ID preventivo..."
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
                <option value="pending">In attesa</option>
                <option value="quote_sent">Preventivo inviato</option>
                <option value="paid">Pagato</option>
                <option value="in_preparazione">In preparazione</option>
                <option value="shipped">Spedito</option>
                <option value="confermato">Confermato</option>
                <option value="delivered">Consegnato</option>
                <option value="cancelled">Annullato</option>
              </select>
              
              <button
                onClick={fetchForms}
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

        {/* Lista Preventivi */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-olive">Caricamento preventivi...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-olive">Nessun preventivo trovato</h3>
              <p className="mt-1 text-sm text-nocciola">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca' 
                  : 'Non ci sono preventivi al momento'
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(form.status)}`}>
                            {getStatusText(form.status)}
                          </span>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(form.status)}`}>
                        {getStatusText(form.status)}
                      </span>
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