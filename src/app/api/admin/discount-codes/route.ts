import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/mongodb';
import type { DiscountCodeSendDocument } from '@/types/discountCodeSend';

// GET /api/admin/discount-codes
// Restituisce la lista degli invii (storico), più recenti prima, senza i recipients per alleggerire il payload
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const collection = db.collection<DiscountCodeSendDocument>('discount_code_sends');

    const [sends, total] = await Promise.all([
      collection
        .find({}, { projection: { recipients: 0 } })
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      sends,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching discount code sends:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dello storico' },
      { status: 500 }
    );
  }
});
