// components/admin/GoalCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import GoalProgressBar from './GoalProgressBar';

interface GoalData {
  goal: {
    id: string;
    target: number;
    startDate: string;
    endDate: string;
    year: number;
  };
  progress: {
    currentRevenue: number;
    percentage: number;
    remaining: number;
    daysElapsed: number;
    daysRemaining: number;
    totalDays: number;
    averagePerDay: number;
    requiredAveragePerDay: number;
    isOnTrack: boolean;
  };
}

interface GoalCardProps {
  onManageGoal: () => void;
}

export default function GoalCard({ onManageGoal }: GoalCardProps) {
  const [goalData, setGoalData] = useState<GoalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoalData();
  }, []);

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/goals/active');

      if (response.status === 404) {
        setGoalData(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Errore durante il recupero dell\'obiettivo');
      }

      const result = await response.json();
      setGoalData(result.data);
    } catch (err) {
      console.error('Errore fetch goal:', err);
      setError('Impossibile caricare l\'obiettivo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Obiettivo di Fatturato</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Obiettivo di Fatturato</h2>
          <button
            onClick={onManageGoal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            + Imposta Obiettivo
          </button>
        </div>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!goalData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Obiettivo di Fatturato</h2>
          <button
            onClick={onManageGoal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            + Imposta Obiettivo
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Nessun obiettivo attivo</p>
          <p className="text-sm">Crea un obiettivo per monitorare il tuo fatturato</p>
        </div>
      </div>
    );
  }

  const { goal, progress } = goalData;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Obiettivo di Fatturato {goal.year}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
          </p>
        </div>
        <button
          onClick={onManageGoal}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Modifica
        </button>
      </div>

      {/* Barra di progresso */}
      <div className="mb-6">
        <GoalProgressBar
          percentage={progress.percentage}
          currentRevenue={progress.currentRevenue}
          target={goal.target}
          isOnTrack={progress.isOnTrack}
        />
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Mancano</p>
          <p className="text-2xl font-bold text-gray-800">
            €{progress.remaining.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Giorni Rimanenti</p>
          <p className="text-2xl font-bold text-gray-800">{progress.daysRemaining}</p>
          <p className="text-xs text-gray-500">su {progress.totalDays}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Media Attuale</p>
          <p className="text-lg font-bold text-gray-800">
            €{progress.averagePerDay.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/g
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Media Necessaria</p>
          <p className="text-lg font-bold text-gray-800">
            €{progress.requiredAveragePerDay.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/g
          </p>
        </div>
      </div>
    </div>
  );
}
