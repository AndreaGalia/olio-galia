import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AdminOrderService } from '@/services/adminOrderService';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const includeStripe = searchParams.get('includeStripe') === 'true';

    const result = await AdminOrderService.getAllOrders(page, limit, status, search, includeStripe);

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nel recupero degli ordini' },
      { status: 500 }
    );
  }
});