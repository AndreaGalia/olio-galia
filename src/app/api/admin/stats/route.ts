import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { DashboardService } from '@/services/dashboardService';

export const GET = withAuth(async () => {
  try {
    const stats = await DashboardService.getDashboardStats();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle statistiche' },
      { status: 500 }
    );
  }
});