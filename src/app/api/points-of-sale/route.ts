import { NextRequest, NextResponse } from 'next/server';
import { PointOfSaleService } from '@/services/pointOfSaleService';

// GET - Punti vendita e categorie attive, localizzati (pagina "Dove trovarci")
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localeParam = searchParams.get('locale');
    const locale: 'it' | 'en' = localeParam === 'en' ? 'en' : 'it';

    const data = await PointOfSaleService.getAllPublic(locale);

    return NextResponse.json(data, {
      headers: {
        // I punti vendita cambiano di rado: cache breve con revalidate in background
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching points of sale:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei punti vendita' },
      { status: 500 }
    );
  }
}
