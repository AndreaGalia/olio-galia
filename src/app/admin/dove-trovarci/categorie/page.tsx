'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import NotificationBanner from '@/components/admin/NotificationBanner';
import { POSCategoryAdmin } from '@/types/pointOfSale';

interface CategoryFormValues {
  nameIT: string;
  nameEN: string;
  descriptionIT: string;
  descriptionEN: string;
  icon: string;
  displayOrder: string;
}

const EMPTY_FORM: CategoryFormValues = {
  nameIT: '',
  nameEN: '',
  descriptionIT: '',
  descriptionEN: '',
  icon: '',
  displayOrder: '',
};

const inputClass =
  'w-full px-4 py-2.5 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive transition-colors';
const labelClass = 'block text-sm font-medium text-olive mb-1.5';

export default function PointOfSaleCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<POSCategoryAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<CategoryFormValues>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/points-of-sale/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      } else {
        setNotification({ type: 'error', message: data.error || 'Errore nel caricamento' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Errore nel caricamento delle categorie' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const set = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (category: POSCategoryAdmin) => {
    setEditingId(category.id);
    setForm({
      nameIT: category.translations.it.name,
      nameEN: category.translations.en.name,
      descriptionIT: category.translations.it.description || '',
      descriptionEN: category.translations.en.description || '',
      icon: category.icon || '',
      displayOrder: String(category.displayOrder),
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.nameIT.trim() || !form.nameEN.trim()) {
      setNotification({ type: 'error', message: 'Il nome è obbligatorio in italiano e in inglese' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nameIT: form.nameIT,
        nameEN: form.nameEN,
        descriptionIT: form.descriptionIT,
        descriptionEN: form.descriptionEN,
        icon: form.icon,
        displayOrder: form.displayOrder ? parseInt(form.displayOrder, 10) : undefined,
      };

      const response = await fetch(
        editingId
          ? `/api/admin/points-of-sale/categories/${editingId}`
          : '/api/admin/points-of-sale/categories',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', message: data.message });
        resetForm();
        fetchCategories();
      } else {
        setNotification({ type: 'error', message: data.error || 'Errore durante il salvataggio' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Errore durante il salvataggio' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/points-of-sale/categories/${deleteModal.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', message: data.message });
        if (editingId === deleteModal.id) resetForm();
        fetchCategories();
      } else {
        setNotification({ type: 'error', message: data.error || 'Errore durante l\'eliminazione' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Errore durante l\'eliminazione' });
    } finally {
      setDeleting(false);
      setDeleteModal(null);
    }
  };

  return (
    <AdminLayout
      title="Categorie punti vendita"
      subtitle="Tipologie usate dal filtro nella pagina Dove Trovarci"
      headerActions={
        <button
          onClick={() => router.push('/admin/dove-trovarci')}
          className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
        >
          ← Torna ai punti vendita
        </button>
      }
    >
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-olive/10 p-6 space-y-4"
          >
            <h2 className="text-lg font-serif text-olive">
              {editingId ? 'Modifica categoria' : 'Nuova categoria'}
            </h2>

            <div>
              <label className={labelClass}>Nome (IT) *</label>
              <input
                type="text"
                value={form.nameIT}
                onChange={e => set('nameIT', e.target.value)}
                placeholder="Supermercati"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Nome (EN) *</label>
              <input
                type="text"
                value={form.nameEN}
                onChange={e => set('nameEN', e.target.value)}
                placeholder="Supermarkets"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Descrizione (IT)</label>
              <input
                type="text"
                value={form.descriptionIT}
                onChange={e => set('descriptionIT', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Descrizione (EN)</label>
              <input
                type="text"
                value={form.descriptionEN}
                onChange={e => set('descriptionEN', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Icona</label>
              <input
                type="text"
                value={form.icon}
                onChange={e => set('icon', e.target.value)}
                placeholder="ShoppingCart"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-nocciola">
                Nome di un&apos;icona lucide-react, es. ShoppingCart, Store, Beef, Tent.
              </p>
            </div>

            <div>
              <label className={labelClass}>Ordine</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={e => set('displayOrder', e.target.value)}
                placeholder="In fondo"
                className={inputClass}
              />
            </div>

            {editingId && (
              <p className="text-xs text-nocciola">
                L&apos;identificativo della categoria non cambia rinominandola, così i punti
                vendita associati restano collegati.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 border border-olive text-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
                >
                  Annulla
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'Salvataggio...' : editingId ? 'Salva' : 'Crea categoria'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-olive/10 overflow-hidden">
            {loading ? (
              <div className="p-8">
                <LoadingSpinner message="Caricamento categorie..." />
              </div>
            ) : categories.length === 0 ? (
              <EmptyState
                title="Nessuna categoria"
                description="Crea la prima categoria per poter aggiungere punti vendita."
              />
            ) : (
              <div className="divide-y divide-olive/10">
                {categories.map(category => (
                  <div key={category.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium text-olive">
                        {category.translations.it.name}
                        <span className="text-nocciola font-normal"> · {category.translations.en.name}</span>
                      </div>
                      <div className="text-xs text-nocciola mt-1">
                        id: {category.id}
                        {category.icon ? ` · icona: ${category.icon}` : ''}
                        {` · ordine: ${category.displayOrder}`}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {category.pointOfSaleCount === 0
                          ? 'Nessun punto vendita associato'
                          : `${category.pointOfSaleCount} punti vendita attivi`}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => startEdit(category)}
                        className="text-olive hover:text-salvia transition-colors font-medium text-sm cursor-pointer"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({ id: category.id, name: category.translations.it.name })
                        }
                        disabled={category.pointOfSaleCount > 0}
                        title={
                          category.pointOfSaleCount > 0
                            ? 'Sposta prima i punti vendita in un\'altra categoria'
                            : undefined
                        }
                        className="text-red-600 hover:text-red-800 transition-colors font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal !== null}
        title="Elimina categoria"
        itemName={deleteModal?.name || ''}
        description="L'eliminazione è definitiva ed è possibile solo se nessun punto vendita usa questa categoria."
        isDeleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </AdminLayout>
  );
}
