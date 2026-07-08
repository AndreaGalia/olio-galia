import { ObjectId } from 'mongodb';

// Tipo di sconto applicato dalla campagna
export type PromotionDiscountType = 'percent' | 'fixed';

// Documento MongoDB — collection `promotion_campaigns`
// La campagna si applica al prodotto intero: lo sconto viene propagato
// a runtime anche a tutte le sue varianti (nessuna granularità per variante).
export interface PromotionCampaignDocument {
  _id?: ObjectId;
  id: string;                              // slug interno, es. "saldi-estate-2026"
  name: string;                            // etichetta interna admin
  badgeLabel: { it: string; en: string };  // testo badge mostrato sul sito, es. "-15%", "SALDI ESTATE"
  discountType: PromotionDiscountType;
  discountValue: number;                   // percent: 15 (= -15%) — fixed: 5 (= -5.00€)
  productIds: string[];                    // id locali Mongo dei prodotti coinvolti (product.id, non stripeProductId)
  startDate: Date;
  endDate: Date;
  active: boolean;                         // toggle manuale admin, indipendente dalle date
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

// Campagna come restituita dalle API admin (date serializzate in JSON)
export interface PromotionCampaign extends Omit<PromotionCampaignDocument, '_id' | 'startDate' | 'endDate' | 'metadata'> {
  _id?: string;
  startDate: string;
  endDate: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

// Promozione risolta per un prodotto, calcolata a runtime e allegata al
// prodotto localizzato (mai salvata sul documento prodotto).
export interface ActivePromotion {
  campaignId: string;                      // PromotionCampaignDocument.id
  label: string;                           // badgeLabel già localizzato
  discountType: PromotionDiscountType;
  discountValue: number;
  endsAt: string;                          // ISO string — usato per il countdown del banner
}

// Una campagna è effettivamente attiva solo se il toggle admin è acceso
// E la data corrente è dentro la finestra startDate/endDate.
export function isPromotionCurrentlyActive(
  campaign: Pick<PromotionCampaignDocument, 'active' | 'startDate' | 'endDate'>,
  now: Date = new Date()
): boolean {
  return (
    campaign.active &&
    now >= new Date(campaign.startDate) &&
    now <= new Date(campaign.endDate)
  );
}
