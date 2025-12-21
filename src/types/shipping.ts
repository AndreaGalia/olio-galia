// Types per il sistema di spedizione con zone geografiche

/**
 * Zone di spedizione disponibili
 */
export type ShippingZone = 'italia' | 'europa' | 'america' | 'mondo';

/**
 * Configurazione zona di spedizione
 * Usata per mapping e visualizzazione UI
 */
export interface ZoneConfig {
  id: ShippingZone;
  name: {
    it: string;
    en: string;
  };
  description: {
    it: string;
    en: string;
  };
  countries: string[]; // Lista codici ISO paesi inclusi
  stripeRateId: string; // ID Shipping Rate Stripe
  estimatedDeliveryDays: {
    min: number;
    max: number;
  };
}

/**
 * Mapping zone → paesi (mantenuto per riferimento futuro)
 * Usato per validazione indirizzi Stripe
 */
export const ZONE_COUNTRIES: Record<ShippingZone, string[]> = {
  italia: ['IT'],
  europa: [
    // Unione Europea
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    // Altri paesi europei
    'GB', 'CH', 'NO', 'IS', 'AL', 'AD', 'BY', 'BA', 'FO', 'GI',
    'GL', 'LI', 'MK', 'MD', 'MC', 'ME', 'RS', 'SM', 'UA', 'VA'
  ],
  america: [
    // Nord America
    'US', 'CA', 'MX',
    // Centro America
    'BZ', 'CR', 'SV', 'GT', 'HN', 'NI', 'PA',
    // Sud America
    'AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE',
    // Caraibi
    'BS', 'BB', 'CU', 'DM', 'DO', 'GD', 'HT', 'JM', 'TT'
  ],
  mondo: [] // Tutti gli altri paesi non inclusi sopra
};
