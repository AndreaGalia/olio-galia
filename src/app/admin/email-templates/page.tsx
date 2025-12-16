'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { EmailTemplateDocument } from '@/types/emailTemplate';
import NotificationBanner from '@/components/admin/NotificationBanner';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import ActionButtons from '@/components/admin/ActionButtons';

export default function EmailTemplatesPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    templateId: string | null;
    templateName: string;
  }>({ isOpen: false, templateId: null, templateName: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email-templates');
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      } else {
        setNotification({
          type: 'error',
          message: 'Errore nel caricamento dei template'
        });
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setNotification({
        type: 'error',
        message: 'Errore nel caricamento dei template'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.templateId) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `/api/admin/email-templates/${deleteModal.templateId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();

      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Template eliminato con successo'
        });
        fetchTemplates();
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Errore nell\'eliminazione del template'
        });
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      setNotification({
        type: 'error',
        message: 'Errore nell\'eliminazione del template'
      });
    } finally {
      setDeleting(false);
      setDeleteModal({ isOpen: false, templateId: null, templateName: '' });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia via-beige to-sabbia/80 flex items-center justify-center">
        <div className="text-olive text-xl">Caricamento...</div>
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
              <h1 className="text-2xl sm:text-3xl font-serif text-olive">
                📧 Gestione Template Email
              </h1>
              <p className="text-nocciola mt-1">
                Gestisci i template email del sistema
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => router.push('/admin/email-templates/create')}
                className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors"
              >
                + Nuovo Template
              </button>
            </div>
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-olive/10 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-olive">
              Caricamento template...
            </div>
          ) : templates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                Nessun template trovato. Crea il primo template!
              </p>
              <button
                onClick={() => router.push('/admin/email-templates/create')}
                className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors"
              >
                + Crea Template
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-olive/10">
                <thead className="bg-olive/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Nome Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-olive uppercase tracking-wider">
                      Ultimo Aggiornamento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-olive uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-olive/10">
                  {templates.map((template) => (
                    <tr key={template._id?.toString()} className="hover:bg-olive/5">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {template.templateKey}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {template.isSystem ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Sistema
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Custom
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {template.metadata.isActive ? (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ Attivo
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            ✗ Disattivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(template.metadata.updatedAt).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionButtons
                          onEdit={() =>
                            router.push(`/admin/email-templates/${template._id}/edit`)
                          }
                          onDelete={() =>
                            setDeleteModal({
                              isOpen: true,
                              templateId: template._id?.toString() || null,
                              templateName: template.name
                            })
                          }
                          deleteDisabled={template.isSystem}
                          deleteTooltip={
                            template.isSystem
                              ? 'Template di sistema non eliminabile'
                              : 'Elimina template'
                          }
                          variant="desktop"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onCancel={() =>
          setDeleteModal({ isOpen: false, templateId: null, templateName: '' })
        }
        onConfirm={handleDelete}
        isDeleting={deleting}
        title="Elimina Template Email"
        itemName={deleteModal.templateName}
        description="Questa azione non può essere annullata. Il template verrà eliminato permanentemente."
      />
    </div>
  );
}
