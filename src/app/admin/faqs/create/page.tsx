'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import FAQFormFields from '@/components/admin/faqs/FAQFormFields';
import FAQSettings from '@/components/admin/faqs/FAQSettings';

export default function CreateFAQPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formDataIT, setFormDataIT] = useState({
    question: '',
    answer: '',
    category: '',
  });

  const [formDataEN, setFormDataEN] = useState({
    question: '',
    answer: '',
    category: '',
  });

  const [order, setOrder] = useState('');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-olive/5">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-olive">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/admin/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIT: formDataIT.question,
          answerIT: formDataIT.answer,
          categoryIT: formDataIT.category,
          questionEN: formDataEN.question,
          answerEN: formDataEN.answer,
          categoryEN: formDataEN.category,
          order: order ? parseInt(order) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/faqs');
      } else {
        setError(data.error || 'Errore durante la creazione');
      }
    } catch (error) {
      setError('Errore durante la creazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-olive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-xl sm:text-3xl font-serif text-olive">Crea Nuova FAQ</h1>
              <p className="text-nocciola mt-1 text-sm sm:text-base">
                Aggiungi una nuova domanda frequente
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/faqs')}
              className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
            >
              ← Torna alle FAQ
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Versione Italiana */}
          <FAQFormFields
            language="it"
            languageLabel="IT"
            languageColor="bg-green-100 text-green-700"
            formData={formDataIT}
            onChange={(field, value) => setFormDataIT({ ...formDataIT, [field]: value })}
            labels={{
              question: 'Domanda (IT)',
              answer: 'Risposta (IT)',
              category: 'Categoria (IT)',
              categoryPlaceholder: 'Produzione',
              categoryHint: 'Es: Produzione, Prodotti, Conservazione, Spedizioni, etc.',
            }}
          />

          {/* Versione Inglese */}
          <FAQFormFields
            language="en"
            languageLabel="EN"
            languageColor="bg-blue-100 text-blue-700"
            formData={formDataEN}
            onChange={(field, value) => setFormDataEN({ ...formDataEN, [field]: value })}
            labels={{
              question: 'Question (EN)',
              answer: 'Answer (EN)',
              category: 'Category (EN)',
              categoryPlaceholder: 'Production',
              categoryHint: 'Ex: Production, Products, Storage, Shipping, etc.',
            }}
          />

          {/* Impostazioni */}
          <FAQSettings
            order={order}
            onOrderChange={setOrder}
            labels={{
              title: 'Impostazioni',
              orderLabel: 'Ordine di visualizzazione (opzionale)',
              orderPlaceholder: 'Lascia vuoto per aggiungere in fondo',
              orderHint: 'Se non specificato, la FAQ verrà aggiunta alla fine della lista',
            }}
          />

          {/* Azioni */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/faqs')}
              className="px-6 py-3 border border-olive text-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creazione...
                </span>
              ) : (
                'Crea FAQ'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
