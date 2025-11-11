import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID ordine mancante' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Recupera tutti i feedback associati a questo orderId
    const feedbacks = await db
      .collection('feedbacks')
      .find({ orderId })
      .sort({ createdAt: -1 }) // Più recenti prima
      .toArray();

    // Trasforma i dati per l'uso nel frontend
    const formattedFeedbacks = feedbacks.map((feedback) => ({
      id: feedback._id.toString(),
      productId: feedback.productId || null,
      productName: feedback.productName,
      rating: feedback.rating,
      comment: feedback.comment,
      customerEmail: feedback.customerEmail,
      customerName: feedback.customerName,
      isAnonymous: feedback.isAnonymous || false,
      orderType: feedback.orderType,
      createdAt: feedback.createdAt,
    }));

    return NextResponse.json({
      success: true,
      feedbacks: formattedFeedbacks,
      count: formattedFeedbacks.length,
    });
  } catch (error) {
    console.error('Errore nel recupero dei feedback:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei feedback' },
      { status: 500 }
    );
  }
}
