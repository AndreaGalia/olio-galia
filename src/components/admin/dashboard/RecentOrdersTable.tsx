import React from 'react';
import { useRouter } from 'next/navigation';
import type { RecentOrder } from '@/types/admin';

interface RecentOrdersTableProps {
  orders: RecentOrder[];
  loading?: boolean;
}

export default function RecentOrdersTable({ orders, loading = false }: RecentOrdersTableProps) {
  const router = useRouter();

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; bg: string; text: string }
    > = {
      paid: { label: 'Pagato', bg: 'bg-green-100', text: 'text-green-700' },
      pending: { label: 'In Attesa', bg: 'bg-yellow-100', text: 'text-yellow-700' },
      shipped: { label: 'Spedito', bg: 'bg-blue-100', text: 'text-blue-700' },
      delivered: { label: 'Consegnato', bg: 'bg-purple-100', text: 'text-purple-700' },
    };

    const config = statusConfig[status] || {
      label: status,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
    };

    return (
      <span
        className={`${config.bg} ${config.text} text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap`}
      >
        {config.label}
      </span>
    );
  };

  const handleRowClick = (order: RecentOrder) => {
    if (order.type === 'order') {
      router.push(`/admin/orders/${order.id}`);
    } else {
      router.push(`/admin/forms/${order.id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
        <h2 className="text-xl font-serif text-olive mb-4">📦 Ultimi Ordini</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
        <h2 className="text-xl font-serif text-olive mb-4">📦 Ultimi Ordini</h2>
        <p className="text-nocciola text-sm text-center py-8">
          Nessun ordine recente disponibile.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-olive">📦 Ultimi Ordini</h2>
        <button
          onClick={() => router.push('/admin/orders')}
          className="text-olive hover:text-salvia text-sm font-medium transition-colors cursor-pointer"
        >
          Vedi tutti →
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-olive/20">
              <th className="text-left text-xs font-medium text-nocciola uppercase tracking-wider py-3 px-2">
                Tipo
              </th>
              <th className="text-left text-xs font-medium text-nocciola uppercase tracking-wider py-3 px-2">
                ID Ordine
              </th>
              <th className="text-left text-xs font-medium text-nocciola uppercase tracking-wider py-3 px-2">
                Cliente
              </th>
              <th className="text-left text-xs font-medium text-nocciola uppercase tracking-wider py-3 px-2">
                Totale
              </th>
              <th className="text-left text-xs font-medium text-nocciola uppercase tracking-wider py-3 px-2">
                Stato
              </th>
              <th className="text-left text-xs font-medium text-nocciola uppercase tracking-wider py-3 px-2">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-olive/10">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => handleRowClick(order)}
                className="hover:bg-olive/5 transition-colors cursor-pointer"
              >
                <td className="py-3 px-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                      order.type === 'order'
                        ? 'bg-olive/10 text-olive'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {order.type === 'order' ? 'Ordine' : 'Preventivo'}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm font-mono text-gray-700">
                    {order.orderId.slice(0, 8)}...
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm text-gray-900">{order.customerName}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm font-semibold text-olive">
                    {formatCurrency(order.total)}
                  </span>
                </td>
                <td className="py-3 px-2">{getStatusBadge(order.shippingStatus)}</td>
                <td className="py-3 px-2">
                  <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => handleRowClick(order)}
            className="border border-olive/20 rounded-xl p-4 hover:bg-olive/5 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    order.type === 'order'
                      ? 'bg-olive/10 text-olive'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {order.type === 'order' ? 'Ordine' : 'Preventivo'}
                </span>
              </div>
              {getStatusBadge(order.shippingStatus)}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{order.customerName}</h3>
            <p className="text-xs font-mono text-gray-500 mb-2">{order.orderId.slice(0, 12)}...</p>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-olive">{formatCurrency(order.total)}</span>
              <span className="text-gray-600">{formatDate(order.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
