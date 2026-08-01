'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import EmptyState from '@/components/admin/EmptyState';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import NotificationBanner from '@/components/admin/NotificationBanner';
import ActionButtons from '@/components/admin/ActionButtons';
import { PointOfSaleAdmin, POSCategoryAdmin } from '@/types/pointOfSale';

export default function PointsOfSaleAdminPage() {
  const router = useRouter();

  const [pointsOfSale, setPointsOfSale] = useState<PointOfSaleAdmin[]>([]);
  const [categories, setCategories] = useState<POSCategoryAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [includeInactive, setIncludeInactive] = useState(true);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPointsOfSale = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (includeInactive) params.set('includeInactive', 'true');
      if (search.trim()) params.set('search', search.trim());
      if (categoryFilter) params.set('categoryId', categoryFilter);

      const response = await fetch(`/api/admin/points-of-sale?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPointsOfSale(data.pointsOfSale);
      } else {
        setNotification({ type: 'error', message: data.error || 'Errore nel caricamento' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Errore nel caricamento dei punti vendita' });
    } finally {
      setLoading(false);
    }
  }, [includeInactive, search, categoryFilter]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/points-of-sale/categories');
        const data = await response.json();
        if (data.success) setCategories(data.categories);
      } catch {
        // il filtro per categoria resta vuoto, la lista funziona comunque
      }
    };
    fetchCategories();
  }, []);

  // Debounce sulla ricerca per non interrogare il DB a ogni tasto
  useEffect(() => {
    const timeout = setTimeout(fetchPointsOfSale, 300);
    return () => clearTimeout(timeout);
  }, [fetchPointsOfSale]);

  const categoryName = (categoryId: string) =>
    categories.find(category => category.id === categoryId)?.translations.it.name || categoryId;

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/points-of-sale/${id}/toggle-active`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', message: data.message });
        fetchPointsOfSale();
      } else {
        setNotification({ type: 'error', message: data.error || 'Errore durante l\'operazione' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Errore durante l\'operazione' });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/points-of-sale/${deleteModal.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', message: 'Punto vendita eliminato con successo' });
        fetchPointsOfSale();
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
      title="Dove Trovarci"
      subtitle="Punti vendita mostrati sulla mappa pubblica"
      headerActions={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/admin/dove-trovarci/categorie')}
            className="px-4 py-2 border border-olive text-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
          >
            Categorie
          </button>
          <button
            onClick={() => router.push('/admin/dove-trovarci/create')}
            className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
          >
            + Nuovo punto vendita
          </button>
        </div>
      }
    >
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Filtri */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-olive/10 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca per nome, città o via..."
            className="w-full px-4 py-2.5 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive transition-colors"
          />

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-olive/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive transition-colors cursor-pointer"
          >
            <option value="">Tutte le categorie</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.translations.it.name}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2 text-sm text-olive cursor-pointer">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={e => setIncludeInactive(e.target.checked)}
              className="rounded border-olive/30 text-olive focus:ring-olive/30 cursor-pointer"
            />
            <span>Mostra anche i disattivati</span>
          </label>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-olive/10 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner message="Caricamento punti vendita..." />
          </div>
        ) : pointsOfSale.length === 0 ? (
          <EmptyState
            title="Nessun punto vendita"
            description={
              search || categoryFilter
                ? 'Nessun risultato con i filtri applicati.'
                : 'Aggiungi il primo punto vendita per popolare la pagina "Dove trovarci".'
            }
            action={
              <button
                onClick={() => router.push('/admin/dove-trovarci/create')}
                className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
              >
                + Nuovo punto vendita
              </button>
            }
          />
        ) : (
          <>
            {/* Tabella desktop */}
            <table className="hidden md:table w-full">
              <thead className="bg-beige">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">Indirizzo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">Prodotti</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">Stato</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-olive uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive/10">
                {pointsOfSale.map(pos => (
                  <tr key={pos.id} className="hover:bg-beige/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-olive">{pos.name}</div>
                      <div className="text-xs text-nocciola">/{pos.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{categoryName(pos.categoryId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{pos.address.street}</div>
                      <div className="text-xs text-nocciola">
                        {pos.address.city}
                        {pos.address.province ? ` (${pos.address.province})` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{pos.productIds.length}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(pos.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          pos.metadata.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pos.metadata.isActive ? 'Attivo' : 'Disattivato'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <ActionButtons
                          onEdit={() => router.push(`/admin/dove-trovarci/${pos.id}`)}
                          onDelete={() => setDeleteModal({ id: pos.id, name: pos.name })}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Card mobile */}
            <div className="md:hidden divide-y divide-olive/10">
              {pointsOfSale.map(pos => (
                <div key={pos.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-olive">{pos.name}</div>
                      <div className="text-sm text-gray-700">
                        {pos.address.street}, {pos.address.city}
                        {pos.address.province ? ` (${pos.address.province})` : ''}
                      </div>
                      <div className="text-xs text-nocciola mt-1">
                        {categoryName(pos.categoryId)} · {pos.productIds.length} prodotti
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleActive(pos.id)}
                      className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${
                        pos.metadata.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {pos.metadata.isActive ? 'Attivo' : 'Off'}
                    </button>
                  </div>
                  <ActionButtons
                    variant="mobile"
                    onEdit={() => router.push(`/admin/dove-trovarci/${pos.id}`)}
                    onDelete={() => setDeleteModal({ id: pos.id, name: pos.name })}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal !== null}
        title="Elimina punto vendita"
        itemName={deleteModal?.name || ''}
        description="Il punto vendita verrà nascosto dalla pagina pubblica. Puoi ripristinarlo da questa lista spuntando 'Mostra anche i disattivati'."
        isDeleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(null)}
      />
    </AdminLayout>
  );
}
