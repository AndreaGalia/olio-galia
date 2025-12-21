// API route per recuperare i prezzi delle shipping rates da Stripe
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { ShippingZone } from '@/types/shipping';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface ShippingRateResponse {
  zone: ShippingZone;
  cost: number; // in centesimi
  currency: string;
  displayName: string;
  formattedCost: string; // es. "€5.90"
}

export async function GET() {
  try {
    const rateIds: Record<ShippingZone, string | undefined> = {
      italia: process.env.STRIPE_SHIPPING_RATE_ITALIA,
      europa: process.env.STRIPE_SHIPPING_RATE_EUROPA,
      america: process.env.STRIPE_SHIPPING_RATE_AMERICA,
      mondo: process.env.STRIPE_SHIPPING_RATE_MONDO,
    };

    // Recupera tutte le shipping rates in parallelo
    const ratesPromises = Object.entries(rateIds).map(async ([zone, rateId]) => {
      if (!rateId) {
        console.warn(`Shipping Rate ID non configurato per zona: ${zone}`);
        return null;
      }

      try {
        const rate = await stripe.shippingRates.retrieve(rateId);

        // Stripe shipping rates hanno fixed_amount
        if (!rate.fixed_amount) {
          console.warn(`Shipping Rate ${rateId} non ha fixed_amount`);
          return null;
        }

        const costInCents = rate.fixed_amount.amount;
        const currency = rate.fixed_amount.currency;

        // Formatta il costo in base alla valuta
        const formattedCost = new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: currency.toUpperCase(),
        }).format(costInCents / 100);

        return {
          zone: zone as ShippingZone,
          cost: costInCents,
          currency: currency,
          displayName: rate.display_name || zone,
          formattedCost,
        } as ShippingRateResponse;
      } catch (error) {
        console.error(`Errore recupero shipping rate per zona ${zone}:`, error);
        return null;
      }
    });

    const rates = await Promise.all(ratesPromises);

    // Filtra i null (rate non configurati o errori)
    const validRates = rates.filter((rate): rate is ShippingRateResponse => rate !== null);

    if (validRates.length === 0) {
      return NextResponse.json(
        { error: 'Nessuna shipping rate configurata correttamente' },
        { status: 500 }
      );
    }

    // Cache per 1 ora (3600 secondi)
    return NextResponse.json(validRates, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Errore recupero shipping rates:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle tariffe di spedizione' },
      { status: 500 }
    );
  }
}
