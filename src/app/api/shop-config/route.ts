// app/api/shop-config/route.ts
import { NextResponse } from 'next/server';

// Paesi europei per spedizione standard (codici ISO supportati da Stripe)
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

// Tutti i paesi supportati
const ALL_COUNTRIES = [
  // Europa
  ...EU_COUNTRIES,
  // Altri paesi principali supportati da Stripe
  'US', 'CA', 'AU', 'JP', 'SG', 'HK', 'CH', 'NO', 'GB',
  'BR', 'MX', 'IN', 'MY', 'TH', 'PH', 'TW',
  'IL', 'AE', 'SA', 'NZ'
];

export async function GET() {
  const euShippingCost = parseFloat(process.env.SHIPPING_COST_EU || '8.90');
  const worldShippingCost = parseFloat(process.env.SHIPPING_COST_WORLD || '25.00');

  return NextResponse.json({
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '100'),
    currency: 'EUR',
    shippingCosts: {
      eu: euShippingCost,
      world: worldShippingCost
    },
    euCountries: EU_COUNTRIES,
    allowedCountries: ALL_COUNTRIES,
  });
}