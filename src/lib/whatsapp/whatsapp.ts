// lib/whatsapp/whatsapp.ts
import {
  WhatsAppOrderData,
  WhatsAppQuoteData,
  WhatsAppShippingData,
  WhatsAppDeliveryData,
  WhatsAppNewsletterData,
  WhatsAppSendResult,
} from '@/types/whatsapp';
import { validatePhoneNumber } from './phone-validator';
import {
  createOrderWhatsAppMessage,
  createQuoteWhatsAppMessage,
  createShippingWhatsAppMessage,
  createDeliveryWhatsAppMessage,
  createNewsletterWelcomeWhatsAppMessage
} from './message-templates';

// Configurazione Meta Cloud API (WhatsApp Business API)
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';
const META_PHONE_NUMBER_ID = process.env.META_WHATSAPP_PHONE_NUMBER_ID; // ID del numero WhatsApp Business
const META_ACCESS_TOKEN = process.env.META_WHATSAPP_ACCESS_TOKEN; // Token permanente
const META_API_VERSION = process.env.META_WHATSAPP_API_VERSION || 'v21.0'; // Versione API Graph

/**
 * Servizio centralizzato per l'invio di messaggi WhatsApp
 * Utilizza Meta Cloud API (WhatsApp Business API)
 *
 * 🎁 Include 1000 messaggi GRATUITI al mese!
 */
export class WhatsAppService {
  /**
   * Verifica se il servizio WhatsApp è configurato correttamente
   */
  private static isConfigured(): boolean {
    return !!(
      WHATSAPP_ENABLED &&
      META_PHONE_NUMBER_ID &&
      META_ACCESS_TOKEN
    );
  }

  /**
   * Invia un messaggio WhatsApp generico tramite Meta Cloud API
   * @param to - Numero di telefono destinatario (formato E.164)
   * @param message - Testo del messaggio
   * @returns Risultato dell'invio
   */
  private static async sendMessage(
    to: string,
    message: string
  ): Promise<WhatsAppSendResult> {
    // Verifica configurazione
    if (!this.isConfigured()) {
      console.warn('[WhatsApp] Servizio non configurato o disabilitato');
      return {
        success: false,
        error: 'Servizio WhatsApp non configurato',
        errorCode: 'NOT_CONFIGURED',
      };
    }

    try {
      // Validazione numero di telefono
      const validation = validatePhoneNumber(to);
      if (!validation.isValid) {
        console.warn(`[WhatsApp] Numero non valido: ${to}`, validation.error);
        return {
          success: false,
          error: validation.error || 'Numero di telefono non valido',
          errorCode: 'INVALID_PHONE',
        };
      }

      // Meta Cloud API richiede numero senza '+' (solo cifre)
      const formattedTo = validation.formattedNumber!.replace('+', '');

      // Endpoint Meta Cloud API
      const url = `https://graph.facebook.com/${META_API_VERSION}/${META_PHONE_NUMBER_ID}/messages`;

      // Payload per invio messaggio testo
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedTo,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      };

      console.log(`[WhatsApp] Invio messaggio a ${validation.formattedNumber} via Meta Cloud API`);

      // Chiamata API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Verifica successo
      if (!response.ok) {
        console.error('[WhatsApp] Errore Meta Cloud API:', data);
        return {
          success: false,
          error: data.error?.message || 'Errore nell\'invio del messaggio',
          errorCode: `META_${data.error?.code || 'UNKNOWN'}`,
        };
      }

      // Successo
      const messageId = data.messages?.[0]?.id;
      console.log(`[WhatsApp] Messaggio inviato con successo. Message ID: ${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      console.error('[WhatsApp] Errore nell\'invio del messaggio:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Invia conferma ordine via WhatsApp
   * @param orderData - Dati dell'ordine
   * @returns Risultato dell'invio
   */
  static async sendOrderConfirmation(
    orderData: WhatsAppOrderData
  ): Promise<WhatsAppSendResult> {
    try {
      const message = createOrderWhatsAppMessage(orderData);
      return await this.sendMessage(orderData.customerPhone, message);
    } catch (error) {
      console.error('[WhatsApp] Errore nella creazione del messaggio ordine:', error);
      return {
        success: false,
        error: 'Errore nella creazione del messaggio',
        errorCode: 'MESSAGE_CREATION_ERROR',
      };
    }
  }

  /**
   * Invia preventivo via WhatsApp
   * @param quoteData - Dati del preventivo
   * @returns Risultato dell'invio
   */
  static async sendQuote(
    quoteData: WhatsAppQuoteData
  ): Promise<WhatsAppSendResult> {
    try {
      const message = createQuoteWhatsAppMessage(quoteData);
      return await this.sendMessage(quoteData.customerPhone, message);
    } catch (error) {
      console.error('[WhatsApp] Errore nella creazione del messaggio preventivo:', error);
      return {
        success: false,
        error: 'Errore nella creazione del messaggio',
        errorCode: 'MESSAGE_CREATION_ERROR',
      };
    }
  }

  /**
   * Invia notifica spedizione via WhatsApp
   * @param shippingData - Dati della spedizione
   * @returns Risultato dell'invio
   */
  static async sendShippingNotification(
    shippingData: WhatsAppShippingData
  ): Promise<WhatsAppSendResult> {
    try {
      const message = createShippingWhatsAppMessage(shippingData);
      return await this.sendMessage(shippingData.customerPhone, message);
    } catch (error) {
      console.error('[WhatsApp] Errore nella creazione del messaggio spedizione:', error);
      return {
        success: false,
        error: 'Errore nella creazione del messaggio',
        errorCode: 'MESSAGE_CREATION_ERROR',
      };
    }
  }

  /**
   * Invia conferma consegna via WhatsApp
   * @param deliveryData - Dati della consegna
   * @returns Risultato dell'invio
   */
  static async sendDeliveryConfirmation(
    deliveryData: WhatsAppDeliveryData
  ): Promise<WhatsAppSendResult> {
    try {
      const message = createDeliveryWhatsAppMessage(deliveryData);
      return await this.sendMessage(deliveryData.customerPhone, message);
    } catch (error) {
      console.error('[WhatsApp] Errore nella creazione del messaggio consegna:', error);
      return {
        success: false,
        error: 'Errore nella creazione del messaggio',
        errorCode: 'MESSAGE_CREATION_ERROR',
      };
    }
  }

  /**
   * Invia messaggio di benvenuto newsletter via WhatsApp
   * @param newsletterData - Dati iscrizione newsletter
   * @returns Risultato dell'invio
   */
  static async sendNewsletterWelcome(
    newsletterData: WhatsAppNewsletterData
  ): Promise<WhatsAppSendResult> {
    try {
      const message = createNewsletterWelcomeWhatsAppMessage(newsletterData);
      return await this.sendMessage(newsletterData.customerPhone, message);
    } catch (error) {
      console.error('[WhatsApp] Errore nella creazione del messaggio newsletter:', error);
      return {
        success: false,
        error: 'Errore nella creazione del messaggio',
        errorCode: 'MESSAGE_CREATION_ERROR',
      };
    }
  }

  /**
   * Verifica lo stato di configurazione del servizio (per debug/admin)
   */
  static getConfigStatus(): {
    isConfigured: boolean;
    isEnabled: boolean;
    hasPhoneNumberId: boolean;
    hasAccessToken: boolean;
    apiVersion: string;
  } {
    return {
      isConfigured: this.isConfigured(),
      isEnabled: WHATSAPP_ENABLED,
      hasPhoneNumberId: !!META_PHONE_NUMBER_ID,
      hasAccessToken: !!META_ACCESS_TOKEN,
      apiVersion: META_API_VERSION,
    };
  }
}
