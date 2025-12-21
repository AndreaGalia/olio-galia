"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ShippingConfigDocument } from '@/types/shippingConfig';

interface ShippingConfigContextType {
  config: ShippingConfigDocument | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ShippingConfigContext = createContext<ShippingConfigContextType | undefined>(undefined);

/**
 * Provider per la configurazione spedizioni
 *
 * Carica la configurazione da MongoDB via API e la rende disponibile
 * a tutti i componenti figli tramite useShippingConfig hook.
 *
 * Questo evita fetch multipli della stessa configurazione.
 */
export function ShippingConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ShippingConfigDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/shipping-config');
      const data = await response.json();

      if (data.success && data.config) {
        setConfig(data.config);
      } else {
        // Configurazione non trovata - usa valori di fallback vuoti
        // (questo è accettabile: l'admin dovrà configurare le spedizioni)
        setError('Configurazione spedizioni non trovata');
        setConfig(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento configurazione');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ShippingConfigContext.Provider value={{ config, loading, error, refetch: fetchConfig }}>
      {children}
    </ShippingConfigContext.Provider>
  );
}

/**
 * Hook per accedere alla configurazione spedizioni
 *
 * @returns { config, loading, error, refetch }
 *
 * @example
 * const { config, loading } = useShippingConfig();
 *
 * if (loading) return <div>Caricamento...</div>;
 * if (!config) return <div>Configurazione non trovata</div>;
 *
 * // Usa config.weightTiers, config.italyConfig, config.weightBasedCosts
 */
export function useShippingConfig(): ShippingConfigContextType {
  const context = useContext(ShippingConfigContext);

  if (context === undefined) {
    throw new Error('useShippingConfig deve essere usato all\'interno di ShippingConfigProvider');
  }

  return context;
}
