// app/api/feedback/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { FeedbackDocument } from '@/types/feedback';

/**
 * GET /api/feedback/[orderId]
 * Verifica se esistono feedback per i prodotti dell'ordine specificato
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID ordine mancante'
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const feedbackCollection = db.collection<FeedbackDocument>('feedbacks');

    // Cerca tutti i feedback per questo ordine
    const feedbacks = await feedbackCollection.find({ orderId }).toArray();

    if (feedbacks.length > 0) {
      return NextResponse.json({
        exists: true,
        allProductsFeedback: true, // Assumiamo che se c'è almeno un feedback, l'ordine è completato
        feedbacks: feedbacks.map(f => ({
          orderId: f.orderId,
          productId: f.productId,
          productName: f.productName,
          rating: f.rating,
          comment: f.comment,
          customerName: f.customerName,
          createdAt: f.createdAt,
        }))
      });
    }

    return NextResponse.json({
      exists: false,
      allProductsFeedback: false,
      feedbacks: []
    });

  } catch (error) {
    console.error('[Feedback] Errore nella verifica feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server'
      },
      { status: 500 }
    );
  }
}
