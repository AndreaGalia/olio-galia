/**
 * TypeScript interfaces per la configurazione delle spedizioni salvata su MongoDB
 *
 * Questo file definisce la struttura dei documenti MongoDB per gestire
 * le fasce di peso, i costi di spedizione e le configurazioni Italia.
 */

import { ShippingZone } from './shipping';

/**
 * Fascia di peso configurabile
 *
 * Esempio: { minGrams: 0, maxGrams: 1000, label: { it: '0-1 kg', en: '0-1 kg' } }
 */
export interface WeightTier {
  minGrams: number;
  maxGrams: number; // Usa Infinity per "oltre Xkg"
  label: {
    it: string;
    en: string;
  };
}

/**
 * Configurazione costo spedizione per una specifica zona e fascia peso
 *
 * Collega zona geografica + fascia peso → Stripe Rate ID + costo display
 */
export interface WeightBasedShippingCost {
  zone: ShippingZone; // 'europa' | 'america' | 'mondo'
  tier: number; // Indice della fascia peso (0-indexed)
  stripeRateId: string; // ID Stripe Shipping Rate (es. 'shr_xxxxx')
  displayPrice: number; // Prezzo in centesimi per preview frontend (es. 1290 = €12.90)
}

/**
 * Configurazione spedizioni per l'Italia (logica separata: basata su totale carrello €)
 */
export interface ItalyShippingConfig {
  freeThreshold: number; // Soglia spedizione gratis in EUR (es. 150.00)
  standardCost: number; // Costo standard in centesimi (es. 590 = €5.90)
  stripeRateId: string; // Stripe Rate ID per spedizione standard (sotto soglia)
  freeStripeRateId: string; // Stripe Rate ID per spedizione gratis (sopra soglia)
}

/**
 * Documento MongoDB principale per la configurazione spedizioni
 *
 * Collection: shipping_config
 * Un solo documento attivo per volta (singleton pattern)
 */
export interface ShippingConfigDocument {
  _id?: string; // MongoDB ObjectId (opzionale in TypeScript)

  /**
   * Array delle fasce di peso globali
   * Valido per Europa, America, Mondo (NON per Italia)
   *
   * Esempio: [
   *   { minGrams: 0, maxGrams: 1000, label: { it: '0-1 kg', en: '0-1 kg' } },
   *   { minGrams: 1001, maxGrams: 3000, label: { it: '1-3 kg', en: '1-3 kg' } },
   *   ...
   * ]
   */
  weightTiers: WeightTier[];

  /**
   * Configurazione spedizioni Italia
   * Logica: gratis sopra soglia, costo fisso sotto soglia (peso NON influisce)
   */
  italyConfig: ItalyShippingConfig;

  /**
   * Array costi spedizione basati su peso per Europa/America/Mondo
   *
   * Esempio: [
   *   { zone: 'europa', tier: 0, stripeRateId: 'shr_xxxxx', displayPrice: 890 },
   *   { zone: 'europa', tier: 1, stripeRateId: 'shr_yyyyy', displayPrice: 1290 },
   *   { zone: 'america', tier: 0, stripeRateId: 'shr_zzzzz', displayPrice: 2500 },
   *   ...
   * ]
   */
  weightBasedCosts: WeightBasedShippingCost[];

  /**
   * Metadata del documento
   */
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean; // Solo un documento con isActive=true può esistere
    version: number; // Versione config per tracking modifiche (incrementato ad ogni update)
  };
}

/**
 * DTO per request API di aggiornamento configurazione
 * (usato in PUT /api/admin/shipping-config)
 */
export interface UpdateShippingConfigRequest {
  weightTiers: WeightTier[];
  italyConfig: ItalyShippingConfig;
  weightBasedCosts: WeightBasedShippingCost[];
}

/**
 * Response API per GET /api/admin/shipping-config
 */
export interface GetShippingConfigResponse {
  success: boolean;
  config: ShippingConfigDocument | null;
  error?: string;
}

/**
 * Response API per PUT /api/admin/shipping-config
 */
export interface UpdateShippingConfigResponse {
  success: boolean;
  message: string;
  config?: ShippingConfigDocument;
  error?: string;
}
