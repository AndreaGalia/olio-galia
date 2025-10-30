// app/api/admin/goals/active/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { GoalService } from '@/services/goalService';

/**
 * GET /api/admin/goals/active
 * Recupera l'obiettivo attivo con il progresso corrente
 */
export const GET = withAuth(async () => {
  try {
    const progress = await GoalService.calculateProgress();

    if (!progress) {
      return NextResponse.json(
        { error: 'Nessun obiettivo attivo trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        goal: {
          id: progress.goal._id?.toString(),
          target: progress.goal.target,
          startDate: progress.goal.startDate,
          endDate: progress.goal.endDate,
          year: progress.goal.year,
        },
        progress: {
          currentRevenue: progress.currentRevenue,
          percentage: Math.round(progress.percentage * 100) / 100, // 2 decimali
          remaining: progress.remaining,
          daysElapsed: progress.daysElapsed,
          daysRemaining: progress.daysRemaining,
          totalDays: progress.totalDays,
          averagePerDay: Math.round(progress.averagePerDay * 100) / 100,
          requiredAveragePerDay: Math.round(progress.requiredAveragePerDay * 100) / 100,
          isOnTrack: progress.isOnTrack,
        },
      },
    });
  } catch (error) {
    console.error('Errore API get active goal:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero dell\'obiettivo' },
      { status: 500 }
    );
  }
});
