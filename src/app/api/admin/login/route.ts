import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/services/adminService';
import { signJWT, getCookieOptions } from '@/lib/auth/jwt';

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

    // Crea la response con i dati dell'utente
    const response = NextResponse.json({
      success: true,
      message: 'Login effettuato con successo',
      user: {
        id: admin._id!.toString(),
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });

    // Imposta il cookie nella response usando le opzioni centralizzate
    response.cookies.set('admin-token', token, getCookieOptions());

    return response;

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}