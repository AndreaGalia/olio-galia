import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { PointOfSaleService } from '@/services/pointOfSaleService';

// GET - Lista punti vendita per admin (inattivi inclusi su richiesta)
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    const pointsOfSale = await PointOfSaleService.getAllAdmin({
      includeInactive: searchParams.get('includeInactive') === 'true',
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
    });

    return NextResponse.json({ success: true, pointsOfSale });
  } catch (error) {
    console.error('Error fetching points of sale for admin:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei punti vendita' },
      { status: 500 }
    );
  }
});

// POST - Crea un nuovo punto vendita
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, categoryId, address, coordinates, productIds, notesIT, notesEN, displayOrder } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Il nome del punto vendita è obbligatorio' }, { status: 400 });
    }
    if (!categoryId?.trim()) {
      return NextResponse.json({ error: 'La categoria è obbligatoria' }, { status: 400 });
    }
    if (!address?.city?.trim()) {
      return NextResponse.json({ error: 'La città è obbligatoria' }, { status: 400 });
    }
    if (!PointOfSaleService.isValidCoordinates(coordinates)) {
      return NextResponse.json(
        { error: 'Coordinate non valide: latitudine tra -90 e 90, longitudine tra -180 e 180' },
        { status: 400 }
      );
    }

    const id = await PointOfSaleService.create({
      name,
      categoryId,
      address,
      coordinates,
      productIds,
      notesIT,
      notesEN,
      displayOrder,
    });

    return NextResponse.json({
      success: true,
      id,
      message: 'Punto vendita creato con successo',
    });
  } catch (error) {
    console.error('Error creating point of sale:', error);
    const message = error instanceof Error ? error.message : 'Errore nella creazione del punto vendita';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
