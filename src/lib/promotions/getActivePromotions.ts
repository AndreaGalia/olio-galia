import { connectToDatabase } from '@/lib/mongodb';
import {
  PromotionCampaignDocument,
  ActivePromotion,
} from '@/types/promotionCampaign';
import { SupportedLocale } from '@/types/products';

type DiscountFields = Pick<PromotionCampaignDocument, 'discountType' | 'discountValue'>;

// Carica le campagne effettivamente attive in questo momento
// (toggle admin acceso E data corrente dentro la finestra startDate/endDate).
export async function getActivePromotionCampaigns(): Promise<PromotionCampaignDocument[]> {
  const { db } = await connectToDatabase();
  const now = new Date();

  return db
    .collection<PromotionCampaignDocument>('promotion_campaigns')
    .find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
    .toArray();
}

// Unica funzione di calcolo dello sconto, in centesimi — usata sia per i
// prezzi mostrati sul sito che per il unit_amount del checkout Stripe,
// così FE e pagamento non possono divergere.
export function getDiscountedUnitAmount(
  unitAmountCents: number,
  campaign: DiscountFields
): number {
  if (campaign.discountType === 'percent') {
    return Math.max(Math.round(unitAmountCents * (1 - campaign.discountValue / 100)), 0);
  }
  return Math.max(unitAmountCents - Math.round(campaign.discountValue * 100), 0);
}

// Prezzo stringa Mongo ("13.50") → prezzo scontato stringa ("11.48")
export function getDiscountedPriceString(price: string, campaign: DiscountFields): string {
  const parsed = parseFloat(price);
  if (isNaN(parsed)) {
    return price;
  }
  const cents = Math.round(parsed * 100);
  return (getDiscountedUnitAmount(cents, campaign) / 100).toFixed(2);
}

// Risolve la campagna da applicare a un prodotto. Se più campagne attive
// coprono lo stesso prodotto, vince quella con il prezzo finale più basso
// sul prezzo base (regola deterministica, favorevole al cliente).
export function resolveCampaignForProduct(
  campaigns: PromotionCampaignDocument[],
  productId: string,
  basePriceCents: number
): PromotionCampaignDocument | null {
  const covering = campaigns.filter(campaign => campaign.productIds.includes(productId));

  if (covering.length === 0) {
    return null;
  }

  return covering.reduce((best, candidate) =>
    getDiscountedUnitAmount(basePriceCents, candidate) < getDiscountedUnitAmount(basePriceCents, best)
      ? candidate
      : best
  );
}

// Converte la campagna nel payload localizzato allegato al prodotto per il FE.
export function toActivePromotion(
  campaign: PromotionCampaignDocument,
  locale: SupportedLocale
): ActivePromotion {
  return {
    campaignId: campaign.id,
    label: campaign.badgeLabel[locale] || campaign.badgeLabel.it,
    discountType: campaign.discountType,
    discountValue: campaign.discountValue,
    endsAt: new Date(campaign.endDate).toISOString(),
  };
}
