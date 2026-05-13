import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import type { WaitingListEntry } from '@/types/waitingList';

// POST /api/waiting-list
// Body: { productId, email, locale }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, email, locale } = body;

    if (!productId || !email || !locale) {
      return NextResponse.json(
        { error: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    if (!['it', 'en'].includes(locale)) {
      return NextResponse.json(
        { error: 'Locale non valido' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Anti-duplicati: stessa email × stesso prodotto
    const existing = await db.collection<WaitingListEntry>('waitingListEntries').findOne({
      productId,
      email: email.toLowerCase().trim(),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'already_subscribed' },
        { status: 409 }
      );
    }

    const entry: WaitingListEntry = {
      productId,
      email: email.toLowerCase().trim(),
      locale: locale as 'it' | 'en',
      createdAt: new Date(),
    };

    await db.collection<WaitingListEntry>('waitingListEntries').insertOne(entry);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to waiting list:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
