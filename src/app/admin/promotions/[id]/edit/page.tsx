'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import PromotionCampaignForm, { campaignToFormValues, CampaignFormValues } from '@/components/admin/PromotionCampaignForm';

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [initialValues, setInitialValues] = useState<CampaignFormValues | null>(null);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!campaignId) return;
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/admin/promotions/${campaignId}`);
        const data = await res.json();
        if (!res.ok) {
          setLoadError(data.error || 'Campagna non trovata');
        } else {
          setInitialValues(campaignToFormValues(data.campaign));
        }
      } catch {
        setLoadError('Errore di rete. Riprova.');
      }
    };
    fetchCampaign();
  }, [campaignId]);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/promotions/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore nell\'aggiornamento della campagna');
      } else {
        router.push('/admin/promotions');
      }
    } catch {
      setError('Errore di rete. Riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Modifica Campagna"
      subtitle="Aggiorna sconto, prodotti e periodo della campagna"
    >
      {loadError ? (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          {loadError}
        </div>
      ) : !initialValues ? (
        <div className="py-10 text-center text-sm text-gray-400">Caricamento campagna...</div>
      ) : (
        <PromotionCampaignForm
          initialValues={initialValues}
          submitLabel="Salva modifiche"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />
      )}
    </AdminLayout>
  );
}
