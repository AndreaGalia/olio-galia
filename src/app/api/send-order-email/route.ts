import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/resend';
import { EmailOrderData } from '@/types/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderData }: { orderData: EmailOrderData } = body;

    // Validazione base
    if (!orderData || !orderData.customerEmail || !orderData.orderNumber) {
      return NextResponse.json(
        { error: 'Dati ordine mancanti o incompleti' },
        { status: 400 }
      );
    }

    // Invio email
    const emailSent = await EmailService.sendOrderConfirmation(orderData);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Email di conferma inviata con successo'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Errore nell\'invio dell\'email'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    
    
    const message = error instanceof Error ? error.message : 'Errore interno del server';
    
    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}
