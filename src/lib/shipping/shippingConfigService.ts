/**
 * Service Layer per gestione configurazione spedizioni su MongoDB
 *
 * Questo service gestisce tutte le operazioni CRUD sulla collection shipping_config.
 * Pattern singleton: solo un documento attivo alla volta.
 */

import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import {
  ShippingConfigDocument,
  UpdateShippingConfigRequest,
  WeightTier,
  ItalyShippingConfig,
  WeightBasedShippingCost,
} from '@/types/shippingConfig';
import { ShippingZone } from '@/types/shipping';

const COLLECTION_NAME = 'shipping_config';

/**
 * Recupera la configurazione spedizioni attiva dal database
 *
 * @returns Configurazione attiva o null se non esiste
 */
export async function getActiveShippingConfig(): Promise<ShippingConfigDocument | null> {
  try {
    const { db } = await connectToDatabase();
    const config = await db
      .collection<ShippingConfigDocument>(COLLECTION_NAME)
      .findOne({ 'metadata.isActive': true });

    return config;
  } catch (error) {
    console.error('[ShippingConfigService] Errore recupero configurazione:', error);
    throw new Error('Impossibile recuperare configurazione spedizioni');
  }
}

/**
 * Crea la configurazione spedizioni iniziale (usato per seed/migration)
 *
 * IMPORTANTE: Questa funzione viene chiamata solo se non esiste alcuna configurazione.
 * I valori di default sono presi dal file weightConfig.ts originale.
 *
 * @param initialConfig Configurazione iniziale da inserire
 * @returns Documento inserito
 */
export async function createInitialShippingConfig(
  initialConfig: UpdateShippingConfigRequest
): Promise<ShippingConfigDocument> {
  try {
    const { db } = await connectToDatabase();

    // Verifica che non esista già una configurazione attiva
    const existingConfig = await db
      .collection<ShippingConfigDocument>(COLLECTION_NAME)
      .findOne({ 'metadata.isActive': true });

    if (existingConfig) {
      throw new Error('Configurazione spedizioni già esistente. Usa updateShippingConfig per modificarla.');
    }

    // Validazione dati
    validateShippingConfig(initialConfig);

    // Crea documento
    const document: Omit<ShippingConfigDocument, '_id'> = {
      weightTiers: initialConfig.weightTiers,
      italyConfig: initialConfig.italyConfig,
      weightBasedCosts: initialConfig.weightBasedCosts,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        version: 1,
      },
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(document);

    return {
      ...document,
      _id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error('[ShippingConfigService] Errore creazione configurazione:', error);
    throw error;
  }
}

/**
 * Aggiorna la configurazione spedizioni esistente
 *
 * Pattern: Disabilita il documento corrente e crea un nuovo documento attivo.
 * Questo mantiene uno storico delle modifiche (versioning).
 *
 * @param newConfig Nuova configurazione da salvare
 * @returns Documento aggiornato
 */
export async function updateShippingConfig(
  newConfig: UpdateShippingConfigRequest
): Promise<ShippingConfigDocument> {
  try {
    const { db } = await connectToDatabase();

    // Validazione dati
    validateShippingConfig(newConfig);

    // Recupera configurazione attuale
    const currentConfig = await db
      .collection<ShippingConfigDocument>(COLLECTION_NAME)
      .findOne({ 'metadata.isActive': true });

    if (!currentConfig) {
      // Se non esiste configurazione, creala
      return await createInitialShippingConfig(newConfig);
    }

    // Disabilita documento corrente (mantiene storico)
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(currentConfig._id) },
      {
        $set: {
          'metadata.isActive': false,
          'metadata.updatedAt': new Date(),
        },
      }
    );

    // Crea nuovo documento attivo
    const newDocument: Omit<ShippingConfigDocument, '_id'> = {
      weightTiers: newConfig.weightTiers,
      italyConfig: newConfig.italyConfig,
      weightBasedCosts: newConfig.weightBasedCosts,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        version: (currentConfig.metadata?.version || 0) + 1,
      },
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newDocument);

    return {
      ...newDocument,
      _id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error('[ShippingConfigService] Errore aggiornamento configurazione:', error);
    throw error;
  }
}

/**
 * Validazione completa della configurazione spedizioni
 *
 * Verifica:
 * - Weight tiers non vuoti e ordinati
 * - Italy config con valori validi
 * - Weight based costs coprono tutte le combinazioni zona+tier
 * - Stripe Rate IDs sono validi
 *
 * @param config Configurazione da validare
 * @throws Error se validazione fallisce
 */
function validateShippingConfig(config: UpdateShippingConfigRequest): void {
  // 1. Validazione Weight Tiers
  if (!config.weightTiers || config.weightTiers.length === 0) {
    throw new Error('weightTiers non può essere vuoto');
  }

  // Verifica ordinamento fasce peso
  for (let i = 0; i < config.weightTiers.length; i++) {
    const tier = config.weightTiers[i];

    if (tier.minGrams < 0 || tier.maxGrams <= 0) {
      throw new Error(`Fascia peso ${i}: minGrams e maxGrams devono essere > 0`);
    }

    if (tier.minGrams >= tier.maxGrams && tier.maxGrams !== Infinity) {
      throw new Error(`Fascia peso ${i}: minGrams deve essere < maxGrams`);
    }

    if (!tier.label?.it || !tier.label?.en) {
      throw new Error(`Fascia peso ${i}: label IT e EN obbligatorie`);
    }

    // Verifica continuità fasce (opzionale, ma raccomandato)
    if (i > 0) {
      const prevTier = config.weightTiers[i - 1];
      if (tier.minGrams !== prevTier.maxGrams + 1 && prevTier.maxGrams !== Infinity) {
        console.warn(
          `[Warning] Fascia peso ${i}: gap tra ${prevTier.maxGrams}g e ${tier.minGrams}g. ` +
            `Alcuni pesi potrebbero non avere fascia assegnata.`
        );
      }
    }
  }

  // 2. Validazione Italy Config
  if (!config.italyConfig) {
    throw new Error('italyConfig obbligatorio');
  }

  if (config.italyConfig.freeThreshold <= 0) {
    throw new Error('italyConfig.freeThreshold deve essere > 0');
  }

  if (config.italyConfig.standardCost < 0) {
    throw new Error('italyConfig.standardCost deve essere >= 0');
  }

  if (!config.italyConfig.stripeRateId || !config.italyConfig.stripeRateId.startsWith('shr_')) {
    throw new Error('italyConfig.stripeRateId non valido (deve iniziare con "shr_")');
  }

  if (!config.italyConfig.freeStripeRateId || !config.italyConfig.freeStripeRateId.startsWith('shr_')) {
    throw new Error('italyConfig.freeStripeRateId non valido (deve iniziare con "shr_")');
  }

  // 3. Validazione Weight Based Costs
  if (!config.weightBasedCosts || config.weightBasedCosts.length === 0) {
    throw new Error('weightBasedCosts non può essere vuoto');
  }

  const validZones: ShippingZone[] = ['europa', 'america', 'mondo'];
  const expectedCombinations = validZones.length * config.weightTiers.length;

  if (config.weightBasedCosts.length !== expectedCombinations) {
    throw new Error(
      `weightBasedCosts deve avere ${expectedCombinations} entries ` +
        `(${validZones.length} zone × ${config.weightTiers.length} fasce peso). ` +
        `Trovate: ${config.weightBasedCosts.length}`
    );
  }

  // Verifica che ogni combinazione zona+tier sia presente
  for (const zone of validZones) {
    for (let tierIndex = 0; tierIndex < config.weightTiers.length; tierIndex++) {
      const entry = config.weightBasedCosts.find(
        (cost) => cost.zone === zone && cost.tier === tierIndex
      );

      if (!entry) {
        throw new Error(`Manca configurazione costo per zona=${zone}, tier=${tierIndex}`);
      }

      if (!entry.stripeRateId || !entry.stripeRateId.startsWith('shr_')) {
        throw new Error(
          `stripeRateId non valido per zona=${zone}, tier=${tierIndex} (deve iniziare con "shr_")`
        );
      }

      if (entry.displayPrice < 0) {
        throw new Error(`displayPrice negativo per zona=${zone}, tier=${tierIndex}`);
      }
    }
  }
}

/**
 * Helper: Trova la fascia peso per un dato peso in grammi
 *
 * @param weightGrams Peso in grammi
 * @param tiers Array fasce peso
 * @returns Indice della fascia (0-indexed) o -1 se non trovata
 */
export function getWeightTierIndex(weightGrams: number, tiers: WeightTier[]): number {
  for (let i = 0; i < tiers.length; i++) {
    if (weightGrams >= tiers[i].minGrams && weightGrams <= tiers[i].maxGrams) {
      return i;
    }
  }
  return -1;
}

/**
 * Helper: Ottiene costo spedizione per zona e peso
 *
 * @param zone Zona di spedizione
 * @param weightGrams Peso in grammi
 * @param config Configurazione spedizioni
 * @returns Configurazione costo o null se non trovata
 */
export function getShippingCostForZoneAndWeight(
  zone: ShippingZone,
  weightGrams: number,
  config: ShippingConfigDocument
): WeightBasedShippingCost | null {
  // Trova fascia peso
  const tierIndex = getWeightTierIndex(weightGrams, config.weightTiers);
  if (tierIndex === -1) return null;

  // Trova configurazione costo
  const cost = config.weightBasedCosts.find(
    (c) => c.zone === zone && c.tier === tierIndex
  );

  return cost || null;
}

/**
 * Helper: Ottiene costo spedizione per l'Italia
 *
 * @param totalEur Totale carrello in EUR
 * @param config Configurazione spedizioni
 * @returns { cost: number, isFree: boolean, stripeRateId: string }
 */
export function getItalyShippingCost(
  totalEur: number,
  config: ShippingConfigDocument
): { cost: number; isFree: boolean; stripeRateId: string } {
  const isFree = totalEur >= config.italyConfig.freeThreshold;

  return {
    cost: isFree ? 0 : config.italyConfig.standardCost,
    isFree,
    stripeRateId: isFree
      ? config.italyConfig.freeStripeRateId
      : config.italyConfig.stripeRateId,
  };
}
