// app/api/download-receipt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Types
interface ReceiptStatus {
  isPaid: boolean;
  hasReceipt: boolean;
  receiptUrl: string | null;
}

// Utilities
const validateSessionId = (sessionId: string | null) => {
  if (!sessionId) {
    throw new Error('Session ID richiesto');
  }
  return sessionId;
};

const retrieveSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};

const validatePaymentStatus = (session: Stripe.Checkout.Session) => {
  if (session.payment_status !== 'paid') {
    throw new Error('Pagamento non completato');
  }
};

const extractPaymentIntentId = (paymentIntent: string | Stripe.PaymentIntent | null): string => {
  if (!paymentIntent) {
    throw new Error('Payment Intent non trovato');
  }

  if (typeof paymentIntent === 'string') {
    return paymentIntent;
  }

  if (paymentIntent && 'id' in paymentIntent && paymentIntent.id) {
    return paymentIntent.id;
  }

  throw new Error('Payment Intent non valido');
};

const findReceiptUrl = async (paymentIntentId: string): Promise<string> => {
  const charges = await stripe.charges.list({
    payment_intent: paymentIntentId,
    limit: 10
  });

  const chargeWithReceipt = charges.data.find(charge => charge.receipt_url);
  
  if (!chargeWithReceipt?.receipt_url) {
    throw new Error('Ricevuta non disponibile');
  }

  return chargeWithReceipt.receipt_url;
};

const checkReceiptAvailability = async (sessionId: string): Promise<ReceiptStatus> => {
  const session = await retrieveSession(sessionId);
  const isPaid = session.payment_status === 'paid';

  if (!isPaid || !session.payment_intent) {
    return {
      isPaid,
      hasReceipt: false,
      receiptUrl: null,
    };
  }

  try {
    const paymentIntentId = extractPaymentIntentId(session.payment_intent);
    await findReceiptUrl(paymentIntentId);
    
    return {
      isPaid: true,
      hasReceipt: true,
      receiptUrl: `/api/download-receipt?session_id=${sessionId}`,
    };
  } catch {
    return {
      isPaid: true,
      hasReceipt: false,
      receiptUrl: null,
    };
  }
};

// GET: Download/redirect to receipt
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = validateSessionId(searchParams.get('session_id'));

    // Recupera sessione e valida pagamento
    const session = await retrieveSession(sessionId);
    validatePaymentStatus(session);

    // Estrai Payment Intent ID
    const paymentIntentId = extractPaymentIntentId(session.payment_intent);
    
    // Trova URL ricevuta
    const receiptUrl = await findReceiptUrl(paymentIntentId);

    // Reindirizza alla ricevuta Stripe
    return NextResponse.redirect(receiptUrl);

  } catch (error) {
    
    
    const message = error instanceof Error ? error.message : 'Errore nel recupero della ricevuta';
    
    // Determina status code appropriato
    const validationErrors = ['richiesto', 'non completato', 'non trovato', 'non disponibile'];
    const status = validationErrors.some(err => message.includes(err)) ? 400 : 500;
    
    return NextResponse.json({ 
      error: message,
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status });
  }
}

// POST: Check receipt availability
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    const validSessionId = validateSessionId(sessionId);

    const receiptStatus = await checkReceiptAvailability(validSessionId);
    
    return NextResponse.json(receiptStatus);

  } catch (error) {
    
    
    const message = error instanceof Error ? error.message : 'Errore nel controllo della ricevuta';
    const status = message.includes('richiesto') ? 400 : 500;
    
    return NextResponse.json({ 
      error: message,
      isPaid: false,
      hasReceipt: false,
      receiptUrl: null
    }, { status });
  }
}