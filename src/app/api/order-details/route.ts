// app/api/order-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Types
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface OrderDetails {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    method: string;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    shippingCost: number;
    total: number;
  };
  total: number;
  status: string;
  created: string;
  currency: string;
  paymentStatus: string;
  paymentIntent: string | Stripe.PaymentIntent | null;
}

// Utilities
const validateSessionId = (sessionId: string | null) => {
  if (!sessionId) {
    throw new Error('Session ID mancante');
  }
  return sessionId;
};

const retrieveSessionData = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: [
      'line_items', 
      'line_items.data.price.product', 
      'customer',
      'shipping_cost'
    ]
  });
};

const extractCustomerInfo = (session: Stripe.Checkout.Session) => {
  const customer = session.customer as Stripe.Customer | null;
  const customerDetails = session.customer_details;

  return {
    name: customerDetails?.name || customer?.name || 'N/D',
    email: customerDetails?.email || customer?.email || 'N/D',
    phone: customerDetails?.phone || 'N/D',
  };
};

const formatShippingAddress = (customerDetails: Stripe.Checkout.Session.CustomerDetails | null) => {
  if (!customerDetails?.address) {
    return 'Come da checkout';
  }

  const { line1, line2, city, postal_code, country } = customerDetails.address;
  return `${line1} ${line2 || ''}, ${city} ${postal_code}, ${country}`.trim();
};

const getShippingMethodName = async (session: Stripe.Checkout.Session, shippingCost: number) => {
  // Se non c'è costo di spedizione, è gratuita
  if (shippingCost === 0) {
    return 'Spedizione Gratuita';
  }

  // Prova a recuperare il nome dal shipping rate
  if (session.shipping_cost?.shipping_rate && typeof session.shipping_cost.shipping_rate === 'string') {
    try {
      const shippingRate = await stripe.shippingRates.retrieve(session.shipping_cost.shipping_rate);
      return shippingRate.display_name || 'Standard';
    } catch (error) {
      console.log('Impossibile recuperare dettagli shipping rate:', error);
    }
  }

  return 'Standard';
};

const extractOrderItems = (session: Stripe.Checkout.Session): OrderItem[] => {
  if (!session.line_items?.data) {
    return [];
  }

  return session.line_items.data.map(item => {
    const product = item.price?.product as Stripe.Product;
    
    return {
      id: product?.id || item.price?.product as string || '',
      name: product?.name || 'Prodotto',
      price: (item.price?.unit_amount || 0) / 100,
      quantity: item.quantity || 0,
      image: product?.images?.[0] || null,
    };
  });
};

const calculatePricing = (session: Stripe.Checkout.Session) => {
  return {
    subtotal: (session.amount_subtotal || 0) / 100,
    shippingCost: (session.shipping_cost?.amount_total || 0) / 100,
    total: (session.amount_total || 0) / 100,
  };
};

const buildOrderDetails = async (session: Stripe.Checkout.Session): Promise<OrderDetails> => {
  const customer = extractCustomerInfo(session);
  const pricing = calculatePricing(session);
  const items = extractOrderItems(session);
  const shippingMethod = await getShippingMethodName(session, pricing.shippingCost);
  
  return {
    id: session.id,
    customer,
    shipping: {
      address: formatShippingAddress(session.customer_details),
      method: shippingMethod
    },
    items,
    pricing,
    // Campi per compatibilità
    total: pricing.total,
    status: session.payment_status,
    created: new Date(session.created * 1000).toISOString(),
    currency: session.currency || 'eur',
    paymentStatus: session.payment_status,
    paymentIntent: session.payment_intent
  };
};

// Main handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = validateSessionId(searchParams.get('session_id'));

    // Recupera dati sessione
    const session = await retrieveSessionData(sessionId);

    // Costruisci dettagli ordine
    const orderDetails = await buildOrderDetails(session);

    return NextResponse.json(orderDetails);

  } catch (error) {
    console.error('Errore nel recuperare i dettagli ordine:', error);
    
    const message = error instanceof Error ? error.message : 'Errore nel recuperare i dettagli ordine';
    const status = message.includes('mancante') ? 400 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}