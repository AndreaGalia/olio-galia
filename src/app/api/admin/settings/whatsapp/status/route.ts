import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { WahaService } from '@/services/wahaService';

/**
 * GET /api/admin/settings/whatsapp/status
 * Verifica stato sessione WAHA
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica che l'utente sia admin
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    // Ottieni stato sessione da WAHA
    const status = await WahaService.getSessionStatus();

    if (!status) {
      return NextResponse.json({
        connected: false,
        status: 'NOT_CONFIGURED',
        message: 'WAHA non configurato o non raggiungibile'
      });
    }

    return NextResponse.json({
      connected: status.status === 'WORKING',
      status: status.status,
      session: status.name,
      message: getStatusMessage(status.status)
    });
  } catch (error) {
    console.error('❌ [WhatsApp Status] Errore:', error);
    return NextResponse.json({
      connected: false,
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Errore nel recupero stato'
    });
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'WORKING':
      return 'WhatsApp connesso e funzionante';
    case 'SCAN_QR_CODE':
      return 'In attesa di scansione QR code';
    case 'FAILED':
      return 'Connessione fallita';
    case 'STOPPED':
      return 'Sessione fermata';
    default:
      return `Stato: ${status}`;
  }
}
