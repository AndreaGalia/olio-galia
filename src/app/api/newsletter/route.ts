// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/services/customerService';
import { EmailService } from '@/lib/email/resend';
import { WhatsAppService } from '@/lib/whatsapp/whatsapp';
import { WhatsAppNewsletterData } from '@/types/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone } = body;

    // Validazione campi obbligatori
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, nome e cognome sono obbligatori' },
        { status: 400 }
      );
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato email non valido' },
        { status: 400 }
      );
    }

    // Verifica se email già esistente
    const existingCustomer = await CustomerService.getCustomerByEmail(email);
    if (existingCustomer) {
      // Se l'email esiste già, restituisci successo ma con messaggio diverso
      return NextResponse.json({
        success: true,
        message: 'Sei già iscritto alla nostra newsletter!',
        alreadySubscribed: true,
      });
    }

    // Crea nuovo cliente con source='newsletter'
    const customerId = await CustomerService.createCustomer({
      email,
      firstName,
      lastName,
      phone: phone || undefined,
      source: 'newsletter',
    });

    // Invia email di benvenuto
    const emailSent = await EmailService.sendNewsletterWelcome({
      firstName,
      lastName,
      email,
    });

    if (!emailSent) {
      console.error('Failed to send newsletter welcome email to:', email);
      // Non blocchiamo l'iscrizione se l'email fallisce
    }

    // Invia messaggio WhatsApp di benvenuto se abbiamo il numero di telefono
    let whatsappSent = false;
    let whatsappError = null;

    if (phone) {
      try {
        const whatsappData: WhatsAppNewsletterData = {
          firstName,
          lastName,
          customerPhone: phone,
        };

        const whatsappResult = await WhatsAppService.sendNewsletterWelcome(whatsappData);

        if (whatsappResult.success) {
          whatsappSent = true;
          console.log(`[WhatsApp] Benvenuto newsletter inviato con successo. Message ID: ${whatsappResult.messageId}`);
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

    return NextResponse.json({
      success: true,
      message: 'Iscrizione completata con successo! Controlla la tua email.',
      customerId,
      emailSent,
      whatsappSent,
      whatsappError,
    });

  } catch (error: any) {
    console.error('Newsletter subscription error:', error);

    // Gestione errori specifici
    if (error.message?.includes('esiste già')) {
      return NextResponse.json(
        { error: 'Sei già iscritto alla nostra newsletter' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Errore durante l\'iscrizione. Riprova più tardi.' },
      { status: 500 }
    );
  }
}
