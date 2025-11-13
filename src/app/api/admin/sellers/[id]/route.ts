import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { SellerService } from '@/services/sellerService';

// GET - Dettaglio venditore con statistiche e preventivi
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    const seller = await SellerService.getSellerById(id);

    if (!seller) {
      return NextResponse.json(
        { error: 'Venditore non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      seller
    });

  } catch (error) {
    console.error('Errore nel recupero del venditore:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del venditore' },
      { status: 500 }
    );
  }
});

// PUT - Aggiorna venditore
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, email, commissionPercentage } = body;

    // Validazione formato email se fornita
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Formato email non valido' },
          { status: 400 }
        );
      }
    }

    // Validazione percentuale se fornita
    if (commissionPercentage !== undefined) {
      if (typeof commissionPercentage !== 'number' || commissionPercentage < 0 || commissionPercentage > 100) {
        return NextResponse.json(
          { error: 'La percentuale deve essere un numero tra 0 e 100' },
          { status: 400 }
        );
      }
    }

    await SellerService.updateSeller(id, {
      name,
      phone,
      email,
      commissionPercentage
    });

    return NextResponse.json({
      success: true,
      message: 'Venditore aggiornato con successo'
    });

  } catch (error: any) {
    console.error('Errore nell\'aggiornamento del venditore:', error);

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
      { error: 'Errore nell\'aggiornamento del venditore' },
      { status: 500 }
    );
  }
});

// DELETE - Soft delete venditore (archivia)
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    await SellerService.deleteSeller(id);

    return NextResponse.json({
      success: true,
      message: 'Venditore archiviato con successo'
    });

  } catch (error) {
    console.error('Errore nell\'eliminazione del venditore:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del venditore' },
      { status: 500 }
    );
  }
});
