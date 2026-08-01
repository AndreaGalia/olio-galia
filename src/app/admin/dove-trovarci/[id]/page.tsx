'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import PointOfSaleForm, {
  PointOfSaleFormValues,
} from '@/components/admin/pointsOfSale/PointOfSaleForm';
import { PointOfSaleAdmin } from '@/types/pointOfSale';

export default function EditPointOfSalePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<PointOfSaleFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPointOfSale = async () => {
      try {
        const response = await fetch(`/api/admin/points-of-sale/${id}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Punto vendita non trovato');
          return;
        }

        const pos = data.pointOfSale as PointOfSaleAdmin;

        setInitialValues({
          name: pos.name,
          categoryId: pos.categoryId,
          street: pos.address.street || '',
          city: pos.address.city || '',
          province: pos.address.province || '',
          postalCode: pos.address.postalCode || '',
          country: pos.address.country || 'IT',
          lat: String(pos.coordinates.lat),
          lng: String(pos.coordinates.lng),
          productIds: pos.productIds || [],
          notesIT: pos.notes?.it || '',
          notesEN: pos.notes?.en || '',
          displayOrder: pos.displayOrder !== undefined ? String(pos.displayOrder) : '',
        });
      } catch {
        setError('Errore nel caricamento del punto vendita');
      } finally {
        setLoading(false);
      }
    };

    fetchPointOfSale();
  }, [id]);

  const handleSubmit = async (values: PointOfSaleFormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/points-of-sale/${id}`, {
        method: 'PUT',
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
        setError(data.error || 'Errore durante il salvataggio');
      }
    } catch {
      setError('Errore durante il salvataggio');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Modifica punto vendita"
      subtitle={initialValues?.name}
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
        {loading ? (
          <LoadingSpinner message="Caricamento punto vendita..." />
        ) : !initialValues ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error || 'Punto vendita non trovato'}
          </div>
        ) : (
          <PointOfSaleForm
            initialValues={initialValues}
            submitLabel="Salva modifiche"
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/dove-trovarci')}
          />
        )}
      </div>
    </AdminLayout>
  );
}
