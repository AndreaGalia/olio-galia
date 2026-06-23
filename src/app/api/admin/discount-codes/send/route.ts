import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getCurrentUser } from '@/lib/auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import { EmailService } from '@/lib/email/resend';
import Stripe from 'stripe';
import type { DiscountCodeSendDocument, DiscountCodeSendRecipient } from '@/types/discountCodeSend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface Recipient {
  email: string;
  customerName?: string;
}

// POST /api/admin/discount-codes/send
// Body: { couponCode, discountDescription, expiryDate?, customMessage, recipients, locale? }
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      couponCode,
      discountDescription,
      expiryDate,
      customMessage,
      recipients,
      locale = 'it',
    } = body;

    // Validazione input
    if (!couponCode || typeof couponCode !== 'string') {
      return NextResponse.json({ error: 'Codice coupon mancante' }, { status: 400 });
    }
    if (!discountDescription || typeof discountDescription !== 'string') {
      return NextResponse.json({ error: 'Descrizione sconto mancante' }, { status: 400 });
    }
    if (!customMessage || typeof customMessage !== 'string') {
      return NextResponse.json({ error: 'Messaggio personalizzato mancante' }, { status: 400 });
    }
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Nessun destinatario specificato' }, { status: 400 });
    }

    const code = couponCode.trim().toUpperCase();

    // Verifica coupon su Stripe prima di inviare
    let stripeVerified = false;
    try {
      const promoCodes = await stripe.promotionCodes.list({ code, limit: 1 });
      if (promoCodes.data.length > 0 && promoCodes.data[0].active) {
        stripeVerified = true;
      } else {
        const coupon = await stripe.coupons.retrieve(code);
        if (coupon.valid) stripeVerified = true;
      }
    } catch {
      // Il codice non esiste su Stripe
    }

    if (!stripeVerified) {
      return NextResponse.json(
        { error: 'Codice coupon non valido o non trovato su Stripe. Verifica nella dashboard prima di inviare.' },
        { status: 400 }
      );
    }

    // Recupera email admin dal JWT per lo storico
    const user = await getCurrentUser();
    const sentBy = user?.email ?? 'admin';

    // Invio email a ogni destinatario (sequenziale per rispettare rate limit Resend)
    const results: DiscountCodeSendRecipient[] = [];

    for (const recipient of recipients as Recipient[]) {
      if (!recipient.email) continue;

      const ok = await EmailService.sendDiscountCode({
        customerEmail: recipient.email,
        customerName: recipient.customerName,
        discountCode: code,
        discountDescription,
        expiryDate: expiryDate || undefined,
        customMessage,
        locale: locale as 'it' | 'en',
      });

      results.push({
        email: recipient.email,
        customerName: recipient.customerName,
        success: ok,
        error: ok ? undefined : 'Invio fallito',
      });
    }

    const totalSent = results.filter(r => r.success).length;
    const totalFailed = results.filter(r => !r.success).length;

    // Salva storico in MongoDB
    const { db } = await connectToDatabase();
    const record: DiscountCodeSendDocument = {
      couponCode: code,
      discountDescription,
      expiryDate: expiryDate || undefined,
      customMessage,
      locale: locale as 'it' | 'en',
      sentAt: new Date(),
      sentBy,
      recipients: results,
      stripeVerified,
      totalSent,
      totalFailed,
    };

    const insertResult = await db.collection<DiscountCodeSendDocument>('discount_code_sends').insertOne(record);

    return NextResponse.json({
      success: true,
      id: insertResult.insertedId.toString(),
      totalSent,
      totalFailed,
      results,
    });
  } catch (error) {
    console.error('Error sending discount codes:', error);
    return NextResponse.json(
      { error: 'Errore interno durante l\'invio' },
      { status: 500 }
    );
  }
});
