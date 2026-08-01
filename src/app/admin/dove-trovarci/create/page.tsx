'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import PointOfSaleForm, {
  PointOfSaleFormValues,
} from '@/components/admin/pointsOfSale/PointOfSaleForm';

export default function CreatePointOfSalePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: PointOfSaleFormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/points-of-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          categoryId: values.categoryId,
          address: {
            street: values.street,
            city: values.city,
            province: values.province,
            postalCode: values.postalCode,
            country: values.country || 'IT',
          },
          coordinates: {
            lat: parseFloat(values.lat),
            lng: parseFloat(values.lng),
          },
          productIds: values.productIds,
          notesIT: values.notesIT,
          notesEN: values.notesEN,
          displayOrder: values.displayOrder ? parseInt(values.displayOrder, 10) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/dove-trovarci');
      } else {
        setError(data.error || 'Errore durante la creazione');
      }
    } catch {
      setError('Errore durante la creazione');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Nuovo punto vendita"
      subtitle="Aggiungi un luogo dove vengono venduti i prodotti"
      headerActions={
        <button
          onClick={() => router.push('/admin/dove-trovarci')}
          className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
        >
          ← Torna alla lista
        </button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <PointOfSaleForm
          submitLabel="Crea punto vendita"
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/dove-trovarci')}
        />
      </div>
    </AdminLayout>
  );
}
