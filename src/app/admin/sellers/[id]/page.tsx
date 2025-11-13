'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import NotificationBanner from '@/components/admin/NotificationBanner';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import SellerStatsCard from '@/components/admin/sellers/SellerStatsCard';
import QuotesTable from '@/components/admin/sellers/QuotesTable';
import PaymentsList from '@/components/admin/sellers/PaymentsList';
import PaymentModal from '@/components/admin/sellers/PaymentModal';
import { SellerWithDetails } from '@/types/sellerTypes';

export default function SellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [seller, setSeller] = useState<SellerWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // State per modale aggiunta pagamento
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  // State per modale conferma eliminazione
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);

  useEffect(() => {
    loadSeller();
  }, [id]);

  const loadSeller = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/sellers/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nel caricamento del venditore');
      }

      setSeller(data.seller);
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (amount: number, date: Date, notes?: string) => {
    setIsAddingPayment(true);

    try {
      const response = await fetch(`/api/admin/sellers/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, date, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'aggiunta del pagamento');
      }

      setNotification({ type: 'success', message: 'Pagamento aggiunto con successo' });
      setShowPaymentModal(false);
      loadSeller();
    } catch (error: any) {
      throw error;
    } finally {
      setIsAddingPayment(false);
    }
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;

    setIsDeletingPayment(true);

    try {
      const response = await fetch(`/api/admin/sellers/${id}/payments/${paymentToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nella rimozione del pagamento');
      }

      setNotification({ type: 'success', message: 'Pagamento rimosso con successo' });
      setPaymentToDelete(null);
      loadSeller();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsDeletingPayment(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const headerActions = (
    <>
      <button
        onClick={() => router.push(`/admin/sellers/${id}/edit`)}
        className="px-2 sm:px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap"
      >
        Modifica
      </button>
      <button
        onClick={() => router.push('/admin/sellers')}
        className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap"
      >
        ← Indietro
      </button>
    </>
  );

  if (loading) {
    return (
      <AdminLayout title="Dettaglio Venditore" subtitle="Caricamento..." headerActions={headerActions}>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  if (!seller) {
    return (
      <AdminLayout title="Dettaglio Venditore" subtitle="Venditore non trovato" headerActions={headerActions}>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Venditore non trovato
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={seller.name}
      subtitle={`${seller.email} • ${seller.phone}`}
      headerActions={headerActions}
    >
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="space-y-6">
        {/* Cards Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SellerStatsCard
            title="Fatturato Totale"
            value={formatCurrency(seller.totalSales)}
            subtitle={`${seller.confirmedQuotesCount} vendite`}
          />

          <SellerStatsCard
            title="Commissioni Totali"
            value={formatCurrency(seller.totalCommission)}
            subtitle={`${seller.commissionPercentage}% su ogni vendita`}
            colorClass="text-olive"
          />

          <SellerStatsCard
            title="Già Pagato"
            value={formatCurrency(seller.totalPaid)}
            subtitle={`${seller.payments.length} pagamenti`}
            colorClass="text-green-600"
          />

          <SellerStatsCard
            title="Da Pagare"
            value={formatCurrency(seller.totalUnpaid)}
            subtitle={seller.totalUnpaid > 0 ? 'Pagamento necessario' : 'Tutto pagato'}
            colorClass={seller.totalUnpaid > 0 ? 'text-red-600' : 'text-green-600'}
          />
        </div>

        {/* Sezione Preventivi */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preventivi Associati ({seller.quoteDetails.length})
          </h2>

          <QuotesTable
            quotes={seller.quoteDetails}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </div>

        {/* Sezione Pagamenti */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pagamenti Ricevuti ({seller.payments.length})
            </h2>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-sm"
            >
              + Aggiungi Pagamento
            </button>
          </div>

          <PaymentsList
            payments={seller.payments}
            onDelete={(paymentId) => setPaymentToDelete(paymentId)}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </div>
      </div>

      {/* Modale Aggiungi Pagamento */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleAddPayment}
        isSubmitting={isAddingPayment}
      />

      {/* Modale Conferma Eliminazione Pagamento */}
      <ConfirmDeleteModal
        isOpen={!!paymentToDelete}
        title="Conferma Eliminazione"
        itemName="questo pagamento"
        description="Questa azione non può essere annullata."
        onConfirm={confirmDeletePayment}
        onCancel={() => setPaymentToDelete(null)}
        isDeleting={isDeletingPayment}
      />
    </AdminLayout>
  );
}
