import React from 'react';
import { useRouter } from 'next/navigation';

interface Alert {
  type: 'warning' | 'error' | 'info';
  title: string;
  count: number;
  description: string;
  action: {
    label: string;
    href: string;
  };
  icon: React.ReactNode;
}

interface AlertsSectionProps {
  pendingOrders: number;
  lowStockProducts: number;
  pendingQuotes: number;
  loading?: boolean;
}

export default function AlertsSection({
  pendingOrders,
  lowStockProducts,
  pendingQuotes,
  loading = false,
}: AlertsSectionProps) {
  const router = useRouter();

  const alerts: Alert[] = [
    {
      type: 'warning',
      title: 'Ordini da Evadere',
      count: pendingOrders,
      description: 'Ordini pagati in attesa di spedizione',
      action: {
        label: 'Gestisci Ordini',
        href: '/admin/orders?status=pending',
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
    },
    {
      type: 'error',
      title: 'Stock Basso',
      count: lowStockProducts,
      description: 'Prodotti con meno di 10 unità disponibili',
      action: {
        label: 'Vedi Prodotti',
        href: '/admin/products',
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      type: 'info',
      title: 'Preventivi Pending',
      count: pendingQuotes,
      description: 'Richieste preventivo non ancora gestite',
      action: {
        label: 'Gestisci Preventivi',
        href: '/admin/preventivi',
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const activeAlerts = alerts.filter((alert) => alert.count > 0);

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
        <h2 className="text-lg sm:text-xl font-serif text-olive mb-4">⚠️ Richiede Attenzione</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive"></div>
        </div>
      </div>
    );
  }

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
        <h2 className="text-lg sm:text-xl font-serif text-olive mb-4">✅ Tutto sotto controllo</h2>
        <p className="text-nocciola text-sm">
          Non ci sono elementi che richiedono la tua attenzione immediata.
        </p>
      </div>
    );
  }

  const getAlertColors = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          badgeBg: 'bg-yellow-100',
          badgeText: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10">
      <h2 className="text-lg sm:text-xl font-serif text-olive mb-3 sm:mb-4">⚠️ Richiede Attenzione</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {activeAlerts.map((alert, index) => {
          const colors = getAlertColors(alert.type);
          return (
            <div
              key={index}
              className={`${colors.bg} ${colors.border} border-2 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className={`${colors.iconBg} p-1.5 sm:p-2 rounded-lg ${colors.iconColor}`}>
                  {alert.icon}
                </div>
                <span
                  className={`${colors.badgeBg} ${colors.badgeText} text-xs font-bold px-2 sm:px-3 py-1 rounded-full`}
                >
                  {alert.count}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">{alert.title}</h3>
              <p className="text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2">{alert.description}</p>
              <button
                onClick={() => router.push(alert.action.href)}
                className={`w-full ${colors.button} px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer`}
              >
                {alert.action.label} →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
