import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { WahaService } from '@/services/wahaService';

/**
 * POST /api/admin/whatsapp/opt-in/batch
 * Abilita opt-in WhatsApp per una lista di numeri di telefono
 *
 * Body: {
 *   phoneNumbers: string[],
 *   collection?: 'customers' | 'orders' | 'forms'
 * }
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { phoneNumbers, collection = 'customers' } = body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return NextResponse.json(
        { error: 'Lista numeri di telefono mancante o non valida' },
        { status: 400 }
      );
    }

    if (phoneNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Lista numeri vuota' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      details: [] as Array<{ phone: string; success: boolean; error?: string }>
    };

    // Processa ogni numero
    for (const phoneNumber of phoneNumbers) {
      try {
        const success = await WahaService.setWhatsAppOptIn(phoneNumber, collection);

        if (success) {
          results.success++;
          results.details.push({ phone: phoneNumber, success: true });
        } else {
          results.failed++;
          results.details.push({
            phone: phoneNumber,
            success: false,
            error: 'Numero non trovato nel database'
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          phone: phoneNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processati ${phoneNumbers.length} numeri: ${results.success} abilitati, ${results.failed} falliti`,
      results
    });
  } catch (error) {
    console.error('[WhatsApp Opt-In Batch] Error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'abilitazione batch' },
      { status: 500 }
    );
  }
});
