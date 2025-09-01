// app/api/verify-checkout-session/route.ts (OPZIONALE)
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface RequestBody {
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'ID sessione richiesto' }, { status: 400 });
    }

    // Recupera dettagli sessione da Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verifica pagamento completato
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ 
        error: 'Pagamento non completato',
        status: session.payment_status 
      }, { status: 400 });
    }

    // Restituisci dettagli ordine
    return NextResponse.json({
      id: session.id,
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
    });

  } catch (error) {
    console.error('Errore verifica:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}