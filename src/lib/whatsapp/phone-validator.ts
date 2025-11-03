// lib/whatsapp/phone-validator.ts
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { PhoneValidationResult } from '@/types/whatsapp';

/**
 * Valida e formatta un numero di telefono per WhatsApp
 * @param phoneNumber - Numero di telefono da validare
 * @param defaultCountry - Paese di default (es. 'IT' per Italia)
 * @returns Risultato della validazione con numero formattato
 */
export function validatePhoneNumber(
  phoneNumber: string | undefined | null,
  defaultCountry: CountryCode = 'IT'
): PhoneValidationResult {
  // Controllo se il numero esiste
  if (!phoneNumber || phoneNumber.trim() === '') {
    return {
      isValid: false,
      error: 'Numero di telefono mancante',
    };
  }

  try {
    // Rimuovi spazi e caratteri speciali comuni
    const cleanedNumber = phoneNumber.trim();

    // Verifica validità base
    if (!isValidPhoneNumber(cleanedNumber, defaultCountry)) {
      return {
        isValid: false,
        error: 'Numero di telefono non valido',
      };
    }

    // Parsing completo del numero
    const parsed = parsePhoneNumber(cleanedNumber, defaultCountry);

    if (!parsed) {
      return {
        isValid: false,
        error: 'Impossibile analizzare il numero di telefono',
      };
    }

    // Verifica che sia un numero mobile (WhatsApp funziona solo su mobile)
    // Nota: questa verifica è opzionale, poiché alcuni numeri fissi possono avere WhatsApp Business
    const type = parsed.getType();
    if (type && type !== 'MOBILE' && type !== 'FIXED_LINE_OR_MOBILE') {
      console.warn(`[WhatsApp] Numero ${parsed.number} non è mobile (tipo: ${type}), ma procedo comunque`);
    }

    return {
      isValid: true,
      formattedNumber: parsed.format('E.164'), // Formato internazionale: +393331234567
      nationalNumber: parsed.formatNational(), // Formato nazionale: 333 123 4567
      countryCode: parsed.country,
    };
  } catch (error) {
    console.error('[WhatsApp] Errore nella validazione del numero:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto nella validazione',
    };
  }
}

/**
 * Verifica se un numero di telefono può ricevere messaggi WhatsApp
 * Nota: questa è solo una validazione del formato, non garantisce che il numero abbia WhatsApp
 * @param phoneNumber - Numero di telefono da verificare
 * @returns true se il numero è valido e potenzialmente raggiungibile su WhatsApp
 */
export function canReceiveWhatsApp(phoneNumber: string | undefined | null): boolean {
  const validation = validatePhoneNumber(phoneNumber);
  return validation.isValid;
}

/**
 * Formatta un numero di telefono per l'uso con Twilio WhatsApp
 * @param phoneNumber - Numero di telefono da formattare
 * @returns Numero formattato in formato E.164 o null se non valido
 */
export function formatForWhatsApp(phoneNumber: string | undefined | null): string | null {
  const validation = validatePhoneNumber(phoneNumber);
  return validation.isValid && validation.formattedNumber ? validation.formattedNumber : null;
}
