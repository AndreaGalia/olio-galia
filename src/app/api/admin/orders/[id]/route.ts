import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AdminOrderService } from '@/services/adminOrderService';

export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    
    const orderDetails = await AdminOrderService.getOrderDetails(id);
    
    if (!orderDetails) {
      return NextResponse.json(
        { error: 'Ordine non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: orderDetails,
    });

  } catch (error) {
    console.error('Errore recupero dettagli ordine:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei dettagli ordine' },
      { status: 500 }
    );
  }
});