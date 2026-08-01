import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { PointOfSaleService } from '@/services/pointOfSaleService';

// PUT - Aggiorna una categoria
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  try {
    const { categoryId } = await params;
    const body = await request.json();

    await PointOfSaleService.updateCategory(categoryId, body);

    return NextResponse.json({
      success: true,
      message: 'Categoria aggiornata con successo',
    });
  } catch (error) {
    console.error('Error updating point of sale category:', error);
    const message = error instanceof Error ? error.message : 'Errore nell\'aggiornamento della categoria';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});

// DELETE - Elimina una categoria (bloccata se ha punti vendita associati)
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  try {
    const { categoryId } = await params;
    await PointOfSaleService.deleteCategory(categoryId);

    return NextResponse.json({
      success: true,
      message: 'Categoria eliminata con successo',
    });
  } catch (error) {
    console.error('Error deleting point of sale category:', error);
    const message = error instanceof Error ? error.message : 'Errore nell\'eliminazione della categoria';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
