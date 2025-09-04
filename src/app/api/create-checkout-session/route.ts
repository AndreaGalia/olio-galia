// app/api/create-checkout-session/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Types
interface CartItem {
  id: string;
  quantity: number;
}

interface RequestBody {
  items: CartItem[];
  needsInvoice?: boolean;
}

// Constants
const SHIPPING_CONFIG = {
  freeThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '100') * 100,
  euCost: Math.round(parseFloat(process.env.SHIPPING_COST_EU || '8.90') * 100),
  worldCost: Math.round(parseFloat(process.env.SHIPPING_COST_WORLD || '25.00') * 100)
} as const;

const COUNTRIES = {
  EU: [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
  
  ALL: [
    // Europa
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    // Altri paesi
    'US', 'CA', 'AU', 'JP', 'SG', 'HK', 'CH', 'NO', 'GB',
    'BR', 'MX', 'IN', 'MY', 'TH', 'PH', 'TW', 'IL', 'AE', 'SA', 'NZ'
  ] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[]
};

// Utilities
const validateCartItems = (items: CartItem[]) => {
  if (!items || items.length === 0) {
    throw new Error('Carrello vuoto');
  }
};

const createPriceMap = (prices: Stripe.Price[]) => {
  return prices.reduce((acc, price) => {
    if (typeof price.product === 'string') {
      acc[price.product] = price;
    }
    return acc;
  }, {} as Record<string, Stripe.Price>);
};

const validateProductAvailability = (product: Stripe.Product, requestedQuantity: number) => {
  const available = parseInt(product.metadata?.available_quantity || '0');
  
  if (requestedQuantity > available) {
    throw new Error(
      `${product.name}: hai richiesto ${requestedQuantity}, disponibili ${available}`
    );
  }
};

const buildLineItems = (
  items: CartItem[], 
  products: Stripe.Product[], 
  priceMap: Record<string, Stripe.Price>
) => {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    
    if (!product) {
      throw new Error('Prodotto non trovato');
    }

    validateProductAvailability(product, item.quantity);

    const price = priceMap[item.id];
    if (price?.id && price.unit_amount) {
      lineItems.push({
        price: price.id,
        quantity: item.quantity,
      });
      
      totalAmount += price.unit_amount * item.quantity;
    }
  }

  return { lineItems, totalAmount };
};

const createShippingOptions = (totalAmount: number) => {
  const { freeThreshold, euCost, worldCost } = SHIPPING_CONFIG;
  
  if (totalAmount >= freeThreshold) {
    return [{
      shipping_rate_data: {
        type: 'fixed_amount' as const,
        fixed_amount: { amount: 0, currency: 'eur' },
        display_name: 'Spedizione Gratuita',
        delivery_estimate: {
          minimum: { unit: 'business_day' as const, value: 3 },
          maximum: { unit: 'business_day' as const, value: 5 },
        },
      },
    }];
  }

  return [
    {
      shipping_rate_data: {
        type: 'fixed_amount' as const,
        fixed_amount: { amount: euCost, currency: 'eur' },
        display_name: 'Spedizione Standard Europa',
        delivery_estimate: {
          minimum: { unit: 'business_day' as const, value: 3 },
          maximum: { unit: 'business_day' as const, value: 7 },
        },
      },
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount' as const,
        fixed_amount: { amount: worldCost, currency: 'eur' },
        display_name: 'Spedizione Internazionale',
        delivery_estimate: {
          minimum: { unit: 'business_day' as const, value: 7 },
          maximum: { unit: 'business_day' as const, value: 14 },
        },
      },
    },
  ];
};

const createInvoiceConfig = (needsInvoice: boolean) => {
  if (!needsInvoice) return {};

  return {
    customer_creation: 'always' as const,
    billing_address_collection: 'required' as const,
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: 'Fattura per ordine dal sito web',
        metadata: { order_type: 'ecommerce' },
        footer: 'Grazie per il tuo acquisto!',
      },
    },
    custom_fields: [
      {
        key: 'codice_fiscale',
        label: { type: 'custom' as const, custom: 'Codice Fiscale' },
        type: 'text' as const,
        optional: false,
      },
      {
        key: 'partita_iva',
        label: { type: 'custom' as const, custom: 'Partita IVA (opzionale)' },
        type: 'text' as const,
        optional: true,
      },
    ],
  };
};

const createSessionConfig = (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[],
  needsInvoice: boolean
): Stripe.Checkout.SessionCreateParams => ({
  payment_method_types: ['card'],
  line_items: lineItems,
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
  locale: 'it',
  
  shipping_address_collection: {
    allowed_countries: COUNTRIES.ALL,
  },
  shipping_options: shippingOptions,
  
  ...createInvoiceConfig(needsInvoice),
});

// Main handler
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { items, needsInvoice = false } = body;

    validateCartItems(items);

    // Fetch data from Stripe
    const [productsResult, pricesResult] = await Promise.all([
      stripe.products.list({ active: true }),
      stripe.prices.list({ active: true })
    ]);

    const priceMap = createPriceMap(pricesResult.data);
    
    // Build line items and calculate total
    const { lineItems, totalAmount } = buildLineItems(
      items, 
      productsResult.data, 
      priceMap
    );

    // Create shipping options based on total
    const shippingOptions = createShippingOptions(totalAmount);
    
    // Create session configuration
    const sessionConfig = createSessionConfig(lineItems, shippingOptions, needsInvoice);
    
    // Create Stripe session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ 
      sessionId: session.id,
      totalAmount: totalAmount / 100,
      freeShippingThreshold: SHIPPING_CONFIG.freeThreshold / 100,
      qualifiesForFreeShipping: totalAmount >= SHIPPING_CONFIG.freeThreshold
    });

  } catch (error) {
    console.error('Errore checkout:', error);
    
    const message = error instanceof Error ? error.message : 'Errore server';
    const status = message.includes('non trovato') || message.includes('richiesto') ? 400 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}