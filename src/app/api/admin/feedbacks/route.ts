// app/api/admin/feedbacks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { FeedbackDocument } from '@/types/feedback';

/**
 * GET /api/admin/feedbacks
 * Recupera tutti i feedback con paginazione e filtri
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const orderType = searchParams.get('orderType') || 'all'; // 'all', 'order', 'quote'
    const minRating = searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!, 10) : null;
    const productName = searchParams.get('productName') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // 'createdAt', 'rating'
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // 'asc', 'desc'

    const db = await getDatabase();
    const feedbackCollection = db.collection<FeedbackDocument>('feedbacks');

    // Costruisci il filtro
    const filter: any = {};

    if (orderType !== 'all') {
      filter.orderType = orderType;
    }

    if (minRating !== null && minRating >= 1 && minRating <= 5) {
      filter.rating = { $gte: minRating };
    }

    if (productName !== 'all') {
      filter.productName = productName;
    }

    // Calcola skip per paginazione
    const skip = (page - 1) * limit;

    // Ordine
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Recupera feedback con paginazione
    const [feedbacks, total] = await Promise.all([
      feedbackCollection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      feedbackCollection.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Per ogni feedback, recupera le info base dell'ordine
    const feedbacksWithOrderInfo = await Promise.all(
      feedbacks.map(async (feedback) => {
        let orderInfo = null;

        try {
          const collection = feedback.orderType === 'order' ? 'orders' : 'forms';
          const order = await db.collection(collection).findOne(
            { _id: feedback.orderId as any },
            { projection: { orderId: 1, sessionId: 1, createdAt: 1, total: 1, items: 1 } }
          );

          if (order) {
            orderInfo = {
              orderNumber: order.orderId || order.sessionId || 'N/A',
              orderDate: order.createdAt || null,
              itemCount: order.items?.length || 0,
            };
          }
        } catch (err) {
          console.error('[Admin Feedbacks] Errore recupero info ordine:', err);
        }

        return {
          _id: feedback._id,
          orderId: feedback.orderId,
          productId: feedback.productId,
          productName: feedback.productName,
          orderType: feedback.orderType,
          rating: feedback.rating,
          comment: feedback.comment,
          customerName: feedback.customerName,
          customerEmail: feedback.customerEmail,
          isAnonymous: feedback.isAnonymous || false, // Default false per retrocompatibilità
          createdAt: feedback.createdAt,
          orderInfo,
        };
      })
    );

    return NextResponse.json({
      success: true,
      feedbacks: feedbacksWithOrderInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[Admin Feedbacks] Errore:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero dei feedback',
      },
      { status: 500 }
    );
  }
});
