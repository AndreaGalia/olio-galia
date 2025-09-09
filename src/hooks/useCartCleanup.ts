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

export function useClearCart() {
  const { clearCart, cart } = useCart();

  const clearCartCompletely = () => {
    try {
      console.log('🔍 Cart state before clearing:', cart);
      console.log('🔍 localStorage before:', localStorage.getItem('cart'));
      
      // First clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartCleared'); // Remove this too
        console.log('🧹 localStorage removed');
      }
      
      // Then clear the context
      clearCart();
      console.log('🧹 Context clearCart called');
      
      // Wait a tick and then recheck
      setTimeout(() => {
        console.log('🔍 Cart state after clearing:', cart);
        console.log('🔍 localStorage after:', localStorage.getItem('cart'));
      }, 100);
      
      // Force localStorage update after context clearing
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify([]));
          localStorage.setItem('cartCleared', 'true');
          console.log('✅ Cart forced to empty');
        }
      }, 200);
      
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
    }
  };

  return clearCartCompletely;
}
