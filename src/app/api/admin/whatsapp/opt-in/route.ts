import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { WahaService } from '@/services/wahaService';

/**
 * GET /api/admin/whatsapp/opt-in
 * Ottieni lista di tutti i numeri con opt-in WhatsApp attivo
 */
export const GET = withAuth(async () => {
  try {
    const optInList = await WahaService.getOptInList();

    return NextResponse.json({
      success: true,
      data: optInList,
      total: optInList.length
    });
  } catch (error) {
    console.error('[WhatsApp Opt-In] Error getting list:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero della lista opt-in' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/whatsapp/opt-in
 * Abilita opt-in WhatsApp per un numero di telefono
 *
 * Body: { phoneNumber: string, collection?: 'customers' | 'orders' | 'forms' }
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { phoneNumber, collection = 'customers' } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Numero di telefono mancante' },
        { status: 400 }
      );
    }

    const success = await WahaService.setWhatsAppOptIn(phoneNumber, collection);

    if (!success) {
      return NextResponse.json(
        { error: 'Nessun record trovato o aggiornato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Opt-in WhatsApp abilitato per ${phoneNumber}`,
      phoneNumber,
      collection
    });
  } catch (error) {
    console.error('[WhatsApp Opt-In] Error enabling:', error);
    return NextResponse.json(
      { error: 'Errore nell\'abilitazione opt-in' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/admin/whatsapp/opt-in
 * Disabilita opt-in WhatsApp per un numero di telefono
 *
 * Body: { phoneNumber: string, collection?: 'customers' | 'orders' | 'forms' }
 */
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { phoneNumber, collection = 'customers' } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Numero di telefono mancante' },
        { status: 400 }
      );
    }

    const success = await WahaService.removeWhatsAppOptIn(phoneNumber, collection);

    if (!success) {
      return NextResponse.json(
        { error: 'Nessun record trovato o aggiornato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Opt-in WhatsApp disabilitato per ${phoneNumber}`,
      phoneNumber,
      collection
    });
  } catch (error) {
    console.error('[WhatsApp Opt-In] Error disabling:', error);
    return NextResponse.json(
      { error: 'Errore nella rimozione opt-in' },
      { status: 500 }
    );
  }
});
