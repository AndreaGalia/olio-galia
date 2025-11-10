'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStats } from '@/hooks/useAdminStats';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCardWithTrend from '@/components/admin/dashboard/StatsCardWithTrend';
import AlertsSection from '@/components/admin/dashboard/AlertsSection';
import RecentOrdersTable from '@/components/admin/dashboard/RecentOrdersTable';
import TopProductsCard from '@/components/admin/dashboard/TopProductsCard';
import SalesChart from '@/components/admin/dashboard/SalesChart';
import RecentCustomersCard from '@/components/admin/dashboard/RecentCustomersCard';
import GoalCard from '@/components/admin/GoalCard';
import GoalManager from '@/components/admin/GoalManager';

export default function AdminDashboardPage() {
  const { stats, loading: statsLoading, refreshStats } = useAdminStats();
  const router = useRouter();
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [goalRefreshKey, setGoalRefreshKey] = useState(0);

  // Calcola trend per le statistiche
  const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) {
      return today > 0 ? { value: 100, isPositive: true } : { value: 0, isPositive: false };
    }
    const change = ((today - yesterday) / yesterday) * 100;
    return {
      value: Math.round(Math.abs(change)),
      isPositive: change >= 0,
    };
  };

  const ordersTrend = stats
    ? calculateTrend(stats.ordersToday, stats.ordersYesterday)
    : undefined;
  const revenueTrend = stats
    ? calculateTrend(stats.revenueToday, stats.revenueYesterday)
    : undefined;

  const headerActions = (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      <button
        onClick={() => router.push('/admin/products')}
        className="px-3 md:px-4 py-2 bg-salvia text-white rounded-lg hover:bg-olive transition-colors cursor-pointer text-sm whitespace-nowrap"
      >
        Prodotti
      </button>
      <button
        onClick={() => router.push('/admin/customers')}
        className="px-3 md:px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-sm whitespace-nowrap"
      >
        Clienti
      </button>
      <button
        onClick={() => router.push('/admin/orders')}
        className="px-3 md:px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-sm whitespace-nowrap"
      >
        Ordini
      </button>
    </div>
  );

  return (
    <AdminLayout
      title="Dashboard Admin"
      subtitle="Panoramica generale del sistema"
      headerActions={headerActions}
    >
      {/* Stats Cards con Trend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatsCardWithTrend
          title="Ordini Totali"
          value={stats?.totalOrders || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
              />
            </svg>
          }
          iconBgColor="bg-olive/10"
          iconColor="text-olive"
          loading={statsLoading}
        />

        <StatsCardWithTrend
          title="Fatturato Totale"
          value={`€${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          loading={statsLoading}
        />

        <StatsCardWithTrend
          title="Ordini Oggi"
          value={stats?.ordersToday || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7l-2 9h12l-2-9M8 7h8"
              />
            </svg>
          }
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          trend={
            ordersTrend
              ? { ...ordersTrend, label: 'vs ieri' }
              : undefined
          }
          loading={statsLoading}
        />

        <StatsCardWithTrend
          title="Fatturato Oggi"
          value={`€${stats?.revenueToday?.toFixed(2) || '0.00'}`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          trend={
            revenueTrend
              ? { ...revenueTrend, label: 'vs ieri' }
              : undefined
          }
          loading={statsLoading}
        />
      </div>

      {/* Goal Section */}
      <div className="mb-6 sm:mb-8">
        <GoalCard
          key={goalRefreshKey}
          onManageGoal={() => setIsGoalManagerOpen(true)}
        />
      </div>

      {/* Alerts Section */}
      <div className="mb-6 sm:mb-8">
        <AlertsSection
          pendingOrders={stats?.pendingOrdersCount || 0}
          lowStockProducts={stats?.lowStockProductsCount || 0}
          pendingQuotes={stats?.pendingQuotesCount || 0}
          loading={statsLoading}
        />
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <RecentOrdersTable orders={stats?.recentOrders || []} loading={statsLoading} />
        <TopProductsCard products={stats?.topProducts || []} loading={statsLoading} />
      </div>

      {/* Sales Chart */}
      <div className="mb-6 sm:mb-8">
        <SalesChart data={stats?.salesLast7Days || []} loading={statsLoading} />
      </div>

      {/* Recent Customers */}
      <div className="mb-6 sm:mb-8">
        <RecentCustomersCard
          customers={stats?.recentCustomers || []}
          newCustomersCount={stats?.newCustomersCount || 0}
          loading={statsLoading}
        />
      </div>

      {/* Azioni Rapide */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-olive/10">
        <h2 className="text-xl sm:text-2xl font-serif text-olive mb-4 sm:mb-6">Azioni Rapide</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-4 sm:p-5 lg:p-6 border-2 border-olive/20 rounded-xl hover:border-olive hover:bg-olive/5 transition-all duration-300 group cursor-pointer text-left"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-olive group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-olive mb-1 sm:mb-2">
              Gestisci Ordini
            </h3>
            <p className="text-nocciola text-xs sm:text-sm">Visualizza e gestisci tutti gli ordini</p>
          </button>

          <button
            onClick={() => router.push('/admin/preventivi')}
            className="p-4 sm:p-5 lg:p-6 border-2 border-olive/20 rounded-xl hover:border-olive hover:bg-olive/5 transition-all duration-300 group cursor-pointer text-left"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-olive group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-olive mb-1 sm:mb-2">
              Gestisci Preventivi
            </h3>
            <p className="text-nocciola text-xs sm:text-sm">Visualizza e gestisci tutti i preventivi</p>
          </button>

          <button
            onClick={() => router.push('/admin/products')}
            className="p-4 sm:p-5 lg:p-6 border-2 border-salvia/20 rounded-xl hover:border-salvia hover:bg-salvia/5 transition-all duration-300 group cursor-pointer text-left"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-salvia group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-salvia mb-1 sm:mb-2">
              Gestisci Prodotti
            </h3>
            <p className="text-nocciola text-xs sm:text-sm">
              Crea, modifica e gestisci i prodotti
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/categories')}
            className="p-4 sm:p-5 lg:p-6 border-2 border-salvia/20 rounded-xl hover:border-salvia hover:bg-salvia/5 transition-all duration-300 group cursor-pointer text-left"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-salvia group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-salvia mb-1 sm:mb-2">
              Gestisci Categorie
            </h3>
            <p className="text-nocciola text-xs sm:text-sm">
              Crea e gestisci le categorie
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/faqs')}
            className="p-4 sm:p-5 lg:p-6 border-2 border-olive/20 rounded-xl hover:border-olive hover:bg-olive/5 transition-all duration-300 group cursor-pointer text-left"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-olive group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-olive mb-1 sm:mb-2">
              Gestisci FAQ
            </h3>
            <p className="text-nocciola text-xs sm:text-sm">
              Crea e gestisci le FAQ
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/feedbacks')}
            className="p-4 sm:p-5 lg:p-6 border-2 border-olive/20 rounded-xl hover:border-olive hover:bg-olive/5 transition-all duration-300 group cursor-pointer text-left"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-olive group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-olive mb-1 sm:mb-2">
              Feedback Clienti
            </h3>
            <p className="text-nocciola text-xs sm:text-sm">
              Visualizza recensioni e valutazioni
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/scenarios')}
            className="p-4 sm:p-5 lg:p-6 border-2 border-salvia/20 rounded-xl hover:border-salvia hover:bg-salvia/5 transition-all duration-300 group cursor-pointer text-left"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-salvia group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-salvia mb-1 sm:mb-2">
              Scenari di Fatturato
            </h3>
            <p className="text-nocciola text-xs sm:text-sm">
              Gestisci costi e predizioni di vendita
            </p>
          </button>

          <button
            onClick={refreshStats}
            disabled={statsLoading}
            className="p-4 sm:p-5 lg:p-6 border-2 border-salvia/20 rounded-xl hover:border-salvia hover:bg-salvia/5 transition-all duration-300 group disabled:opacity-50 cursor-pointer text-left"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <svg
                className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-salvia group-hover:scale-110 transition-transform ${
                  statsLoading ? 'animate-spin' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-salvia mb-1 sm:mb-2">
              Aggiorna Dati
            </h3>
            <p className="text-nocciola text-xs sm:text-sm">Ricarica le statistiche</p>
          </button>

          <button
            onClick={() => router.push('/')}
            className="p-4 sm:p-5 lg:p-6 border-2 border-nocciola/20 rounded-xl hover:border-nocciola hover:bg-nocciola/5 transition-all duration-300 group cursor-pointer text-left sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-nocciola group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-nocciola mb-1 sm:mb-2">
              Vai al Sito
            </h3>
            <p className="text-nocciola text-xs sm:text-sm">Visualizza il sito pubblico</p>
          </button>
        </div>
      </div>

      {/* Goal Manager Modal */}
      <GoalManager
        isOpen={isGoalManagerOpen}
        onClose={() => setIsGoalManagerOpen(false)}
        onSuccess={() => {
          setGoalRefreshKey(prev => prev + 1);
          refreshStats();
        }}
      />
    </AdminLayout>
  );
}
