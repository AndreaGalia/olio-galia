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
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'In attesa';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Annullato';
      case 'processing': return 'In elaborazione';
      default: return status;
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
            className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors"
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
                onClick={() => router.push('/admin/orders')}
                className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
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
                <h2 className="text-xl font-serif text-olive mb-4">Prodotti Richiesti</h2>
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
                        <p className="font-semibold text-olive">
                          €{product.price.toFixed(2)} cad.
                        </p>
                        <p className="text-sm text-nocciola">
                          Tot: €{(product.price * product.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totali Stimati */}
                <div className="mt-6 pt-6 border-t border-olive/10">
                  <div className="space-y-2">
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
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar con informazioni */}
            <div className="space-y-6">
              {/* Stato */}
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