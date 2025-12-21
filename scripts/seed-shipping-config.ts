/**
 * Script di seed per la configurazione spedizioni
 *
 * Questo script popola MongoDB con la configurazione spedizioni iniziale.
 * Utilizza i valori di default del vecchio sistema hardcoded.
 *
 * ESECUZIONE:
 * npx ts-node --project tsconfig.json scripts/seed-shipping-config.ts
 *
 * NOTA: Questo script crea la configurazione SOLO se non esiste già.
 * Se esiste già una configurazione attiva, lo script termina senza modifiche.
 */

import { connectToDatabase } from '../src/lib/mongodb';
import { ShippingConfigDocument, WeightTier, ItalyShippingConfig, WeightBasedShippingCost } from '../src/types/shippingConfig';
import { ShippingZone } from '../src/types/shipping';

// ===== CONFIGURAZIONE DI DEFAULT =====

const DEFAULT_WEIGHT_TIERS: WeightTier[] = [
  {
    minGrams: 0,
    maxGrams: 1000,
    label: { it: '0-1 kg', en: '0-1 kg' },
  },
  {
    minGrams: 1001,
    maxGrams: 3000,
    label: { it: '1-3 kg', en: '1-3 kg' },
  },
  {
    minGrams: 3001,
    maxGrams: 5000,
    label: { it: '3-5 kg', en: '3-5 kg' },
  },
  {
    minGrams: 5001,
    maxGrams: 10000,
    label: { it: '5-10 kg', en: '5-10 kg' },
  },
  {
    minGrams: 10001,
    maxGrams: Infinity,
    label: { it: 'Oltre 10 kg', en: 'Over 10 kg' },
  },
];

const DEFAULT_ITALY_CONFIG: ItalyShippingConfig = {
  freeThreshold: 150.0, // Euro
  standardCost: 590, // Centesimi (5.90€)
  stripeRateId: process.env.STRIPE_SHIPPING_RATE_ITALIA || '',
  freeStripeRateId: process.env.STRIPE_SHIPPING_RATE_ITALIA_FREE || '',
};

const DEFAULT_WEIGHT_BASED_COSTS: WeightBasedShippingCost[] = [
  // ===== EUROPA =====
  {
    zone: 'europa' as ShippingZone,
    tier: 0,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_EUROPA_0_1KG || '',
    displayPrice: 890, // 8.90€
  },
  {
    zone: 'europa' as ShippingZone,
    tier: 1,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_EUROPA_1_3KG || '',
    displayPrice: 1290, // 12.90€
  },
  {
    zone: 'europa' as ShippingZone,
    tier: 2,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_EUROPA_3_5KG || '',
    displayPrice: 1690, // 16.90€
  },
  {
    zone: 'europa' as ShippingZone,
    tier: 3,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_EUROPA_5_10KG || '',
    displayPrice: 2490, // 24.90€
  },
  {
    zone: 'europa' as ShippingZone,
    tier: 4,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_EUROPA_10KG_PLUS || '',
    displayPrice: 3990, // 39.90€
  },

  // ===== AMERICA =====
  {
    zone: 'america' as ShippingZone,
    tier: 0,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_AMERICA_0_1KG || '',
    displayPrice: 2500, // 25.00€
  },
  {
    zone: 'america' as ShippingZone,
    tier: 1,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_AMERICA_1_3KG || '',
    displayPrice: 3500, // 35.00€
  },
  {
    zone: 'america' as ShippingZone,
    tier: 2,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_AMERICA_3_5KG || '',
    displayPrice: 4500, // 45.00€
  },
  {
    zone: 'america' as ShippingZone,
    tier: 3,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_AMERICA_5_10KG || '',
    displayPrice: 6500, // 65.00€
  },
  {
    zone: 'america' as ShippingZone,
    tier: 4,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_AMERICA_10KG_PLUS || '',
    displayPrice: 9900, // 99.00€
  },

  // ===== MONDO =====
  {
    zone: 'mondo' as ShippingZone,
    tier: 0,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_MONDO_0_1KG || '',
    displayPrice: 3000, // 30.00€
  },
  {
    zone: 'mondo' as ShippingZone,
    tier: 1,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_MONDO_1_3KG || '',
    displayPrice: 4500, // 45.00€
  },
  {
    zone: 'mondo' as ShippingZone,
    tier: 2,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_MONDO_3_5KG || '',
    displayPrice: 6000, // 60.00€
  },
  {
    zone: 'mondo' as ShippingZone,
    tier: 3,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_MONDO_5_10KG || '',
    displayPrice: 8500, // 85.00€
  },
  {
    zone: 'mondo' as ShippingZone,
    tier: 4,
    stripeRateId: process.env.STRIPE_SHIPPING_RATE_MONDO_10KG_PLUS || '',
    displayPrice: 12900, // 129.00€
  },
];

// ===== FUNZIONE SEED =====

async function seedShippingConfig() {
  try {
    console.log('[Seed] Connessione a MongoDB...');
    const { db } = await connectToDatabase();

    const collection = db.collection<ShippingConfigDocument>('shipping_config');

    // Verifica se esiste già una configurazione attiva
    const existingConfig = await collection.findOne({ 'metadata.isActive': true });

    if (existingConfig) {
      console.log('[Seed] ⚠️  Configurazione spedizioni già esistente. Seed non necessario.');
      console.log('[Seed] Se vuoi modificare la configurazione, usa l\'Admin Panel: /admin/shipping-config');
      return;
    }

    console.log('[Seed] Creazione configurazione spedizioni di default...');

    // Crea documento configurazione
    const configDocument: ShippingConfigDocument = {
      weightTiers: DEFAULT_WEIGHT_TIERS,
      italyConfig: DEFAULT_ITALY_CONFIG,
      weightBasedCosts: DEFAULT_WEIGHT_BASED_COSTS,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        version: 1,
      },
    };

    // Inserisci nel database
    const result = await collection.insertOne(configDocument);

    console.log('[Seed] ✅ Configurazione spedizioni creata con successo!');
    console.log(`[Seed] Document ID: ${result.insertedId}`);
    console.log('[Seed] Dettagli configurazione:');
    console.log(`  - Fasce peso: ${DEFAULT_WEIGHT_TIERS.length}`);
    console.log(`  - Soglia Italia gratis: €${DEFAULT_ITALY_CONFIG.freeThreshold}`);
    console.log(`  - Costo Italia standard: €${(DEFAULT_ITALY_CONFIG.standardCost / 100).toFixed(2)}`);
    console.log(`  - Configurazioni peso: ${DEFAULT_WEIGHT_BASED_COSTS.length} (3 zone × 5 fasce)`);

    // Validazione Stripe Rate IDs
    console.log('\n[Seed] Validazione Stripe Rate IDs:');
    const missingRates: string[] = [];

    if (!DEFAULT_ITALY_CONFIG.stripeRateId) missingRates.push('STRIPE_SHIPPING_RATE_ITALIA');
    if (!DEFAULT_ITALY_CONFIG.freeStripeRateId) missingRates.push('STRIPE_SHIPPING_RATE_ITALIA_FREE');

    DEFAULT_WEIGHT_BASED_COSTS.forEach((cost) => {
      if (!cost.stripeRateId) {
        const tierLabel = DEFAULT_WEIGHT_TIERS[cost.tier]?.label.it || `tier ${cost.tier}`;
        missingRates.push(`STRIPE_SHIPPING_RATE_${cost.zone.toUpperCase()}_${tierLabel.replace(/[^0-9]/g, '_')}`);
      }
    });

    if (missingRates.length > 0) {
      console.log('  ⚠️  ATTENZIONE: Le seguenti variabili d\'ambiente sono vuote:');
      missingRates.forEach((rate) => console.log(`     - ${rate}`));
      console.log('\n  Per configurare le Stripe Rates:');
      console.log('  1. Crea le shipping rates su Stripe Dashboard');
      console.log('  2. Copia gli ID (shr_xxx) in .env.local');
      console.log('  3. Aggiorna la configurazione dall\'Admin Panel: /admin/shipping-config');
    } else {
      console.log('  ✅ Tutti gli Stripe Rate IDs configurati correttamente');
    }

    console.log('\n[Seed] 🎉 Seed completato! Puoi modificare la configurazione su: /admin/shipping-config');
  } catch (error) {
    console.error('[Seed] ❌ Errore durante il seed:', error);
    throw error;
  }
}

// Esegui seed
seedShippingConfig()
  .then(() => {
    console.log('[Seed] Script completato');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Seed] Script fallito:', error);
    process.exit(1);
  });
