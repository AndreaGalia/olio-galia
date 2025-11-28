import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID mancante' },
        { status: 400 }
      );
    }

    // Cerca l'ordine salvato dal webhook usando OrderService
    const order = await OrderService.findOrderBySessionId(sessionId);

    if (!order) {
      // Webhook non ha ancora salvato
      return NextResponse.json(
        { message: 'Ordine in elaborazione', order: null },
        { status: 202 } // Accepted but not yet processed
      );
    }

    // Ordine trovato
    return NextResponse.json({ order });

  } catch (error) {
    console.error('Errore recupero ordine:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
