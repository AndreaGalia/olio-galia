import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from './jwt';

export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Token mancante o non valido' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Accesso negato' },
        { status: 403 }
      );
    }

    // Aggiungi le informazioni utente all'header per le API
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.userId);
    response.headers.set('x-user-email', user.email);
    response.headers.set('x-user-role', user.role);
    
    return null; // Tutto OK, continua
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore di autenticazione' },
      { status: 401 }
    );
  }
}

export function withAuth<T extends [NextRequest, ...any[]]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const [request] = args;
    
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }
    
    return handler(...args);
  };
}