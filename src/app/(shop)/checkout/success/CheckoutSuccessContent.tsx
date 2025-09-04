'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useT } from '@/hooks/useT';

// Import dei tipi
import { 
  OrderDetails, 
  InvoiceStatus, 
  ReceiptStatus 
} from '@/types/checkoutSuccessTypes';
import SuccessHeroSection from '@/components/checkoutSuccessPage/SuccessHeroSection';
import TimelineProcess from '@/components/checkoutSuccessPage/TimelineProcess';
import CallToAction from '@/components/checkoutSuccessPage/CallToAction';
import BackgroundDecorations from '@/components/checkoutSuccessPage/BackgroundDecorations';
import OrderSummaryDisplay from '@/components/checkoutSuccessPage/OrderSummaryDisplay';


export default function CheckoutSuccessContent() {
  const { t } = useT();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  
  // Stati principali
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
  }, [sessionId, clearCart]);

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
  }, [sessionId, processing]);

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
        <SuccessHeroSection
          sessionId={sessionId}
          orderDetails={orderDetails}
          invoiceStatus={invoiceStatus}
          receiptStatus={receiptStatus}
        />

        {/* Riepilogo Ordine */}
        <OrderSummaryDisplay 
          orderDetails={orderDetails}
          loading={loadingOrder}
        />

        {/* Timeline Process */}
        <TimelineProcess currentStep="confirmation" />

        {/* Call to Action */}
        <CallToAction />

        {/* Decorazioni di sfondo */}
        <BackgroundDecorations />
      </div>
    </div>
  );
}