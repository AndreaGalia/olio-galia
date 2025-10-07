import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET() {
  try {
    const db = await getDatabase();
    const settings = await db.collection('admin_settings').findOne({});

    // Se non esistono impostazioni, ritorna i valori di default
    if (!settings) {
      return NextResponse.json({
        torino_checkout_enabled: false
      });
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
    const { torino_checkout_enabled } = body;

    if (typeof torino_checkout_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'torino_checkout_enabled deve essere un boolean' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Aggiorna o crea le impostazioni
    const result = await db.collection('admin_settings').updateOne(
      {},
      {
        $set: {
          torino_checkout_enabled,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      torino_checkout_enabled
    });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento delle impostazioni' },
      { status: 500 }
    );
  }
}