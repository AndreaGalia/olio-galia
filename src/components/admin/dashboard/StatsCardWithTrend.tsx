import React from 'react';

interface StatsCardWithTrendProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  loading?: boolean;
}

export default function StatsCardWithTrend({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  loading = false,
}: StatsCardWithTrendProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-olive/10 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center flex-1 min-w-0">
          <div className={`p-2.5 sm:p-3 ${iconBgColor} rounded-xl flex-shrink-0`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-3 sm:ml-4 flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-nocciola">{title}</h3>
            <p className="text-xl sm:text-2xl font-serif text-olive whitespace-nowrap">
              {loading ? '...' : value}
            </p>
          </div>
        </div>
        {trend && !loading && (
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:ml-4 flex-shrink-0">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                trend.isPositive
                  ? 'bg-green-100 text-green-700'
                  : trend.value === 0
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {trend.value > 0 ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : trend.value < 0 ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                </svg>
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <p className="text-[10px] text-gray-500 sm:mt-1">{trend.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}
