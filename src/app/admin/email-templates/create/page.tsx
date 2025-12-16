'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import HTMLEditor from '@/components/admin/HTMLEditor';
import NotificationBanner from '@/components/admin/NotificationBanner';
import { TEMPLATE_VARIABLES, VARIABLE_DESCRIPTIONS } from '@/types/emailTemplate';

export default function CreateEmailTemplatePage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    templateKey: '',
    subjectIT: '',
    htmlBodyIT: '',
    subjectEN: '',
    htmlBodyEN: '',
    availableVariables: [] as string[],
  });

  const [selectedTemplateType, setSelectedTemplateType] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testLocale, setTestLocale] = useState<'it' | 'en'>('it');
  const [sendingTest, setSendingTest] = useState(false);

  const handleTemplateTypeChange = (type: string) => {
    setSelectedTemplateType(type);
    if (type && TEMPLATE_VARIABLES[type]) {
      setFormData(prev => ({
        ...prev,
        availableVariables: TEMPLATE_VARIABLES[type]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.templateKey || !formData.subjectIT ||
        !formData.htmlBodyIT || !formData.subjectEN || !formData.htmlBodyEN) {
      setNotification({
        type: 'error',
        message: 'Tutti i campi sono obbligatori'
      });
      return;
    }

    if (!/^[a-z0-9_]+$/.test(formData.templateKey)) {
      setNotification({
        type: 'error',
        message: 'Template key deve contenere solo lettere minuscole, numeri e underscore'
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Template creato con successo'
        });
        setTimeout(() => router.push('/admin/email-templates'), 1500);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Errore nella creazione del template'
        });
      }
    } catch (error) {
      console.error('Error creating template:', error);
      setNotification({
        type: 'error',
        message: 'Errore nella creazione del template'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      alert('Inserisci un indirizzo email');
      return;
    }

    // Crea template temporaneo per test
    const tempTemplate = {
      templateKey: formData.templateKey || 'test',
      name: formData.name || 'Test',
      isSystem: false,
      translations: {
        it: {
          subject: formData.subjectIT,
          htmlBody: formData.htmlBodyIT,
        },
        en: {
          subject: formData.subjectEN,
          htmlBody: formData.htmlBodyEN,
        },
      },
      availableVariables: formData.availableVariables,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
    };

    try {
      setSendingTest(true);
      // Simula invio salvando temporaneamente
      const createRes = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, templateKey: `temp_test_${Date.now()}` }),
      });

      if (!createRes.ok) {
        throw new Error('Errore creazione template temporaneo');
      }

      const createData = await createRes.json();
      const tempId = createData.templateId;

      // Invia test
      const testRes = await fetch(`/api/admin/email-templates/${tempId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail, locale: testLocale }),
      });

      const testData = await testRes.json();

      // Elimina template temporaneo
      await fetch(`/api/admin/email-templates/${tempId}`, { method: 'DELETE' });

      if (testData.success) {
        alert(`Email di test inviata a ${testEmail}`);
        setShowTestModal(false);
        setTestEmail('');
      } else {
        alert(testData.error || 'Errore invio email di test');
      }
    } catch (error) {
      console.error('Error sending test:', error);
      alert('Errore nell\'invio dell\'email di test');
    } finally {
      setSendingTest(false);
    }
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    setNotification({
      type: 'success',
      message: `Variabile {{${variable}}} copiata!`
    });
    setTimeout(() => setNotification(null), 2000);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80 flex items-center justify-center">
        <div className="text-olive text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-olive/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif text-olive">
                ➕ Nuovo Template Email
              </h1>
              <p className="text-nocciola mt-1">
                Crea un nuovo template email personalizzato
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/email-templates')}
              className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
            >
              ← Indietro
            </button>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <NotificationBanner
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-8 space-y-8">

            {/* Info Base */}
            <section>
              <h3 className="text-lg font-semibold text-olive mb-4">
                📋 Informazioni Base
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Template *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="es. Conferma Ordine"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Key *
                  </label>
                  <input
                    type="text"
                    value={formData.templateKey}
                    onChange={(e) => setFormData({ ...formData, templateKey: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive font-mono"
                    placeholder="es. custom_welcome"
                    pattern="[a-z0-9_]+"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solo lettere minuscole, numeri e underscore
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo Template (opzionale - per suggerire variabili)
                </label>
                <select
                  value={selectedTemplateType}
                  onChange={(e) => handleTemplateTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                >
                  <option value="">-- Seleziona tipo --</option>
                  <option value="order_confirmation">Conferma Ordine</option>
                  <option value="shipping_notification">Notifica Spedizione</option>
                  <option value="delivery_notification">Notifica Consegna</option>
                  <option value="quote_email">Email Preventivo</option>
                  <option value="review_request">Richiesta Recensione</option>
                  <option value="newsletter_welcome">Benvenuto Newsletter</option>
                </select>
              </div>
            </section>

            {/* Variabili Disponibili */}
            {formData.availableVariables.length > 0 && (
              <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                  💡 Variabili Disponibili (click per copiare)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {formData.availableVariables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => copyVariable(variable)}
                      className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 rounded-md text-sm font-mono text-blue-900 hover:bg-blue-100 transition-colors"
                      title={VARIABLE_DESCRIPTIONS[variable] || variable}
                    >
                      {`{{${variable}}}`}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Traduzioni Italiano */}
            <section>
              <h3 className="text-lg font-semibold text-olive mb-4">
                🇮🇹 Versione Italiana
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oggetto Email (IT) *
                  </label>
                  <input
                    type="text"
                    value={formData.subjectIT}
                    onChange={(e) => setFormData({ ...formData, subjectIT: e.target.value })}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="es. Conferma Ordine #{{orderNumber}}"
                    required
                  />
                </div>
                <HTMLEditor
                  value={formData.htmlBodyIT}
                  onChange={(value) => setFormData({ ...formData, htmlBodyIT: value })}
                  label="Corpo HTML (IT) *"
                  placeholder="Inserisci il codice HTML del template..."
                  height="500px"
                />
              </div>
            </section>

            {/* Traduzioni Inglese */}
            <section>
              <h3 className="text-lg font-semibold text-olive mb-4">
                🇬🇧 Versione Inglese
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oggetto Email (EN) *
                  </label>
                  <input
                    type="text"
                    value={formData.subjectEN}
                    onChange={(e) => setFormData({ ...formData, subjectEN: e.target.value })}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="es. Order Confirmation #{{orderNumber}}"
                    required
                  />
                </div>
                <HTMLEditor
                  value={formData.htmlBodyEN}
                  onChange={(value) => setFormData({ ...formData, htmlBodyEN: value })}
                  label="Corpo HTML (EN) *"
                  placeholder="Insert the HTML template code..."
                  height="500px"
                />
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-olive/10">
              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                className="px-6 py-2 border border-olive text-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
              >
                📧 Invia Test Email
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/admin/email-templates')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvataggio...' : 'Salva Template'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-olive mb-4">
              📧 Invia Email di Test
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Destinatario
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lingua
                </label>
                <select
                  value={testLocale}
                  onChange={(e) => setTestLocale(e.target.value as 'it' | 'en')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                >
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia disabled:opacity-50"
                >
                  {sendingTest ? 'Invio...' : 'Invia Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
