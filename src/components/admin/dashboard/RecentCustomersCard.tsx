import React from 'react';
import { useRouter } from 'next/navigation';
import type { RecentCustomer } from '@/types/admin';

interface RecentCustomersCardProps {
  customers: RecentCustomer[];
  newCustomersCount: number;
  loading?: boolean;
}

export default function RecentCustomersCard({
  customers,
  newCustomersCount,
  loading = false,
}: RecentCustomersCardProps) {
  const router = useRouter();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
    }).format(d);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-olive text-white',
      'bg-salvia text-white',
      'bg-blue-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
        <h2 className="text-lg sm:text-xl font-serif text-olive mb-4">👥 Nuovi Clienti</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive"></div>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-serif text-olive">👥 Nuovi Clienti</h2>
          <span className="text-xs bg-olive/10 text-olive px-2 py-1 rounded-full font-medium">
            {newCustomersCount} ultimo mese
          </span>
        </div>
        <p className="text-nocciola text-sm text-center py-8">
          Nessun cliente registrato.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-serif text-olive">👥 Nuovi Clienti</h2>
        <button
          onClick={() => router.push('/admin/customers')}
          className="text-olive hover:text-salvia text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          Vedi tutti →
        </button>
      </div>

      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-olive/5 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="text-xs sm:text-sm text-gray-700">Clienti ultimo mese</span>
        </div>
        <span className="text-base sm:text-lg font-bold text-olive">{newCustomersCount}</span>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {customers.map((customer, index) => (
          <div
            key={customer.id}
            onClick={() => router.push(`/admin/customers/${customer.id}`)}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-olive/10 hover:bg-olive/5 transition-colors cursor-pointer group"
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${getAvatarColor(
                index
              )}`}
            >
              {getInitials(customer.name)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                {customer.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{customer.email}</p>
            </div>

            {/* Stats - hide on mobile, show on tablet+ */}
            <div className="hidden sm:flex text-right flex-shrink-0 flex-col">
              <div className="text-xs text-gray-500">
                {customer.totalOrders} ordini
              </div>
              <div className="text-sm font-semibold text-olive">
                {formatCurrency(customer.totalSpent)}
              </div>
            </div>

            {/* Date badge - hide on mobile */}
            <div className="hidden lg:flex flex-shrink-0">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                {formatDate(customer.createdAt)}
              </span>
            </div>

            {/* Arrow icon */}
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-olive transition-colors flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
