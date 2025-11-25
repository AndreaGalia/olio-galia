import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { EmailService } from '@/lib/email/resend';
import { WhatsAppService } from '@/lib/whatsapp/whatsapp';
import { ReviewRequestData } from '@/types/email';
import { WhatsAppReviewRequestData } from '@/types/whatsapp';
import { generateFeedbackUrl } from '@/lib/feedback/token';

export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: formId } = await params;

    const db = await getDatabase();
    const formsCollection = db.collection('forms');
    const feedbacksCollection = db.collection('feedbacks');

    // 1. Trova il preventivo
    let form;
    if (formId.match(/^[0-9a-fA-F]{24}$/)) {
      form = await formsCollection.findOne({ _id: new ObjectId(formId) });
    } else {
      form = await formsCollection.findOne({ orderId: formId });
    }

    if (!form) {
      return NextResponse.json(
        { error: 'Preventivo non trovato' },
        { status: 404 }
      );
    }

    const mongoId = form._id.toString();

    // 2. Verifica che il preventivo sia confermato
    if (form.status !== 'confermato') {
      return NextResponse.json(
        { error: 'Il preventivo deve essere nello stato "confermato" per richiedere una recensione' },
        { status: 400 }
      );
    }

    // 3. Verifica che NON esista già un feedback per questo preventivo
    const existingFeedback = await feedbacksCollection.findOne({ orderId: mongoId });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Esiste già un feedback per questo preventivo' },
        { status: 400 }
      );
    }

    // 4. Verifica protezione 24h
    const lastRequestDate = form.lastReviewRequestDate;
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
      feedbackUrl = await generateFeedbackUrl(mongoId, 'quote');
    } catch (error) {
      console.error('[Feedback] Errore nella generazione token:', error);
      return NextResponse.json(
        { error: 'Errore nella generazione del link feedback' },
        { status: 500 }
      );
    }

    // 6. Prepara i dati per email
    const customerName = `${form.firstName} ${form.lastName}`;
    const customerEmail = form.email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email del cliente non disponibile' },
        { status: 400 }
      );
    }

    const reviewData: ReviewRequestData = {
      customerName,
      customerEmail,
      orderNumber: form.orderId,
      orderType: 'quote'
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

    // 8. Invia WhatsApp (se ha numero telefono)
    let whatsappSent = false;
    let whatsappError = null;

    // Recupera il telefono aggiornato dal database clienti
    let customerPhone = form.phone;
    if (customerEmail) {
      try {
        const customersCollection = db.collection('customers');
        const customer = await customersCollection.findOne({
          email: customerEmail.toLowerCase()
        });

        // Se troviamo il cliente, usa il telefono aggiornato
        if (customer && customer.phone) {
          customerPhone = customer.phone;
        }
      } catch (error) {
        // Se c'è un errore nel recupero del cliente, usa il telefono del form
        console.warn('[ReviewRequest] Errore recupero cliente:', error);
      }
    }

    if (customerPhone) {
      try {
        const whatsappData: WhatsAppReviewRequestData = {
          customerName,
          customerPhone,
          orderNumber: form.orderId,
          orderType: 'quote'
        };

        const whatsappResult = await WhatsAppService.sendReviewRequest(whatsappData, feedbackUrl);

        if (whatsappResult.success) {
          whatsappSent = true;
        } else {
          whatsappError = whatsappResult.error || 'Errore nell\'invio WhatsApp';
        }
      } catch (error) {
        whatsappError = error instanceof Error ? error.message : 'Errore sconosciuto nell\'invio WhatsApp';
        console.error('[WhatsApp] Errore:', whatsappError);
      }
    }

    // 9. Aggiorna database con contatore e data ultimo invio
    const now = new Date();

    await formsCollection.updateOne(
      { _id: form._id },
      {
        $set: {
          lastReviewRequestDate: now,
          updatedAt: now
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
      whatsappSent,
      whatsappError,
      reviewRequestCount: (form.reviewRequestCount || 0) + 1,
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
