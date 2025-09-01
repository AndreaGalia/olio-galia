// app/api/update-stock/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Cache semplice per evitare doppi aggiornamenti
const processedSessions = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    // Controlla se già processato
    if (processedSessions.has(sessionId)) {
      return NextResponse.json({ 
        success: true, 
        message: 'Stock già aggiornato per questa sessione' 
      });
    }

    // 1. Recupera sessione da Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });

    // 2. Verifica pagamento completato
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Pagamento non completato' }, { status: 400 });
    }

    // 3. Per ogni prodotto acquistato, decrementa stock
    if (session.line_items) {
      for (const item of session.line_items.data) {
        if (item.price?.product) {
          const productId = item.price.product as string;
          const quantityBought = item.quantity || 0;

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
        }
      }
    }

    // Marca come processato
    processedSessions.add(sessionId);
    
    // Pulisci cache dopo 1 ora (opzionale)
    setTimeout(() => {
      processedSessions.delete(sessionId);
    }, 60 * 60 * 1000);

    return NextResponse.json({ success: true, message: 'Stock aggiornato' });

  } catch (error) {
    console.error('Errore:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}