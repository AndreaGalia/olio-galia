'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function CreateCategoryPage() {
  const { user } = useAdminAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    translations: {
      it: {
        name: '',
        description: ''
      },
      en: {
        name: '',
        description: ''
      }
    }
  });

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/admin/categories')}
        className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
      >
        ← Tutte le Categorie
      </button>
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
      >
        Dashboard
      </button>
    </>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.translations.it.name || !formData.translations.en.name) {
        throw new Error('Nome in italiano e inglese sono obbligatori');
      }

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella creazione della categoria');
      }

      router.push('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione della categoria');
    } finally {
      setLoading(false);
    }
  };

  const generateIdFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleItNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        it: { ...prev.translations.it, name: value }
      },
      id: prev.id === '' ? generateIdFromName(value) : prev.id
    }));
  };

  return (
    <AdminLayout
      title="Nuova Categoria"
      subtitle="Crea una nuova categoria per i prodotti"
      headerActions={headerActions}
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-olive mb-2">
              ID Categoria *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              className="w-full p-3 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90"
              placeholder="es: olio-extravergine"
              required
            />
            <p className="text-sm text-nocciola mt-1">
              L'ID verrà generato automaticamente dal nome italiano se lasciato vuoto
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-olive border-b border-olive/20 pb-2">
                🇮🇹 Italiano
              </h3>

              <div>
                <label className="block text-sm font-medium text-olive mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.translations.it.name}
                  onChange={(e) => handleItNameChange(e.target.value)}
                  className="w-full p-3 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90"
                  placeholder="es: Olio Extravergine"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-olive mb-2">
                  Descrizione
                </label>
                <textarea
                  value={formData.translations.it.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      it: { ...prev.translations.it, description: e.target.value }
                    }
                  }))}
                  className="w-full p-3 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90"
                  rows={3}
                  placeholder="Descrizione della categoria in italiano"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-olive border-b border-olive/20 pb-2">
                🇬🇧 English
              </h3>

              <div>
                <label className="block text-sm font-medium text-olive mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.translations.en.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      en: { ...prev.translations.en, name: e.target.value }
                    }
                  }))}
                  className="w-full p-3 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90"
                  placeholder="ex: Extra Virgin Oil"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-olive mb-2">
                  Description
                </label>
                <textarea
                  value={formData.translations.en.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      en: { ...prev.translations.en, description: e.target.value }
                    }
                  }))}
                  className="w-full p-3 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90"
                  rows={3}
                  placeholder="Category description in English"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-olive/10">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-olive/20 text-olive rounded-lg hover:bg-olive/5 transition-colors"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading || !formData.translations.it.name || !formData.translations.en.name}
              className="px-6 py-3 bg-salvia text-white rounded-lg hover:bg-olive transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{loading ? 'Creazione...' : 'Crea Categoria'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}