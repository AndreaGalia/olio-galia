import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { AdminService } from '@/services/adminService';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Recupera i dettagli aggiornati dall'admin
    const admin = await AdminService.getAdminById(currentUser.userId);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: admin._id!.toString(),
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });

  } catch (error) {
    console.error('Errore recupero profilo admin:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}