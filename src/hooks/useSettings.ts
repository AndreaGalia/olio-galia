import { useState, useEffect } from 'react';

interface Settings {
  torino_checkout_enabled: boolean;
  stripe_enabled: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    torino_checkout_enabled: false,
    stripe_enabled: true // Default: Stripe abilitato
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error('Errore nel caricamento delle impostazioni');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, refetch: fetchSettings };
}