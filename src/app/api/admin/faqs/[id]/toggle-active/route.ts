import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { FAQService } from '@/services/faqService';

// POST - Toggle attiva/disattiva FAQ
export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const newActiveState = await FAQService.toggleFAQActive(id);

    return NextResponse.json({
      success: true,
      isActive: newActiveState,
      message: `FAQ ${newActiveState ? 'attivata' : 'disattivata'} con successo`,
    });
  } catch (error: any) {
    console.error('Error toggling FAQ active:', error);
    if (error.message === 'FAQ non trovata') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Errore nella modifica dello stato della FAQ' },
      { status: 500 }
    );
  }
});
