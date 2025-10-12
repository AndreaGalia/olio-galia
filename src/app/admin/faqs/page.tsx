'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { FAQDocument } from '@/types/faq';
import NotificationBanner from '@/components/admin/NotificationBanner';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import FAQTableRow from '@/components/admin/faqs/FAQTableRow';
import EmptyFAQState from '@/components/admin/faqs/EmptyFAQState';

export default function FAQsAdminPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    faqId: string | null;
    faqQuestion: string;
  }>({
    isOpen: false,
    faqId: null,
    faqQuestion: '',
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchFAQs();
    }
  }, [user]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/faqs');
      const data = await response.json();

      if (data.success) {
        setFaqs(data.faqs);
      } else {
        setNotification({ type: 'error', message: 'Errore nel caricamento delle FAQ' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Errore nel caricamento delle FAQ' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/faqs/${id}/toggle-active`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', message: data.message });
        fetchFAQs(); // Ricarica la lista
      } else {
        setNotification({ type: 'error', message: data.error || 'Errore durante l\'operazione' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Errore durante l\'operazione' });
    }
  };

  const openDeleteModal = (faq: FAQDocument) => {
    setDeleteModal({
      isOpen: true,
      faqId: faq._id?.toString() || null,
      faqQuestion: faq.translations.it.question,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      faqId: null,
      faqQuestion: '',
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.faqId) return;

    try {
      setDeletingId(deleteModal.faqId);
      const response = await fetch(`/api/admin/faqs/${deleteModal.faqId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setNotification({ type: 'success', message: 'FAQ eliminata con successo' });
        fetchFAQs(); // Ricarica la lista
      } else {
        setNotification({ type: 'error', message: data.error || 'Errore durante l\'eliminazione' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Errore durante l\'eliminazione' });
    } finally {
      setDeletingId(null);
      closeDeleteModal();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-olive/5">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-olive/30 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-olive">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-olive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-xl sm:text-3xl font-serif text-olive">Gestione FAQ</h1>
              <p className="text-nocciola mt-1 text-sm sm:text-base">
                Gestisci le domande frequenti del sito
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => router.push('/admin/faqs/create')}
                className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
              >
                + Nuova FAQ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {faqs.length === 0 ? (
          <EmptyFAQState
            onCreateClick={() => router.push('/admin/faqs/create')}
            labels={{
              title: 'Nessuna FAQ',
              description: 'Inizia creando la tua prima FAQ.',
              button: '+ Crea prima FAQ',
            }}
          />
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-olive/10">
                <thead className="bg-olive/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Ordine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Domanda (IT)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Categoria (IT)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-olive uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-olive/10">
                  {faqs.map((faq) => (
                    <FAQTableRow
                      key={faq._id?.toString()}
                      faq={faq}
                      onEdit={(id) => router.push(`/admin/faqs/${id}/edit`)}
                      onDelete={openDeleteModal}
                      onToggleActive={handleToggleActive}
                      labels={{
                        active: 'Attiva',
                        inactive: 'Disattivata',
                        editTooltip: 'Modifica',
                        deleteTooltip: 'Elimina',
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onCancel={closeDeleteModal}
        onConfirm={handleDelete}
        isDeleting={deletingId !== null}
        title="Elimina FAQ"
        itemName={deleteModal.faqQuestion}
        description="Questa azione non può essere annullata."
      />
    </div>
  );
}
