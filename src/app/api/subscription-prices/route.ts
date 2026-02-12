import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { priceIds } = await req.json();

    if (!priceIds || !Array.isArray(priceIds) || priceIds.length === 0) {
      return NextResponse.json({ error: 'priceIds richiesti' }, { status: 400 });
    }

    // Filtra solo stringhe valide
    const validIds = priceIds.filter((id: unknown) => typeof id === 'string' && id.trim());

    if (validIds.length === 0) {
      return NextResponse.json({ prices: {} });
    }

    // Fetch tutti i prezzi in parallelo
    const results = await Promise.allSettled(
      validIds.map((id: string) => stripe.prices.retrieve(id))
    );

    const prices: Record<string, { amount: number; currency: string }> = {};

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const price = result.value;
        if (price.unit_amount !== null) {
          prices[price.id] = {
            amount: price.unit_amount / 100,
            currency: price.currency,
          };
        }
      }
    }

    return NextResponse.json({ prices });
  } catch {
    return NextResponse.json({ error: 'Errore nel recupero prezzi' }, { status: 500 });
  }
}
