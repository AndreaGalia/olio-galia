'use client';

import { useRouter } from 'next/navigation';
import { useAdminStats } from '@/hooks/useAdminStats';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboardPage() {
  const { stats, loading: statsLoading, refreshStats } = useAdminStats();
  const router = useRouter();

  const headerActions = (
    <button
      onClick={() => router.push('/admin/orders')}
      className="px-2 sm:px-4 py-2 bg-olive text-white rounded-lg hover:bg-salvia transition-colors cursor-pointer text-xs sm:text-base whitespace-nowrap flex-shrink-0"
    >
      Gestisci Ordini
    </button>
  );

  return (
    <AdminLayout
      title="Dashboard Admin"
      subtitle="Panoramica generale del sistema"
      headerActions={headerActions}
    >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
            <div className="flex items-center">
              <div className="p-3 bg-olive/10 rounded-xl">
                <svg className="w-6 h-6 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-nocciola">Ordini Totali</h3>
                <p className="text-2xl font-serif text-olive">
                  {statsLoading ? '...' : stats?.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-nocciola">Fatturato Totale</h3>
                <p className="text-2xl font-serif text-olive">
                  {statsLoading ? '...' : `€${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7l-2 9h12l-2-9M8 7h8" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-nocciola">Ordini Oggi</h3>
                <p className="text-2xl font-serif text-olive">
                  {statsLoading ? '...' : stats?.ordersToday || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-nocciola">Fatturato Oggi</h3>
                <p className="text-2xl font-serif text-olive">
                  {statsLoading ? '...' : `€${stats?.revenueToday?.toFixed(2) || '0.00'}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-olive/10">
          <h2 className="text-2xl font-serif text-olive mb-6">Azioni Rapide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/admin/orders')}
              className="p-6 border-2 border-olive/20 rounded-xl hover:border-olive hover:bg-olive/5 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-olive group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-olive mb-2 whitespace-nowrap">Gestisci Ordini</h3>
              <p className="text-nocciola text-sm">Visualizza e gestisci tutti gli ordini</p>
            </button>

            <button
              onClick={() => router.push('/admin/preventivi')}
              className="p-6 border-2 border-olive/20 rounded-xl hover:border-olive hover:bg-olive/5 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-olive group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-olive mb-2 whitespace-nowrap">Gestisci Preventivi</h3>
              <p className="text-nocciola text-sm">Visualizza e gestisci tutti i preventivi</p>
            </button>

            <button
              onClick={refreshStats}
              disabled={statsLoading}
              className="p-6 border-2 border-salvia/20 rounded-xl hover:border-salvia hover:bg-salvia/5 transition-all duration-300 group disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <svg className={`w-8 h-8 text-salvia group-hover:scale-110 transition-transform ${statsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-salvia mb-2 whitespace-nowrap">Aggiorna Dati</h3>
              <p className="text-nocciola text-sm">Ricarica le statistiche più recenti</p>
            </button>

            <button
              onClick={() => router.push('/')}
              className="p-6 border-2 border-nocciola/20 rounded-xl hover:border-nocciola hover:bg-nocciola/5 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-nocciola group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-nocciola mb-2 whitespace-nowrap">Vai al Sito</h3>
              <p className="text-nocciola text-sm">Visualizza il sito pubblico</p>
            </button>
          </div>
        </div>
    </AdminLayout>
  );
}