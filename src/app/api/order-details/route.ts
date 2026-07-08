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
    addressDetails?: {
      line1?: string;
      city?: string;
      postal_code?: string;
      country?: string;
      state?: string;
    };
    // Nuovi campi per sistema zone
    zone?: 'italia' | 'europa' | 'america' | 'mondo';
    selectedCity?: string;
    selectedCountry?: string;
    selectedCountryCode?: string;
    cost?: number;
    stripeShippingRateId?: string;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    shippingCost: number;
    total: number;
    discount?: {
      code: string;
      amount: number;
    };
    // Campagne promozionali applicate alle righe (sconto già incluso nel subtotal)
    promotions?: AppliedPromotionSummary[];
  };
  total: number;
  status: string;
  created: string;
  currency: string;
  paymentStatus: string;
  paymentIntent: string | Stripe.PaymentIntent | null;
}

interface AppliedPromotionSummary {
  campaignId: string;
  productId?: string;
  amount?: number; // risparmio totale in € per la riga (se disponibile)
}

// Legge le promozioni applicate dai metadata sessione (scritti da
// create-checkout-session). Formato compatto {c,p,o,d,q} in centesimi,
// oppure fallback con soli id campagna se il carrello era molto grande.
const extractAppliedPromotions = (session: Stripe.Checkout.Session): AppliedPromotionSummary[] => {
  const raw = session.metadata?.applied_promotions;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Fallback: array di soli id campagna
    if (parsed.every(entry => typeof entry === 'string')) {
      return parsed.map(campaignId => ({ campaignId }));
    }

    return parsed
      .map((entry): AppliedPromotionSummary => ({
        campaignId: entry?.c,
        productId: typeof entry?.p === 'string' ? entry.p : undefined,
        amount:
          typeof entry?.o === 'number' && typeof entry?.d === 'number' && typeof entry?.q === 'number'
            ? ((entry.o - entry.d) * entry.q) / 100
            : undefined,
      }))
      .filter(entry => typeof entry.campaignId === 'string');
  } catch {
    return [];
  }
};

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
      'shipping_cost',
      'total_details.breakdown.discounts',
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

const formatShippingAddress = (address: Stripe.Address | null | undefined) => {
  if (!address) {
    return 'Come da checkout';
  }

  const { line1, line2, city, postal_code, country } = address;
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
      // Impossibile recuperare dettagli shipping rate
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
  // Estrai codice sconto e importo da total_details (disponibile con expand)
  const discounts = (session.total_details as any)?.breakdown?.discounts;
  const firstDiscount = Array.isArray(discounts) && discounts.length > 0 ? discounts[0] : null;
  const discountAmount = firstDiscount ? (firstDiscount.amount || 0) / 100 : 0;
  const discountCode =
    firstDiscount?.discount?.promotion_code?.code ||
    firstDiscount?.discount?.coupon?.name ||
    firstDiscount?.discount?.coupon?.id ||
    null;

  const promotions = extractAppliedPromotions(session);

  return {
    subtotal: (session.amount_subtotal || 0) / 100,
    shippingCost: (session.shipping_cost?.amount_total || 0) / 100,
    total: (session.amount_total || 0) / 100,
    ...(discountAmount > 0 && discountCode
      ? { discount: { code: discountCode, amount: discountAmount } }
      : {}),
    ...(promotions.length > 0 ? { promotions } : {}),
  };
};

const buildOrderDetails = async (session: Stripe.Checkout.Session): Promise<OrderDetails> => {
  const customer = extractCustomerInfo(session);
  const pricing = calculatePricing(session);
  const items = extractOrderItems(session);
  const shippingMethod = await getShippingMethodName(session, pricing.shippingCost);

  // Indirizzo di spedizione: collected_information (raccolto nel checkout) ha la precedenza
  // su customer_details.address (indirizzo di fatturazione/wallet, es. Apple Pay)
  const shippingAddress = session.collected_information?.shipping_details?.address ||
    session.customer_details?.address ||
    null;

  // Estrai dettagli indirizzo strutturati
  const addressDetails = shippingAddress ? {
    line1: shippingAddress.line1 || undefined,
    city: shippingAddress.city || undefined,
    postal_code: shippingAddress.postal_code || undefined,
    country: shippingAddress.country || undefined,
    state: shippingAddress.state || undefined,
  } : undefined;

  // Estrai dati shipping dai metadata (se presenti)
  const shippingMetadata = session.metadata || {};

  return {
    id: session.id,
    customer,
    shipping: {
      address: formatShippingAddress(shippingAddress),
      method: shippingMethod,
      addressDetails,
      // Nuovi campi dal sistema zone
      zone: shippingMetadata.shipping_zone as any,
      selectedCity: shippingMetadata.shipping_city,
      selectedCountry: shippingMetadata.shipping_country,
      selectedCountryCode: shippingMetadata.shipping_country_code,
      cost: pricing.shippingCost * 100, // Converti in centesimi
      stripeShippingRateId: typeof session.shipping_cost?.shipping_rate === 'string'
        ? session.shipping_cost.shipping_rate
        : undefined,
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
    const message = error instanceof Error ? error.message : 'Errore nel recuperare i dettagli ordine';
    const status = message.includes('mancante') ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}