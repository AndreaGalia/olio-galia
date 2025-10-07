import { useEffect, useState } from 'react';
import { InvoiceStatus } from '@/types/checkoutSuccessTypes';

export function useInvoiceStatus(sessionId: string | null) {
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>({
    hasInvoice: false,
    invoiceReady: false,
    invoiceNumber: null,
    checking: false,
  });

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
        
      } finally {
        setInvoiceStatus(prev => ({ ...prev, checking: false }));
      }
    };

    checkInvoiceStatus();

    const interval = setInterval(() => {
      if (!invoiceStatus.invoiceReady && invoiceStatus.hasInvoice) {
        checkInvoiceStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [sessionId, invoiceStatus.invoiceReady, invoiceStatus.hasInvoice]);

  return invoiceStatus;
}