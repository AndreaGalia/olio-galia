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

    // Cerca l'ordine con controllo di accesso temporale (2 ore)
    const { order, expired, createdAt } = await OrderService.findOrderBySessionIdWithAccessControl(sessionId, 2);

    // Se l'accesso è scaduto
    if (expired) {
      return NextResponse.json(
        {
          error: 'access_expired',
          message: 'Per motivi di sicurezza, i dettagli completi dell\'ordine sono visibili solo per 2 ore. Controlla la tua email per i dettagli.',
          order: null,
          expired: true,
          createdAt: createdAt?.toISOString()
        },
        { status: 403 } // Forbidden
      );
    }

    if (!order) {
      // Webhook non ha ancora salvato
      return NextResponse.json(
        { message: 'Ordine in elaborazione', order: null, expired: false },
        { status: 202 } // Accepted but not yet processed
      );
    }

    // Ordine trovato e ancora accessibile
    return NextResponse.json({ order, expired: false });

  } catch (error) {
    console.error('Errore recupero ordine:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
