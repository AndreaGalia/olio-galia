import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { SellerService } from '@/services/sellerService';

// POST - Aggiungi pagamento al venditore
export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, date, notes } = body;

    // Validazione campi obbligatori
    if (!amount || !date) {
      return NextResponse.json(
        { error: 'Importo e data sono obbligatori' },
        { status: 400 }
      );
    }

    // Validazione importo (deve essere numero positivo in centesimi)
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'L\'importo deve essere un numero positivo (in centesimi)' },
        { status: 400 }
      );
    }

    // Validazione data
    const paymentDate = new Date(date);
    if (isNaN(paymentDate.getTime())) {
      return NextResponse.json(
        { error: 'Data non valida' },
        { status: 400 }
      );
    }

    const paymentId = await SellerService.addPayment(id, {
      amount,
      date: paymentDate,
      notes
    });

    return NextResponse.json({
      success: true,
      paymentId,
      message: 'Pagamento aggiunto con successo'
    });

  } catch (error: any) {
    console.error('Errore nell\'aggiunta del pagamento:', error);

    if (error.message?.includes('importo')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nell\'aggiunta del pagamento' },
      { status: 500 }
    );
  }
});
