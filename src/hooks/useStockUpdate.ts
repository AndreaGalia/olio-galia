import { useEffect, useState, useRef } from 'react';

interface StockUpdateStatus {
  updating: boolean;
  updated: boolean;
  alreadyProcessed: boolean;
  error: string | null;
  source: string | null;
}

export function useStockUpdate(sessionId: string | null) {
  const [processing, setProcessing] = useState(false);
  const [stockUpdateStatus, setStockUpdateStatus] = useState<StockUpdateStatus>({
    updating: false,
    updated: false,
    alreadyProcessed: false,
    error: null,
    source: null
  });
  const hasProcessed = useRef(false);

  useEffect(() => {
    const updateStock = async () => {
      if (!sessionId || hasProcessed.current || processing) return;

      hasProcessed.current = true;
      setProcessing(true);
      setStockUpdateStatus(prev => ({ 
        ...prev, 
        updating: true, 
        error: null,
        source: null 
      }));

      try {
        
        
        const response = await fetch('/api/update-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const result = await response.json();

        if (response.ok) {
          if (result.alreadyProcessed) {
            const source = result.source || 'unknown';
            setStockUpdateStatus(prev => ({ 
              ...prev, 
              updating: false, 
              alreadyProcessed: true,
              source: source
            }));
          } else {
            
            setStockUpdateStatus(prev => ({ 
              ...prev, 
              updating: false, 
              updated: true 
            }));
          }
        } else {
          throw new Error(result.error || 'Errore nell\'aggiornamento stock');
        }

      } catch (error) {
        
        hasProcessed.current = false; // Permetti retry
        setStockUpdateStatus(prev => ({ 
          ...prev, 
          updating: false, 
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          source: null
        }));
      } finally {
        setProcessing(false);
      }
    };

    const timer = setTimeout(() => {
      updateStock();
    }, 100);

    return () => clearTimeout(timer);
  }, [sessionId, processing]);

  return { processing, stockUpdateStatus };
}