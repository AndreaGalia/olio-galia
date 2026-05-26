import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Path mancante' }, { status: 400 });
    }

    const db = await getDatabase();

    // Documento unico per giorno — aggiornato con $inc (atomico, nessuna crescita esplosiva)
    const today = new Date().toISOString().slice(0, 10); // "2026-05-26"

    await db.collection('page_views').updateOne(
      { date: today },
      {
        $inc: {
          total: 1,
          [`pages.${path.replace(/\./g, '_')}`]: 1,
        },
        $setOnInsert: { date: today },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch {
    // Silent fail — non bloccare l'utente per un errore di tracking
    return NextResponse.json({ success: false });
  }
}
