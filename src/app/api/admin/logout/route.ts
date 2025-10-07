import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/jwt';

export async function POST() {
  try {
    await clearAuthCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Logout effettuato con successo'
    });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore durante il logout' },
      { status: 500 }
    );
  }
}