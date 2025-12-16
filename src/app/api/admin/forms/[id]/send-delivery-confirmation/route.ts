import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { EmailService } from '@/lib/email/resend';
import { generateFeedbackUrl } from '@/lib/feedback/token';
import { WahaService } from '@/services/wahaService';
import { WhatsAppTemplates } from '@/lib/whatsapp/templates';

export const POST = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Configurazione email mancante' },
        { status: 500 }
      );
    }

    const { id: formId } = await params;
    const db = await getDatabase();
    const collection = db.collection('forms');

    // Trova il form
    let form;
    if (formId.match(/^[0-9a-fA-F]{24}$/)) {
      form = await collection.findOne({ _id: new ObjectId(formId) });
    } else {
      form = await collection.findOne({ orderId: formId });
    }

    if (!form) {
      return NextResponse.json(
        { error: 'Form non trovato' },
        { status: 404 }
      );
    }

    // Prepara i dati per l'email di consegna
    const deliveryData = {
      customerName: `${form.firstName} ${form.lastName}`,
      customerEmail: form.email,
      orderNumber: form.orderId,
      orderId: formId, // MongoDB _id per link feedback
      shippingTrackingId: form.shippingTrackingId || undefined,
      deliveryDate: new Date().toLocaleDateString('it-IT')
    };

    // Genera URL feedback sicuro con token JWT
    let feedbackUrl: string | undefined;
    try {
      feedbackUrl = await generateFeedbackUrl(formId, 'quote');
    } catch (error) {
      console.error('[Feedback] Errore nella generazione token:', error);
      // Continua senza link feedback se fallisce
    }

    // Invia l'email usando EmailService (usa template dal DB con fallback)
    const emailSent = await EmailService.sendDeliveryNotification(deliveryData, feedbackUrl);

    if (!emailSent) {
      throw new Error('Errore nell\'invio dell\'email di conferma consegna');
    }

    // Invia notifica WhatsApp consegna (preventivo/form)
    if (form.phone) {
      try {
        const isEnabled = await WahaService.isNotificationTypeEnabled('deliveryConfirmation');
        if (isEnabled) {
          const whatsappMessage = await WhatsAppTemplates.deliveryConfirmation({
            orderId: form.orderId,
            customerName: `${form.firstName} ${form.lastName}`,
            type: 'quote'
          });

          await WahaService.sendTextMessage(form.phone, whatsappMessage);
        }
      } catch (whatsappError) {
        console.error('⚠️ Error sending WhatsApp delivery notification:', whatsappError);
      }
    }

    // Aggiorna il form con informazioni sull'invio della conferma
    await collection.updateOne(
      { _id: form._id },
      {
        $set: {
          deliveryConfirmationSent: true,
          deliveryConfirmationSentAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Email di conferma consegna inviata con successo',
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nell\'invio della conferma consegna' },
      { status: 500 }
    );
  }
});