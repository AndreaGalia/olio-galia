import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST /api/admin/discount-codes/verify
// Body: { couponCode: string }
// Verifica che il codice esista su Stripe (promo code o coupon ID) e ne restituisce i dettagli
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { couponCode } = body;

    if (!couponCode || typeof couponCode !== 'string') {
      return NextResponse.json(
        { error: 'Codice coupon mancante' },
        { status: 400 }
      );
    }

    const code = couponCode.trim().toUpperCase();

    // Prova prima come promotion code (codice leggibile es. "ESTATE10")
    const promoCodes = await stripe.promotionCodes.list({ code, limit: 1, expand: ['data.coupon'] });

    if (promoCodes.data.length > 0) {
      const promo = promoCodes.data[0];
      const coupon = promo.coupon;

      if (!promo.active) {
        return NextResponse.json(
          { error: 'Il codice promozionale esiste ma non è attivo' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        type: 'promotion_code',
        name: coupon.name || code,
        discountType: coupon.percent_off ? 'percent' : 'fixed',
        value: coupon.percent_off ?? (coupon.amount_off ? coupon.amount_off / 100 : 0),
        currency: coupon.currency ?? 'eur',
        expiresAt: promo.expires_at ? new Date(promo.expires_at * 1000).toISOString() : null,
        valid: promo.active,
      });
    }

    // Fallback: prova come coupon ID diretto
    try {
      const coupon = await stripe.coupons.retrieve(code);

      if (!coupon.valid) {
        return NextResponse.json(
          { error: 'Il coupon esiste ma non è più valido (scaduto o esaurito)' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        type: 'coupon',
        name: coupon.name || code,
        discountType: coupon.percent_off ? 'percent' : 'fixed',
        value: coupon.percent_off ?? (coupon.amount_off ? coupon.amount_off / 100 : 0),
        currency: coupon.currency ?? 'eur',
        expiresAt: coupon.redeem_by ? new Date(coupon.redeem_by * 1000).toISOString() : null,
        valid: coupon.valid,
      });
    } catch {
      // Il codice non esiste né come promo code né come coupon
      return NextResponse.json(
        { error: 'Codice non trovato su Stripe. Verifica che esista nella dashboard.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error verifying coupon:', error);
    return NextResponse.json(
      { error: 'Errore durante la verifica del codice su Stripe' },
      { status: 500 }
    );
  }
});
