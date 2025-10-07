import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { CustomerService } from '@/services/customerService';

// GET - Lista clienti con paginazione, ricerca e sorting
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'name' | 'totalOrders' | 'totalSpent' | 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const result = await CustomerService.getAllCustomers(
      page,
      limit,
      search || undefined,
      sortBy,
      sortOrder
    );

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero dei clienti' },
      { status: 500 }
    );
  }
});

// POST - Crea nuovo cliente manualmente
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, address } = body;

    // Validazione campi obbligatori
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, nome e cognome sono obbligatori' },
        { status: 400 }
      );
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato email non valido' },
        { status: 400 }
      );
    }

    const customerId = await CustomerService.createCustomer({
      email,
      firstName,
      lastName,
      phone,
      address,
    });

    return NextResponse.json({
      success: true,
      customerId,
      message: 'Cliente creato con successo',
    });

  } catch (error: any) {
    if (error.message?.includes('esiste già')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nella creazione del cliente' },
      { status: 500 }
    );
  }
});
