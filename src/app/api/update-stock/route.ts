// app/api/update-stock/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService'; // Aggiungi questo import

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
  let sessionId = 'unknown'; // Dichiara sessionId per error handling
  
  try {
    const body: RequestBody = await request.json();
    sessionId = body.sessionId; // Assegna per usarlo nel catch

    // Validazione
    validateInput(sessionId);

    console.log(`🔍 Controllando ordine ${sessionId}...`);

    // NUOVO: Prima controlla se l'ordine esiste già nel database MongoDB
    const orderExists = await OrderService.orderExists(sessionId);
    
    if (orderExists) {
      console.log(`⏭️ Ordine ${sessionId} già presente nel DB, saltando aggiornamento stock`);
      return NextResponse.json({
        success: true,
        message: 'Ordine già processato, stock non modificato',
        alreadyProcessed: true,
        source: 'mongodb'
      });
    }

    // Controlla se già processato (cache in memoria come backup)
    if (isAlreadyProcessed(sessionId)) {
      console.log(`⏭️ Ordine ${sessionId} già processato (cache in memoria)`);
      return NextResponse.json({ 
        success: true, 
        message: 'Stock già aggiornato per questa sessione',
        alreadyProcessed: true,
        source: 'memory_cache'
      });
    }

    console.log(`📦 Procedendo con aggiornamento stock per ${sessionId}...`);

    // Recupera sessione da Stripe
    const session = await retrieveSession(sessionId);

    // Verifica pagamento completato
    validatePaymentStatus(session);

    // Aggiorna stock per ogni prodotto
    await processStockUpdates(session);

    // Marca come processato
    markAsProcessed(sessionId);

    console.log(`✅ Stock aggiornato con successo per ${sessionId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Stock aggiornato con successo',
      alreadyProcessed: false
    });

  } catch (error) {
    console.error('❌ Errore nell\'aggiornamento stock:', error);
    
    const message = error instanceof Error ? error.message : 'Errore server';
    const status = message.includes('richiesto') || message.includes('completato') ? 400 : 500;
    
    return NextResponse.json({ 
      error: message,
      sessionId: sessionId // Ora funziona correttamente
    }, { status });
  }
}