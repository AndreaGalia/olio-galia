import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { SellerService } from '@/services/sellerService';

// GET - Lista semplificata venditori per dropdown
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const sellers = await SellerService.getSellersForDropdown();

    return NextResponse.json({
      success: true,
      sellers
    });

  } catch (error) {
    console.error('Errore nel recupero dei venditori per dropdown:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei venditori' },
      { status: 500 }
    );
  }
});
