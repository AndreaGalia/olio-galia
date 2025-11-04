// app/api/feedback/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { BatchFeedbackData, FeedbackDocument } from '@/types/feedback';

/**
 * POST /api/feedback/batch
 * Salva feedback multipli per tutti i prodotti di un ordine
 */
export async function POST(request: NextRequest) {
  try {
    const body: BatchFeedbackData = await request.json();
    const { orderId, customerEmail, customerName, isAnonymous, orderType, feedbacks } = body;

    // Validazione input base
    const missingFields: string[] = [];
    if (!orderId) missingFields.push('orderId');
    if (!customerEmail || customerEmail.trim().length === 0) missingFields.push('customerEmail');
    if (!customerName || customerName.trim().length === 0) missingFields.push('customerName');
    if (!orderType) missingFields.push('orderType');
    if (!feedbacks || !Array.isArray(feedbacks) || feedbacks.length === 0) {
      missingFields.push('feedbacks (array vuoto o mancante)');
    }

    if (missingFields.length > 0) {
      console.error('[Feedback Batch API] Campi mancanti:', missingFields);
      return NextResponse.json(
        {
          success: false,
          error: `Campi mancanti: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validazione orderType
    if (orderType !== 'order' && orderType !== 'quote') {
      return NextResponse.json(
        {
          success: false,
          error: 'Tipo ordine non valido'
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const feedbackCollection = db.collection<FeedbackDocument>('feedbacks');

    // Verifica se esistono già feedback per questo ordine
    const existingFeedbacks = await feedbackCollection.find({ orderId }).toArray();

    if (existingFeedbacks.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hai già inviato feedback per questo ordine'
        },
        { status: 409 }
      );
    }

    // Valida ogni singolo feedback
    const feedbackDocuments: FeedbackDocument[] = [];
    const errors: string[] = [];

    for (let i = 0; i < feedbacks.length; i++) {
      const feedback = feedbacks[i];
      const productLabel = `Prodotto ${i + 1}`;

      // Validazioni
      if (!feedback.productName || feedback.productName.trim().length === 0) {
        errors.push(`${productLabel}: nome prodotto mancante`);
        continue;
      }

      if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5 || !Number.isInteger(feedback.rating)) {
        errors.push(`${productLabel} (${feedback.productName}): rating deve essere 1-5`);
        continue;
      }

      if (!feedback.comment || feedback.comment.trim().length === 0) {
        errors.push(`${productLabel} (${feedback.productName}): commento mancante`);
        continue;
      }

      if (feedback.comment.length > 500) {
        errors.push(`${productLabel} (${feedback.productName}): commento troppo lungo (max 500 caratteri)`);
        continue;
      }

      // Crea documento feedback
      feedbackDocuments.push({
        orderId,
        productId: feedback.productId,
        productName: feedback.productName.trim(),
        rating: feedback.rating,
        comment: feedback.comment.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        customerName: customerName.trim(),
        isAnonymous: isAnonymous || false, // Default false per retrocompatibilità
        orderType,
        createdAt: new Date(),
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Errori di validazione:\n${errors.join('\n')}`
        },
        { status: 400 }
      );
    }

    if (feedbackDocuments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nessun feedback valido da salvare'
        },
        { status: 400 }
      );
    }

    // Salva tutti i feedback in un'unica operazione
    const result = await feedbackCollection.insertMany(feedbackDocuments);

    if (!result.insertedCount || result.insertedCount !== feedbackDocuments.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Errore nel salvataggio di alcuni feedback'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Grazie per i tuoi ${result.insertedCount} feedback!`,
        count: result.insertedCount,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[Feedback Batch] Errore nel salvataggio:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server'
      },
      { status: 500 }
    );
  }
}
