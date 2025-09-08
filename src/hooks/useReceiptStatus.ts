import { useEffect, useState } from 'react';
import { ReceiptStatus } from '@/types/checkoutSuccessTypes';

export function useReceiptStatus(sessionId: string | null) {
  const [receiptStatus, setReceiptStatus] = useState<ReceiptStatus>({
    isPaid: false,
    hasReceipt: false,
    receiptUrl: null,
    checking: false,
  });

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

    checkReceiptStatus();
  }, [sessionId]);

  return receiptStatus;
}