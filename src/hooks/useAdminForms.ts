import { useState, useEffect, useCallback } from 'react';

export interface AdminFormSummary {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  province: string;
  cart: Array<{
    id: string;
    quantity: number;
  }>;
  status: string;
  type: string;
  created: string;
  itemCount: number;
}

interface UseAdminFormsReturn {
  forms: AdminFormSummary[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
  fetchForms: (page?: number, status?: string, search?: string) => Promise<void>;
}

export function useAdminForms(): UseAdminFormsReturn {
  const [forms, setForms] = useState<AdminFormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchForms = useCallback(async (page: number = 1, status: string = 'all', search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (status && status !== 'all') {
        params.append('status', status);
      }

      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/admin/forms?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel recupero dei forms');
      }

      const data = await response.json();
      
      setForms(data.forms);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
      setTotal(data.total);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  return {
    forms,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    fetchForms,
  };
}