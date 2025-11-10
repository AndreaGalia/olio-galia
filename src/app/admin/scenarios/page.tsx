'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ScenarioDocument } from '@/types/scenario';
import { formatCurrency, formatPercentage } from '@/lib/scenario/calculations';
import Modal from '@/components/ui/Modal';
import Toast, { ToastType } from '@/components/ui/Toast';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

interface ToastData {
  message: string;
  type: ToastType;
}

export default function ScenariosPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({ isOpen: false, id: '', name: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/scenarios');
      const data = await res.json();

      if (data.success) {
        setScenarios(data.scenarios || []);
      } else {
        setError(data.error || 'Errore nel caricamento');
      }
    } catch (err) {
      console.error('Error fetching scenarios:', err);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleDeleteConfirm = async () => {
    const { id, name } = deleteModal;

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/scenarios/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setDeleteModal({ isOpen: false, id: '', name: '' });
        showToast('Scenario eliminato con successo!', 'success');
        fetchScenarios();
      } else {
        showToast(data.error || 'Errore durante eliminazione', 'error');
      }
    } catch (err) {
      console.error('Error deleting scenario:', err);
      showToast('Errore di connessione', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/scenarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: { isActive: !currentStatus },
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast(
          currentStatus ? 'Scenario archiviato' : 'Scenario riattivato',
          'success'
        );
        fetchScenarios();
      } else {
        showToast(data.error || 'Errore durante aggiornamento', 'error');
      }
    } catch (err) {
      console.error('Error toggling scenario:', err);
      showToast('Errore di connessione', 'error');
    }
  };

  const headerActions = (
    <Link
      href="/admin/scenarios/new"
      className="px-4 py-2 bg-salvia text-white rounded-lg hover:bg-olive transition-colors flex items-center space-x-2 cursor-pointer"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
      <span>Nuovo Scenario</span>
    </Link>
  );

  if (loading) {
    return <LoadingSpinner message="Caricamento scenari..." />;
  }

  return (
    <AdminLayout
      title="Scenari di Fatturato"
      subtitle="Gestisci e confronta scenari di previsione del fatturato"
      headerActions={headerActions}
    >
      <div>

      {/* Error */}
      {error && (
        <div className="admin-card p-4 bg-red-50 border border-red-200 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {scenarios.length === 0 && !error && (
        <div className="admin-card p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-[--olive] mb-2">
            Nessuno scenario creato
          </h3>
          <p className="text-gray-600 mb-6">
            Crea il tuo primo scenario per iniziare a prevedere il fatturato
          </p>
          <Link
            href="/admin/scenarios/new"
            className="admin-button-primary inline-flex items-center gap-2"
          >
            <span>+</span>
            <span>Crea Primo Scenario</span>
          </Link>
        </div>
      )}

      {/* Scenarios Grid */}
      {scenarios.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scenarios.map((scenario) => {
            const isProfitable = scenario.calculations.expectedProfit > 0;
            const isActive = scenario.metadata.isActive;

            return (
              <div
                key={scenario._id?.toString()}
                className={`admin-card p-6 transition-all hover:shadow-lg ${
                  !isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-[--olive]">
                        {scenario.name}
                      </h3>
                      {!isActive && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                          Archiviato
                        </span>
                      )}
                    </div>
                    {scenario.description && (
                      <p className="text-sm text-gray-600">
                        {scenario.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Main Metrics */}
                <div
                  className={`p-4 rounded-lg mb-4 ${
                    isProfitable ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Guadagno Stimato</p>
                    <p
                      className={`text-3xl font-bold ${
                        isProfitable ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(scenario.calculations.expectedProfit)}
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Margine: </span>
                        <span className="font-medium">
                          {formatPercentage(scenario.calculations.profitMargin)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">ROI: </span>
                        <span className="font-medium">
                          {formatPercentage(scenario.calculations.roi)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600 mb-1">Costi</p>
                    <p className="font-bold text-gray-800">
                      {formatCurrency(scenario.calculations.totalCosts)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600 mb-1">Ricavi</p>
                    <p className="font-bold text-gray-800">
                      {formatCurrency(scenario.calculations.expectedRevenue)}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 mb-4 pb-4 border-b">
                  <p>
                    Creato:{' '}
                    {new Date(
                      scenario.metadata.createdAt
                    ).toLocaleDateString('it-IT')}
                  </p>
                  <p>
                    Aggiornato:{' '}
                    {new Date(
                      scenario.metadata.updatedAt
                    ).toLocaleDateString('it-IT')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/scenarios/${scenario._id}/edit`}
                    className="admin-button-secondary flex-1 min-w-[120px]"
                  >
                    Modifica
                  </Link>
                  <button
                    onClick={() =>
                      handleToggleActive(
                        scenario._id!.toString(),
                        isActive
                      )
                    }
                    className="admin-button-secondary flex-1 min-w-[120px]"
                  >
                    {isActive ? 'Archivia' : 'Riattiva'}
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteClick(scenario._id!.toString(), scenario.name)
                    }
                    className="admin-button-secondary text-red-600 hover:bg-red-50 px-4"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {scenarios.length > 0 && (
        <div className="mt-8 admin-card p-6 bg-[--beige]">
          <h3 className="text-lg font-bold text-[--olive] mb-4">
            Riepilogo Scenari
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[--olive]">
                {scenarios.length}
              </p>
              <p className="text-sm text-gray-600">Scenari Totali</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {scenarios.filter((s) => s.calculations.expectedProfit > 0).length}
              </p>
              <p className="text-sm text-gray-600">Scenari Profittevoli</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[--salvia]">
                {scenarios.filter((s) => s.metadata.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Scenari Attivi</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDeleteConfirm}
        title="Elimina Scenario"
        message={`Sei sicuro di voler eliminare lo scenario "${deleteModal.name}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        type="danger"
        loading={deleting}
      />
      </div>
    </AdminLayout>
  );
}
