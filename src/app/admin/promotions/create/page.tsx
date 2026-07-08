'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import PromotionCampaignForm from '@/components/admin/PromotionCampaignForm';

export default function CreatePromotionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore nella creazione della campagna');
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
      title="Nuova Campagna"
      subtitle="Crea una campagna promozionale su uno o più prodotti"
    >
      <PromotionCampaignForm
        submitLabel="Crea campagna"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </AdminLayout>
  );
}
