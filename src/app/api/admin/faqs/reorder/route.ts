import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { FAQService } from '@/services/faqService';

// POST - Riordina le FAQ
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: 'orderedIds deve essere un array' },
        { status: 400 }
      );
    }

    await FAQService.reorderFAQs(orderedIds);

    return NextResponse.json({
      success: true,
      message: 'FAQ riordinate con successo',
    });
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    return NextResponse.json(
      { error: 'Errore nel riordinamento delle FAQ' },
      { status: 500 }
    );
  }
});
