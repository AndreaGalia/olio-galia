import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { FAQService } from '@/services/faqService';

// GET - Ottiene una singola FAQ
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const faq = await FAQService.getFAQById(id);

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      faq,
    });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero della FAQ' },
      { status: 500 }
    );
  }
});

// PUT - Aggiorna una FAQ
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();

    await FAQService.updateFAQ(id, body);

    return NextResponse.json({
      success: true,
      message: 'FAQ aggiornata con successo',
    });
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    if (error.message === 'FAQ non trovata') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della FAQ' },
      { status: 500 }
    );
  }
});

// DELETE - Elimina una FAQ
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await FAQService.deleteFAQ(id);

    return NextResponse.json({
      success: true,
      message: 'FAQ eliminata con successo',
    });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    if (error.message === 'FAQ non trovata') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della FAQ' },
      { status: 500 }
    );
  }
});
