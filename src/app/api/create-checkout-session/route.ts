// app/api/create-checkout-session/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ShippingZone, ZONE_COUNTRIES } from '@/types/shipping';
import {
  getActiveShippingConfig,
  getShippingCostForZoneAndWeight as getShippingCostForZoneAndWeightService,
  getItalyShippingCost as getItalyShippingCostService,
} from '@/lib/shipping/shippingConfigService';
import {
  getActivePromotionCampaigns,
  resolveCampaignForProduct,
  getDiscountedUnitAmount,
} from '@/lib/promotions/getActivePromotions';
import type { PromotionCampaignDocument } from '@/types/promotionCampaign';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Types
interface CartItem {
  id: string;
  quantity: number;
}

// Item mappato su Stripe che conserva anche l'id Mongo del prodotto,
// necessario per risolvere le campagne promozionali al checkout
interface MappedCartItem extends CartItem {
  localProductId?: string;
}

// Promozione applicata a una riga del checkout — salvata nei metadata
// della sessione per la riconciliazione ordini
interface AppliedPromotion {
  campaignId: string;
  productId: string;
  originalUnitAmount: number;
  discountedUnitAmount: number;
  quantity: number;
}

interface RequestBody {
  items: CartItem[];
  needsInvoice?: boolean;
  shippingZone?: ShippingZone;
  locale?: 'it' | 'en';
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

const STRIPE_BLOCKED_COUNTRIES = new Set(['BY', 'CU', 'IR', 'KP', 'RU', 'SY']);

const getAllowedCountriesForZone = (
  zone: ShippingZone
): Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] => {
  const countries = ZONE_COUNTRIES[zone];
  // 'mondo' ha array vuoto → usiamo COUNTRIES.ALL (tutti i paesi supportati)
  if (countries.length === 0) return COUNTRIES.ALL;
  const filtered = countries.filter(c => !STRIPE_BLOCKED_COUNTRIES.has(c));
  return filtered as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];
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
const mapLocalIdsToStripeIds = async (items: CartItem[]): Promise<MappedCartItem[]> => {
  const { db } = await connectToDatabase();
  const mappedItems: MappedCartItem[] = [];

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
          id: variant.stripeProductId,
          localProductId: productId
        });
      } else {
        // Prodotto senza variante
        if (!mongoProduct.stripeProductId) {
          throw new Error(`Il prodotto "${mongoProduct.translations?.it?.name || productId}" non è disponibile per il checkout online. Richiedi un preventivo invece.`);
        }
        mappedItems.push({
          ...item,
          id: mongoProduct.stripeProductId,
          localProductId: productId
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
        id: variant.stripeProductId,
        localProductId: mongoProduct.id
      });
    } else {
      // È già un ID Stripe senza variante — reverse-lookup dell'id Mongo
      // per poter risolvere eventuali campagne promozionali
      const mongoProduct = await db.collection('products').findOne({
        $or: [
          { stripeProductId: productId },
          { 'variants.stripeProductId': productId }
        ]
      });
      mappedItems.push({
        ...item,
        localProductId: mongoProduct?.id
      });
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

const buildLineItems = async (
  items: MappedCartItem[],
) => {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let totalAmount = 0;
  const appliedPromotions: AppliedPromotion[] = [];

  // Campagne attive caricate una sola volta — se la lettura fallisce si
  // procede senza sconti (mai bloccare il checkout per colpa delle promo)
  let campaigns: PromotionCampaignDocument[] = [];
  try {
    campaigns = await getActivePromotionCampaigns();
  } catch (error) {
    console.error('Failed to fetch promotion campaigns for checkout:', error);
  }

  for (const item of items) {
    // Fetch chirurgico: solo il prodotto e i suoi prezzi
    const [product, prices] = await Promise.all([
      stripe.products.retrieve(item.id),
      stripe.prices.list({ product: item.id, active: true, limit: 10 }),
    ]);

    if (!product || !product.active) {
      throw new Error(`Prodotto non trovato su Stripe: ${item.id}`);
    }

    validateProductAvailability(product, item.quantity);

    const price = prices.data[0];
    if (price?.id && price.unit_amount) {
      // Campagna promozionale attiva sul prodotto Mongo corrispondente?
      const campaign = item.localProductId
        ? resolveCampaignForProduct(campaigns, item.localProductId, price.unit_amount)
        : null;

      if (campaign) {
        // Prezzo scontato calcolato server-side, passato inline via price_data:
        // Stripe crea un Price ad-hoc (active=false) per questa sola sessione,
        // il Price di catalogo resta intatto
        const discountedUnitAmount = getDiscountedUnitAmount(price.unit_amount, campaign);

        lineItems.push({
          price_data: {
            currency: price.currency,
            unit_amount: discountedUnitAmount,
            product: item.id,
          },
          quantity: item.quantity,
        });

        totalAmount += discountedUnitAmount * item.quantity;
        appliedPromotions.push({
          campaignId: campaign.id,
          productId: item.localProductId!,
          originalUnitAmount: price.unit_amount,
          discountedUnitAmount,
          quantity: item.quantity,
        });
      } else {
        lineItems.push({
          price: price.id,
          quantity: item.quantity,
        });

        totalAmount += price.unit_amount * item.quantity;
      }
    }
  }

  return { lineItems, totalAmount, appliedPromotions };
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

// Serializza le promozioni applicate per i metadata sessione (limite Stripe:
// 500 caratteri per valore). Formato compatto; se sfora, salva solo gli id campagna.
const serializeAppliedPromotions = (appliedPromotions: AppliedPromotion[]): string | null => {
  if (appliedPromotions.length === 0) return null;

  const compact = JSON.stringify(
    appliedPromotions.map(p => ({
      c: p.campaignId,
      p: p.productId,
      o: p.originalUnitAmount,
      d: p.discountedUnitAmount,
      q: p.quantity,
    }))
  );
  if (compact.length <= 500) return compact;

  const idsOnly = JSON.stringify([...new Set(appliedPromotions.map(p => p.campaignId))]);
  return idsOnly.length <= 500 ? idsOnly : null;
};

const createSessionConfig = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  shippingZone: ShippingZone,
  items: CartItem[],
  totalAmount: number,
  needsInvoice: boolean,
  locale: 'it' | 'en' = 'it',
  appliedPromotions: AppliedPromotion[] = []
): Promise<Stripe.Checkout.SessionCreateParams> => {
  // Ottiene le shipping options basate su zona e peso/totale carrello
  const shippingOptions = await getShippingOptionsForZone(shippingZone, items, totalAmount);

  const promotionsMetadata = serializeAppliedPromotions(appliedPromotions);

  return {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart?payment_canceled=true`,
    locale: locale,

    shipping_address_collection: {
      allowed_countries: getAllowedCountriesForZone(shippingZone),
    },

    // Usa shipping_options con riferimento alle shipping rates già create
    shipping_options: shippingOptions,

    // Abilita i codici promozionali Stripe
    allow_promotion_codes: true,

    // Metadata per salvare la zona selezionata e il locale dell'utente
    metadata: {
      shipping_zone: shippingZone,
      locale: locale,
      // Campagne promozionali applicate alle righe (per riconciliazione ordini)
      ...(promotionsMetadata ? { applied_promotions: promotionsMetadata } : {}),
    },

    ...createInvoiceConfig(needsInvoice),
  };
};

// Main handler
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { items, needsInvoice = false, shippingZone, locale = 'it' } = body;

    // Validazioni
    validateCartItems(items);
    validateShippingZone(shippingZone);

    // Mappa gli ID locali agli ID Stripe (se necessario)
    const mappedItems = await mapLocalIdsToStripeIds(items);

    // Build line items — fetch chirurgico per ogni prodotto
    const { lineItems, totalAmount, appliedPromotions } = await buildLineItems(mappedItems);

    // Create session configuration con zona selezionata + calcolo shipping basato su peso/totale
    const sessionConfig = await createSessionConfig(
      lineItems,
      shippingZone!,
      items, // Passa items originali (con ID locali) per calcolo peso
      totalAmount,
      needsInvoice,
      locale,
      appliedPromotions
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