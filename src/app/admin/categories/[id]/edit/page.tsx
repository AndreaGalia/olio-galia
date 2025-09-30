'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface CategoryTranslation {
  name: string;
  description?: string;
}

interface CategoryDocument {
  id: string;
  translations: {
    it: CategoryTranslation;
    en: CategoryTranslation;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAdminAuth();
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryDocument | null>(null);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setCategoryId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  const fetchCategory = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${categoryId}`);
      if (!response.ok) throw new Error('Categoria non trovata');

      const categoryData = await response.json();
      setCategory(categoryData);
      setFormData({
        translations: categoryData.translations
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento della categoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.translations.it.name || !formData.translations.en.name) {
        throw new Error('Nome in italiano e inglese sono obbligatori');
      }

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nell\'aggiornamento della categoria');
      }

      router.push('/admin/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento della categoria');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Modifica Categoria"
        subtitle="Caricamento..."
        headerActions={headerActions}
      >
        <LoadingSpinner message="Caricamento categoria..." />
      </AdminLayout>
    );
  }

  if (!category) {
    return (
      <AdminLayout
        title="Categoria Non Trovata"
        subtitle="La categoria richiesta non esiste"
        headerActions={headerActions}
      >
        <EmptyState
          icon={
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          title="Categoria non trovata"
          description="La categoria richiesta non esiste o è stata eliminata"
          action={
            <button
              onClick={() => router.push('/admin/categories')}
              className="px-4 py-2 bg-salvia text-white rounded-lg hover:bg-olive transition-colors"
            >
              Torna alle Categorie
            </button>
          }
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Modifica Categoria"
      subtitle={`Modifica la categoria: ${categoryId}`}
      headerActions={headerActions}
    >
      {/* Category Status */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-nocciola">Stato:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            category.metadata.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {category.metadata.isActive ? 'Attiva' : 'Disattivata'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-nocciola">ID:</span>
          <code className="bg-olive/10 px-2 py-1 rounded text-olive font-mono text-sm">
            {categoryId}
          </code>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      it: { ...prev.translations.it, name: e.target.value }
                    }
                  }))}
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
                  value={formData.translations.it.description || ''}
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
                  value={formData.translations.en.description || ''}
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

          <div className="bg-olive/5 rounded-lg p-4">
            <h4 className="font-medium text-olive mb-2">Informazioni</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-nocciola">
              <div>
                <strong>Creata:</strong> {new Date(category.metadata.createdAt).toLocaleString('it-IT')}
              </div>
              <div>
                <strong>Ultima modifica:</strong> {new Date(category.metadata.updatedAt).toLocaleString('it-IT')}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-olive/10">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-olive/20 text-olive rounded-lg hover:bg-olive/5 transition-colors"
              disabled={saving}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving || !formData.translations.it.name || !formData.translations.en.name}
              className="px-6 py-3 bg-salvia text-white rounded-lg hover:bg-olive transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving && (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}