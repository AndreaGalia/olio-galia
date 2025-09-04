// app/api/update-stock/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Types
interface RequestBody {
  sessionId: string;
}

// Cache semplice per evitare doppi aggiornamenti
const processedSessions = new Set<string>();

// Utilities
const validateInput = (sessionId: string) => {
  if (!sessionId) {
    throw new Error('ID sessione richiesto');
  }
};

const isAlreadyProcessed = (sessionId: string): boolean => {
  return processedSessions.has(sessionId);
};

const markAsProcessed = (sessionId: string) => {
  processedSessions.add(sessionId);
  
  // Pulisci cache dopo 1 ora
  setTimeout(() => {
    processedSessions.delete(sessionId);
  }, 60 * 60 * 1000);
};

const retrieveSession = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items']
  });
};

const validatePaymentStatus = (session: Stripe.Checkout.Session) => {
  if (session.payment_status !== 'paid') {
    throw new Error('Pagamento non completato');
  }
};

const updateProductStock = async (productId: string, quantityBought: number) => {
  // Recupera prodotto attuale
  const product = await stripe.products.retrieve(productId);
  const currentStock = parseInt(product.metadata?.available_quantity || '0');
  
  // Calcola nuovo stock
  const newStock = Math.max(0, currentStock - quantityBought);
  
  // Aggiorna su Stripe
  await stripe.products.update(productId, {
    metadata: {
      ...product.metadata,
      available_quantity: newStock.toString(),
      last_updated: new Date().toISOString()
    }
  });

  console.log(`${product.name}: ${currentStock} → ${newStock}`);
};

const processStockUpdates = async (session: Stripe.Checkout.Session) => {
  if (!session.line_items) {
    return;
  }

  for (const item of session.line_items.data) {
    if (item.price?.product) {
      const productId = item.price.product as string;
      const quantityBought = item.quantity || 0;
      
      await updateProductStock(productId, quantityBought);
    }
  }
};

// Main handler
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { sessionId } = body;

    // Validazione
    validateInput(sessionId);

    // Controlla se già processato
    if (isAlreadyProcessed(sessionId)) {
      return NextResponse.json({ 
        success: true, 
        message: 'Stock già aggiornato per questa sessione' 
      });
    }

    // Recupera sessione da Stripe
    const session = await retrieveSession(sessionId);

    // Verifica pagamento completato
    validatePaymentStatus(session);

    // Aggiorna stock per ogni prodotto
    await processStockUpdates(session);

    // Marca come processato
    markAsProcessed(sessionId);

    return NextResponse.json({ 
      success: true, 
      message: 'Stock aggiornato' 
    });

  } catch (error) {
    console.error('Errore:', error);
    
    const message = error instanceof Error ? error.message : 'Errore server';
    const status = message.includes('richiesto') || message.includes('completato') ? 400 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}