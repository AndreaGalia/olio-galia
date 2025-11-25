// lib/whatsapp/whatsapp.ts
import {
  WhatsAppOrderData,
  WhatsAppQuoteData,
  WhatsAppShippingData,
  WhatsAppDeliveryData,
  WhatsAppNewsletterData,
  WhatsAppReviewRequestData,
  WhatsAppSendResult,
} from '@/types/whatsapp';
import { validatePhoneNumber } from './phone-validator';
import {
  createOrderWhatsAppMessage,
  createQuoteWhatsAppMessage,
  createShippingWhatsAppMessage,
  createDeliveryWhatsAppMessage,
  createNewsletterWelcomeWhatsAppMessage,
  createReviewRequestWhatsAppMessage
} from './message-templates';

// Configurazione generale WhatsApp
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER || 'meta'; // 'meta' o 'twilio'

// Configurazione Meta Cloud API (WhatsApp Business API)
const META_PHONE_NUMBER_ID = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
const META_ACCESS_TOKEN = process.env.META_WHATSAPP_ACCESS_TOKEN;
const META_API_VERSION = process.env.META_WHATSAPP_API_VERSION || 'v21.0';

// Configurazione Twilio
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

/**
 * Servizio centralizzato per l'invio di messaggi WhatsApp
 * Supporta due provider:
 * - Meta Cloud API (gratuito 1000 msg/mese, ma complesso)
 * - Twilio (a pagamento, semplice e affidabile)
 */
export class WhatsAppService {
  /**
   * Verifica se il servizio WhatsApp è configurato correttamente
   */
  private static isConfigured(): boolean {
    if (!WHATSAPP_ENABLED) return false;

    if (WHATSAPP_PROVIDER === 'twilio') {
      return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER);
    }

    // Default: Meta
    return !!(META_PHONE_NUMBER_ID && META_ACCESS_TOKEN);
  }

  /**
   * Invia un messaggio WhatsApp (routing automatico al provider configurato)
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

    // Routing al provider configurato
    if (WHATSAPP_PROVIDER === 'twilio') {
      return this.sendMessageWithTwilio(to, message);
    }

    // Default: Meta Cloud API
    return this.sendMessageWithMeta(to, message);
  }

  /**
   * Invia un messaggio WhatsApp tramite Twilio
   * @param to - Numero di telefono destinatario (formato E.164)
   * @param message - Testo del messaggio
   * @returns Risultato dell'invio
   */
  private static async sendMessageWithTwilio(
    to: string,
    message: string
  ): Promise<WhatsAppSendResult> {
    try {
      // Validazione numero di telefono
      const validation = validatePhoneNumber(to);
      if (!validation.isValid) {
        console.warn(`[WhatsApp/Twilio] Numero non valido: ${to}`, validation.error);
        return {
          success: false,
          error: validation.error || 'Numero di telefono non valido',
          errorCode: 'INVALID_PHONE',
        };
      }

      const formattedTo = validation.formattedNumber!; // Twilio usa formato E.164 con +

      // Import dinamico di Twilio (solo quando necessario)
      const twilio = (await import('twilio')).default;
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

      console.log(`[WhatsApp/Twilio] Invio messaggio a ${formattedTo}`);

      const twilioMessage = await client.messages.create({
        from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formattedTo}`,
        body: message,
      });

      console.log(`[WhatsApp/Twilio] Messaggio inviato con successo: ${twilioMessage.sid}`);

      return {
        success: true,
        messageId: twilioMessage.sid,
      };
    } catch (error: any) {
      console.error('[WhatsApp/Twilio] Errore nell\'invio del messaggio:', error);

      return {
        success: false,
        error: error?.message || 'Errore sconosciuto nell\'invio con Twilio',
        errorCode: error?.code || 'TWILIO_ERROR',
      };
    }
  }

  /**
   * Invia un messaggio WhatsApp tramite Meta Cloud API
   * @param to - Numero di telefono destinatario (formato E.164)
   * @param message - Testo del messaggio
   * @returns Risultato dell'invio
   */
  private static async sendMessageWithMeta(
    to: string,
    message: string
  ): Promise<WhatsAppSendResult> {
    try {
      // Validazione numero di telefono
      const validation = validatePhoneNumber(to);
      if (!validation.isValid) {
        console.warn(`[WhatsApp/Meta] Numero non valido: ${to}`, validation.error);
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

      console.log(`[WhatsApp/Meta] Invio messaggio a ${formattedTo}`);

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
        console.error('[WhatsApp/Meta] Errore Meta Cloud API:', data);
        return {
          success: false,
          error: data.error?.message || 'Errore nell\'invio del messaggio',
          errorCode: `META_${data.error?.code || 'UNKNOWN'}`,
        };
      }

      // Successo
      const messageId = data.messages?.[0]?.id;

      console.log(`[WhatsApp/Meta] Messaggio inviato con successo: ${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      console.error('[WhatsApp/Meta] Errore nell\'invio del messaggio:', error);

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
   * @param feedbackUrl - URL feedback opzionale con token JWT
   * @returns Risultato dell'invio
   */
  static async sendDeliveryConfirmation(
    deliveryData: WhatsAppDeliveryData,
    feedbackUrl?: string
  ): Promise<WhatsAppSendResult> {
    try {
      const message = createDeliveryWhatsAppMessage(deliveryData, feedbackUrl);
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
   * Invia richiesta recensione via WhatsApp
   * @param reviewData - Dati per richiesta recensione
   * @param feedbackUrl - URL feedback con token JWT
   * @returns Risultato dell'invio
   */
  static async sendReviewRequest(
    reviewData: WhatsAppReviewRequestData,
    feedbackUrl: string
  ): Promise<WhatsAppSendResult> {
    try {
      const message = createReviewRequestWhatsAppMessage(reviewData, feedbackUrl);
      return await this.sendMessage(reviewData.customerPhone, message);
    } catch (error) {
      console.error('[WhatsApp] Errore nella creazione del messaggio richiesta recensione:', error);
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
    provider: string;
    meta?: {
      hasPhoneNumberId: boolean;
      hasAccessToken: boolean;
      apiVersion: string;
    };
    twilio?: {
      hasAccountSid: boolean;
      hasAuthToken: boolean;
      hasWhatsAppNumber: boolean;
    };
  } {
    const status: any = {
      isConfigured: this.isConfigured(),
      isEnabled: WHATSAPP_ENABLED,
      provider: WHATSAPP_PROVIDER,
    };

    if (WHATSAPP_PROVIDER === 'twilio') {
      status.twilio = {
        hasAccountSid: !!TWILIO_ACCOUNT_SID,
        hasAuthToken: !!TWILIO_AUTH_TOKEN,
        hasWhatsAppNumber: !!TWILIO_WHATSAPP_NUMBER,
      };
    } else {
      status.meta = {
        hasPhoneNumberId: !!META_PHONE_NUMBER_ID,
        hasAccessToken: !!META_ACCESS_TOKEN,
        apiVersion: META_API_VERSION,
      };
    }

    return status;
  }
}
