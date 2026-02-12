// app/api/create-portal-session/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SubscriptionService } from '@/services/subscriptionService';
import { EmailService } from '@/lib/email/resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email richiesta' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting: max 3 requests per 10 minutes
    const recentCount = await SubscriptionService.countRecentTokenRequests(normalizedEmail, 10);
    if (recentCount >= 3) {
      return NextResponse.json(
        { error: 'Troppe richieste. Riprova tra qualche minuto.' },
        { status: 429 }
      );
    }

    // Find Stripe customer by email
    const customers = await stripe.customers.list({
      email: normalizedEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'Nessun abbonamento trovato per questa email' },
        { status: 404 }
      );
    }

    const customer = customers.data[0];

    // Generate temporary token (15 min expiry)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await SubscriptionService.saveTemporaryToken(normalizedEmail, customer.id, token, expiresAt);

    // Build magic link
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const magicLink = `${baseUrl}/manage-subscription/access?token=${token}`;

    // Send email with magic link
    await EmailService.sendPortalAccessMagicLink(normalizedEmail, magicLink);

    return NextResponse.json({ sent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore server';
    console.error('Error in create-portal-session:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
