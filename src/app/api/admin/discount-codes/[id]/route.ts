import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { DiscountCodeSendDocument } from '@/types/discountCodeSend';

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/discount-codes/[id]
// Dettaglio completo di un singolo invio, inclusa la lista recipients con esito
export const GET = withAuth(async (_request: NextRequest, { params }: Params) => {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const send = await db
      .collection<DiscountCodeSendDocument>('discount_code_sends')
      .findOne({ _id: new ObjectId(id) });

    if (!send) {
      return NextResponse.json({ error: 'Invio non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true, send });
  } catch (error) {
    console.error('Error fetching discount code send:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del dettaglio' },
      { status: 500 }
    );
  }
});
