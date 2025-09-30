'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import NotificationBanner from '@/components/admin/NotificationBanner';
import ActionButtons from '@/components/admin/ActionButtons';
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
  productCount?: number;
}

export default function CategoriesPage() {
  const { user } = useAdminAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ categoryId: string; categoryName: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/categories?includeInactive=${includeInactive}`);
      if (!response.ok) throw new Error('Errore nel caricamento delle categorie');
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [includeInactive]);

  const filteredCategories = categories.filter(category =>
    category.translations.it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.translations.en.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/admin/categories/create')}
        className="px-4 py-2 bg-salvia text-white rounded-lg hover:bg-olive transition-colors flex items-center space-x-2 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nuova Categoria</span>
      </button>
      <button
        onClick={() => router.push('/admin/products')}
        className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
      >
        Prodotti
      </button>
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
      >
        Dashboard
      </button>
    </>
  );

  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translations: categories.find(c => c.id === categoryId)?.translations,
          isActive: !isActive
        })
      });

      if (!response.ok) throw new Error('Errore nell\'aggiornamento della categoria');
      setSuccessMessage('Stato categoria aggiornato con successo');
      setTimeout(() => setSuccessMessage(null), 5000);
      await fetchCategories();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nell\'aggiornamento della categoria');
    }
  };

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setDeleteModal({ categoryId, categoryName });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${deleteModal.categoryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nell\'eliminazione');
      }

      setDeleteModal(null);
      setSuccessMessage('Categoria eliminata con successo');
      setTimeout(() => setSuccessMessage(null), 5000);
      await fetchCategories();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nell\'eliminazione della categoria');
      setDeleteModal(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Gestione Categorie"
      subtitle="Gestisci le categorie dei prodotti"
      headerActions={headerActions}
    >
      {/* Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-olive/40 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cerca categorie per nome o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-olive/20 rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90"
          />
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-3 bg-white/90 border border-olive/20 rounded-lg text-olive">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-olive/30 text-olive focus:ring-olive/20"
            />
            <span className="text-sm">Inattive</span>
          </label>
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="px-4 py-3 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Aggiorna</span>
          </button>
        </div>
      </div>

      {error && (
        <NotificationBanner
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {successMessage && (
        <NotificationBanner
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Caricamento categorie..." />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={
              <svg className="mx-auto h-12 w-12 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="Nessuna categoria trovata"
            description={
              searchTerm
                ? 'Prova a modificare i termini di ricerca'
                : 'Non ci sono categorie disponibili'
            }
            action={
              !searchTerm ? (
                <button
                  onClick={() => router.push('/admin/categories/create')}
                  className="px-4 py-2 bg-salvia text-white rounded-lg hover:bg-olive transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Crea Prima Categoria</span>
                </button>
              ) : null
            }
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-olive/10">
                <thead className="bg-olive/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Nome (IT)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Nome (EN)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Prodotti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-olive/10">
                  {filteredCategories.map((category) => (
                    <CategoryTableRow
                      key={category.id}
                      category={category}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDeleteClick}
                      onEdit={() => router.push(`/admin/categories/${category.id}/edit`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDeleteClick}
                  onEdit={() => router.push(`/admin/categories/${category.id}/edit`)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal !== null}
        title="Conferma eliminazione categoria"
        itemName={deleteModal?.categoryName || ''}
        description="La categoria verrà eliminata definitivamente. Questa azione non può essere annullata."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal(null)}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
}

interface CategoryRowProps {
  category: CategoryDocument;
  onToggleActive: (categoryId: string, isActive: boolean) => void;
  onDelete: (categoryId: string, categoryName: string) => void;
  onEdit: () => void;
}

function CategoryTableRow({ category, onToggleActive, onDelete, onEdit }: CategoryRowProps) {
  return (
    <tr className="hover:bg-olive/5 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <code className="text-sm bg-olive/10 px-2 py-1 rounded text-olive font-mono">
          {category.id}
        </code>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-olive">{category.translations.it.name}</div>
        {category.translations.it.description && (
          <div className="text-sm text-nocciola mt-1">{category.translations.it.description}</div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-olive">{category.translations.en.name}</div>
        {category.translations.en.description && (
          <div className="text-sm text-nocciola mt-1">{category.translations.en.description}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-olive/10 text-olive">
          {category.productCount || 0} prodotti
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleActive(category.id, category.metadata.isActive)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            category.metadata.isActive
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          } transition-colors cursor-pointer`}
        >
          {category.metadata.isActive ? 'Attiva' : 'Inattiva'}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <ActionButtons
          onEdit={onEdit}
          onDelete={() => onDelete(category.id, category.translations.it.name)}
          deleteDisabled={Boolean(category.productCount && category.productCount > 0)}
          deleteTooltip={category.productCount && category.productCount > 0 ? 'Impossibile eliminare: categoria con prodotti associati' : undefined}
          variant="desktop"
        />
      </td>
    </tr>
  );
}

function CategoryCard({ category, onToggleActive, onDelete, onEdit }: CategoryRowProps) {
  return (
    <div className="p-4 border-b border-olive/10 last:border-b-0">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <code className="text-xs bg-olive/10 px-2 py-1 rounded text-olive font-mono">
              {category.id}
            </code>
            <button
              onClick={() => onToggleActive(category.id, category.metadata.isActive)}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                category.metadata.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              } cursor-pointer`}
            >
              {category.metadata.isActive ? 'Attiva' : 'Inattiva'}
            </button>
          </div>
          <h3 className="text-sm font-medium text-olive">{category.translations.it.name}</h3>
          <p className="text-xs text-nocciola">{category.translations.en.name}</p>
          {category.translations.it.description && (
            <p className="text-xs text-nocciola mt-1">{category.translations.it.description}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-olive/10 text-olive">
          {category.productCount || 0} prodotti
        </span>
      </div>

      <ActionButtons
        onEdit={onEdit}
        onDelete={() => onDelete(category.id, category.translations.it.name)}
        deleteDisabled={Boolean(category.productCount && category.productCount > 0)}
        deleteTooltip={category.productCount && category.productCount > 0 ? 'Impossibile eliminare: categoria con prodotti associati' : undefined}
        variant="mobile"
      />
    </div>
  );
}