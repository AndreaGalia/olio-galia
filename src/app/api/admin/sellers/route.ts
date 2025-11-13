import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { SellerService } from '@/services/sellerService';

// GET - Lista venditori con paginazione, ricerca e sorting
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sortBy = (searchParams.get('sortBy') || 'totalSales') as 'name' | 'totalSales' | 'totalCommission' | 'totalUnpaid' | 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const result = await SellerService.getAllSellers(
      page,
      limit,
      search || undefined,
      sortBy,
      sortOrder,
      includeInactive
    );

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error('Errore nel recupero dei venditori:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei venditori' },
      { status: 500 }
    );
  }
});

// POST - Crea nuovo venditore
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, phone, email, commissionPercentage } = body;

    // Validazione campi obbligatori
    if (!name || !phone || !email || commissionPercentage === undefined) {
      return NextResponse.json(
        { error: 'Nome, telefono, email e percentuale commissione sono obbligatori' },
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

    // Validazione percentuale
    if (typeof commissionPercentage !== 'number' || commissionPercentage < 0 || commissionPercentage > 100) {
      return NextResponse.json(
        { error: 'La percentuale deve essere un numero tra 0 e 100' },
        { status: 400 }
      );
    }

    const sellerId = await SellerService.createSeller({
      name,
      phone,
      email,
      commissionPercentage
    });

    return NextResponse.json({
      success: true,
      sellerId,
      message: 'Venditore creato con successo',
    });

  } catch (error: any) {
    console.error('Errore nella creazione del venditore:', error);

    if (error.message?.includes('esiste già')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (error.message?.includes('percentuale')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nella creazione del venditore' },
      { status: 500 }
    );
  }
});
