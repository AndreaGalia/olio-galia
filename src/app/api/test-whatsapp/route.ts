import { NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp/whatsapp';

export async function GET() {
  const status = WhatsAppService.getConfigStatus();

  if (!status.isConfigured) {
    return NextResponse.json({
      error: 'WhatsApp non configurato',
      status,
    }, { status: 500 });
  }

  return NextResponse.json({
    message: 'WhatsApp configurato correttamente! ✅',
    status,
  });
}

// Endpoint per test invio (rimuovi in produzione!)
export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Numero di telefono richiesto',
      }, { status: 400 });
    }

    // Test con messaggio personalizzato o default
    const testMessage = message || '🧪 Test messaggio da Olio Galia!\n\nSe ricevi questo, la configurazione funziona! ✅';

    // Usa il metodo pubblico sendOrderConfirmation per il test
    const result = await WhatsAppService.sendOrderConfirmation({
      customerName: 'Test Cliente',
      customerPhone: phoneNumber,
      orderNumber: 'TEST001',
      orderDate: new Date().toLocaleDateString('it-IT'),
      items: [
        {
          name: 'Test Prodotto',
          quantity: 1,
          price: 10.00,
        },
      ],
      total: 10.00,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    }, { status: 500 });
  }
}
