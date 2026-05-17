import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function PUT(request: NextRequest) {
  try {
    const { order } = await request.json() as { order: { id: string; displayOrder: number }[] };

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Formato non valido' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    await Promise.all(
      order.map(({ id, displayOrder }) =>
        db.collection('products').updateOne(
          { id },
          { $set: { displayOrder } }
        )
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Errore nel salvataggio dell\'ordine' }, { status: 500 });
  }
}
