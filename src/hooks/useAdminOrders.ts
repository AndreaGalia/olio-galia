import { useState, useEffect, useCallback } from 'react';

export interface AdminOrderSummary {
  id: string;
  sessionId: string;
  paymentIntent: string | null;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  created: string;
  itemCount: number;
  shipping?: {
    address: string;
    method: string;
  };
}

interface UseAdminOrdersReturn {
  orders: AdminOrderSummary[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
  fetchOrders: (page?: number, status?: string, search?: string) => Promise<void>;
}

export function useAdminOrders(): UseAdminOrdersReturn {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async (page: number = 1, status: string = 'all', search: string = '') => {
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

      const response = await fetch(`/api/admin/orders?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel recupero degli ordini');
      }

      const data = await response.json();
      
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
      setTotal(data.total);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('Errore recupero ordini:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    fetchOrders,
  };
}