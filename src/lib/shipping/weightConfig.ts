/**
 * DEPRECATO: File legacy mantenuto per retrocompatibilità
 *
 * La configurazione spedizioni è ora gestita dinamicamente tramite MongoDB.
 * Vedi: src/lib/shipping/shippingConfigService.ts
 *
 * Questo file contiene solo funzioni helper che accettano la configurazione
 * come parametro invece di usare costanti statiche.
 */

import { ShippingZone } from '@/types/shipping';
import {
  WeightTier,
  WeightBasedShippingCost,
  ItalyShippingConfig,
  ShippingConfigDocument,
} from '@/types/shippingConfig';

// Re-export delle interfacce per retrocompatibilità
export type { WeightTier, WeightBasedShippingCost, ItalyShippingConfig };

/**
 * NOTA: Le configurazioni WEIGHT_TIERS, ITALY_SHIPPING_CONFIG e WEIGHT_BASED_SHIPPING
 * sono state rimosse da questo file.
 *
 * Ora vengono lette dinamicamente da MongoDB tramite shippingConfigService.
 * Per modificare la configurazione, usa l'Admin Panel: /admin/shipping-config
 */

// ===== HELPER FUNCTIONS (DEPRECATED - USE shippingConfigService.ts) =====

/**
 * DEPRECATO: Usa getWeightTierIndex da shippingConfigService.ts
 *
 * Determina l'index della fascia peso per un dato peso totale in grammi
 *
 * @param totalGrams - Peso totale del carrello in grammi
 * @param weightTiers - Array fasce peso da configurazione MongoDB
 * @returns Index della fascia, oppure -1 se peso fuori range
 */
export function getWeightTier(totalGrams: number, weightTiers: WeightTier[]): number {
  return weightTiers.findIndex((tier) =>
    totalGrams >= tier.minGrams && totalGrams <= tier.maxGrams
  );
}

/**
 * DEPRECATO: Usa getShippingCostForZoneAndWeight da shippingConfigService.ts
 *
 * Ottiene la configurazione di spedizione per una zona e peso specifici
 *
 * @param zone - Zona di spedizione
 * @param totalGrams - Peso totale del carrello in grammi
 * @param config - Configurazione spedizioni da MongoDB
 * @returns Configurazione spedizione con Stripe Rate ID e prezzo, oppure null
 */
export function getShippingCostForZoneAndWeight(
  zone: ShippingZone,
  totalGrams: number,
  config: ShippingConfigDocument
): WeightBasedShippingCost | null {
  const tierIndex = getWeightTier(totalGrams, config.weightTiers);

  if (tierIndex === -1) {
    return null; // Peso fuori range
  }

  return (
    config.weightBasedCosts.find(
      (cost) => cost.zone === zone && cost.tier === tierIndex
    ) || null
  );
}

/**
 * DEPRECATO: Usa getItalyShippingCost da shippingConfigService.ts
 *
 * Calcola il costo di spedizione per l'Italia basato sul totale del carrello in €
 *
 * @param totalEur - Totale del carrello in Euro
 * @param italyConfig - Configurazione Italia da MongoDB
 * @returns Oggetto con flag isFree, costo in centesimi e Stripe Rate ID
 */
export function getItalyShippingCost(
  totalEur: number,
  italyConfig: ItalyShippingConfig
): {
  isFree: boolean;
  cost: number;
  stripeRateId: string;
} {
  const isFree = totalEur >= italyConfig.freeThreshold;

  return {
    isFree,
    cost: isFree ? 0 : italyConfig.standardCost,
    stripeRateId: isFree ? italyConfig.freeStripeRateId : italyConfig.stripeRateId,
  };
}

/**
 * Ottiene il label tradotto per una fascia peso
 *
 * @param tierIndex - Index della fascia
 * @param locale - Lingua ('it' | 'en')
 * @param weightTiers - Array fasce peso da configurazione MongoDB
 * @returns Label tradotto, oppure stringa vuota se tierIndex non valido
 */
export function getWeightTierLabel(
  tierIndex: number,
  locale: 'it' | 'en',
  weightTiers: WeightTier[]
): string {
  const tier = weightTiers[tierIndex];
  return tier ? tier.label[locale] : '';
}
