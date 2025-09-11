'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminOrderDetails {
  id: string;
  sessionId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  created: string;
  itemCount: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
  }>;
  pricing: {
    subtotal: number;
    shippingCost: number;
    total: number;
  };
  shipping?: {
    address: string;
    method: string;
  };
  paymentIntent: string | null;
  mongoId?: string;
  orderId?: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  shippingTrackingId?: string;
}

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [orderId, setOrderId] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<AdminOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [shippingForm, setShippingForm] = useState({
    trackingId: '',
    status: 'shipping'
  });
  const [isSubmittingShipping, setIsSubmittingShipping] = useState(false);
  const [shippingSuccess, setShippingSuccess] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const getShippingStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800' },
      shipping: { label: 'In Preparazione', color: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Spedito', color: 'bg-green-100 text-green-800' },
      delivered: { label: 'Consegnato', color: 'bg-purple-100 text-purple-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: 'Sconosciuto', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading, logout } = useAdminAuth();
  const router = useRouter();

  // Unwrap params
  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (orderId && user) {
      fetchOrderDetails();
    }
  }, [orderId, user]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/orders/${orderId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel recupero dei dettagli ordine');
      }

      const data = await response.json();
      setOrderDetails(data.order);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('Errore recupero dettagli ordine:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const handleDeliverySubmit = async () => {
    setIsSubmittingShipping(true);
    setShippingError(null);
    setShippingSuccess(false);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingTrackingId: orderDetails?.shippingTrackingId,
          shippingStatus: 'delivered',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'aggiornamento');
      }

      setOrderDetails(data.order);
      setShippingSuccess(true);
      
      setTimeout(() => {
        setShippingSuccess(false);
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setShippingError(errorMessage);
    } finally {
      setIsSubmittingShipping(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica che l'ID spedizione sia richiesto solo quando lo stato è "shipped"
    if (shippingForm.status === 'shipped' && !shippingForm.trackingId.trim()) {
      setShippingError('ID spedizione è richiesto quando lo stato è "spedito"');
      return;
    }

    setIsSubmittingShipping(true);
    setShippingError(null);
    setShippingSuccess(false);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingTrackingId: shippingForm.status === 'shipped' ? shippingForm.trackingId.trim() : undefined,
          shippingStatus: shippingForm.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'aggiornamento');
      }

      setOrderDetails(data.order);
      setShippingSuccess(true);
      setShippingForm({ trackingId: '', status: 'shipping' });
      
      // Nascondi il messaggio di successo dopo 3 secondi
      setTimeout(() => {
        setShippingSuccess(false);
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setShippingError(errorMessage);
    } finally {
      setIsSubmittingShipping(false);
    }
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
          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-serif text-olive">Dettagli Ordine</h1>
              {orderDetails?.paymentIntent && (
                <p className="text-nocciola mt-1">
                  Payment Intent: {orderDetails.paymentIntent.slice(-8)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/orders')}
                className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
              >
                ← Indietro
              </button>
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

          {/* Mobile Header */}
          <div className="md:hidden py-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => router.push('/admin/orders')}
                className="p-2 text-olive hover:bg-olive/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-olive hover:bg-olive/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-serif text-olive">Dettagli Ordine</h1>
              {orderDetails?.paymentIntent && (
                <p className="text-nocciola text-sm mt-1">
                  Payment Intent: {orderDetails.paymentIntent.slice(-8)}
                </p>
              )}
            </div>
            <div className="flex justify-center mt-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-3 py-1 text-sm text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-olive/10 text-center">
            <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-nocciola">Caricamento dettagli ordine...</p>
          </div>
        ) : error ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Errore</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchOrderDetails}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Riprova
              </button>
            </div>
          </div>
        ) : !orderDetails ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-olive/10 text-center">
            <h3 className="text-xl font-semibold text-nocciola mb-2">Ordine non trovato</h3>
            <p className="text-nocciola">L'ordine richiesto non esiste o non è accessibile.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Bar */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
              {/* Mobile Layout */}
              <div className="block sm:hidden space-y-4">
                <div className="flex flex-wrap gap-2">
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    orderDetails.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {orderDetails.paymentStatus === 'paid' ? '✓ Pagato' : '⏳ Non Pagato'}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    orderDetails.shippingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    orderDetails.shippingStatus === 'shipping' ? 'bg-blue-100 text-blue-800' :
                    orderDetails.shippingStatus === 'shipped' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {orderDetails.shippingStatus === 'pending' ? 'In Attesa' :
                     orderDetails.shippingStatus === 'shipping' ? 'In Preparazione' :
                     orderDetails.shippingStatus === 'shipped' ? 'Spedito' :
                     'Consegnato'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-nocciola">
                    <span className="font-medium">Creato:</span> {new Date(orderDetails.created).toLocaleDateString('it-IT')}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-serif text-olive font-bold">
                      €{orderDetails.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-nocciola">
                      #{orderDetails.paymentIntent?.slice(-8) || orderDetails.id.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                    orderDetails.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {orderDetails.paymentStatus === 'paid' ? '✓ Pagato' : '⏳ Non Pagato'}
                  </div>
                  {getShippingStatusBadge(orderDetails.shippingStatus)}
                  <div className="text-sm text-nocciola">
                    <div className="font-medium">Creato il</div>
                    <div>{new Date(orderDetails.created).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl sm:text-3xl font-serif text-olive font-bold">
                    €{orderDetails.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-nocciola uppercase tracking-wide">
                    {orderDetails.currency} • Ordine #{orderDetails.paymentIntent?.slice(-8) || orderDetails.id.slice(-8)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Form Spedizione - Solo se non ancora spedito */}
              {orderDetails.paymentStatus === 'paid' && orderDetails.shippingStatus !== 'shipped' && orderDetails.shippingStatus !== 'delivered' && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
                  <h2 className="text-lg sm:text-xl font-serif text-olive mb-4 sm:mb-6 flex items-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Gestione Spedizione
                  </h2>

                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    {/* ID Spedizione - Solo quando lo stato è "shipped" */}
                    {shippingForm.status === 'shipped' && (
                      <div>
                        <label htmlFor="trackingId" className="block text-sm font-medium text-nocciola mb-2">
                          ID Spedizione *
                        </label>
                        <input
                          type="text"
                          id="trackingId"
                          value={shippingForm.trackingId}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, trackingId: e.target.value }))}
                          placeholder="Inserisci l'ID di tracciamento"
                          className="w-full px-4 py-2 border border-nocciola/30 rounded-lg focus:ring-2 focus:ring-olive focus:border-olive"
                          disabled={isSubmittingShipping}
                        />
                        <p className="text-xs text-nocciola/70 mt-1">
                          L'ID spedizione sarà inviato automaticamente al cliente via email
                        </p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="shippingStatus" className="block text-sm font-medium text-nocciola mb-2">
                        Stato Spedizione
                      </label>
                      <select
                        id="shippingStatus"
                        value={shippingForm.status}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, status: e.target.value, trackingId: e.target.value !== 'shipped' ? '' : prev.trackingId }))}
                        className="w-full px-4 py-2 border border-nocciola/30 rounded-lg focus:ring-2 focus:ring-olive focus:border-olive"
                        disabled={isSubmittingShipping}
                      >
                        <option value="shipping">In Preparazione</option>
                        <option value="shipped">Spedito</option>
                        <option value="delivered">Consegnato</option>
                      </select>
                      <p className="text-xs text-nocciola/70 mt-1">
                        {shippingForm.status === 'shipping' && 'Ordine in preparazione - nessuna email sarà inviata'}
                        {shippingForm.status === 'shipped' && 'Email di spedizione sarà inviata automaticamente al cliente'}
                        {shippingForm.status === 'delivered' && 'Ordine consegnato'}
                      </p>
                    </div>

                    {shippingError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {shippingError}
                      </div>
                    )}

                    {shippingSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        ✅ Stato spedizione aggiornato con successo!
                        {orderDetails?.shippingStatus === 'shipped' && ' Email inviata al cliente.'}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingShipping || (shippingForm.status === 'shipped' && !shippingForm.trackingId.trim())}
                      className="w-full sm:w-auto px-6 py-3 bg-olive text-white font-semibold rounded-lg hover:bg-olive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isSubmittingShipping ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Aggiornamento...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414M4 13h2.586a1 1 0 01.707.293l2.414 2.414" />
                          </svg>
                          Aggiorna Spedizione
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Form Consegna - Solo se spedito ma non consegnato */}
              {orderDetails.shippingStatus === 'shipped' && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
                  <h2 className="text-lg sm:text-xl font-serif text-olive mb-4 sm:mb-6 flex items-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Conferma Consegna
                  </h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Ordine spedito:</strong> Clicca il pulsante qui sotto per confermare che l'ordine è stato consegnato. 
                      Verrà inviata automaticamente una email di conferma al cliente.
                    </p>
                  </div>

                  <button
                    onClick={handleDeliverySubmit}
                    disabled={isSubmittingShipping}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSubmittingShipping ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Confermando consegna...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Conferma Consegna
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Info Consegna Completata - Solo se consegnato */}
              {orderDetails.shippingStatus === 'delivered' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-200">
                  <h2 className="text-lg sm:text-xl font-serif text-green-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ✅ Ordine Consegnato
                  </h2>
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-700">Stato:</span>
                        <span className="text-sm font-bold text-green-800 bg-green-100 px-3 py-1 rounded">
                          ✅ Consegnato
                        </span>
                      </div>
                      {orderDetails.shippingTrackingId && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-700">ID Spedizione:</span>
                          <span className="text-sm font-mono font-bold text-green-800 bg-green-100 px-3 py-1 rounded">
                            {orderDetails.shippingTrackingId}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-600">
                        📧 Email di conferma consegna inviata automaticamente al cliente
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Tracking - Solo se spedito ma non ancora consegnato */}
              {orderDetails.shippingTrackingId && orderDetails.shippingStatus !== 'delivered' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-200">
                  <h2 className="text-lg sm:text-xl font-serif text-green-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Spedizione Completata
                  </h2>
                  <div className="bg-white rounded-lg p-4 border border-green-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">ID Spedizione:</span>
                      <span className="text-sm font-mono font-bold text-green-800 bg-green-100 px-3 py-1 rounded">
                        {orderDetails.shippingTrackingId}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      📧 Email di notifica inviata automaticamente al cliente
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Informazioni Cliente */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
                <h2 className="text-lg sm:text-xl font-serif text-olive mb-4 sm:mb-6 flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informazioni Cliente
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-nocciola/70 mb-1">Nome Completo</label>
                    <p className="text-olive font-semibold">{orderDetails.customer?.name || orderDetails.customerName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-nocciola/70 mb-1">Email</label>
                    <p className="text-olive">{orderDetails.customer?.email || orderDetails.customerEmail}</p>
                  </div>

                  {orderDetails.customer?.phone && (
                    <div>
                      <label className="block text-sm font-medium text-nocciola/70 mb-1">Telefono</label>
                      <p className="text-olive">{orderDetails.customer.phone}</p>
                    </div>
                  )}
                  
                  {orderDetails.shipping && (
                    <div>
                      <label className="block text-sm font-medium text-nocciola/70 mb-1">Indirizzo di Spedizione</label>
                      <p className="text-olive">{orderDetails.shipping.address}</p>
                      <p className="text-sm text-nocciola mt-1">
                        Metodo: {orderDetails.shipping.method}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stati Ordine - Solo Desktop */}
              <div className="hidden sm:block bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
                <h2 className="text-xl font-serif text-olive mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Stati Ordine
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-nocciola/70 mb-2">Stato Pagamento</label>
                    <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                      orderDetails.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderDetails.paymentStatus === 'paid' ? '✓ Pagato' : '⏳ Non Pagato'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-nocciola/70 mb-2">Stato Spedizione</label>
                    {getShippingStatusBadge(orderDetails.shippingStatus)}
                  </div>
                </div>
              </div>

              {/* Informazioni Tecniche */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
                <h2 className="text-lg sm:text-xl font-serif text-olive mb-4 sm:mb-6 flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Dettagli Tecnici
                </h2>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-nocciola/70 mb-1">Stato Ordine</label>
                      <p className="text-olive font-semibold capitalize">{orderDetails.status}</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-nocciola/70 mb-1">Valuta</label>
                      <p className="text-olive font-semibold uppercase">{orderDetails.currency}</p>
                    </div>
                  </div>

                  {orderDetails.paymentIntent && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-nocciola/70 mb-1">ID Pagamento</label>
                      <p className="text-olive font-mono text-xs sm:text-sm bg-olive/5 p-2 rounded break-all">{orderDetails.paymentIntent}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-nocciola/70 mb-1">ID Sessione</label>
                    <p className="text-olive font-mono text-xs sm:text-sm bg-olive/5 p-2 rounded break-all">{orderDetails.sessionId}</p>
                  </div>

                  {orderDetails.updatedAt && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-nocciola/70 mb-1">Ultimo Aggiornamento</label>
                      <p className="text-olive text-xs sm:text-sm">
                        {new Date(orderDetails.updatedAt).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prodotti Ordinati */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
              <h2 className="text-lg sm:text-xl font-serif text-olive mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
                Prodotti ({orderDetails.itemCount} {orderDetails.itemCount === 1 ? 'articolo' : 'articoli'})
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                {orderDetails.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-sabbia/20 to-beige/20 rounded-xl border border-nocciola/10 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {item.image ? (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-olive/10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-olive/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-olive/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-olive text-sm sm:text-base truncate">{item.name}</h4>
                        <p className="text-xs sm:text-sm text-nocciola">
                          {item.quantity} × €{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right flex justify-between sm:block">
                      <div>
                        <p className="font-bold text-olive text-lg sm:text-xl">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs sm:text-sm text-nocciola">
                          €{item.price.toFixed(2)} cad.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Riepilogo Prezzi */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
              <h2 className="text-lg sm:text-xl font-serif text-olive mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Riepilogo
              </h2>
              
              <div className="bg-gradient-to-r from-olive/5 to-salvia/5 rounded-xl p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-nocciola">Subtotale:</span>
                    <span className="text-olive font-semibold">€{orderDetails.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <div className="flex items-center space-x-2">
                      <span className="text-nocciola">Spedizione:</span>
                      {orderDetails.pricing.shippingCost === 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Gratuita
                        </span>
                      )}
                    </div>
                    <span className="text-olive font-semibold">€{orderDetails.pricing.shippingCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-olive/20 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-serif text-olive font-bold">Totale:</span>
                      <span className="text-xl sm:text-2xl font-serif text-olive font-bold">€{orderDetails.pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}