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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-olive/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className={`p-3 ${iconBgColor} rounded-xl`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-medium text-nocciola">{title}</h3>
            <p className="text-2xl font-serif text-olive">
              {loading ? '...' : value}
            </p>
          </div>
        </div>
        {trend && !loading && (
          <div className="ml-4">
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
            <p className="text-[10px] text-gray-500 mt-1 text-center">{trend.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}
