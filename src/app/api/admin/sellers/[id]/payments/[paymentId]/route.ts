import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { SellerService } from '@/services/sellerService';

// DELETE - Rimuovi pagamento dal venditore
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) => {
  try {
    const { id, paymentId } = await params;

    await SellerService.removePayment(id, paymentId);

    return NextResponse.json({
      success: true,
      message: 'Pagamento rimosso con successo'
    });

  } catch (error) {
    console.error('Errore nella rimozione del pagamento:', error);
    return NextResponse.json(
      { error: 'Errore nella rimozione del pagamento' },
      { status: 500 }
    );
  }
});
