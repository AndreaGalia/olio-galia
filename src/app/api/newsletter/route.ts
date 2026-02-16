// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/services/customerService';
import { EmailService } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validazione campo obbligatorio
    if (!email) {
      return NextResponse.json(
        { error: 'Email è obbligatoria' },
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
      source: 'newsletter',
    });

    // Invia email di benvenuto
    const emailSent = await EmailService.sendNewsletterWelcome({
      email,
    });

    if (!emailSent) {
      console.error('Failed to send newsletter welcome email to:', email);
      // Non blocchiamo l'iscrizione se l'email fallisce
    }

    return NextResponse.json({
      success: true,
      message: 'Iscrizione completata con successo! Controlla la tua email.',
      customerId,
      emailSent,
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
