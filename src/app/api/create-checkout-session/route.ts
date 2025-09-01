// app/api/create-checkout-session/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CartItem {
  id: string;
  quantity: number;
}

interface RequestBody {
  items: CartItem[];
  needsInvoice?: boolean; // Flag per richiedere fattura
}

// Soglia per spedizione gratuita (in centesimi, da variabile ENV)
const FREE_SHIPPING_THRESHOLD = parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '100') * 100; // Converti da euro a centesimi

// Costi spedizione
const EU_SHIPPING_COST = Math.round(parseFloat(process.env.SHIPPING_COST_EU || '8.90') * 100); // In centesimi
const WORLD_SHIPPING_COST = Math.round(parseFloat(process.env.SHIPPING_COST_WORLD || '25.00') * 100); // In centesimi

// Paesi europei (usando i codici ISO supportati da Stripe)
const EU_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

// Tutti i paesi supportati da Stripe
const ALL_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = [
  // Europa
  ...EU_COUNTRIES,
  // Altri paesi principali supportati da Stripe
  'US', 'CA', 'AU', 'JP', 'SG', 'HK', 'CH', 'NO', 'GB',
  'BR', 'MX', 'IN', 'MY', 'TH', 'PH', 'TW',
  'IL', 'AE', 'SA', 'NZ'
];

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { items, needsInvoice = false } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrello vuoto' }, { status: 400 });
    }

    // Recupera prodotti da Stripe
    const products = await stripe.products.list({ active: true });
    const prices = await stripe.prices.list({ active: true });

    // Mappa prezzi per prodotto
    const priceMap: Record<string, Stripe.Price> = {};
    prices.data.forEach(price => {
      if (typeof price.product === 'string') {
        priceMap[price.product] = price;
      }
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalAmount = 0; // Calcola il totale per la soglia spedizione

    // Controlla ogni prodotto nel carrello
    for (const item of items) {
      const product = products.data.find(p => p.id === item.id);
      
      if (!product) {
        return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 400 });
      }

      // Verifica quantità disponibile
      const available = parseInt(product.metadata?.available_quantity || '0');
      if (item.quantity > available) {
        return NextResponse.json({ 
          error: `${product.name}: hai richiesto ${item.quantity}, disponibili ${available}` 
        }, { status: 400 });
      }

      const price = priceMap[item.id];
      if (price && price.id && price.unit_amount) {
        lineItems.push({
          price: price.id,
          quantity: item.quantity,
        });
        
        // Aggiungi al totale
        totalAmount += price.unit_amount * item.quantity;
      }
    }

    // Determina le opzioni di spedizione basate sul totale
    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [];
    
    if (totalAmount >= FREE_SHIPPING_THRESHOLD) {
      // Sopra la soglia: solo spedizione gratuita
      shippingOptions.push({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'eur' },
          display_name: 'Spedizione Gratuita',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 5 },
          },
        },
      });
    } else {
      // Sotto la soglia: SOLO spedizione a pagamento
      shippingOptions.push({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: EU_SHIPPING_COST, currency: 'eur' }, // Europa
          display_name: 'Spedizione Standard Europa',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      });

      // Aggiungi opzione spedizione resto del mondo
      shippingOptions.push({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: WORLD_SHIPPING_COST, currency: 'eur' }, // Resto del mondo
          display_name: 'Spedizione Internazionale',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 7 },
            maximum: { unit: 'business_day', value: 14 },
          },
        },
      });
    }

    // Configurazione base della sessione
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      locale: 'it',
      
      // Spedizione
      shipping_address_collection: {
        allowed_countries: ALL_COUNTRIES,
      },
      shipping_options: shippingOptions,
    };

    // Se serve la fattura, aggiungi i campi necessari
    if (needsInvoice) {
      sessionConfig.customer_creation = 'always';
      sessionConfig.invoice_creation = {
        enabled: true,
        invoice_data: {
          description: `Fattura per ordine dal sito web`,
          metadata: {
            order_type: 'ecommerce',
          },
          footer: 'Grazie per il tuo acquisto!',
        },
      };
      
      // Raccogli informazioni aggiuntive per la fattura
      sessionConfig.custom_fields = [
        {
          key: 'codice_fiscale',
          label: { type: 'custom', custom: 'Codice Fiscale' },
          type: 'text',
          optional: false,
        },
        {
          key: 'partita_iva',
          label: { type: 'custom', custom: 'Partita IVA (opzionale)' },
          type: 'text',
          optional: true,
        },
      ];
      
      // Richiedi anche l'indirizzo di fatturazione
      sessionConfig.billing_address_collection = 'required';
    }

    // Crea sessione checkout Stripe
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ 
      sessionId: session.id,
      totalAmount: totalAmount / 100, // Restituisci il totale in euro per info
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD / 100,
      qualifiesForFreeShipping: totalAmount >= FREE_SHIPPING_THRESHOLD
    });

  } catch (error) {
    console.error('Errore checkout:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}