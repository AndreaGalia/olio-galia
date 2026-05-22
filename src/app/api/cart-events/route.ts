import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, variantId, productName, price, quantity } = body;

    if (!productId || !productName || price == null || !quantity) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const db = await getDatabase();

    await db.collection('cart_events').insertOne({
      productId,
      variantId: variantId || null,
      productName,
      price: Number(price),
      quantity: Number(quantity),
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
