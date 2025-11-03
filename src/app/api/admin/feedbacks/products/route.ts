// app/api/admin/feedbacks/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { FeedbackDocument } from '@/types/feedback';

/**
 * GET /api/admin/feedbacks/products
 * Recupera tutti i nomi di prodotti unici dai feedback
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const db = await getDatabase();
    const feedbackCollection = db.collection<FeedbackDocument>('feedbacks');

    // Ottieni tutti i prodotti unici
    const uniqueProducts = await feedbackCollection
      .distinct('productName');

    // Ordina alfabeticamente
    uniqueProducts.sort();

    return NextResponse.json({
      success: true,
      products: uniqueProducts,
    });
  } catch (error) {
    console.error('[Admin Feedbacks Products] Errore:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero dei prodotti',
      },
      { status: 500 }
    );
  }
});
