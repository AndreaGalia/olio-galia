import { useEffect, useState, useRef } from 'react';
import { OrderDetails } from '@/types/checkoutSuccessTypes';

interface OrderSaveStatus {
  saving: boolean;
  saved: boolean;
  error: string | null;
}

export function useOrderSave(
  sessionId: string | null, 
  orderDetails: OrderDetails | null, 
  loadingOrder: boolean
) {
  const [orderSaveStatus, setOrderSaveStatus] = useState<OrderSaveStatus>({
    saving: false,
    saved: false,
    error: null
  });
  const hasOrderSaved = useRef(false);

  useEffect(() => {
    const saveOrderToMongo = async () => {
      if (!sessionId || !orderDetails || hasOrderSaved.current || orderSaveStatus.saving) {
        return;
      }

      hasOrderSaved.current = true;
      setOrderSaveStatus(prev => ({ ...prev, saving: true, error: null }));

      try {
        console.log('💾 Salvando ordine in MongoDB...');
        
        const response = await fetch('/api/save-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log('✅ Ordine salvato con successo:', result);
          setOrderSaveStatus(prev => ({ 
            ...prev, 
            saved: true, 
            saving: false 
          }));
        } else {
          throw new Error(result.error || 'Errore nel salvare l\'ordine');
        }

      } catch (error) {
        console.error('❌ Errore nel salvare l\'ordine:', error);
        hasOrderSaved.current = false;
        setOrderSaveStatus(prev => ({ 
          ...prev, 
          saving: false, 
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        }));
      }
    };

    if (orderDetails && !loadingOrder) {
      const timer = setTimeout(() => {
        saveOrderToMongo();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [sessionId, orderDetails, loadingOrder, orderSaveStatus.saving]);

  return orderSaveStatus;
}