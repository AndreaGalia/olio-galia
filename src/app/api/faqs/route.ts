import { NextRequest, NextResponse } from 'next/server';
import { FAQService } from '@/services/faqService';

// GET - Ottiene tutte le FAQ attive
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') as 'it' | 'en' | null;

    const faqs = await FAQService.getAllFAQs(locale || 'it');

    return NextResponse.json({
      success: true,
      faqs,
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle FAQ' },
      { status: 500 }
    );
  }
}
