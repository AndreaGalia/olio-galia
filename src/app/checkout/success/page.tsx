// app/checkout/success/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useT } from '@/hooks/useT';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Customer {
  name?: string;
  email?: string;
  phone?: string;
}

interface Shipping {
  address?: string;
  method?: string;
}

// Interfaccia pricing semplificata - SOLO subtotale, spedizione, totale
interface Pricing {
  subtotal: number;
  shippingCost: number;
  total: number;
}

// Interfaccia OrderDetails aggiornata
interface OrderDetails {
  id: string;
  customer?: Customer;
  shipping?: Shipping;
  items?: OrderItem[];
  pricing?: Pricing;        // NUOVO campo per subtotale, spedizione, totale
  total: number;            // Mantenuto per compatibilità
  status: string;
  created: string;
  currency?: string;
  paymentStatus?: string;
  paymentIntent?: string;
}

interface InvoiceStatus {
  hasInvoice: boolean;
  invoiceReady: boolean;
  invoiceNumber: string | null;
  checking: boolean;
}

interface ReceiptStatus {
  isPaid: boolean;
  hasReceipt: boolean;
  receiptUrl: string | null;
  checking: boolean;
}

export default function CheckoutSuccess() {
  const { t, translate } = useT();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const hasProcessed = useRef(false);
  
  // Stati per la fattura e ricevuta
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>({
    hasInvoice: false,
    invoiceReady: false,
    invoiceNumber: null,
    checking: false,
  });

  const [receiptStatus, setReceiptStatus] = useState<ReceiptStatus>({
    isPaid: false,
    hasReceipt: false,
    receiptUrl: null,
    checking: false,
  });

  // Recupera i dettagli dell'ordine
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) return;

      try {
        setLoadingOrder(true);
        const response = await fetch(`/api/order-details?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data);
        }
      } catch (error) {
        console.error('Errore nel recuperare i dettagli ordine:', error);
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  // Controlla lo stato della fattura
  useEffect(() => {
    const checkInvoiceStatus = async () => {
      if (!sessionId) return;

      setInvoiceStatus(prev => ({ ...prev, checking: true }));

      try {
        const response = await fetch('/api/download-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          setInvoiceStatus(prev => ({
            ...prev,
            hasInvoice: data.hasInvoice,
            invoiceReady: data.invoiceReady,
            invoiceNumber: data.invoiceNumber,
          }));
        }
      } catch (error) {
        console.error('Errore nel controllo fattura:', error);
      } finally {
        setInvoiceStatus(prev => ({ ...prev, checking: false }));
      }
    };

    // Controlla subito
    checkInvoiceStatus();

    // Se la fattura non è pronta, ricontrolla ogni 10 secondi
    const interval = setInterval(() => {
      if (!invoiceStatus.invoiceReady && invoiceStatus.hasInvoice) {
        checkInvoiceStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [sessionId]);

  // Controlla lo stato della ricevuta
  useEffect(() => {
    const checkReceiptStatus = async () => {
      if (!sessionId) return;

      setReceiptStatus(prev => ({ ...prev, checking: true }));

      try {
        const response = await fetch('/api/download-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          setReceiptStatus(prev => ({
            ...prev,
            isPaid: data.isPaid,
            hasReceipt: data.hasReceipt,
            receiptUrl: data.receiptUrl,
          }));
        }
      } catch (error) {
        console.error('Errore nel controllo ricevuta:', error);
      } finally {
        setReceiptStatus(prev => ({ ...prev, checking: false }));
      }
    };

    // Controlla subito
    checkReceiptStatus();
  }, [sessionId]);

  // Funzione per inviare messaggio WhatsApp
  const sendWhatsAppMessage = () => {
    if (!orderDetails) return;

    const phoneNumber = "393661368797";
    const orderNumber = sessionId?.slice(-8).toUpperCase() || '';
    const date = new Date().toLocaleDateString('it-IT');
    const customerName = orderDetails.customer?.name || 'N/D';
    const email = orderDetails.customer?.email || 'N/D';
    const total = orderDetails.total?.toFixed(2) || '0.00';

    let message = t.checkoutSuccess.whatsappMessage.greeting;
    message += t.checkoutSuccess.whatsappMessage.intro;
    message += translate('checkoutSuccess.whatsappMessage.orderNumber', { orderNumber });
    message += translate('checkoutSuccess.whatsappMessage.orderDate', { date });
    message += translate('checkoutSuccess.whatsappMessage.customerName', { name: customerName });
    message += translate('checkoutSuccess.whatsappMessage.customerEmail', { email });
    message += t.checkoutSuccess.whatsappMessage.productsTitle;
    
    orderDetails.items?.forEach((item) => {
      message += translate('checkoutSuccess.whatsappMessage.productLine', { name: item.name, quantity: item.quantity });
    });
    
    
    message += translate('checkoutSuccess.whatsappMessage.totalPaid', { total });
    message += t.checkoutSuccess.whatsappMessage.question;
    message += t.checkoutSuccess.whatsappMessage.thanks;
    message += t.checkoutSuccess.whatsappMessage.regards;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Svuota il carrello immediatamente quando la pagina si carica
  useEffect(() => {
    if (sessionId) {
      try {
        clearCart();
        
        // Salva anche nel localStorage come backup
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart');
          localStorage.setItem('cartCleared', 'true');
        }
      } catch (error) {
        console.error('Errore nello svuotare il carrello:', error);
      }
    }
  }, [sessionId]);

  // Aggiorna stock separatamente
  useEffect(() => {
    const updateStock = async () => {
      if (!sessionId || hasProcessed.current || processing) return;

      hasProcessed.current = true;
      setProcessing(true);

      try {
        const response = await fetch('/api/update-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          hasProcessed.current = false;
        }

      } catch (error) {
        console.error('Errore:', error);
        hasProcessed.current = false;
      } finally {
        setProcessing(false);
      }
    };

    const timer = setTimeout(() => {
      updateStock();
    }, 100);

    return () => clearTimeout(timer);
  }, [sessionId]);

  // Effetto di backup per pulire il carrello
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId && typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      <div className="container mx-auto px-4 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Icona successo animata */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-olive to-salvia rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <svg className="w-16 h-16 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Cerchi decorativi */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-4 h-4 bg-olive/30 rounded-full animate-bounce"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-3 h-3 bg-salvia/30 rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-8 right-8 w-2 h-2 bg-nocciola/40 rounded-full animate-bounce delay-150"></div>
            <div className="absolute top-8 left-8 w-2 h-2 bg-nocciola/40 rounded-full animate-bounce delay-450"></div>
          </div>

          {/* Titolo principale */}
          <h1 className="text-5xl md:text-6xl font-serif text-olive mb-6 tracking-tight">
            {t.checkoutSuccess.hero.title}
          </h1>
          
          {/* Sottotitolo */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-2xl md:text-3xl text-salvia mb-4 font-light">
              {t.checkoutSuccess.hero.subtitle}
            </p>
            <p className="text-lg text-nocciola leading-relaxed">
              {t.checkoutSuccess.hero.description}
            </p>
          </div>

          {/* ID Ordine, WhatsApp e Ricevuta Unificata */}
          {sessionId && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8 flex-wrap">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-olive/10">
                <p className="text-sm text-nocciola/80 mb-1">{t.checkoutSuccess.hero.orderNumber}</p>
                <p className="text-xl font-serif text-olive font-semibold tracking-wider">
                  #{sessionId.slice(-8).toUpperCase()}
                </p>
              </div>
              
              {orderDetails && (
                <button
                  onClick={sendWhatsAppMessage}
                  className="group relative cursor-pointer flex items-center gap-3 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span className="font-medium">{t.checkoutSuccess.hero.whatsapp}</span>
                </button>
              )}

              {/* Bottone Ricevuta Unificato con tema personalizzato */}
              {receiptStatus.hasReceipt && (
                <div className="relative group">
                  {/* Badge "Fattura Inclusa" se presente */}
                  {invoiceStatus.hasInvoice && (
                    <div className="absolute -top-3 -right-2 z-20">
                      <div className="bg-gradient-to-r from-olive to-salvia text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse font-medium">
                        {t.checkoutSuccess.badges.invoiceIncluded}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      if (receiptStatus.receiptUrl) {
                        window.open(receiptStatus.receiptUrl, '_blank');
                      }
                    }}
                    disabled={receiptStatus.checking}
                    className="group relative cursor-pointer overflow-hidden flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-olive to-salvia hover:from-salvia hover:to-olive disabled:from-nocciola disabled:to-nocciola text-white rounded-2xl shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60 font-semibold text-lg min-w-[280px] border border-olive/20"
                  >
                    {/* Effetto shimmer di sfondo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Icona principale */}
                    <div className="relative z-10 flex-shrink-0">
                      {receiptStatus.checking ? (
                        <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <div className="relative">
                          <svg className="w-7 h-7 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          
                          {/* Effetti sparkle con colori del tema */}
                          <div className="absolute -top-2 -left-2 w-2 h-2 bg-sabbia rounded-full animate-pulse opacity-80"></div>
                          <div className="absolute -bottom-1 -right-3 w-1.5 h-1.5 bg-beige rounded-full animate-pulse delay-300 opacity-60"></div>
                          <div className="absolute top-0 -right-4 w-1 h-1 bg-nocciola rounded-full animate-pulse delay-150 opacity-70"></div>
                        </div>
                      )}
                    </div>

                    {/* Contenuto testuale */}
                    <div className="relative z-10 flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="leading-tight">
                          {receiptStatus.checking ? t.checkoutSuccess.hero.documentsChecking : 
                           invoiceStatus.hasInvoice ? t.checkoutSuccess.hero.documents : t.checkoutSuccess.hero.receipt}
                        </span>
                        
                        {/* Icona esterna */}
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      
                      {!receiptStatus.checking && (
                        <span className="text-xs opacity-80 font-normal">
                          {invoiceStatus.hasInvoice ? 
                            t.checkoutSuccess.hero.receiptAndInvoiceIncluded : 
                            t.checkoutSuccess.hero.opensNewWindow}
                        </span>
                      )}
                    </div>

                    {/* Effetto hover overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Riepilogo Ordine */}
        {orderDetails && !loadingOrder && (
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-olive/10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif text-olive mb-2">{t.checkoutSuccess.orderSummary.title}</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-olive to-salvia mx-auto rounded-full"></div>
              </div>

              {/* Informazioni Cliente */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-beige/50 rounded-2xl p-6">
                  <h3 className="font-serif text-lg text-olive mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t.checkoutSuccess.orderSummary.customerData}
                  </h3>
                  <p className="text-nocciola mb-2">
                    <span className="font-medium">{t.checkoutSuccess.orderSummary.name}</span> {orderDetails.customer?.name || 'N/D'}
                  </p>
                  <p className="text-nocciola">
                    <span className="font-medium">{t.checkoutSuccess.orderSummary.email}</span> {orderDetails.customer?.email || 'N/D'}
                  </p>
                </div>

                <div className="bg-beige/50 rounded-2xl p-6">
                  <h3 className="font-serif text-lg text-olive mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.checkoutSuccess.orderSummary.shipping}
                  </h3>
                  <p className="text-nocciola mb-2">
                    <span className="font-medium">{t.checkoutSuccess.orderSummary.address}</span> {orderDetails.shipping?.address || t.checkoutSuccess.orderSummary.asPerCheckout}
                  </p>
                </div>
              </div>

              {/* Prodotti Ordinati */}
              <div className="mb-8">
                <h3 className="font-serif text-xl text-olive mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                  </svg>
                  {t.checkoutSuccess.orderSummary.productsOrdered}
                </h3>
                
                <div className="space-y-4">
                  {orderDetails.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-sabbia/30 to-beige/30 rounded-2xl border border-nocciola/10">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <div className="w-16 h-16 bg-olive/10 rounded-xl flex items-center justify-center overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-olive">{item.name}</h4>
                          <p className="text-sm text-nocciola">{t.checkoutSuccess.orderSummary.quantity} {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-olive">€{(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-nocciola">€{item.price.toFixed(2)} {t.checkoutSuccess.orderSummary.each}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-nocciola">
                      <p>{t.checkoutSuccess.orderSummary.productDetailsNotAvailable}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Totale */}
              <div className="border-t border-nocciola/20 pt-6">
                <div className="bg-gradient-to-r from-olive/10 to-salvia/10 rounded-2xl p-6">
                  
                  {/* Subtotale prodotti */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-nocciola">{t.checkoutSuccess.orderSummary.subtotal}</span>
                    <span className="text-nocciola">
                      €{orderDetails.pricing?.subtotal?.toFixed(2) || 
                         ((orderDetails.total || 0) - (orderDetails.pricing?.shippingCost || (orderDetails.total || 0) * 0.1)).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Costo spedizione reale da Stripe */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-nocciola">{t.checkoutSuccess.orderSummary.shippingCost}</span>
                      {orderDetails.pricing?.shippingCost === 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          {t.checkoutSuccess.freeShipping}
                        </span>
                      )}
                    </div>
                    <span className="text-nocciola">
                      {orderDetails.pricing?.shippingCost !== undefined ? 
                        `€${orderDetails.pricing.shippingCost.toFixed(2)}` : 
                        `€${((orderDetails.total || 0) * 0.1).toFixed(2)}`
                      }
                    </span>
                  </div>
                  
                  {/* Separatore prima del totale */}
                  <div className="border-t border-olive/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-serif text-olive font-bold">{t.checkoutSuccess.orderSummary.total}</span>
                      <span className="text-2xl font-serif text-olive font-bold">
                        €{(orderDetails.pricing?.total || orderDetails.total || 0).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Informazioni aggiuntive sul metodo di spedizione */}
                    {orderDetails.shipping?.method && (
                      <div className="mt-3 pt-3 border-t border-olive/10">
                        <p className="text-sm text-nocciola/80 text-center">
                          <span className="font-medium">{t.checkoutSuccess.shippingMethod}</span> {orderDetails.shipping.method}
                        </p>
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Riepilogo */}
        {loadingOrder && (
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-olive/10">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-nocciola">{t.checkoutSuccess.loading.orderSummary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Process */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-serif text-olive text-center mb-12">{t.checkoutSuccess.timeline.title}</h2>
          
          <div className="relative">
            {/* Linea di connessione */}
            <div className="absolute left-1/2 transform -translate-x-0.5 w-1 h-full bg-gradient-to-b from-olive via-salvia to-nocciola opacity-30"></div>
            
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <h3 className="text-xl font-serif text-olive mb-2">{t.checkoutSuccess.timeline.steps.confirmation.title}</h3>
                  <p className="text-nocciola">{t.checkoutSuccess.timeline.steps.confirmation.description}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-olive to-salvia rounded-full flex items-center justify-center shadow-lg z-10">
                  <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 pl-8">
                  <span className="text-sm bg-olive text-beige px-3 py-1 rounded-full">{t.checkoutSuccess.timeline.steps.confirmation.status}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <span className="text-sm bg-salvia text-beige px-3 py-1 rounded-full">{t.checkoutSuccess.timeline.steps.preparation.status}</span>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-salvia to-nocciola rounded-full flex items-center justify-center shadow-lg z-10">
                  <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div className="flex-1 pl-8">
                  <h3 className="text-xl font-serif text-olive mb-2">{t.checkoutSuccess.timeline.steps.preparation.title}</h3>
                  <p className="text-nocciola">{t.checkoutSuccess.timeline.steps.preparation.description}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center">
                <div className="flex-1 text-right pr-8">
                  <h3 className="text-xl font-serif text-olive mb-2">{t.checkoutSuccess.timeline.steps.shipping.title}</h3>
                  <p className="text-nocciola">{t.checkoutSuccess.timeline.steps.shipping.description}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-nocciola to-sabbia rounded-full flex items-center justify-center shadow-lg z-10 opacity-60">
                  <svg className="w-8 h-8 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1 pl-8">
                  <span className="text-sm bg-nocciola/20 text-nocciola px-3 py-1 rounded-full">{t.checkoutSuccess.timeline.steps.shipping.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto shadow-xl border border-olive/10">
            <h3 className="text-2xl font-serif text-olive mb-6">{t.checkoutSuccess.cta.title}</h3>
            <p className="text-nocciola mb-8 leading-relaxed">
              {t.checkoutSuccess.cta.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products"
                className="group px-8 py-4 bg-gradient-to-r from-olive to-salvia text-beige rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium text-lg relative overflow-hidden"
              >
                <span className="relative z-10">{t.checkoutSuccess.cta.discoverProducts}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-salvia to-olive transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </Link>
              
              <Link 
                href="/"
                className="group px-8 py-4 border-2 border-olive text-olive rounded-full hover:bg-olive hover:text-beige transition-all duration-300 font-medium text-lg"
              >
                {t.checkoutSuccess.cta.backToHome}
              </Link>
            </div>
          </div>
        </div>

        {/* Decorazioni di sfondo */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-olive/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-salvia/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-nocciola/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>
    </div>
  );
}