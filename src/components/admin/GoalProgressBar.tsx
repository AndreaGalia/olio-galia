// components/admin/GoalProgressBar.tsx
'use client';

import React from 'react';

interface GoalProgressBarProps {
  percentage: number;
  currentRevenue: number;
  target: number;
  isOnTrack: boolean;
}

export default function GoalProgressBar({
  percentage,
  currentRevenue,
  target,
  isOnTrack,
}: GoalProgressBarProps) {
  // Limita la percentuale al 100% per la visualizzazione
  const displayPercentage = Math.min(percentage, 100);

  // Determina il colore in base allo stato
  const getBarColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (isOnTrack) return 'bg-blue-500';
    return 'bg-orange-500';
  };

  const getTextColor = () => {
    if (percentage >= 100) return 'text-green-600';
    if (isOnTrack) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-2">
      {/* Barra di progresso */}
      <div className="relative w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
        <div
          className={`h-full ${getBarColor()} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
          style={{ width: `${displayPercentage}%` }}
        >
          {displayPercentage > 15 && (
            <span className="text-white font-semibold text-sm">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
        {displayPercentage <= 15 && (
          <span
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${getTextColor()} font-semibold text-sm`}
          >
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Informazioni numeriche */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
          €{currentRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-gray-600">
          / €{target.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Badge di stato */}
      <div className="flex justify-center">
        {percentage >= 100 ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🎉 Obiettivo Raggiunto!
          </span>
        ) : isOnTrack ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ✓ In linea con l&apos;obiettivo
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            ⚠ Sotto l&apos;obiettivo
          </span>
        )}
      </div>
    </div>
  );
}
