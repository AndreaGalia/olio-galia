'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface Subscription {
  _id: string;
  stripeSubscriptionId: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  shippingZone: string;
  interval: string;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  canceled: number;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  unpaid: 'bg-orange-100 text-orange-800',
  paused: 'bg-gray-100 text-gray-800',
  incomplete: 'bg-blue-100 text-blue-800',
};

const INTERVAL_LABELS: Record<string, string> = {
  month: 'Mensile',
  bimonth: 'Bimestrale',
  quarter: 'Trimestrale',
  semester: 'Semestrale',
};

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, canceled: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterZone, setFilterZone] = useState('');

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/admin/orders')}
        className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        Ordini
      </button>
      <button
        onClick={() => router.push('/admin/dashboard')}
        className="px-2 sm:px-4 py-2 text-olive border border-olive rounded-lg hover:bg-olive hover:text-white transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
      >
        Dashboard
      </button>
    </>
  );

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (filterStatus) params.set('status', filterStatus);
      if (filterZone) params.set('zone', filterZone);

      const response = await fetch(`/api/admin/subscriptions?${params}`);
      const data = await response.json();

      setSubscriptions(data.subscriptions || []);
      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);
      if (data.stats) setStats(data.stats);
    } catch {
      // errore silenzioso
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, filterStatus, filterZone]);

  return (
    <AdminLayout
      title="Abbonamenti"
      subtitle={`${stats.total} totali, ${stats.active} attivi`}
      headerActions={headerActions}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-olive/10 p-4">
          <p className="text-sm text-nocciola">Totale</p>
          <p className="text-2xl font-bold text-olive">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-600">Attivi</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <p className="text-sm text-red-600">Cancellati</p>
          <p className="text-2xl font-bold text-red-700">{stats.canceled}</p>
        </div>
      </div>

      {/* Filtri */}
      <div className="flex gap-4 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-olive/20 rounded-lg text-sm"
        >
          <option value="">Tutti gli stati</option>
          <option value="active">Attivi</option>
          <option value="canceled">Cancellati</option>
          <option value="past_due">Scaduti</option>
          <option value="paused">In pausa</option>
        </select>
        <select
          value={filterZone}
          onChange={(e) => { setFilterZone(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-olive/20 rounded-lg text-sm"
        >
          <option value="">Tutte le zone</option>
          <option value="italia">Italia</option>
          <option value="europa">Europa</option>
          <option value="america">America</option>
          <option value="mondo">Mondo</option>
        </select>
      </div>

      {/* Tabella */}
      <div className="bg-white rounded-lg border border-olive/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-nocciola">Caricamento...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-8 text-center text-nocciola">Nessun abbonamento trovato</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-olive/5">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-olive">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-olive">Prodotto</th>
                  <th className="px-4 py-3 text-left font-medium text-olive">Zona</th>
                  <th className="px-4 py-3 text-left font-medium text-olive">Intervallo</th>
                  <th className="px-4 py-3 text-left font-medium text-olive">Stato</th>
                  <th className="px-4 py-3 text-left font-medium text-olive">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive/5">
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-olive/5">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-olive">{sub.customerEmail}</p>
                        <p className="text-xs text-nocciola">{sub.customerName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-nocciola">{sub.productName}</td>
                    <td className="px-4 py-3 text-nocciola capitalize">{sub.shippingZone}</td>
                    <td className="px-4 py-3 text-nocciola">{INTERVAL_LABELS[sub.interval] || sub.interval}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[sub.status] || 'bg-gray-100 text-gray-800'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-nocciola text-xs">
                      {new Date(sub.createdAt).toLocaleDateString('it-IT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginazione */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-olive/10">
            <p className="text-sm text-nocciola">
              Pagina {page} - {total} abbonamenti totali
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-olive/20 rounded text-sm disabled:opacity-50 cursor-pointer"
              >
                Precedente
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="px-3 py-1 border border-olive/20 rounded text-sm disabled:opacity-50 cursor-pointer"
              >
                Successivo
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
