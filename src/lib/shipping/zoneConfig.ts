// Configurazione delle zone di spedizione
import { ShippingZone, ZoneConfig } from '@/types/shipping';

/**
 * Configurazione completa delle zone di spedizione
 * Include traduzioni, descrizioni, paesi e mapping con Stripe Shipping Rates
 */
export const SHIPPING_ZONES: Record<ShippingZone, ZoneConfig> = {
  italia: {
    id: 'italia',
    name: {
      it: 'Italia',
      en: 'Italy'
    },
    description: {
      it: 'Spedizione nazionale in Italia',
      en: 'National shipping in Italy'
    },
    countries: ['IT'],
    stripeRateId: process.env.NEXT_PUBLIC_STRIPE_SHIPPING_RATE_ITALIA || '',
    estimatedDeliveryDays: {
      min: 2,
      max: 4
    }
  },

  europa: {
    id: 'europa',
    name: {
      it: 'Europa',
      en: 'Europe'
    },
    description: {
      it: 'Spedizione in tutti i paesi europei',
      en: 'Shipping to all European countries'
    },
    countries: [
      // Unione Europea
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
      // Altri paesi europei
      'GB', 'CH', 'NO', 'IS', 'AL', 'AD', 'BY', 'BA', 'FO', 'GI',
      'GL', 'LI', 'MK', 'MD', 'MC', 'ME', 'RS', 'SM', 'UA', 'VA'
    ],
    stripeRateId: process.env.NEXT_PUBLIC_STRIPE_SHIPPING_RATE_EUROPA || '',
    estimatedDeliveryDays: {
      min: 3,
      max: 7
    }
  },

  america: {
    id: 'america',
    name: {
      it: 'America',
      en: 'Americas'
    },
    description: {
      it: 'Spedizione in Nord, Centro e Sud America',
      en: 'Shipping to North, Central and South America'
    },
    countries: [
      // Nord America
      'US', 'CA', 'MX',
      // Centro America
      'BZ', 'CR', 'SV', 'GT', 'HN', 'NI', 'PA',
      // Sud America
      'AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE',
      // Caraibi
      'BS', 'BB', 'CU', 'DM', 'DO', 'GD', 'HT', 'JM', 'TT'
    ],
    stripeRateId: process.env.NEXT_PUBLIC_STRIPE_SHIPPING_RATE_AMERICA || '',
    estimatedDeliveryDays: {
      min: 7,
      max: 14
    }
  },

  mondo: {
    id: 'mondo',
    name: {
      it: 'Resto del Mondo',
      en: 'Rest of World'
    },
    description: {
      it: 'Spedizione internazionale in tutto il mondo',
      en: 'International shipping worldwide'
    },
    countries: [], // Tutti i paesi non inclusi nelle altre zone
    stripeRateId: process.env.NEXT_PUBLIC_STRIPE_SHIPPING_RATE_MONDO || '',
    estimatedDeliveryDays: {
      min: 10,
      max: 21
    }
  }
};

/**
 * Ottiene la configurazione di una zona specifica
 */
export function getZoneConfig(zone: ShippingZone): ZoneConfig {
  return SHIPPING_ZONES[zone];
}

/**
 * Ottiene tutte le zone disponibili come array
 */
export function getAllZones(): ZoneConfig[] {
  return Object.values(SHIPPING_ZONES);
}

/**
 * Ottiene lo Stripe Shipping Rate ID per una zona
 * Lato server: usa le variabili d'ambiente server-side
 */
export function getStripeRateIdServer(zone: ShippingZone): string {
  const rateMap = {
    italia: process.env.STRIPE_SHIPPING_RATE_ITALIA,
    europa: process.env.STRIPE_SHIPPING_RATE_EUROPA,
    america: process.env.STRIPE_SHIPPING_RATE_AMERICA,
    mondo: process.env.STRIPE_SHIPPING_RATE_MONDO,
  };

  const rateId = rateMap[zone];

  if (!rateId) {
    throw new Error(`Shipping Rate ID non configurato per zona: ${zone}`);
  }

  return rateId;
}

/**
 * Valida che tutti gli Shipping Rate ID siano configurati
 * Da usare all'avvio dell'app o in fase di build
 */
export function validateShippingRateConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  const zones: ShippingZone[] = ['italia', 'europa', 'america', 'mondo'];

  for (const zone of zones) {
    try {
      getStripeRateIdServer(zone);
    } catch {
      missing.push(zone);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}
