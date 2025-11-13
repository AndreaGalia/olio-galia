'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import NotificationBanner from '@/components/admin/NotificationBanner';
import { SellerDocument } from '@/types/sellerTypes';

export default function EditSellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commissionPercentage: '10',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

      const seller: SellerDocument = data.seller;
      setFormData({
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        commissionPercentage: seller.commissionPercentage.toString(),
      });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Nome è obbligatorio';
    }

    if (!formData.email) {
      newErrors.email = 'Email è obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }

    if (!formData.phone || formData.phone.trim().length === 0) {
      newErrors.phone = 'Numero di telefono è obbligatorio';
    }

    const commission = parseFloat(formData.commissionPercentage);
    if (isNaN(commission) || commission < 0 || commission > 100) {
      newErrors.commissionPercentage = 'La percentuale deve essere tra 0 e 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const response = await fetch(`/api/admin/sellers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          commissionPercentage: parseFloat(formData.commissionPercentage),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'aggiornamento del venditore');
      }

      setNotification({ type: 'success', message: 'Venditore aggiornato con successo' });

      // Redirect dopo 1.5 secondi
      setTimeout(() => {
        router.push(`/admin/sellers/${id}`);
      }, 1500);

    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerActions = (
    <button
      onClick={() => router.push(`/admin/sellers/${id}`)}
      className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
    >
      ← Indietro
    </button>
  );

  if (loading) {
    return (
      <AdminLayout title="Modifica Venditore" subtitle="Caricamento..." headerActions={headerActions}>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Modifica Venditore"
      subtitle="Aggiorna le informazioni del venditore"
      headerActions={headerActions}
    >
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Informazioni Base */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Venditore</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mario Rossi"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="venditore@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero di Telefono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+39 123 456 7890"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentuale Commissione (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.commissionPercentage}
                    onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-olive focus:border-transparent ${
                      errors.commissionPercentage ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                {errors.commissionPercentage && (
                  <p className="mt-1 text-sm text-red-500">{errors.commissionPercentage}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Percentuale di guadagno applicata a tutti i preventivi confermati
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push(`/admin/sellers/${id}`)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
