import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verifica che l'utente sia admin
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const db = await getDatabase();
    const settings = await db.collection('admin_settings').findOne({});

    // Se non esistono impostazioni, ritorna i valori di default
    if (!settings) {
      return NextResponse.json({
        torino_checkout_enabled: false,
        stripe_enabled: true, // Default: Stripe abilitato
        whatsapp: {
          enabled: false,
          apiUrl: '',
          session: 'olio-galia',
          orderConfirmation: true,
          shippingUpdate: true,
          deliveryConfirmation: true,
          reviewRequest: true
        }
      });
    }

    // Assicura che esista la sezione whatsapp anche se il documento è vecchio
    if (!settings.whatsapp) {
      settings.whatsapp = {
        enabled: false,
        apiUrl: '',
        session: 'olio-galia',
        orderConfirmation: true,
        shippingUpdate: true,
        deliveryConfirmation: true,
        reviewRequest: true
      };
    }

    // Assicura che esista stripe_enabled (default true per compatibilità)
    if (settings.stripe_enabled === undefined) {
      settings.stripe_enabled = true;
    }

    return NextResponse.json(settings);
  } catch (error) {

    return NextResponse.json(
      { error: 'Errore nel recupero delle impostazioni' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verifica che l'utente sia admin
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const body = await request.json();
    const { torino_checkout_enabled, stripe_enabled, whatsapp } = body;

    // Validazione
    if (torino_checkout_enabled !== undefined && typeof torino_checkout_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'torino_checkout_enabled deve essere un boolean' },
        { status: 400 }
      );
    }

    if (stripe_enabled !== undefined && typeof stripe_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'stripe_enabled deve essere un boolean' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Prepara l'oggetto di update
    const updateData: any = {
      updated_at: new Date()
    };

    if (torino_checkout_enabled !== undefined) {
      updateData.torino_checkout_enabled = torino_checkout_enabled;
    }

    if (stripe_enabled !== undefined) {
      updateData.stripe_enabled = stripe_enabled;
    }

    if (whatsapp !== undefined) {
      updateData.whatsapp = whatsapp;
    }

    // Aggiorna o crea le impostazioni
    await db.collection('admin_settings').updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    );

    // Inoltre, salva le impostazioni WhatsApp nella collection 'settings'
    // per compatibilità con WahaService che cerca lì
    if (whatsapp !== undefined) {
      await db.collection('settings').updateOne(
        { key: 'whatsapp' },
        {
          $set: {
            key: 'whatsapp',
            value: whatsapp,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      torino_checkout_enabled,
      stripe_enabled,
      whatsapp
    });
  } catch (error) {

    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento delle impostazioni' },
      { status: 500 }
    );
  }
}