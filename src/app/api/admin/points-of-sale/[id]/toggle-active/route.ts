import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { PointOfSaleService } from '@/services/pointOfSaleService';

// POST - Attiva/disattiva un punto vendita
export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const isActive = await PointOfSaleService.toggleActive(id);

    return NextResponse.json({
      success: true,
      isActive,
      message: isActive ? 'Punto vendita attivato' : 'Punto vendita disattivato',
    });
  } catch (error) {
    console.error('Error toggling point of sale:', error);
    const message = error instanceof Error ? error.message : 'Errore durante l\'operazione';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
