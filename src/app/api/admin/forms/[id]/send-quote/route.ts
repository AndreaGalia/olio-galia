import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';
import { createQuoteEmailHTML } from '@/lib/email/quote-template';
import { WhatsAppService } from '@/lib/whatsapp/whatsapp';
import { WhatsAppQuoteData } from '@/types/whatsapp';

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    // Verifica che la API key sia configurata
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
        { error: 'Preventivo non trovato' },
        { status: 404 }
      );
    }

    // Verifica che ci siano i prezzi finali
    if (!form.finalPricing) {
      return NextResponse.json(
        { error: 'I prezzi finali devono essere impostati prima di inviare il preventivo' },
        { status: 400 }
      );
    }

    // Recupera informazioni sui prodotti (già implementato in route.ts principale)
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const productsInfo = [];
    
    if (form.cart && Array.isArray(form.cart)) {
      for (const item of form.cart) {
        try {
          const product = await stripe.products.retrieve(item.id);
          
          // Usa il prezzo finale dal preventivo
          const finalPriceData = form.finalPricing.finalPrices.find((fp: any) => fp.productId === item.id);
          const finalPrice = finalPriceData ? finalPriceData.finalPrice : 0;
          
          productsInfo.push({
            name: product.name,
            quantity: item.quantity,
            unitPrice: finalPrice,
            totalPrice: finalPrice * item.quantity
          });
        } catch (error) {
          
          
          // Usa i dati del preventivo come fallback
          const finalPriceData = form.finalPricing.finalPrices.find((fp: any) => fp.productId === item.id);
          const finalPrice = finalPriceData ? finalPriceData.finalPrice : 0;
          
          productsInfo.push({
            name: `Prodotto ${item.id}`,
            quantity: item.quantity,
            unitPrice: finalPrice,
            totalPrice: finalPrice * item.quantity
          });
        }
      }
    }

    // Prepara i dati per l'email
    const quoteData = {
      customerName: `${form.firstName} ${form.lastName}`,
      orderId: form.orderId,
      items: productsInfo,
      subtotal: form.finalPricing.finalSubtotal,
      shipping: form.finalPricing.finalShipping,
      total: form.finalPricing.finalTotal,
      customerEmail: form.email,
      customerPhone: form.phone
    };

    

    // Genera il contenuto HTML dell'email
    const emailHTML = createQuoteEmailHTML(quoteData);

    // Invia l'email
    

    const emailResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Olio Galia <onboarding@resend.dev>',
      to: [form.email],
      // bcc: ['admin@olio-galia.it'], // Rimuovo BCC per ora
      subject: `Il tuo Preventivo #${form.orderId} - Olio Galia`,
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
        const whatsappData: WhatsAppQuoteData = {
          customerName: `${form.firstName} ${form.lastName}`,
          customerPhone: form.phone,
          quoteNumber: form.orderId,
          items: productsInfo.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
          subtotal: form.finalPricing.finalSubtotal,
          shipping: form.finalPricing.finalShipping,
          total: form.finalPricing.finalTotal,
        };

        const whatsappResult = await WhatsAppService.sendQuote(whatsappData);

        if (whatsappResult.success) {
          whatsappSent = true;
          console.log(`[WhatsApp] Preventivo inviato con successo. Message ID: ${whatsappResult.messageId}`);
        } else {
          whatsappError = whatsappResult.error || 'Errore nell\'invio WhatsApp';
          console.warn(`[WhatsApp] Errore nell'invio: ${whatsappError}`);
        }
      } catch (error) {
        whatsappError = error instanceof Error ? error.message : 'Errore sconosciuto nell\'invio WhatsApp';
        console.error('[WhatsApp] Errore:', whatsappError);
        // Non interrompiamo il processo per errori WhatsApp
      }
    }

    // Aggiorna il form con informazioni sull'invio
    await collection.updateOne(
      { _id: form._id },
      {
        $set: {
          quoteSent: true,
          quoteSentAt: new Date(),
          emailId: emailResult.data.id,
          whatsappSent,
          whatsappError,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Preventivo inviato con successo',
      emailId: emailResult.data.id,
      whatsappSent,
      whatsappError,
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nell\'invio del preventivo' },
      { status: 500 }
    );
  }
});