import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { PointOfSaleService } from '@/services/pointOfSaleService';

// GET - Singolo punto vendita
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const pointOfSale = await PointOfSaleService.getById(id);

    if (!pointOfSale) {
      return NextResponse.json({ error: 'Punto vendita non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true, pointOfSale });
  } catch (error) {
    console.error('Error fetching point of sale:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del punto vendita' },
      { status: 500 }
    );
  }
});

// PUT - Aggiorna un punto vendita
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.coordinates !== undefined && !PointOfSaleService.isValidCoordinates(body.coordinates)) {
      return NextResponse.json(
        { error: 'Coordinate non valide: latitudine tra -90 e 90, longitudine tra -180 e 180' },
        { status: 400 }
      );
    }

    await PointOfSaleService.update(id, body);

    return NextResponse.json({
      success: true,
      message: 'Punto vendita aggiornato con successo',
    });
  } catch (error) {
    console.error('Error updating point of sale:', error);
    const message = error instanceof Error ? error.message : 'Errore nell\'aggiornamento del punto vendita';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});

// DELETE - Soft delete di un punto vendita
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await PointOfSaleService.softDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Punto vendita eliminato con successo',
    });
  } catch (error) {
    console.error('Error deleting point of sale:', error);
    const message = error instanceof Error ? error.message : 'Errore nell\'eliminazione del punto vendita';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
