'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

interface AdminSettings {
  torino_checkout_enabled: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AdminSettings>({ torino_checkout_enabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Carica le impostazioni attuali
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
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

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Errore nel salvataggio delle impostazioni');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChange = (key: keyof AdminSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/admin/preventivi')}
        className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        Preventivi
      </button>
      <button
        onClick={() => router.push('/admin/orders')}
        className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        Ordini
      </button>
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="px-2 sm:px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        Dashboard
      </button>
    </>
  );

  if (loading) {
    return (
      <AdminLayout
        title="Impostazioni"
        subtitle="Configura le opzioni dell'applicazione"
        headerActions={headerActions}
      >
        <LoadingSpinner message="Caricamento impostazioni..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Impostazioni"
      subtitle="Configura le opzioni dell'applicazione"
      headerActions={headerActions}
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Impostazioni salvate con successo!
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
        <h2 className="text-xl font-semibold text-olive mb-6">Funzionalità Checkout</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-olive/10 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Checkout Torino</h3>
              <p className="text-sm text-gray-600">
                Abilita il bottone di checkout per ordini con ritiro a Torino nella pagina del carrello
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange('torino_checkout_enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.torino_checkout_enabled ? 'bg-olive' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.torino_checkout_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-salvia to-olive text-white rounded-lg hover:from-olive hover:to-salvia transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dashoffset" dur="1s" values="32;0;32" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span>Salvataggio...</span>
              </>
            ) : (
              <span>Salva Impostazioni</span>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}