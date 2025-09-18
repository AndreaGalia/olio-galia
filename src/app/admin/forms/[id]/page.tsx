'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface FormProduct {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  quantity: number;
  price: number;
  currency: string;
}

interface FormDetails {
  id: string;
  orderId: string;
  customer: {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    province: string;
  };
  cart: Array<{
    id: string;
    quantity: number;
  }>;
  products: FormProduct[];
  pricing: {
    subtotal: number;
    estimatedShipping: number;
    estimatedTotal: number;
  };
  finalPricing?: {
    finalPrices: Array<{
      productId: string;
      finalPrice: number;
    }>;
    finalSubtotal: number;
    finalShipping: number;
    finalTotal: number;
  };
  status: string;
  type: string;
  created: string;
  notes: string;
  itemCount: number;
}

export default function FormDetailPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<FormDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [finalPrices, setFinalPrices] = useState<Record<string, number>>({});
  const [finalShipping, setFinalShipping] = useState(0);
  const [isSendingQuote, setIsSendingQuote] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (params.id && user) {
      fetchFormDetails();
    }
  }, [params.id, user]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/forms/${params.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel recupero del preventivo');
      }

      const data = await response.json();
      setForm(data.form);
      
      // Inizializza i prezzi finali se già presenti
      if (data.form.finalPricing) {
        const priceMap: Record<string, number> = {};
        data.form.finalPricing.finalPrices.forEach((item: any) => {
          priceMap[item.productId] = item.finalPrice;
        });
        setFinalPrices(priceMap);
        setFinalShipping(data.form.finalPricing.finalShipping);
      } else {
        // Inizializza con i prezzi stimati
        const initialPrices: Record<string, number> = {};
        data.form.products.forEach((product: FormProduct) => {
          initialPrices[product.id] = product.price;
        });
        setFinalPrices(initialPrices);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('Errore recupero dettagli form:', error);
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'quote_sent': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_preparazione': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'confermato': return 'text-green-700 bg-green-100 border-green-300';
      case 'delivered': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'In attesa';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Annullato';
      case 'processing': return 'In elaborazione';
      case 'quote_sent': return 'Preventivo inviato';
      case 'paid': return 'Pagato';
      case 'in_preparazione': return 'In preparazione';
      case 'shipped': return 'Spedito';
      case 'confermato': return 'Confermato';
      case 'delivered': return 'Consegnato';
      default: return status;
    }
  };

  const calculateFinalTotal = () => {
    const subtotal = form?.products.reduce((sum, product) => {
      return sum + (finalPrices[product.id] || 0) * product.quantity;
    }, 0) || 0;
    
    return {
      subtotal,
      shipping: finalShipping,
      total: subtotal + finalShipping
    };
  };

  const saveFinalPricing = async () => {
    if (!form) return;
    
    try {
      const finalPricing = {
        finalPrices: form.products.map(product => ({
          productId: product.id,
          finalPrice: finalPrices[product.id] || 0
        })),
        finalSubtotal: calculateFinalTotal().subtotal,
        finalShipping: finalShipping,
        finalTotal: calculateFinalTotal().total
      };

      const response = await fetch(`/api/admin/forms/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalPricing })
      });

      if (!response.ok) throw new Error('Errore nel salvataggio');
      
      setForm(prev => prev ? { ...prev, finalPricing } : null);
      setIsEditingPrices(false);
      
    } catch (error) {
      setError('Errore nel salvataggio dei prezzi');
    }
  };

  const sendQuoteEmail = async () => {
    if (!form) return;
    
    try {
      setIsSendingQuote(true);
      
      const response = await fetch(`/api/admin/forms/${params.id}/send-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Errore nell\'invio del preventivo');
      
      // Aggiorna lo stato a 'quote_sent'
      await fetch(`/api/admin/forms/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'quote_sent' })
      });
      
      setForm(prev => prev ? { ...prev, status: 'quote_sent' } : null);
      
    } catch (error) {
      setError('Errore nell\'invio del preventivo');
    } finally {
      setIsSendingQuote(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!form) return;
    
    try {
      const response = await fetch(`/api/admin/forms/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Errore nell\'aggiornamento dello stato');
      
      setForm(prev => prev ? { ...prev, status: newStatus } : null);
      
      // Se cambiamo stato a 'confermato', inviamo email di conferma consegna
      if (newStatus === 'confermato') {
        await sendDeliveryConfirmationEmail();
      }
      
    } catch (error) {
      setError('Errore nell\'aggiornamento dello stato');
    }
  };

  const sendDeliveryConfirmationEmail = async () => {
    if (!form) return;
    
    try {
      const response = await fetch(`/api/admin/forms/${params.id}/send-delivery-confirmation`, {
        method: 'POST'
      });

      if (!response.ok) {
        console.error('Errore invio email di conferma consegna');
      } else {
        console.log('Email di conferma consegna inviata con successo');
      }
    } catch (error) {
      console.error('Errore invio email di conferma consegna:', error);
    }
  };

  if (authLoading || loading) {
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

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-olive/5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Errore</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
          >
            Torna agli ordini
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-olive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-serif text-olive">
                Dettagli Preventivo
              </h1>
              <p className="text-nocciola mt-1">
                {form?.orderId} - {form?.customer.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/preventivi')}
                className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
              >
                ← Torna ai preventivi
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {form && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informazioni Cliente */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dati Cliente */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
                <h2 className="text-xl font-serif text-olive mb-4">Informazioni Cliente</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-nocciola">Nome</label>
                    <p className="mt-1 text-gray-900">{form.customer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nocciola">Email</label>
                    <p className="mt-1 text-gray-900">{form.customer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nocciola">Telefono</label>
                    <p className="mt-1 text-gray-900">{form.customer.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nocciola">Provincia</label>
                    <p className="mt-1 text-gray-900">{form.address.province}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-nocciola">Indirizzo</label>
                    <p className="mt-1 text-gray-900">{form.address.street}</p>
                  </div>
                </div>
              </div>

              {/* Prodotti Richiesti */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-serif text-olive">Prodotti Richiesti</h2>
                  {form.status === 'pending' && (
                    <button
                      onClick={() => setIsEditingPrices(!isEditingPrices)}
                      className="px-4 py-2 text-sm bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
                    >
                      {isEditingPrices ? 'Annulla' : 'Modifica Prezzi'}
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {form.products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-olive/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-olive">Quantità: {product.quantity}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {isEditingPrices ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              value={finalPrices[product.id] || product.price}
                              onChange={(e) => setFinalPrices(prev => ({
                                ...prev,
                                [product.id]: parseFloat(e.target.value) || 0
                              }))}
                              className="w-20 px-2 py-1 text-sm border border-olive/20 rounded"
                              step="0.01"
                              min="0"
                            />
                            <p className="text-xs text-nocciola">€/cad.</p>
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold text-olive">
                              €{(form.finalPricing?.finalPrices.find(fp => fp.productId === product.id)?.finalPrice || product.price).toFixed(2)} cad.
                            </p>
                            <p className="text-sm text-nocciola">
                              Tot: €{((form.finalPricing?.finalPrices.find(fp => fp.productId === product.id)?.finalPrice || product.price) * product.quantity).toFixed(2)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sezione Spedizione in Editing Mode */}
                {isEditingPrices && (
                  <div className="mt-6 pt-6 border-t border-olive/10">
                    <h3 className="text-lg font-medium text-olive mb-3">Spedizione</h3>
                    <div className="flex items-center space-x-4">
                      <label className="text-sm text-nocciola">Costo spedizione:</label>
                      <input
                        type="number"
                        value={finalShipping}
                        onChange={(e) => setFinalShipping(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 text-sm border border-olive/20 rounded"
                        step="0.01"
                        min="0"
                      />
                      <span className="text-sm text-nocciola">€</span>
                    </div>
                  </div>
                )}

                {/* Totali */}
                <div className="mt-6 pt-6 border-t border-olive/10">
                  {isEditingPrices ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-nocciola">Subtotale:</span>
                        <span className="font-medium">€{calculateFinalTotal().subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-nocciola">Spedizione:</span>
                        <span className="font-medium">€{calculateFinalTotal().shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold text-olive border-t border-olive/10 pt-2">
                        <span>Totale finale:</span>
                        <span>€{calculateFinalTotal().total.toFixed(2)}</span>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        <button
                          onClick={saveFinalPricing}
                          className="flex-1 px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
                        >
                          Salva Prezzi
                        </button>
                        <button
                          onClick={() => setIsEditingPrices(false)}
                          className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive/5 transition-colors cursor-pointer"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {form.finalPricing ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-nocciola">Subtotale:</span>
                            <span className="font-medium">€{form.finalPricing.finalSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-nocciola">Spedizione:</span>
                            <span className="font-medium">€{form.finalPricing.finalShipping.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-olive border-t border-olive/10 pt-2">
                            <span>Totale finale:</span>
                            <span>€{form.finalPricing.finalTotal.toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-nocciola">Subtotale stimato:</span>
                            <span className="font-medium">€{form.pricing.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-nocciola">Spedizione stimata:</span>
                            <span className="font-medium">Da calcolare</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold text-olive border-t border-olive/10 pt-2">
                            <span>Totale stimato:</span>
                            <span>€{form.pricing.subtotal.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar con informazioni */}
            <div className="space-y-6">
              {/* Stato e Azioni */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
                <h2 className="text-xl font-serif text-olive mb-4">Stato Preventivo</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-nocciola mb-2">
                      Stato attuale
                    </label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(form.status)}`}>
                      {getStatusText(form.status)}
                    </span>
                  </div>

                  {/* Azioni Preventivo */}
                  <div className="space-y-3">
                    {form.status === 'pending' && form.finalPricing && (
                      <button
                        onClick={sendQuoteEmail}
                        disabled={isSendingQuote}
                        className="w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-olive to-salvia text-beige font-semibold rounded-xl hover:from-salvia hover:to-olive disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl whitespace-nowrap"
                      >
                        {isSendingQuote ? (
                          <>
                            <div className="w-4 h-4 border-2 border-beige/30 border-t-beige rounded-full animate-spin mr-2"></div>
                            <span className="text-sm sm:text-base">Invio in corso...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm sm:text-base">Invia Preventivo</span>
                          </>
                        )}
                      </button>
                    )}

                    {form.status === 'quote_sent' && (
                      <button
                        onClick={() => updateStatus('paid')}
                        className="w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-sm sm:text-base">Segna come Pagato</span>
                      </button>
                    )}

                    {form.status === 'paid' && (
                      <button
                        onClick={() => updateStatus('in_preparazione')}
                        className="w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-sm sm:text-base">Metti in Preparazione</span>
                      </button>
                    )}

                    {form.status === 'in_preparazione' && (
                      <button
                        onClick={() => updateStatus('shipped')}
                        className="w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-5H8z" />
                        </svg>
                        <span className="text-sm sm:text-base">Segna come Spedito</span>
                      </button>
                    )}

                    {form.status === 'shipped' && (
                      <button
                        onClick={() => updateStatus('confermato')}
                        className="w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-salvia to-olive text-beige font-semibold rounded-xl hover:from-olive hover:to-salvia transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm sm:text-base">Conferma Consegna</span>
                      </button>
                    )}

                    {(form.status === 'pending' || form.status === 'quote_sent') && (
                      <button
                        onClick={() => updateStatus('cancelled')}
                        className="w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm sm:text-base">Annulla Preventivo</span>
                      </button>
                    )}
                  </div>

                  {form.notes && (
                    <div>
                      <label className="block text-sm font-medium text-nocciola mb-2">
                        Note interne
                      </label>
                      <div className="p-3 bg-olive/5 rounded-lg border border-olive/10">
                        <p className="text-gray-900 whitespace-pre-wrap">{form.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informazioni Aggiuntive */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
                <h2 className="text-xl font-serif text-olive mb-4">Dettagli</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-nocciola block">ID Preventivo:</span>
                    <span className="text-gray-900">{form.orderId}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-nocciola block">Data richiesta:</span>
                    <span className="text-gray-900">
                      {new Date(form.created).toLocaleDateString('it-IT')} - {' '}
                      {new Date(form.created).toLocaleTimeString('it-IT', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-nocciola block">Tipo:</span>
                    <span className="text-gray-900">Richiesta da Torino</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-nocciola block">Prodotti:</span>
                    <span className="text-gray-900">{form.itemCount}</span>
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