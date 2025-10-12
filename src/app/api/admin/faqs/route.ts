import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { FAQService } from '@/services/faqService';

// GET - Ottiene tutte le FAQ (incluse non attive) per admin
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const faqs = await FAQService.getAllFAQsAdmin();

    return NextResponse.json({
      success: true,
      faqs,
    });
  } catch (error) {
    console.error('Error fetching FAQs for admin:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle FAQ' },
      { status: 500 }
    );
  }
});

// POST - Crea nuova FAQ
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      questionIT,
      answerIT,
      categoryIT,
      questionEN,
      answerEN,
      categoryEN,
      order,
    } = body;

    // Validazione campi obbligatori
    if (!questionIT || !answerIT || !categoryIT || !questionEN || !answerEN || !categoryEN) {
      return NextResponse.json(
        { error: 'Tutti i campi sono obbligatori (IT e EN)' },
        { status: 400 }
      );
    }

    const faqId = await FAQService.createFAQ({
      questionIT,
      answerIT,
      categoryIT,
      questionEN,
      answerEN,
      categoryEN,
      order,
    });

    return NextResponse.json({
      success: true,
      faqId,
      message: 'FAQ creata con successo',
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione della FAQ' },
      { status: 500 }
    );
  }
});
