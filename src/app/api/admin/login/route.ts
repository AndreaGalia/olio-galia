import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/services/adminService';
import { signJWT, setAuthCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validazione base
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono richiesti' },
        { status: 400 }
      );
    }

    // Tentativo di login
    const admin = await AdminService.loginAdmin({ email, password });
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Genera JWT
    const token = await signJWT({
      userId: admin._id!.toString(),
      email: admin.email,
      role: admin.role,
    });

    // Imposta il cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Login effettuato con successo',
      user: {
        id: admin._id!.toString(),
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });

  } catch (error) {
    console.error('Errore login admin:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}