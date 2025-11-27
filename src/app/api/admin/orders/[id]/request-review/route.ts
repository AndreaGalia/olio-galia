import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { EmailService } from '@/lib/email/resend';
import { ReviewRequestData } from '@/types/email';
import { generateFeedbackUrl } from '@/lib/feedback/token';

export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID ordine non valido' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const ordersCollection = db.collection('orders');
    const feedbacksCollection = db.collection('feedbacks');

    // 1. Trova l'ordine
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json(
        { error: 'Ordine non trovato' },
        { status: 404 }
      );
    }

    // 2. Verifica che l'ordine sia consegnato
    if (order.shippingStatus !== 'delivered') {
      return NextResponse.json(
        { error: 'L\'ordine deve essere nello stato "delivered" per richiedere una recensione' },
        { status: 400 }
      );
    }

    // 3. Verifica che NON esista già un feedback per questo ordine
    const existingFeedback = await feedbacksCollection.findOne({ orderId: id });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Esiste già un feedback per questo ordine' },
        { status: 400 }
      );
    }

    // 4. Verifica protezione 24h
    const lastRequestDate = order.lastReviewRequestDate;
    if (lastRequestDate) {
      const hoursSinceLastRequest = (Date.now() - new Date(lastRequestDate).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastRequest < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastRequest);
        return NextResponse.json(
          {
            error: `Devi attendere ${hoursRemaining} ore prima di inviare un'altra richiesta`,
            hoursRemaining
          },
          { status: 429 }
        );
      }
    }

    // 5. Genera URL feedback sicuro con token JWT
    let feedbackUrl: string;
    try {
      feedbackUrl = await generateFeedbackUrl(id, 'order');
    } catch (error) {
      console.error('[Feedback] Errore nella generazione token:', error);
      return NextResponse.json(
        { error: 'Errore nella generazione del link feedback' },
        { status: 500 }
      );
    }

    // 6. Prepara i dati per email
    const orderNumber = order.orderId || order.sessionId || order.id;
    const customerName = order.customerName || order.customer?.name || 'Cliente';
    const customerEmail = order.customerEmail || order.customer?.email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email del cliente non disponibile' },
        { status: 400 }
      );
    }

    const reviewData: ReviewRequestData = {
      customerName,
      customerEmail,
      orderNumber: orderNumber.slice(-8).toUpperCase(),
      orderType: 'order'
    };

    // 7. Invia email
    let emailSent = false;
    let emailError = null;

    try {
      emailSent = await EmailService.sendReviewRequest(reviewData, feedbackUrl);
      if (!emailSent) {
        emailError = 'Errore nell\'invio dell\'email';
      }
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Errore sconosciuto nell\'invio email';
      console.error('[Email] Errore:', emailError);
    }

    // 8. Aggiorna database con contatore e data ultimo invio
    const now = new Date();

    await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          lastReviewRequestDate: now
        },
        $inc: { reviewRequestCount: 1 },
        $push: { reviewRequestHistory: now } as any
      }
    );

    // 10. Risposta
    return NextResponse.json({
      success: true,
      message: 'Richiesta recensione inviata con successo',
      emailSent,
      emailError,
      reviewRequestCount: (order.reviewRequestCount || 0) + 1,
      lastReviewRequestDate: now,
    });

  } catch (error) {
    console.error('[ReviewRequest] Errore:', error);
    return NextResponse.json(
      { error: 'Errore nell\'invio della richiesta recensione' },
      { status: 500 }
    );
  }
});
