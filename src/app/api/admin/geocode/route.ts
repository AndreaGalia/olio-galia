import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { GeocodeResult } from '@/types/pointOfSale';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Nominatim richiede uno User-Agent identificativo e impone un limite di 1
 * richiesta al secondo. Il proxy serve proprio a questo: imposta l'header
 * (il browser non lo permetterebbe), evita problemi di CORS e applica il
 * throttle. Essendo dietro withAuth il volume resta comunque minimo.
 */
const CONTACT_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.com';
const USER_AGENT = `OlioGalia-Admin/1.0 (${CONTACT_URL})`;

const MIN_INTERVAL_MS = 1100;
let lastRequestAt = 0;

async function throttle() {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestAt = Date.now();
}

// GET - Cerca le coordinate a partire da un indirizzo testuale
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
      return NextResponse.json(
        { error: 'Inserisci un indirizzo da cercare' },
        { status: 400 }
      );
    }

    await throttle();

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '5');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'it',
      },
      // Nominatim può essere lento: meglio fallire in fretta che bloccare la form
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Servizio di geocoding non disponibile. Inserisci le coordinate manualmente.' },
        { status: 502 }
      );
    }

    const raw = (await response.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    const results: GeocodeResult[] = raw
      .map(item => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
      }))
      .filter(item => Number.isFinite(item.lat) && Number.isFinite(item.lng));

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Nessun risultato trovato per questo indirizzo. Prova a semplificarlo o inserisci le coordinate manualmente.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return NextResponse.json(
      { error: 'Errore durante la ricerca dell\'indirizzo. Inserisci le coordinate manualmente.' },
      { status: 500 }
    );
  }
});
