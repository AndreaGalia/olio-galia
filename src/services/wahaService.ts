// services/wahaService.ts
import { getDatabase } from '@/lib/mongodb';

/**
 * WAHA WhatsApp Service
 * Servizio per inviare messaggi WhatsApp tramite WAHA (WhatsApp HTTP API)
 *
 * Features:
 * - Invio messaggi di testo
 * - Invio immagini con caption
 * - Invio documenti
 * - Check stato sessione
 * - Configurabile on/off da admin panel
 * - Supporto autenticazione API key (se WAHA_API_KEY è configurato)
 *
 * Environment Variables:
 * - WAHA_API_KEY (optional): API key per autenticare richieste a WAHA
 */

interface WahaTextMessage {
  session: string;
  chatId: string;
  text: string;
}

interface WahaImageMessage {
  session: string;
  chatId: string;
  file: {
    url: string;
    mimetype: string;
    filename: string;
  };
  caption?: string;
}

interface WahaDocumentMessage {
  session: string;
  chatId: string;
  file: {
    url: string;
    mimetype: string;
    filename: string;
  };
  caption?: string;
}

interface WahaSessionStatus {
  name: string;
  status: 'WORKING' | 'STOPPED' | 'FAILED' | 'SCAN_QR_CODE';
  config?: Record<string, unknown>;
}

interface WahaSettings {
  enabled: boolean;
  apiUrl: string;
  session: string;
  orderConfirmation: boolean;
  shippingUpdate: boolean;
  deliveryConfirmation: boolean;
  reviewRequest: boolean;
}

export class WahaService {
  private static readonly SETTINGS_COLLECTION = 'settings';
  private static readonly SETTINGS_KEY = 'whatsapp';

  /**
   * Ottieni configurazione WhatsApp da database
   */
  private static async getWhatsAppSettings(): Promise<WahaSettings | null> {
    try {
      const db = await getDatabase();
      const settings = await db.collection(this.SETTINGS_COLLECTION).findOne({
        key: this.SETTINGS_KEY
      });

      if (!settings?.value) {
        return null;
      }

      return settings.value as WahaSettings;
    } catch (error) {
      console.error('❌ [WAHA] Errore recupero settings:', error);
      return null;
    }
  }

  /**
   * Verifica se WhatsApp è abilitato e configurato correttamente
   */
  private static async isWhatsAppEnabled(): Promise<boolean> {
    const settings = await this.getWhatsAppSettings();

    if (!settings || !settings.enabled) {
      return false;
    }

    if (!settings.apiUrl || !settings.session) {
      console.warn('⚠️ [WAHA] WhatsApp enabled but missing API URL or session');
      return false;
    }

    return true;
  }

  /**
   * Formatta numero di telefono per WhatsApp
   * Converte +39 333 1234567 in 393331234567@c.us
   */
  private static formatPhoneNumber(phone: string): string {
    // Rimuovi spazi, trattini, parentesi
    let cleaned = phone.replace(/[\s\-()]/g, '');

    // Rimuovi il + se presente
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    // Aggiungi @c.us per WhatsApp
    return `${cleaned}@c.us`;
  }

  /**
   * Ottieni headers per richieste WAHA (con API key se configurata)
   */
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Aggiungi API key se presente nelle env
    const apiKey = process.env.WAHA_API_KEY;
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    return headers;
  }

  /**
   * Invia messaggio di testo via WhatsApp
   */
  static async sendTextMessage(
    phoneNumber: string,
    text: string,
    options?: { skipIfDisabled?: boolean }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isEnabled = await this.isWhatsAppEnabled();
      if (!isEnabled) {
        if (options?.skipIfDisabled !== false) {
          return { success: true }; // Non bloccare il flusso se disabilitato
        }
        return { success: false, error: 'WhatsApp notifications are disabled' };
      }

      const settings = await this.getWhatsAppSettings();
      if (!settings) {
        return { success: false, error: 'WhatsApp settings not found' };
      }

      const chatId = this.formatPhoneNumber(phoneNumber);

      const payload: WahaTextMessage = {
        session: settings.session,
        chatId,
        text
      };

      const response = await fetch(`${settings.apiUrl}/api/sendText`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ [WAHA] Send failed:', errorData);
        return {
          success: false,
          error: `WAHA API error: ${response.status} ${errorData}`
        };
      }

      await response.json();

      return { success: true };
    } catch (error) {
      console.error('❌ [WAHA] Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Invia immagine con caption via WhatsApp
   */
  static async sendImageMessage(
    phoneNumber: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isEnabled = await this.isWhatsAppEnabled();
      if (!isEnabled) {
        return { success: true }; // Non bloccare il flusso
      }

      const settings = await this.getWhatsAppSettings();
      if (!settings) {
        return { success: false, error: 'WhatsApp settings not found' };
      }

      const chatId = this.formatPhoneNumber(phoneNumber);

      const payload: WahaImageMessage = {
        session: settings.session,
        chatId,
        file: {
          url: imageUrl,
          mimetype: 'image/jpeg',
          filename: 'image.jpg'
        },
        caption
      };

      const response = await fetch(`${settings.apiUrl}/api/sendImage`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `WAHA API error: ${response.status} ${errorData}`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ [WAHA] Error sending WhatsApp image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Invia documento via WhatsApp
   */
  static async sendDocumentMessage(
    phoneNumber: string,
    documentUrl: string,
    filename: string,
    caption?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isEnabled = await this.isWhatsAppEnabled();
      if (!isEnabled) {
        return { success: true }; // Non bloccare il flusso
      }

      const settings = await this.getWhatsAppSettings();
      if (!settings) {
        return { success: false, error: 'WhatsApp settings not found' };
      }

      const chatId = this.formatPhoneNumber(phoneNumber);

      const payload: WahaDocumentMessage = {
        session: settings.session,
        chatId,
        file: {
          url: documentUrl,
          mimetype: 'application/pdf',
          filename
        },
        caption
      };

      const response = await fetch(`${settings.apiUrl}/api/sendFile`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `WAHA API error: ${response.status} ${errorData}`
        };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ [WAHA] Error sending WhatsApp document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verifica stato sessione WAHA
   */
  static async getSessionStatus(): Promise<WahaSessionStatus | null> {
    try {
      const settings = await this.getWhatsAppSettings();
      if (!settings || !settings.apiUrl || !settings.session) {
        return null;
      }

      const response = await fetch(
        `${settings.apiUrl}/api/sessions/${settings.session}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        console.error('❌ [WAHA] Failed to get session status');
        return null;
      }

      const status: WahaSessionStatus = await response.json();
      return status;
    } catch (error) {
      console.error('❌ [WAHA] Error checking session status:', error);
      return null;
    }
  }

  /**
   * Test invio messaggio (per admin panel)
   */
  static async testMessage(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    return this.sendTextMessage(
      phoneNumber,
      '🧪 Test message from Olio Galia\n\nWhatsApp integration is working correctly! ✅',
      { skipIfDisabled: false } // Forza invio anche se disabilitato per testing
    );
  }

  /**
   * Salva/aggiorna configurazione WhatsApp
   */
  static async saveWhatsAppSettings(settings: WahaSettings): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.SETTINGS_COLLECTION);

      const result = await collection.updateOne(
        { key: this.SETTINGS_KEY },
        {
          $set: {
            key: this.SETTINGS_KEY,
            value: settings,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      return result.acknowledged;
    } catch (error) {
      console.error('❌ [WAHA] Error saving WhatsApp settings:', error);
      return false;
    }
  }

  /**
   * Check se un tipo di notifica è abilitato
   */
  static async isNotificationTypeEnabled(type: keyof Omit<WahaSettings, 'enabled' | 'apiUrl' | 'session'>): Promise<boolean> {
    const settings = await this.getWhatsAppSettings();
    if (!settings || !settings.enabled) {
      return false;
    }
    return settings[type] === true;
  }
}

export default WahaService;
