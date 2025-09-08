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
        console.error('Errore nello svuotare il carrello:', error);
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