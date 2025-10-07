import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

export function useCartCleanup(sessionId: string | null) {
  const { clearCart } = useCart();

  // Svuota il carrello immediatamente quando la pagina si carica
  useEffect(() => {
    if (sessionId) {
      try {
        clearCart();
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart');
          localStorage.setItem('cartCleared', 'true');
        }
      } catch (error) {
        
      }
    }
  }, [sessionId, clearCart]);

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
}

export function useClearCart() {
  const { clearCart } = useCart();

  const clearCartCompletely = () => {
    try {
      // First clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartCleared');
      }

      // Then clear the context
      clearCart();

      // Force localStorage update after context clearing
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify([]));
          localStorage.setItem('cartCleared', 'true');
        }
      }, 200);

    } catch (error) {
      // Silent error handling
    }
  };

  return clearCartCompletely;
}
