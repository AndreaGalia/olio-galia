import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EmailService } from '@/lib/email/resend';
import type { WaitingListEntry } from '@/types/waitingList';
import type { ProductDocument } from '@/types/products';

type Params = { params: Promise<{ productId: string }> };

// GET /api/admin/waiting-list/[productId]
// Ritorna tutti gli iscritti per il prodotto
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { productId } = await params;
    const { db } = await connectToDatabase();

    const entries = await db
      .collection<WaitingListEntry>('waitingListEntries')
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Error fetching waiting list:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/admin/waiting-list/[productId]
// Body: { action: 'notify' }
// Invia email a tutti gli iscritti non ancora notificati
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { productId } = await params;
    const body = await request.json();

    if (body.action !== 'notify') {
      return NextResponse.json(
        { error: 'Azione non valida' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Recupera il prodotto per nome e slug
    const product = await db
      .collection<ProductDocument>('products')
      .findOne({ id: productId });

    if (!product) {
      return NextResponse.json(
        { error: 'Prodotto non trovato' },
        { status: 404 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com';

    // Recupera solo gli iscritti non ancora notificati
    const pending = await db
      .collection<WaitingListEntry>('waitingListEntries')
      .find({ productId, notifiedAt: { $exists: false } })
      .toArray();

    if (pending.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'Nessun iscritto da notificare' });
    }

    let sent = 0;
    let failed = 0;

    for (const entry of pending) {
      const locale = entry.locale;
      const productName =
        product.translations[locale]?.name || product.translations.it.name;
      const slug = product.slug[locale] || product.slug.it;
      const productUrl = `${siteUrl}/products/${slug}`;

      const ok = await EmailService.sendWaitingListNotification(
        entry.email,
        productName,
        productUrl,
        locale
      );

      if (ok) {
        await db.collection<WaitingListEntry>('waitingListEntries').updateOne(
          { _id: (entry as any)._id },
          { $set: { notifiedAt: new Date() } }
        );
        sent++;
      } else {
        failed++;
      }
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error('Error sending waiting list notifications:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
