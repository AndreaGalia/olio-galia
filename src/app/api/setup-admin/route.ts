import { NextResponse } from 'next/server';
import { AdminService } from '@/services/adminService';

// IMPORTANTE: Questo endpoint dovrebbe essere protetto o rimosso dopo l'uso!
// Aggiungi un token segreto per proteggerlo
export async function POST(request: Request) {
  try {
    // Protezione con token segreto
    const { token, email, password } = await request.json();

    if (token !== process.env.SETUP_ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Token non autorizzato' },
        { status: 401 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password richiesti' },
        { status: 400 }
      );
    }

    console.log('🔐 Creazione admin...');

    const adminId = await AdminService.createAdmin(email, password);

    return NextResponse.json({
      success: true,
      message: 'Admin creato con successo',
      adminId,
      email
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('già esistente')) {
      return NextResponse.json(
        { error: 'Admin già esistente' },
        { status: 409 }
      );
    }

    console.error('❌ Errore:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione admin' },
      { status: 500 }
    );
  }
}
