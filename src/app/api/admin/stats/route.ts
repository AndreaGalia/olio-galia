import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AdminOrderService } from '@/services/adminOrderService';

export const GET = withAuth(async () => {
  try {
    const stats = await AdminOrderService.getOrderStats();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nel recupero delle statistiche' },
      { status: 500 }
    );
  }
});