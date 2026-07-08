import { connectToDatabase } from '@/lib/mongodb';
import { PromotionDiscountType } from '@/types/promotionCampaign';

// Payload validato e normalizzato per creare/aggiornare una campagna
export interface CampaignInput {
  name: string;
  badgeLabel: { it: string; en: string };
  discountType: PromotionDiscountType;
  discountValue: number;
  productIds: string[];
  startDate: Date;
  endDate: Date;
  active: boolean;
}

type ValidationResult =
  | { input: CampaignInput; error?: undefined }
  | { input?: undefined; error: string };

// Valida il body di POST/PUT campagna. Verifica anche che tutti i
// productIds esistano nella collection products.
export async function validateCampaignInput(body: Record<string, unknown>): Promise<ValidationResult> {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return { error: 'Il nome della campagna è obbligatorio' };
  }

  const badgeLabel = body.badgeLabel as { it?: unknown; en?: unknown } | undefined;
  const badgeIt = typeof badgeLabel?.it === 'string' ? badgeLabel.it.trim() : '';
  const badgeEn = typeof badgeLabel?.en === 'string' ? badgeLabel.en.trim() : '';
  if (!badgeIt || !badgeEn) {
    return { error: 'Il testo del badge è obbligatorio in italiano e in inglese' };
  }

  const discountType = body.discountType;
  if (discountType !== 'percent' && discountType !== 'fixed') {
    return { error: 'Tipo di sconto non valido' };
  }

  const discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { error: 'Il valore dello sconto deve essere maggiore di zero' };
  }
  if (discountType === 'percent' && discountValue >= 100) {
    return { error: 'Lo sconto percentuale deve essere inferiore al 100%' };
  }

  if (
    !Array.isArray(body.productIds) ||
    body.productIds.length === 0 ||
    !body.productIds.every((id: unknown) => typeof id === 'string' && id.length > 0)
  ) {
    return { error: 'Seleziona almeno un prodotto' };
  }
  const productIds = [...new Set(body.productIds as string[])];

  const startDate = new Date(body.startDate as string);
  const endDate = new Date(body.endDate as string);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: 'Date di inizio/fine non valide' };
  }
  if (endDate <= startDate) {
    return { error: 'La data di fine deve essere successiva alla data di inizio' };
  }

  const { db } = await connectToDatabase();
  const found = await db
    .collection('products')
    .find({ id: { $in: productIds } }, { projection: { id: 1 } })
    .toArray();

  if (found.length !== productIds.length) {
    const foundIds = new Set(found.map(product => product.id));
    const missing = productIds.filter(id => !foundIds.has(id));
    return { error: `Prodotti non trovati: ${missing.join(', ')}` };
  }

  return {
    input: {
      name,
      badgeLabel: { it: badgeIt, en: badgeEn },
      discountType,
      discountValue,
      productIds,
      startDate,
      endDate,
      active: body.active !== false,
    },
  };
}
