import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import type { FilterParams } from '@/types/admin';

interface UseAdminDataOptions<T> {
  endpoint: string;
  initialFilters?: Partial<FilterParams>;
  dependencies?: unknown[];
}

interface UseAdminDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  filters: FilterParams;
  setFilters: (filters: Partial<FilterParams>) => void;
  refresh: () => Promise<void>;
}

export function useAdminData<T>({
  endpoint,
  initialFilters = {},
  dependencies = []
}: UseAdminDataOptions<T>): UseAdminDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFiltersState] = useState<FilterParams>({
    page: 1,
    limit: 20,
    ...initialFilters
  });

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.search || '', 300);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (filters.includeStripe) {
        params.append('includeStripe', 'true');
      }

      const response = await fetch(`${endpoint}?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel recupero dei dati');
      }

      const responseData = await response.json();

      // Handle different response formats
      if (responseData.orders) {
        setData(responseData.orders);
      } else if (responseData.forms) {
        setData(responseData.forms);
      } else if (responseData.data) {
        setData(responseData.data);
      } else {
        setData(responseData);
      }

      setTotalPages(responseData.totalPages || 1);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('Errore recupero dati:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, filters.page, filters.status, filters.limit, filters.includeStripe, debouncedSearch]);

  const setFilters = useCallback((newFilters: Partial<FilterParams>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when changing filters (except when explicitly setting page)
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  }, []);

  const refresh = useCallback(() => fetchData(), [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    totalPages,
    filters,
    setFilters,
    refresh
  };
}