// lib/whatsapp/templates.ts

/**
 * Template messaggi WhatsApp per Olio Galia
 * Messaggi personalizzati per notifiche automatiche
 *
 * Supporta template custom da database con placeholder dinamici
 */

import { getDatabase } from '@/lib/mongodb';
import { DEFAULT_TEMPLATES, type WhatsAppTemplates as WhatsAppTemplatesType } from '@/types/whatsapp';

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  total: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

interface ShippingUpdateData {
  orderId: string;
  customerName: string;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
}

interface DeliveryConfirmationData {
  orderId: string;
  customerName: string;
  type: 'order' | 'quote';
}

interface ReviewRequestData {
  orderId: string;
  customerName: string;
  feedbackUrl: string;
  type: 'order' | 'quote';
}

interface QuoteConfirmationData {
  quoteId: string;
  customerName: string;
  total: number;
  currency: string;
  description?: string;
}

export class WhatsAppTemplates {
  /**
   * Carica template personalizzati dal database
   */
  private static async getCustomTemplates(): Promise<WhatsAppTemplatesType | null> {
    try {
      const db = await getDatabase();
      const settings = await db.collection('admin_settings').findOne({});

      if (settings?.whatsapp?.templates) {
        return settings.whatsapp.templates;
      }

      return null;
    } catch (error) {
      console.error('[Templates] Error loading custom templates:', error);
      return null;
    }
  }

  /**
   * Sostituisce placeholder nel template
   */
  private static replacePlaceholders(template: string, placeholders: Record<string, string>): string {
    let result = template;

    Object.entries(placeholders).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });

    return result;
  }

  /**
   * Template: Conferma ordine ricevuto
   */
  static async orderConfirmation(data: OrderConfirmationData): Promise<string> {
    const customTemplates = await this.getCustomTemplates();
    const template = customTemplates?.orderConfirmation || DEFAULT_TEMPLATES.orderConfirmation;

    const itemsList = data.items
      .map(item => `• ${item.name} x${item.quantity}`)
      .join('\n');

    return this.replacePlaceholders(template, {
      customerName: data.customerName,
      orderId: data.orderId,
      total: this.formatPrice(data.total, data.currency),
      items: itemsList
    });
  }

  /**
   * Template: Aggiornamento spedizione
   */
  static async shippingUpdate(data: ShippingUpdateData): Promise<string> {
    const customTemplates = await this.getCustomTemplates();
    const template = customTemplates?.shippingUpdate || DEFAULT_TEMPLATES.shippingUpdate;

    return this.replacePlaceholders(template, {
      customerName: data.customerName,
      orderId: data.orderId,
      carrier: data.carrier || 'Corriere Espresso',
      trackingNumber: data.trackingNumber || 'N/D'
    });
  }

  /**
   * Template: Conferma consegna completata
   */
  static async deliveryConfirmation(data: DeliveryConfirmationData): Promise<string> {
    const customTemplates = await this.getCustomTemplates();
    const template = customTemplates?.deliveryConfirmation || DEFAULT_TEMPLATES.deliveryConfirmation;

    return this.replacePlaceholders(template, {
      customerName: data.customerName,
      orderId: data.orderId
    });
  }

  /**
   * Template: Richiesta recensione
   */
  static async reviewRequest(data: ReviewRequestData): Promise<string> {
    const customTemplates = await this.getCustomTemplates();
    const template = customTemplates?.reviewRequest || DEFAULT_TEMPLATES.reviewRequest;

    return this.replacePlaceholders(template, {
      customerName: data.customerName,
      orderId: data.orderId,
      feedbackUrl: data.feedbackUrl
    });
  }

  /**
   * Template: Conferma preventivo
   */
  static quoteConfirmation(data: QuoteConfirmationData): string {
    let message = `✅ *Preventivo confermato!*

Ciao ${data.customerName},

Il tuo preventivo *#${data.quoteId}* è stato confermato! 🎉

💰 *Totale:* ${this.formatPrice(data.total, data.currency)}

`;

    if (data.description) {
      message += `📝 *Dettagli:*\n${data.description}\n\n`;
    }

    message += `Procediamo con la preparazione del tuo ordine.

📞 Ti contatteremo a breve per organizzare la consegna.

Grazie per aver scelto *Olio Galia* 🫒

_Per informazioni, rispondi a questo messaggio._`;

    return message;
  }

  /**
   * Template: Pagamento preventivo ricevuto
   */
  static quotePaymentReceived(customerName: string, quoteId: string, amount: number): string {
    return `💳 *Pagamento ricevuto!*

Ciao ${customerName},

Abbiamo ricevuto il pagamento per il preventivo *#${quoteId}*.

💰 *Importo:* ${this.formatPrice(amount, 'EUR')}

✅ Procediamo subito con la preparazione!

Ti aggiorneremo sullo stato della tua richiesta.

*Olio Galia* 🫒`;
  }

  /**
   * Template: Aggiornamento stato preventivo
   */
  static quoteStatusUpdate(customerName: string, quoteId: string, status: string, note?: string): string {
    const statusEmoji = {
      pending: '⏳',
      confirmed: '✅',
      processing: '🔄',
      delivered: '📦',
      cancelled: '❌'
    }[status] || '📋';

    let message = `${statusEmoji} *Aggiornamento preventivo*

Ciao ${customerName},

Stato preventivo *#${quoteId}*: *${status}*

`;

    if (note) {
      message += `📝 *Note:*\n${note}\n\n`;
    }

    message += `Ti terremo aggiornato su ogni sviluppo.

*Olio Galia* 🫒

_Per domande, rispondi a questo messaggio._`;

    return message;
  }

  /**
   * Template: Notifica admin nuovo ordine (opzionale, alternativa a Telegram)
   */
  static adminNewOrder(orderId: string, customerName: string, total: number, itemsCount: number): string {
    return `🔔 *Nuovo Ordine Ricevuto!*

🔢 *Ordine:* #${orderId}
👤 *Cliente:* ${customerName}
💰 *Totale:* ${this.formatPrice(total, 'EUR')}
📦 *Prodotti:* ${itemsCount} articoli

🎯 *Azione richiesta:* Gestisci l'ordine nel pannello admin

_Olio Galia Admin_`;
  }

  /**
   * Template: Notifica admin nuovo preventivo
   */
  static adminNewQuote(quoteId: string, customerName: string, total: number): string {
    return `📋 *Nuovo Preventivo Ricevuto!*

🔢 *Preventivo:* #${quoteId}
👤 *Cliente:* ${customerName}
💰 *Importo:* ${this.formatPrice(total, 'EUR')}

🎯 *Azione richiesta:* Rivedi il preventivo nel pannello admin

_Olio Galia Admin_`;
  }

  /**
   * Template: Test messaggio (per admin panel)
   */
  static testMessage(): string {
    return `🧪 *Test WhatsApp Integration*

Questo è un messaggio di test da *Olio Galia*.

✅ L'integrazione WhatsApp funziona correttamente!

⏱️ ${new Date().toLocaleString('it-IT')}

_Se ricevi questo messaggio, la configurazione è corretta._`;
  }

  /**
   * Helper: Formatta prezzo
   */
  private static formatPrice(amount: number, currency: string): string {
    // amount è in centesimi, convertiamo in euro
    const euros = amount / 100;
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(euros);
  }
}

export default WhatsAppTemplates;
