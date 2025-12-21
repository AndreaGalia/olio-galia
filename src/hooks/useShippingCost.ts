import { useMemo } from 'react';
import { ShippingZone } from '@/types/shipping';
import {
  getShippingCostForZoneAndWeight,
  getItalyShippingCost,
} from '@/lib/shipping/weightConfig';
import { useShippingConfig } from '@/contexts/ShippingConfigContext';

export interface ShippingCostInfo {
  zone: ShippingZone | null;
  cost: number; // Costo in centesimi
  costEur: number; // Costo in Euro (cost / 100)
  isFree: boolean; // true se spedizione gratuita
  tierLabel: string; // Label fascia peso (es. "1-3 kg") o "Gratis"/"Standard"
  errorMessage?: string; // Messaggio errore se calcolo fallisce
}

/**
 * Hook per calcolare il costo di spedizione in base a zona, peso e totale carrello
 *
 * LOGICA:
 * - Italia: costo basato su totale € (gratis se >= soglia, altrimenti tariffa fissa)
 * - Europa/America/Mondo: costo basato su peso totale carrello (fasce peso)
 *
 * @param selectedZone - Zona di spedizione selezionata dall'utente
 * @param totalGrams - Peso totale carrello in grammi
 * @param totalEur - Totale carrello in Euro
 * @param hasAllWeights - true se tutti i prodotti hanno peso configurato
 * @param locale - Lingua per label tradotti ('it' | 'en')
 * @returns Informazioni sul costo di spedizione
 *
 * @example
 * const shippingCost = useShippingCost(
 *   selectedZone,
 *   totalGrams,
 *   total,
 *   hasAllWeights,
 *   locale
 * );
 *
 * if (shippingCost.errorMessage) {
 *   // Mostra errore
 * } else {
 *   // Mostra costo: {shippingCost.isFree ? 'GRATIS' : `€${shippingCost.costEur}`}
 * }
 */
export function useShippingCost(
  selectedZone: ShippingZone | null,
  totalGrams: number,
  totalEur: number,
  hasAllWeights: boolean,
  locale: 'it' | 'en' = 'it'
): ShippingCostInfo {
  // Recupera configurazione da context
  const { config, loading } = useShippingConfig();

  return useMemo(() => {
    // Configurazione in caricamento o non disponibile
    if (loading || !config) {
      return {
        zone: null,
        cost: 0,
        costEur: 0,
        isFree: false,
        tierLabel: '',
        errorMessage: loading
          ? (locale === 'it' ? 'Caricamento...' : 'Loading...')
          : (locale === 'it'
              ? 'Configurazione spedizioni non disponibile'
              : 'Shipping configuration not available'),
      };
    }

    // Nessuna zona selezionata
    if (!selectedZone) {
      return {
        zone: null,
        cost: 0,
        costEur: 0,
        isFree: false,
        tierLabel: '',
      };
    }

    // ===== ITALIA: basata su totale € (NON peso) =====
    if (selectedZone === 'italia') {
      const italyResult = getItalyShippingCost(totalEur, config.italyConfig);

      return {
        zone: 'italia',
        cost: italyResult.cost,
        costEur: italyResult.cost / 100,
        isFree: italyResult.isFree,
        tierLabel: italyResult.isFree
          ? (locale === 'it' ? 'Gratis' : 'Free')
          : (locale === 'it' ? 'Standard' : 'Standard'),
      };
    }

    // ===== EUROPA/AMERICA/MONDO: basata su peso =====

    // Verifica che tutti i prodotti abbiano peso
    if (!hasAllWeights) {
      return {
        zone: selectedZone,
        cost: 0,
        costEur: 0,
        isFree: false,
        tierLabel: '',
        errorMessage: locale === 'it'
          ? 'Alcuni prodotti non hanno peso configurato. Contattaci per un preventivo.'
          : 'Some products do not have weight configured. Contact us for a quote.',
      };
    }

    // Calcola fascia peso e costo
    const shippingConfig = getShippingCostForZoneAndWeight(selectedZone, totalGrams, config);

    if (!shippingConfig) {
      return {
        zone: selectedZone,
        cost: 0,
        costEur: 0,
        isFree: false,
        tierLabel: '',
        errorMessage: locale === 'it'
          ? 'Peso del carrello fuori range. Contattaci per un preventivo.'
          : 'Cart weight out of range. Contact us for a quote.',
      };
    }

    const tierLabel = config.weightTiers[shippingConfig.tier]?.label[locale] || '';

    return {
      zone: selectedZone,
      cost: shippingConfig.displayPrice,
      costEur: shippingConfig.displayPrice / 100,
      isFree: false,
      tierLabel,
    };
  }, [config, loading, selectedZone, totalGrams, totalEur, hasAllWeights, locale]);
}
