import { useEffect, useState } from 'react';
import { OrderDetails } from '@/types/checkoutSuccessTypes';

interface OrderPollingResult {
  order: OrderDetails | null;
  loading: boolean;
  error: string | null;
  expired?: boolean; // Indica se l'accesso è scaduto
}

export function useOrderPolling(sessionId: string | null) {
  const [result, setResult] = useState<OrderPollingResult>({
    order: null,
    loading: true,
    error: null,
    expired: false
  });

  useEffect(() => {
    if (!sessionId) {
      setResult({ order: null, loading: false, error: 'Session ID mancante', expired: false });
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // Max 30 secondi (30 tentativi * 1 sec)
    let isMounted = true;

    const pollOrder = async () => {
      try {
        const response = await fetch(`/api/order-confirmation?session_id=${sessionId}`);
        const data = await response.json();

        if (!isMounted) return;

        // Controlla se l'accesso è scaduto (status 403)
        if (response.status === 403 && data.error === 'access_expired') {
          setResult({
            order: null,
            loading: false,
            error: null,
            expired: true
          });
          return;
        }

        if (response.ok && data.order) {
          // Ordine trovato in MongoDB
          setResult({ order: data.order, loading: false, error: null, expired: false });
        } else if (attempts < maxAttempts) {
          // Webhook non ha ancora salvato, riprova dopo 1 secondo
          attempts++;
          setTimeout(pollOrder, 1000);
        } else {
          // Timeout - webhook potrebbe aver avuto problemi
          setResult({
            order: null,
            loading: false,
            error: 'Ordine in elaborazione. Riceverai una email di conferma a breve.',
            expired: false
          });
        }
      } catch (error) {
        if (!isMounted) return;
        setResult({
          order: null,
          loading: false,
          error: 'Errore nel recupero ordine',
          expired: false
        });
      }
    };

    pollOrder();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return result;
}
