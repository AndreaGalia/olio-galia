// app/api/order-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID mancante' }, { status: 400 });
    }

    // Recupera la sessione Stripe con informazioni sulla spedizione
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [
        'line_items', 
        'line_items.data.price.product', 
        'customer',
        'shipping_cost'
      ]
    });

    // Estrae i dettagli del cliente
    const customer = session.customer as Stripe.Customer;
    const customerDetails = session.customer_details;

    // Estrae i prodotti
    const items = session.line_items?.data.map(item => ({
      id: item.price?.product as string,
      name: (item.price?.product as Stripe.Product)?.name || 'Prodotto',
      price: (item.price?.unit_amount || 0) / 100, // Converti da centesimi
      quantity: item.quantity || 0,
      image: (item.price?.product as Stripe.Product)?.images?.[0] || null,
    })) || [];

    // Calcola i costi
    const subtotal = (session.amount_subtotal || 0) / 100; // Subtotale prodotti
    const shippingCost = (session.shipping_cost?.amount_total || 0) / 100; // Costo spedizione reale da Stripe
    const total = (session.amount_total || 0) / 100; // Totale finale

    // Ottieni informazioni sul metodo di spedizione
    let shippingMethodName = 'Standard';
    if (session.shipping_cost?.shipping_rate) {
      try {
        // Se c'è un shipping_rate_id, recupera i dettagli
        if (typeof session.shipping_cost.shipping_rate === 'string') {
          const shippingRate = await stripe.shippingRates.retrieve(session.shipping_cost.shipping_rate);
          shippingMethodName = shippingRate.display_name || 'Standard';
        }
      } catch (error) {
        console.log('Impossibile recuperare dettagli shipping rate:', error);
        // Determina il nome basandosi sul costo
        shippingMethodName = shippingCost === 0 ? 'Spedizione Gratuita' : 'Standard';
      }
    } else {
      // Se non c'è shipping_rate, determina il nome basandosi sul costo
      shippingMethodName = shippingCost === 0 ? 'Spedizione Gratuita' : 'Standard';
    }

    const orderDetails = {
      id: sessionId,
      customer: {
        name: customerDetails?.name || customer?.name || 'N/D',
        email: customerDetails?.email || customer?.email || 'N/D',
        phone: customerDetails?.phone || 'N/D',
      },
      shipping: {
        address: customerDetails?.address ? 
          `${customerDetails.address.line1} ${customerDetails.address.line2 || ''}, ${customerDetails.address.city} ${customerDetails.address.postal_code}, ${customerDetails.address.country}`.trim() 
          : 'Come da checkout',
        method: shippingMethodName
      },
      items,
      // Struttura pricing semplificata (solo subtotale, spedizione, totale)
      pricing: {
        subtotal,
        shippingCost,
        total
      },
      // Mantieni questi campi per compatibilità con il codice esistente
      total,
      status: session.payment_status,
      created: new Date(session.created * 1000).toISOString(),
      currency: session.currency || 'eur',
      paymentStatus: session.payment_status,
      paymentIntent: session.payment_intent
    };

    return NextResponse.json(orderDetails);

  } catch (error) {
    console.error('Errore nel recuperare i dettagli ordine:', error);
    return NextResponse.json(
      { error: 'Errore nel recuperare i dettagli ordine' }, 
      { status: 500 }
    );
  }
}