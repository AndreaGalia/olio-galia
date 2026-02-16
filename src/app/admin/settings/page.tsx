'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import WhatsAppTemplateEditor from '@/components/admin/WhatsAppTemplateEditor';
import { DEFAULT_TEMPLATES } from '@/types/whatsapp';

interface WhatsAppSettings {
  enabled: boolean;
  apiUrl: string;
  session: string;
  orderConfirmation: boolean;
  shippingUpdate: boolean;
  deliveryConfirmation: boolean;
  reviewRequest: boolean;
  templates?: {
    orderConfirmation: string;
    shippingUpdate: string;
    deliveryConfirmation: string;
    reviewRequest: string;
  };
}

interface NewsletterPopupSettings {
  enabled: boolean;
  showOnHomepage: boolean;
  delayMs: number;
  scrollThreshold: number;
  dismissDays: number;
}

interface AdminSettings {
  torino_checkout_enabled: boolean;
  stripe_enabled: boolean;
  whatsapp: WhatsAppSettings;
  newsletter_popup: NewsletterPopupSettings;
}

interface WhatsAppStatus {
  connected: boolean;
  status: string;
  message: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AdminSettings>({
    torino_checkout_enabled: false,
    stripe_enabled: true, // Default: Stripe abilitato
    whatsapp: {
      enabled: false,
      apiUrl: '',
      session: 'olio-galia',
      orderConfirmation: true,
      shippingUpdate: true,
      deliveryConfirmation: true,
      reviewRequest: true,
      templates: DEFAULT_TEMPLATES
    },
    newsletter_popup: {
      enabled: true,
      showOnHomepage: false,
      delayMs: 20000,
      scrollThreshold: 50,
      dismissDays: 7
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // WhatsApp test
  const [testPhone, setTestPhone] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // WhatsApp status
  const [wahaStatus, setWahaStatus] = useState<WhatsAppStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // WhatsApp tabs
  const [whatsappTab, setWhatsappTab] = useState<'config' | 'templates'>('config');

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

  const handleWhatsAppToggle = (key: keyof WhatsAppSettings) => {
    setSettings(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        [key]: !prev.whatsapp[key]
      }
    }));
  };

  const handleWhatsAppInputChange = (key: keyof WhatsAppSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        [key]: value
      }
    }));
  };

  const checkWhatsAppStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await fetch('/api/admin/settings/whatsapp/status');
      if (response.ok) {
        const data = await response.json();
        setWahaStatus(data);
      }
    } catch (err) {
      console.error('Errore verifica stato WhatsApp:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const testWhatsApp = async () => {
    if (!testPhone) {
      setTestResult({ success: false, message: 'Inserisci un numero di telefono' });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      const response = await fetch('/api/admin/settings/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: testPhone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error || 'Errore nell\'invio' });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Errore sconosciuto'
      });
    } finally {
      setTesting(false);
    }
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

      {/* Sezione Checkout */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6 mb-6">
        <h2 className="text-xl font-semibold text-olive mb-6">Funzionalità Checkout</h2>

        <div className="space-y-4">
          {/* Toggle Stripe */}
          <div className="flex items-center justify-between p-4 border border-olive/10 rounded-lg bg-blue-50/30">
            <div>
              <h3 className="font-medium text-gray-900">Integrazione Stripe</h3>
              <p className="text-sm text-gray-600">
                Abilita i pagamenti online con Stripe. Se disabilitato, solo Checkout Torino sarà disponibile.
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange('stripe_enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.stripe_enabled ? 'bg-olive' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.stripe_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Toggle Checkout Torino */}
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

          {/* Link to Shipping Configuration */}
          <div className="flex items-center justify-between p-4 border border-olive/10 rounded-lg bg-yellow-50/30">
            <div>
              <h3 className="font-medium text-gray-900">Configurazione Spedizioni</h3>
              <p className="text-sm text-gray-600">
                Gestisci fasce peso, costi spedizione e configurazione zone geografiche
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/shipping-config')}
              className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-sm whitespace-nowrap"
            >
              Configura →
            </button>
          </div>
        </div>
      </div>

      {/* Sezione Newsletter Popup */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-olive">Popup Newsletter</h2>
          <button
            type="button"
            onClick={() => setSettings(prev => ({
              ...prev,
              newsletter_popup: { ...prev.newsletter_popup, enabled: !prev.newsletter_popup.enabled }
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.newsletter_popup.enabled ? 'bg-olive' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.newsletter_popup.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Mostra un popup per l&apos;iscrizione alla newsletter ai visitatori del sito dopo un certo tempo o scroll.
        </p>

        <div className="space-y-4">
          {/* Toggle Mostra in Homepage */}
          <div className="flex items-center justify-between p-4 border border-olive/10 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Mostra in Homepage</h3>
              <p className="text-sm text-gray-600">
                Se abilitato, il popup apparirà anche nella pagina principale
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({
                ...prev,
                newsletter_popup: { ...prev.newsletter_popup, showOnHomepage: !prev.newsletter_popup.showOnHomepage }
              }))}
              disabled={!settings.newsletter_popup.enabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.newsletter_popup.showOnHomepage && settings.newsletter_popup.enabled ? 'bg-olive' : 'bg-gray-200'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.newsletter_popup.showOnHomepage ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Delay */}
          <div className="p-4 border border-olive/10 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Delay (secondi)
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Tempo di attesa prima di mostrare il popup
            </p>
            <input
              type="number"
              min="0"
              step="1"
              value={Math.round(settings.newsletter_popup.delayMs / 1000)}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                newsletter_popup: { ...prev.newsletter_popup, delayMs: Math.max(0, parseInt(e.target.value) || 0) * 1000 }
              }))}
              disabled={!settings.newsletter_popup.enabled}
              className="w-32 px-4 py-2 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/50 disabled:opacity-50"
            />
          </div>

          {/* Soglia Scroll */}
          <div className="p-4 border border-olive/10 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Soglia scroll (%)
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Percentuale di scroll della pagina per triggerare il popup (0-100)
            </p>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={settings.newsletter_popup.scrollThreshold}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                newsletter_popup: { ...prev.newsletter_popup, scrollThreshold: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }
              }))}
              disabled={!settings.newsletter_popup.enabled}
              className="w-32 px-4 py-2 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/50 disabled:opacity-50"
            />
          </div>

          {/* Giorni prima di rimostrare */}
          <div className="p-4 border border-olive/10 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Giorni prima di rimostrare
            </label>
            <p className="text-xs text-gray-600 mb-2">
              Dopo che l&apos;utente chiude il popup, non verrà rimostrato per questo numero di giorni
            </p>
            <input
              type="number"
              min="1"
              step="1"
              value={settings.newsletter_popup.dismissDays}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                newsletter_popup: { ...prev.newsletter_popup, dismissDays: Math.max(1, parseInt(e.target.value) || 1) }
              }))}
              disabled={!settings.newsletter_popup.enabled}
              className="w-32 px-4 py-2 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/50 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Sezione WhatsApp Notifications */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-olive">Notifiche WhatsApp</h2>
          <button
            type="button"
            onClick={() => handleWhatsAppToggle('enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.whatsapp.enabled ? 'bg-olive' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.whatsapp.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Invia messaggi WhatsApp automatici ai clienti per conferme ordini, spedizioni e richieste recensioni.
        </p>

        {/* Tab Navigation */}
        {settings.whatsapp.enabled && (
          <div className="border-b border-olive/20 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setWhatsappTab('config')}
                className={`pb-2 px-1 border-b-2 transition-colors ${
                  whatsappTab === 'config'
                    ? 'border-olive text-olive font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Configurazione
              </button>
              <button
                onClick={() => setWhatsappTab('templates')}
                className={`pb-2 px-1 border-b-2 transition-colors ${
                  whatsappTab === 'templates'
                    ? 'border-olive text-olive font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Template Messaggi
              </button>
            </div>
          </div>
        )}

        {/* Configuration Content */}
        {whatsappTab === 'config' && (
          <>
            {/* Configurazione API */}
            <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL API WAHA
            </label>
            <input
              type="text"
              value={settings.whatsapp.apiUrl}
              onChange={(e) => handleWhatsAppInputChange('apiUrl', e.target.value)}
              placeholder="http://your-server:3000 o https://waha.yourdomain.com"
              className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/50"
              disabled={!settings.whatsapp.enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              URL del server WAHA (es. http://localhost:3000 per sviluppo)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Sessione
            </label>
            <input
              type="text"
              value={settings.whatsapp.session}
              onChange={(e) => handleWhatsAppInputChange('session', e.target.value)}
              placeholder="olio-galia"
              className="w-full px-4 py-2 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/50"
              disabled={!settings.whatsapp.enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              Nome della sessione WhatsApp configurata su WAHA
            </p>
          </div>
        </div>

        {/* Stato Connessione */}
        {settings.whatsapp.enabled && settings.whatsapp.apiUrl && (
          <div className="mb-6 p-4 border border-olive/20 rounded-lg bg-olive/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Stato Connessione</h3>
                {wahaStatus ? (
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        wahaStatus.connected ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm text-gray-600">{wahaStatus.message}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Clicca per verificare</p>
                )}
              </div>
              <button
                onClick={checkWhatsAppStatus}
                disabled={checkingStatus}
                className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {checkingStatus ? 'Verificando...' : 'Verifica Stato'}
              </button>
            </div>
          </div>
        )}

        {/* Tipi di Notifiche */}
        <div className="space-y-3 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Abilita Notifiche</h3>

          {[
            {
              key: 'orderConfirmation' as keyof WhatsAppSettings,
              label: 'Conferma Ordine',
              description: 'Messaggio automatico dopo pagamento completato'
            },
            {
              key: 'shippingUpdate' as keyof WhatsAppSettings,
              label: 'Aggiornamento Spedizione',
              description: 'Notifica quando ordine viene spedito con tracking'
            },
            {
              key: 'deliveryConfirmation' as keyof WhatsAppSettings,
              label: 'Conferma Consegna',
              description: 'Messaggio quando ordine arriva a destinazione'
            },
            {
              key: 'reviewRequest' as keyof WhatsAppSettings,
              label: 'Richiesta Recensione',
              description: 'Chiedi recensione dopo consegna (richiesta manuale)'
            }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 border border-olive/10 rounded-lg"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleWhatsAppToggle(item.key)}
                disabled={!settings.whatsapp.enabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.whatsapp[item.key] && settings.whatsapp.enabled
                    ? 'bg-olive'
                    : 'bg-gray-200'
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.whatsapp[item.key] ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Test WhatsApp */}
        {settings.whatsapp.enabled && settings.whatsapp.apiUrl && (
          <div className="p-4 border border-olive/20 rounded-lg bg-yellow-50">
            <h3 className="font-medium text-gray-900 mb-3">Test Invio Messaggio</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+39 333 1234567"
                className="flex-1 px-4 py-2 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/50"
              />
              <button
                onClick={testWhatsApp}
                disabled={testing || !testPhone}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              >
                {testing ? 'Invio...' : 'Invia Test'}
              </button>
            </div>
            {testResult && (
              <div
                className={`mt-3 p-3 rounded-lg ${
                  testResult.success
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {testResult.message}
              </div>
            )}
            <p className="text-xs text-gray-600 mt-2">
              Formato: +39 333 1234567 o 393331234567
            </p>
          </div>
        )}
          </>
        )}

        {/* Template Editor Content */}
        {whatsappTab === 'templates' && (
          <WhatsAppTemplateEditor
            templates={settings.whatsapp.templates || DEFAULT_TEMPLATES}
            onChange={(newTemplates) => {
              setSettings(prev => ({
                ...prev,
                whatsapp: {
                  ...prev.whatsapp,
                  templates: newTemplates
                }
              }));
            }}
            disabled={!settings.whatsapp.enabled}
          />
        )}
      </div>

      {/* Bottone Salva */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-salvia to-olive text-white rounded-lg hover:from-olive hover:to-salvia transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="32"
                  strokeDashoffset="32"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    dur="1s"
                    values="32;0;32"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
              <span>Salvataggio...</span>
            </>
          ) : (
            <span>Salva Impostazioni</span>
          )}
        </button>
      </div>
    </AdminLayout>
  );
}
