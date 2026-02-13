// app/api/create-subscription-session/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SubscriptionInterval, ShippingZone } from '@/types/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface RequestBody {
  productId: string;
  shippingZone: ShippingZone;
  interval: SubscriptionInterval;
  quantity?: number;
}

const ALLOWED_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'US', 'CA', 'AU', 'JP', 'SG', 'HK', 'CH', 'NO', 'GB',
  'BR', 'MX', 'IN', 'MY', 'TH', 'PH', 'TW', 'IL', 'AE', 'SA', 'NZ'
];

const VALID_ZONES: ShippingZone[] = ['italia', 'europa', 'america', 'mondo'];
const VALID_INTERVALS: SubscriptionInterval[] = ['month', 'bimonth', 'quarter', 'semester'];
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { productId, shippingZone, interval, quantity = 1 } = body;

    // Validazioni
    if (!productId) {
      return NextResponse.json({ error: 'Prodotto mancante' }, { status: 400 });
    }
    if (!shippingZone || !VALID_ZONES.includes(shippingZone)) {
      return NextResponse.json({ error: 'Zona di spedizione non valida' }, { status: 400 });
    }
    if (!interval || !VALID_INTERVALS.includes(interval)) {
      return NextResponse.json({ error: 'Intervallo non valido' }, { status: 400 });
    }
    if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
      return NextResponse.json({ error: 'Quantità non valida' }, { status: 400 });
    }

    // Cerca prodotto in MongoDB
    const { db } = await connectToDatabase();
    const product = await db.collection('products').findOne({ id: productId });

    if (!product) {
      return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 });
    }

    if (!product.isSubscribable) {
      return NextResponse.json({ error: 'Prodotto non disponibile per abbonamento' }, { status: 400 });
    }

    // Prendi il Price ID: prima prova nuovo formato (subscriptionPrices), poi fallback al vecchio
    let priceId: string | undefined;

    if (product.subscriptionPrices?.[String(quantity)]?.[shippingZone]?.[interval]) {
      const entry = product.subscriptionPrices[String(quantity)][shippingZone][interval];
      priceId = typeof entry === 'object' && entry.priceId ? entry.priceId : undefined;
    }

    // Fallback per vecchio formato (solo qty=1)
    if (!priceId && quantity === 1 && product.stripeRecurringPriceIds?.[shippingZone]?.[interval]) {
      priceId = product.stripeRecurringPriceIds[shippingZone][interval];
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Combinazione quantità/zona/intervallo non disponibile per questo prodotto' },
        { status: 400 }
      );
    }

    // Crea Stripe Checkout Session in modalità subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1, // Il prezzo include già tutto (prodotto + spedizione per la quantità)
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug?.it || ''}?subscription_canceled=true`,
      locale: 'it',
      shipping_address_collection: {
        allowed_countries: ALLOWED_COUNTRIES,
      },
      metadata: {
        type: 'subscription',
        productId: product.id,
        productName: product.translations?.it?.name || '',
        shippingZone,
        interval,
        quantity: String(quantity),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore server';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
