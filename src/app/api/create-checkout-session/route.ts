// app/api/create-checkout-session/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ShippingZone } from '@/types/shipping';
import {
  getActiveShippingConfig,
  getShippingCostForZoneAndWeight as getShippingCostForZoneAndWeightService,
  getItalyShippingCost as getItalyShippingCostService,
} from '@/lib/shipping/shippingConfigService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Types
interface CartItem {
  id: string;
  quantity: number;
}

interface RequestBody {
  items: CartItem[];
  needsInvoice?: boolean;
  shippingZone?: ShippingZone; // Zona di spedizione selezionata
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

const validateShippingZone = (zone?: ShippingZone) => {
  if (!zone) {
    throw new Error('Seleziona una zona di spedizione');
  }

  const validZones: ShippingZone[] = ['italia', 'europa', 'america', 'mondo'];
  if (!validZones.includes(zone)) {
    throw new Error('Zona di spedizione non valida');
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

// Parse variant separator from cart item ID
const parseCartItemId = (id: string): { productId: string; variantId?: string } => {
  const parts = id.split('::');
  return {
    productId: parts[0],
    variantId: parts.length > 1 ? parts[1] : undefined,
  };
};

// Mappa gli ID locali agli ID Stripe (supporta varianti con separatore ::)
const mapLocalIdsToStripeIds = async (items: CartItem[]) => {
  const { db } = await connectToDatabase();
  const mappedItems: CartItem[] = [];

  for (const item of items) {
    const { productId, variantId } = parseCartItemId(item.id);

    // Se l'ID inizia con "local_", è un ID locale MongoDB
    if (productId.startsWith('local_')) {
      // Cerca il prodotto in MongoDB per ottenere lo stripeProductId
      const mongoProduct = await db.collection('products').findOne({ id: productId });

      if (!mongoProduct) {
        throw new Error(`Prodotto non trovato: ${productId}`);
      }

      // Se ha una variante, cerca lo stripeProductId della variante
      if (variantId && mongoProduct.variants) {
        const variant = mongoProduct.variants.find((v: any) => v.variantId === variantId);
        if (!variant) {
          throw new Error(`Variante non trovata: ${variantId}`);
        }
        if (!variant.stripeProductId) {
          throw new Error(`La variante "${variant.translations?.it?.name || variantId}" non è disponibile per il checkout online.`);
        }
        mappedItems.push({
          ...item,
          id: variant.stripeProductId
        });
      } else {
        // Prodotto senza variante
        if (!mongoProduct.stripeProductId) {
          throw new Error(`Il prodotto "${mongoProduct.translations?.it?.name || productId}" non è disponibile per il checkout online. Richiedi un preventivo invece.`);
        }
        mappedItems.push({
          ...item,
          id: mongoProduct.stripeProductId
        });
      }
    } else if (variantId) {
      // ID Stripe con variante — cerca la variante in MongoDB per ottenere il suo stripeProductId
      const mongoProduct = await db.collection('products').findOne({
        $or: [{ id: productId }, { stripeProductId: productId }]
      });

      if (!mongoProduct) {
        throw new Error(`Prodotto non trovato: ${productId}`);
      }

      const variant = mongoProduct.variants?.find((v: any) => v.variantId === variantId);
      if (!variant) {
        throw new Error(`Variante non trovata: ${variantId}`);
      }
      if (!variant.stripeProductId) {
        throw new Error(`La variante "${variant.translations?.it?.name || variantId}" non è disponibile per il checkout online.`);
      }
      mappedItems.push({
        ...item,
        id: variant.stripeProductId
      });
    } else {
      // È già un ID Stripe senza variante, usa così com'è
      mappedItems.push(item);
    }
  }

  return mappedItems;
};

// Calcola peso totale carrello in grammi (query MongoDB)
// Il peso è sempre del prodotto padre (condiviso tra varianti)
const calculateCartWeight = async (items: CartItem[]): Promise<number> => {
  const { db } = await connectToDatabase();
  let totalGrams = 0;

  for (const item of items) {
    const { productId } = parseCartItemId(item.id);

    const product = await db.collection('products').findOne({
      $or: [{ id: productId }, { stripeProductId: productId }]
    });

    if (product?.weight) {
      totalGrams += product.weight * item.quantity;
    }
  }

  return totalGrams;
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

// Vecchia funzione - mantenuta per compatibilità ma non più usata con nuovo sistema zone
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

// Calcola e restituisce le shipping options basate su zona e peso/totale carrello
const getShippingOptionsForZone = async (
  zone: ShippingZone,
  items: CartItem[],
  totalAmountCents: number
): Promise<Stripe.Checkout.SessionCreateParams.ShippingOption[]> => {
  // Recupera configurazione spedizioni da MongoDB
  const config = await getActiveShippingConfig();

  if (!config) {
    throw new Error(
      'Configurazione spedizioni non trovata. Configura le spedizioni dall\'Admin Panel: /admin/shipping-config'
    );
  }

  // ===== ITALIA: basata su totale € (NON peso) =====
  if (zone === 'italia') {
    const totalEur = totalAmountCents / 100;
    const italyConfig = getItalyShippingCostService(totalEur, config);

    if (!italyConfig.stripeRateId) {
      throw new Error(
        'Configurazione spedizione Italia incompleta. Verifica la configurazione nell\'Admin Panel.'
      );
    }

    return [{ shipping_rate: italyConfig.stripeRateId }];
  }

  // ===== EUROPA/AMERICA/MONDO: basata su peso =====
  const totalGrams = await calculateCartWeight(items);

  const shippingConfig = getShippingCostForZoneAndWeightService(zone, totalGrams, config);

  if (!shippingConfig || !shippingConfig.stripeRateId) {
    throw new Error(
      `Impossibile calcolare spedizione per zona ${zone} con peso ${totalGrams}g. ` +
      `Contattaci per un preventivo personalizzato.`
    );
  }

  return [{ shipping_rate: shippingConfig.stripeRateId }];
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

const createSessionConfig = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  shippingZone: ShippingZone,
  items: CartItem[],
  totalAmount: number,
  needsInvoice: boolean
): Promise<Stripe.Checkout.SessionCreateParams> => {
  // Ottiene le shipping options basate su zona e peso/totale carrello
  const shippingOptions = await getShippingOptionsForZone(shippingZone, items, totalAmount);

  return {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart?payment_canceled=true`,
    locale: 'it',

    shipping_address_collection: {
      allowed_countries: COUNTRIES.ALL,
    },

    // Usa shipping_options con riferimento alle shipping rates già create
    shipping_options: shippingOptions,

    // Metadata per salvare la zona selezionata
    metadata: {
      shipping_zone: shippingZone,
    },

    ...createInvoiceConfig(needsInvoice),
  };
};

// Main handler
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { items, needsInvoice = false, shippingZone } = body;

    // Validazioni
    validateCartItems(items);
    validateShippingZone(shippingZone);

    // Mappa gli ID locali agli ID Stripe (se necessario)
    const mappedItems = await mapLocalIdsToStripeIds(items);

    // Fetch data from Stripe
    const [productsResult, pricesResult] = await Promise.all([
      stripe.products.list({ active: true }),
      stripe.prices.list({ active: true })
    ]);

    const priceMap = createPriceMap(pricesResult.data);

    // Build line items and calculate total (usa gli ID mappati)
    const { lineItems, totalAmount } = buildLineItems(
      mappedItems,
      productsResult.data,
      priceMap
    );

    // Create session configuration con zona selezionata + calcolo shipping basato su peso/totale
    const sessionConfig = await createSessionConfig(
      lineItems,
      shippingZone!,
      items, // Passa items originali (con ID locali) per calcolo peso
      totalAmount,
      needsInvoice
    );

    // Create Stripe session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      sessionId: session.id,
      totalAmount: totalAmount / 100,
      shippingZone: shippingZone,
    });

  } catch (error) {
    
    
    const message = error instanceof Error ? error.message : 'Errore server';
    const status = message.includes('non trovato') || message.includes('richiesto') ? 400 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}