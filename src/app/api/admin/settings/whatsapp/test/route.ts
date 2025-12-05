import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { WahaService } from '@/services/wahaService';
import { WhatsAppTemplates } from '@/lib/whatsapp/templates';

/**
 * POST /api/admin/settings/whatsapp/test
 * Test invio messaggio WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica che l'utente sia admin
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Numero di telefono richiesto' },
        { status: 400 }
      );
    }

    // Invia messaggio di test
    const testMessage = WhatsAppTemplates.testMessage();
    const result = await WahaService.sendTextMessage(phoneNumber, testMessage, {
      skipIfDisabled: false // Forza invio anche se disabilitato
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Messaggio di test inviato con successo!'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Errore nell\'invio del messaggio'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ [Test WhatsApp] Errore:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}
