import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';
import { createDeliveryNotificationHTML } from '@/lib/email/delivery-template';
import { WhatsAppService } from '@/lib/whatsapp/whatsapp';
import { WhatsAppDeliveryData } from '@/types/whatsapp';
import { generateFeedbackUrl } from '@/lib/feedback/token';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Genera il contenuto HTML dell'email
    const emailHTML = createDeliveryNotificationHTML(deliveryData, feedbackUrl);

    // Invia l'email
    

    const emailResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Olio Galia <onboarding@resend.dev>',
      to: [form.email],
      subject: `Ordine consegnato #${form.orderId} - Olio Galia`,
      html: emailHTML,
    });

    

    if (!emailResult.data?.id) {
      
      throw new Error(`Errore nell'invio dell'email: ${JSON.stringify(emailResult.error || emailResult)}`);
    }

    // Invia notifica WhatsApp se abbiamo il numero di telefono
    let whatsappSent = false;
    let whatsappError = null;

    if (form.phone) {
      try {
        const whatsappData: WhatsAppDeliveryData = {
          customerName: `${form.firstName} ${form.lastName}`,
          customerPhone: form.phone,
          orderNumber: form.orderId,
          orderId: formId, // MongoDB _id per link feedback
          deliveryDate: new Date().toLocaleDateString('it-IT'),
        };

        const whatsappResult = await WhatsAppService.sendDeliveryConfirmation(whatsappData, feedbackUrl);

        if (whatsappResult.success) {
          whatsappSent = true;
        } else {
          whatsappError = whatsappResult.error || 'Errore nell\'invio WhatsApp';
        }
      } catch (error) {
        whatsappError = error instanceof Error ? error.message : 'Errore sconosciuto nell\'invio WhatsApp';
        // Non interrompiamo il processo per errori WhatsApp
      }
    }

    // Aggiorna il form con informazioni sull'invio della conferma
    await collection.updateOne(
      { _id: form._id },
      {
        $set: {
          deliveryConfirmationSent: true,
          deliveryConfirmationSentAt: new Date(),
          deliveryEmailId: emailResult.data.id,
          whatsappSent,
          whatsappError,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Email di conferma consegna inviata con successo',
      emailId: emailResult.data.id,
      whatsappSent,
      whatsappError,
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nell\'invio della conferma consegna' },
      { status: 500 }
    );
  }
});