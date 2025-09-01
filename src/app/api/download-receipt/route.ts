// app/api/download-receipt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID richiesto' }, { status: 400 });
  }

  try {
    // Recupera la sessione Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Controlla se il pagamento è stato completato
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Pagamento non completato' }, { status: 400 });
    }

    // Recupera il Payment Intent ID
    let paymentIntentId: string;
    if (typeof session.payment_intent === 'string') {
      paymentIntentId = session.payment_intent;
    } else if (session.payment_intent && typeof session.payment_intent === 'object' && session.payment_intent.id) {
      paymentIntentId = session.payment_intent.id;
    } else {
      return NextResponse.json({ error: 'Payment Intent non trovato' }, { status: 400 });
    }

    // Recupera tutti i charges per questo PaymentIntent
    const charges = await stripe.charges.list({
      payment_intent: paymentIntentId,
      limit: 10
    });

    // Trova il primo charge con receipt_url
    const chargeWithReceipt = charges.data.find(charge => charge.receipt_url);
    
    if (!chargeWithReceipt || !chargeWithReceipt.receipt_url) {
      return NextResponse.json({ error: 'Ricevuta non disponibile' }, { status: 404 });
    }

    // Reindirizza alla ricevuta di Stripe
    return NextResponse.redirect(chargeWithReceipt.receipt_url);

  } catch (error) {
    console.error('Errore nel recupero della ricevuta:', error);
    return NextResponse.json({ 
      error: 'Errore nel recupero della ricevuta',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

// Endpoint per controllare se la ricevuta è disponibile
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID richiesto' }, { status: 400 });
    }

    // Recupera la sessione
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    const isPaid = session.payment_status === 'paid';
    let hasReceipt = false;
    let receiptUrl: string | null = null;

    if (isPaid && session.payment_intent) {
      // Ottieni il Payment Intent ID
      let paymentIntentId: string;
      if (typeof session.payment_intent === 'string') {
        paymentIntentId = session.payment_intent;
      } else if (session.payment_intent && typeof session.payment_intent === 'object' && session.payment_intent.id) {
        paymentIntentId = session.payment_intent.id;
      } else {
        return NextResponse.json({ 
          isPaid: false, 
          hasReceipt: false,
          receiptUrl: null 
        });
      }

      try {
        // Cerca i charges
        const charges = await stripe.charges.list({
          payment_intent: paymentIntentId,
          limit: 10
        });

        const chargeWithReceipt = charges.data.find(charge => charge.receipt_url);
        
        if (chargeWithReceipt && chargeWithReceipt.receipt_url) {
          hasReceipt = true;
          receiptUrl = `/api/download-receipt?session_id=${sessionId}`;
        }
      } catch (chargeError) {
        console.error('Errore nel recuperare i charges:', chargeError);
        // Continua senza receipt se c'è un errore
      }
    }

    return NextResponse.json({
      isPaid,
      hasReceipt,
      receiptUrl,
    });

  } catch (error) {
    console.error('Errore nel controllo ricevuta:', error);
    return NextResponse.json({ 
      error: 'Errore nel controllo della ricevuta',
      isPaid: false,
      hasReceipt: false,
      receiptUrl: null
    }, { status: 500 });
  }
}