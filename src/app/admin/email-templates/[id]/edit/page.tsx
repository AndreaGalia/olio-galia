'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import HTMLEditor from '@/components/admin/HTMLEditor';
import NotificationBanner from '@/components/admin/NotificationBanner';
import { EmailTemplateDocument, VARIABLE_DESCRIPTIONS } from '@/types/emailTemplate';

export default function EditEmailTemplatePage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [template, setTemplate] = useState<EmailTemplateDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    subjectIT: '',
    htmlBodyIT: '',
    subjectEN: '',
    htmlBodyEN: '',
  });

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testLocale, setTestLocale] = useState<'it' | 'en'>('it');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && id) {
      fetchTemplate();
    }
  }, [user, id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/email-templates/${id}`);
      const data = await response.json();

      if (data.success) {
        setTemplate(data.template);
        setFormData({
          name: data.template.name,
          subjectIT: data.template.translations.it.subject,
          htmlBodyIT: data.template.translations.it.htmlBody,
          subjectEN: data.template.translations.en.subject,
          htmlBodyEN: data.template.translations.en.htmlBody,
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Template non trovato'
        });
        setTimeout(() => router.push('/admin/email-templates'), 2000);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      setNotification({
        type: 'error',
        message: 'Errore nel caricamento del template'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.subjectIT || !formData.htmlBodyIT ||
        !formData.subjectEN || !formData.htmlBodyEN) {
      setNotification({
        type: 'error',
        message: 'Tutti i campi sono obbligatori'
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Template aggiornato con successo'
        });
        setTimeout(() => router.push('/admin/email-templates'), 1500);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Errore nell\'aggiornamento del template'
        });
      }
    } catch (error) {
      console.error('Error updating template:', error);
      setNotification({
        type: 'error',
        message: 'Errore nell\'aggiornamento del template'
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

    try {
      setSendingTest(true);
      const response = await fetch(`/api/admin/email-templates/${id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail, locale: testLocale }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Email di test inviata a ${testEmail}`);
        setShowTestModal(false);
        setTestEmail('');
      } else {
        alert(data.error || 'Errore nell\'invio dell\'email di test');
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

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80 flex items-center justify-center">
        <div className="text-olive text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80 flex items-center justify-center">
        <div className="text-red-600 text-xl">Template non trovato</div>
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif text-olive">
                  ✏️ Modifica Template
                </h1>
                {template.isSystem && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    🔒 Template di Sistema
                  </span>
                )}
              </div>
              <p className="text-nocciola mt-1">
                {template.name} ({template.templateKey})
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Template *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-olive/30 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Key
                  </label>
                  <input
                    type="text"
                    value={template.templateKey}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    La chiave del template non può essere modificata
                  </p>
                </div>
              </div>
            </section>

            {/* Variabili Disponibili */}
            {template.availableVariables && template.availableVariables.length > 0 && (
              <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                  💡 Variabili Disponibili (click per copiare)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {template.availableVariables.map((variable) => (
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
                    required
                  />
                </div>
                <HTMLEditor
                  value={formData.htmlBodyIT}
                  onChange={(value) => setFormData({ ...formData, htmlBodyIT: value })}
                  label="Corpo HTML (IT) *"
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
                    required
                  />
                </div>
                <HTMLEditor
                  value={formData.htmlBodyEN}
                  onChange={(value) => setFormData({ ...formData, htmlBodyEN: value })}
                  label="Corpo HTML (EN) *"
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
                  {saving ? 'Salvataggio...' : 'Salva Modifiche'}
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
