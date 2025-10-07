// hooks/useFormSubmit.ts
import { useState } from 'react';

interface FormSubmitResponse {
  orderId: string;
  message?: string;
}

interface UseFormSubmitReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  data: FormSubmitResponse | null;
  submitForm: (formData: any) => Promise<void>;
  reset: () => void;
}

export function useFormSubmit(): UseFormSubmitReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<FormSubmitResponse | null>(null);

  const submitForm = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setData(null);

    try {
      // Delay di 3 secondi per simulare elaborazione
      await new Promise(resolve => setTimeout(resolve, 3000));
      const response = await fetch('/api/save-order-pending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          type: 'torino_delivery',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore durante l\'invio della richiesta');
      }

      const result = await response.json();
      
      setData(result);
      setSuccess(true);
      
      
      
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
    setData(null);
  };

  return {
    isLoading,
    error,
    success,
    data,
    submitForm,
    reset,
  };
}