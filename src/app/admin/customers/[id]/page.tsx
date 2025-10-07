'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import NotificationBanner from '@/components/admin/NotificationBanner';
import CustomerInfo from '@/components/admin/customers/CustomerInfo';
import CustomerAddress from '@/components/admin/customers/CustomerAddress';
import CustomerStats from '@/components/admin/customers/CustomerStats';
import OrderHistory from '@/components/admin/customers/OrderHistory';
import { CustomerWithOrders } from '@/types/customerTypes';

export default function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [customerId, setCustomerId] = useState<string>('');
  const [customer, setCustomer] = useState<CustomerWithOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    province: '',
  });

  const { user, loading: authLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setCustomerId(p.id));
  }, [params]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (customerId && user) {
      fetchCustomerDetails();
    }
  }, [customerId, user]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/customers/${customerId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel recupero dei dettagli cliente');
      }

      const data = await response.json();
      setCustomer(data.customer);

      // Popola form
      setFormData({
        firstName: data.customer.firstName || '',
        lastName: data.customer.lastName || '',
        phone: data.customer.phone || '',
        street: data.customer.address?.street || '',
        city: data.customer.address?.city || '',
        postalCode: data.customer.address?.postalCode || '',
        country: data.customer.address?.country || '',
        province: data.customer.address?.province || '',
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          address: formData.street ? {
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            province: formData.province || undefined,
          } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'aggiornamento');
      }

      setNotification({ type: 'success', message: 'Cliente aggiornato con successo' });
      setIsEditing(false);
      fetchCustomerDetails();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <AdminLayout title="Caricamento..." subtitle="">
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Errore" subtitle="">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Errore nel caricamento del cliente</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => router.push('/admin/customers')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
          >
            Torna alla lista clienti
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout title="Cliente non trovato" subtitle="">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Il cliente richiesto non esiste</p>
          <button
            onClick={() => router.push('/admin/customers')}
            className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia cursor-pointer"
          >
            Torna alla lista clienti
          </button>
        </div>
      </AdminLayout>
    );
  }

  const headerActions = (
    <>
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
        >
          Modifica
        </button>
      ) : (
        <>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer"
          >
            Salva
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              fetchCustomerDetails();
            }}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Annulla
          </button>
        </>
      )}
      <button
        onClick={() => router.push('/admin/customers')}
        className="px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer"
      >
        ← Indietro
      </button>
    </>
  );

  return (
    <AdminLayout
      title={`${customer.firstName} ${customer.lastName}`}
      subtitle={customer.email}
      headerActions={headerActions}
    >
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <CustomerInfo
            customer={customer}
            isEditing={isEditing}
            formData={formData}
            onFormChange={handleFormChange}
          />
          <CustomerAddress
            customer={customer}
            isEditing={isEditing}
            formData={formData}
            onFormChange={handleFormChange}
          />
          <CustomerStats customer={customer} />
        </div>

        <div className="lg:col-span-2">
          <OrderHistory customer={customer} />
        </div>
      </div>
    </AdminLayout>
  );
}
