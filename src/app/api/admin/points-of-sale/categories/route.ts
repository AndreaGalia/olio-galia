import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { PointOfSaleService } from '@/services/pointOfSaleService';

// Nota: in Next.js i segmenti statici hanno precedenza su quelli dinamici,
// quindi questa rotta vince su /api/admin/points-of-sale/[id].

// GET - Lista categorie punti vendita con conteggio associazioni
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') !== 'false';

    const categories = await PointOfSaleService.getCategoriesAdmin(includeInactive);

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching point of sale categories:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle categorie' },
      { status: 500 }
    );
  }
});

// POST - Crea una nuova categoria
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { nameIT, nameEN, descriptionIT, descriptionEN, icon, displayOrder } = body;

    if (!nameIT?.trim() || !nameEN?.trim()) {
      return NextResponse.json(
        { error: 'Il nome della categoria è obbligatorio in italiano e in inglese' },
        { status: 400 }
      );
    }

    const id = await PointOfSaleService.createCategory({
      nameIT,
      nameEN,
      descriptionIT,
      descriptionEN,
      icon,
      displayOrder,
    });

    return NextResponse.json({
      success: true,
      id,
      message: 'Categoria creata con successo',
    });
  } catch (error) {
    console.error('Error creating point of sale category:', error);
    const message = error instanceof Error ? error.message : 'Errore nella creazione della categoria';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
