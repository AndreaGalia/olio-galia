'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useProducts } from '@/hooks/useProducts';
import CustomerSearch from '@/components/admin/CustomerSearch';
import type { Product } from '@/types/products';
import type { CustomerDocument } from '@/types/customerTypes';

interface SelectedProduct {
  productId: string;
  quantity: number | string;
}

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerProvince: string;
  selectedProducts: SelectedProduct[];
  shippingCost: number;
  notes: string;
}

export default function CreateCustomQuotePage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDocument | null>(null);

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerProvince: '',
    selectedProducts: [],
    shippingCost: 0,
    notes: ''
  });

  // Auto-compila i campi quando si seleziona un cliente
  useEffect(() => {
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        customerEmail: selectedCustomer.email,
        customerPhone: selectedCustomer.phone || '',
        customerAddress: selectedCustomer.address
          ? `${selectedCustomer.address.street}, ${selectedCustomer.address.city} ${selectedCustomer.address.postalCode}, ${selectedCustomer.address.country}`
          : '',
        customerProvince: selectedCustomer.address?.province || ''
      }));
    }
  }, [selectedCustomer]);

  if (authLoading || productsLoading) {
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
    router.push('/admin/login');
    return null;
  }

  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-olive/5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Errore</h1>
          <p className="text-gray-600 mb-4">Errore nel caricamento dei prodotti: {productsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, { productId: '', quantity: 1 }]
    }));
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((_, i) => i !== index)
    }));
  };

  const updateSelectedProduct = (index: number, field: keyof SelectedProduct, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const getProductPrice = (selectedProduct: SelectedProduct): number => {
    const product = getProductById(selectedProduct.productId);
    return product ? parseFloat(product.price) : 0;
  };

  const calculateTotal = () => {
    const subtotal = formData.selectedProducts.reduce((sum, selectedProduct) => {
      const price = getProductPrice(selectedProduct);
      const quantity = typeof selectedProduct.quantity === 'string' ? parseInt(selectedProduct.quantity) || 0 : selectedProduct.quantity;
      return sum + (price * quantity);
    }, 0);
    return {
      subtotal,
      shipping: formData.shippingCost,
      total: subtotal + formData.shippingCost
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validazione locale
      if (!formData.customerName.trim() || !formData.customerEmail.trim()) {
        throw new Error('Nome cliente e email sono obbligatori');
      }

      if (formData.selectedProducts.length === 0) {
        throw new Error('Seleziona almeno un prodotto');
      }

      if (formData.selectedProducts.some(p => {
        const quantity = typeof p.quantity === 'string' ? parseInt(p.quantity) || 0 : p.quantity;
        return !p.productId || quantity <= 0;
      })) {
        throw new Error('Tutti i prodotti devono essere selezionati con quantità positiva');
      }

      // Nessun delay per l'admin

      // Prepara i dati per l'API - normalizza quantities a number
      const normalizedProducts = formData.selectedProducts.map(p => ({
        productId: p.productId,
        quantity: typeof p.quantity === 'string' ? parseInt(p.quantity) || 1 : p.quantity
      }));

      const apiData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerProvince: formData.customerProvince,
        selectedProducts: normalizedProducts,
        notes: formData.notes
      };

      const response = await fetch('/api/admin/preventivi/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Errore nella creazione del preventivo');
      }

      setSuccess(`Preventivo ${data.orderId} creato con successo!`);

      // Reindirizza ai dettagli del preventivo come fa CheckoutTorinoButton
      if (data.orderId) {
        // Prima redirect immediato
        router.push(`/admin/forms/${data.id}`);

        // Poi reset del form con delay come fa CheckoutTorinoButton
        setTimeout(() => {
          setSuccess(null);
          setFormData({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            customerAddress: '',
            customerProvince: '',
            selectedProducts: [],
            shippingCost: 0,
            notes: ''
          });
        }, 600);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-olive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-xl sm:text-3xl font-serif text-olive">Crea Preventivo Personalizzato</h1>
              <p className="text-nocciola mt-1 text-sm sm:text-base">Crea un nuovo preventivo per un cliente</p>
            </div>
            <button
              onClick={() => router.push('/admin/preventivi')}
              className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
            >
              ← Torna ai preventivi
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dati Cliente */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
              <h2 className="text-xl font-serif text-olive mb-6">Informazioni Cliente</h2>

              {/* Ricerca Cliente */}
              <div className="mb-6">
                <CustomerSearch
                  onSelectCustomer={setSelectedCustomer}
                  selectedCustomer={selectedCustomer}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nocciola mb-2">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
                    placeholder="Nome e cognome del cliente"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nocciola mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
                    placeholder="email@esempio.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nocciola mb-2">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
                    placeholder="+39 123 456 7890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nocciola mb-2">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={formData.customerProvince}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerProvince: e.target.value }))}
                    className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
                    placeholder="TO"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nocciola mb-2">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                    className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
                    placeholder="Via, numero civico, città"
                  />
                </div>
              </div>
            </div>

            {/* Prodotti */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-olive">Prodotti</h2>
                <button
                  type="button"
                  onClick={addProduct}
                  className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Aggiungi prodotto</span>
                </button>
              </div>

              {formData.selectedProducts.length === 0 ? (
                <div className="text-center py-8 text-nocciola">
                  <svg className="mx-auto h-12 w-12 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="mt-2">Nessun prodotto selezionato</p>
                  <p className="text-sm">Clicca "Aggiungi prodotto" per iniziare</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.selectedProducts.map((selectedProduct, index) => {
                    const product = getProductById(selectedProduct.productId);
                    const price = getProductPrice(selectedProduct);

                    return (
                      <div key={index} className="p-4 bg-olive/5 rounded-lg border border-olive/10">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium text-olive">Prodotto {index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-nocciola mb-2">
                              Seleziona prodotto *
                            </label>
                            <select
                              value={selectedProduct.productId}
                              onChange={(e) => updateSelectedProduct(index, 'productId', e.target.value)}
                              className="w-full px-3 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
                              required
                            >
                              <option value="">-- Seleziona un prodotto --</option>
                              {products.map((product) => {
                                // Controlla se questo prodotto è già stato selezionato in un altro slot
                                const isAlreadySelected = formData.selectedProducts.some(
                                  (sp, spIndex) => sp.productId === product.id && spIndex !== index
                                );

                                return (
                                  <option
                                    key={product.id}
                                    value={product.id}
                                    disabled={isAlreadySelected}
                                    className={isAlreadySelected ? 'text-gray-400' : ''}
                                  >
                                    {product.name} - €{product.price} ({product.size})
                                    {isAlreadySelected ? ' (già selezionato)' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {product && (
                            <>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-nocciola mb-2">
                                  Descrizione
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                                  {product.description}
                                </div>
                              </div>

                              <div className="md:col-span-2 flex items-center space-x-4">
                                {product.images && product.images[0] && (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                                  <p className="text-sm text-nocciola">
                                    Prezzo: €{product.price} | Taglia: {product.size}
                                  </p>
                                  {product.inStock ? (
                                    <p className="text-sm text-green-600">✓ Disponibile ({product.stockQuantity} pz)</p>
                                  ) : (
                                    <p className="text-sm text-red-600">✗ Non disponibile</p>
                                  )}
                                  <p className="text-xs text-olive mt-1">
                                    I prezzi potranno essere modificati prima dell'invio
                                  </p>
                                </div>
                              </div>
                            </>
                          )}


                          <div>
                            <label className="block text-sm font-medium text-nocciola mb-2">
                              Quantità *
                            </label>
                            <input
                              type="number"
                              value={selectedProduct.quantity}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || value === '0') {
                                  updateSelectedProduct(index, 'quantity', '');
                                } else {
                                  updateSelectedProduct(index, 'quantity', parseInt(value) || 1);
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                  updateSelectedProduct(index, 'quantity', 1);
                                }
                              }}
                              className="w-full px-3 py-2 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
                              placeholder="1"
                              min="1"
                              required
                            />
                          </div>
                        </div>

                        <div className="mt-4 text-right">
                          <span className="text-lg font-semibold text-olive">
                            Subtotale: €{(price * (typeof selectedProduct.quantity === 'string' ? parseInt(selectedProduct.quantity) || 0 : selectedProduct.quantity)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
              <h2 className="text-xl font-serif text-olive mb-4">Note interne</h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/50 focus:border-olive"
                placeholder="Note interne per il preventivo..."
                rows={4}
              />
            </div>
          </div>

          {/* Sidebar con riepilogo */}
          <div className="space-y-6">
            {/* Riepilogo Totali */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
              <h2 className="text-xl font-serif text-olive mb-4">Riepilogo</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-nocciola">Prodotti selezionati:</span>
                  <span className="font-medium">{formData.selectedProducts.length}</span>
                </div>
                <div className="text-center py-4 text-nocciola">
                  <p className="text-sm">I prezzi e la spedizione verranno</p>
                  <p className="text-sm">gestiti nella pagina dei dettagli</p>
                </div>
              </div>
            </div>

            {/* Azioni */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
              <button
                type="submit"
                disabled={loading || success !== null}
                className="w-full px-6 py-4 bg-gradient-to-r from-olive to-salvia text-white font-semibold rounded-xl hover:from-salvia hover:to-olive disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Creazione in corso...
                  </>
                ) : success ? (
                  <>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Preventivo creato!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Crea Preventivo
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}