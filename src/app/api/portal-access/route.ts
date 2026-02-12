import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SubscriptionService } from '@/services/subscriptionService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token richiesto' }, { status: 400 });
    }

    // 1. Check permanent token (portalAccessToken on subscription)
    const subscription = await SubscriptionService.findByPortalToken(token);
    if (subscription) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/manage-subscription`,
      });
      return NextResponse.json({ url: portalSession.url });
    }

    // 2. Check temporary token (portal_tokens collection)
    const tempToken = await SubscriptionService.findAndUseTemporaryToken(token);
    if (tempToken) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: tempToken.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/manage-subscription`,
      });
      return NextResponse.json({ url: portalSession.url });
    }

    return NextResponse.json(
      { error: 'Link non valido o scaduto' },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore server';
    console.error('Error in portal-access:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
