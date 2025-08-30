// app/api/products/translations/[locale]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;
    
    // Valida la lingua supportata
    if (!['it', 'en'].includes(locale)) {
      return NextResponse.json(
        { error: 'Unsupported locale' },
        { status: 400 }
      );
    }
    
    // Importa dinamicamente le traduzioni
    const translations = await import(`@/data/products/translations/${locale}.json`);
    
    return NextResponse.json(translations.default);
  } catch (error) {
    console.error(`Error loading translations for locale:`, error);
    return NextResponse.json(
      { error: `Failed to load translations` },
      { status: 500 }
    );
  }
}