import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const settings = await db.collection('admin_settings').findOne({});

    // Ritorna solo le impostazioni pubbliche necessarie al frontend
    return NextResponse.json({
      torino_checkout_enabled: settings?.torino_checkout_enabled || false
    });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nel recupero delle impostazioni' },
      { status: 500 }
    );
  }
}