import { useEffect, useState } from 'react';
import { OrderDetails } from '@/types/checkoutSuccessTypes';

export function useOrderDetails(sessionId: string | null) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

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
        
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  return { orderDetails, loadingOrder };
}