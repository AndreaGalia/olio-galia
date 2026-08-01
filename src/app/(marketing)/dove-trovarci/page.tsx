import { Suspense } from 'react';
import DoveTrovarciHero from '@/components/doveTrovarciPage/DoveTrovarciHero';
import PointOfSaleSection from '@/components/doveTrovarciPage/PointOfSaleSection';
import { StructuredData, generatePointsOfSaleSchema } from '@/lib/seo/structured-data';
import { PointOfSaleService } from '@/services/pointOfSaleService';

// I punti vendita cambiano di rado: pagina rigenerata al massimo ogni ora
export const revalidate = 3600;

export default async function DoveTrovarciPage() {
  // Lettura server-side usata solo per il JSON-LD: la lista visibile viene
  // caricata dal client, che conosce il locale attivo.
  let structuredData: object | null = null;

  try {
    const { pointsOfSale } = await PointOfSaleService.getAllPublic('it');
    if (pointsOfSale.length > 0) {
      structuredData = generatePointsOfSaleSchema(pointsOfSale, 'it');
    }
  } catch {
    // Un errore sul JSON-LD non deve impedire il rendering della pagina
  }

  return (
    <div className="min-h-screen bg-homepage-bg">
      {structuredData && <StructuredData data={structuredData} />}
      <DoveTrovarciHero />
      {/* PointOfSaleSection legge ?punto=<slug> con useSearchParams:
          Next richiede un boundary di Suspense per il prerender statico */}
      <Suspense fallback={null}>
        <PointOfSaleSection />
      </Suspense>
    </div>
  );
}
