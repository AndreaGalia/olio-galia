// lib/telegram/telegram.ts
import { OrderDetails } from '@/types/checkoutSuccessTypes';

interface TelegramConfig {
  botToken: string;
  chatIds: string[]; // Array di chat IDs
}

export class TelegramService {
  private static getConfig(): TelegramConfig | null {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram non configurato. Aggiungi TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID alle variabili d\'ambiente.');
      return null;
    }

    // Supporta multipli CHAT_ID separati da virgola
    const chatIds = chatId.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (chatIds.length === 0) {
      console.warn('⚠️ Nessun CHAT_ID valido trovato.');
      return null;
    }

    return { botToken, chatIds };
  }

  /**
   * Invia una notifica Telegram per un nuovo ordine
   */
  static async sendOrderNotification(orderDetails: OrderDetails, mongoId?: string): Promise<boolean> {
    const config = this.getConfig();
    if (!config) {
      return false;
    }

    try {
      // Formatta il messaggio
      const message = this.formatOrderMessage(orderDetails, mongoId);

      // Invia il messaggio a tutti i CHAT_ID configurati
      const results = await Promise.allSettled(
        config.chatIds.map(chatId =>
          fetch(
            `https://api.telegram.org/bot${config.botToken}/sendMessage`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
              }),
            }
          )
        )
      );

      // Verifica quanti invii sono riusciti
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const totalCount = config.chatIds.length;

      if (successCount === 0) {
        console.error('❌ Nessuna notifica Telegram inviata con successo');
        return false;
      }

      if (successCount < totalCount) {
        console.warn(`⚠️ Notifica Telegram inviata a ${successCount}/${totalCount} utenti`);
      } else {
        console.log(`✅ Notifica Telegram inviata con successo a ${successCount} utenti`);
      }

      return true;
    } catch (error) {
      console.error('❌ Errore invio notifica Telegram:', error);
      return false;
    }
  }

  /**
   * Formatta il messaggio dell'ordine per Telegram
   */
  private static formatOrderMessage(orderDetails: OrderDetails, mongoId?: string): string {
    const orderNumber = typeof orderDetails.paymentIntent === 'string'
      ? orderDetails.paymentIntent.slice(-8).toUpperCase()
      : orderDetails.id.slice(-8).toUpperCase();

    const customerName = orderDetails.customer?.name || 'N/D';
    const customerEmail = orderDetails.customer?.email || 'N/D';
    const customerPhone = orderDetails.customer?.phone || 'N/D';

    const total = orderDetails.pricing?.total || orderDetails.total || 0;
    const subtotal = orderDetails.pricing?.subtotal || 0;
    const shippingCost = orderDetails.pricing?.shippingCost || 0;

    const shippingAddress = orderDetails.shipping?.address || 'N/D';

    // Lista prodotti
    const itemsList = orderDetails.items?.map((item, index) => {
      return `  ${index + 1}. <b>${item.name}</b> x${item.quantity} - €${item.price?.toFixed(2)}`;
    }).join('\n') || 'Nessun prodotto';

    // Costruisci l'URL per l'ordine nel pannello admin
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const orderUrl = mongoId ? `${baseUrl}/admin/orders/${mongoId}` : null;

    // Costruisci il messaggio
    const message = `
🛒 <b>NUOVO ORDINE RICEVUTO!</b> 🛒

📋 <b>Ordine:</b> #${orderNumber}
📅 <b>Data:</b> ${new Date(orderDetails.created || new Date()).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

👤 <b>Cliente:</b>
  • Nome: ${customerName}
  • Email: ${customerEmail}
  • Telefono: ${customerPhone}

📦 <b>Prodotti:</b>
${itemsList}

📍 <b>Indirizzo di spedizione:</b>
${shippingAddress}

💰 <b>Totale:</b>
  • Subtotale: €${subtotal.toFixed(2)}
  • Spedizione: €${shippingCost.toFixed(2)}
  • <b>TOTALE: €${total.toFixed(2)}</b>

${orderUrl ? `🔗 <a href="${orderUrl}">Visualizza ordine nel pannello admin</a>` : '🔔 Controlla il pannello admin per gestire l\'ordine.'}
`.trim();

    return message;
  }

  /**
   * Invia una notifica Telegram per un preventivo pagato
   */
  static async sendQuotePaidNotification(
    formData: any,
    productsInfo: any[],
    mongoId?: string
  ): Promise<boolean> {
    const config = this.getConfig();
    if (!config) {
      return false;
    }

    try {
      // Formatta il messaggio
      const message = this.formatQuotePaidMessage(formData, productsInfo, mongoId);

      // Invia il messaggio a tutti i CHAT_ID configurati
      const results = await Promise.allSettled(
        config.chatIds.map(chatId =>
          fetch(
            `https://api.telegram.org/bot${config.botToken}/sendMessage`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
              }),
            }
          )
        )
      );

      // Verifica quanti invii sono riusciti
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const totalCount = config.chatIds.length;

      if (successCount === 0) {
        console.error('❌ Nessuna notifica Telegram preventivo inviata con successo');
        return false;
      }

      if (successCount < totalCount) {
        console.warn(`⚠️ Notifica Telegram preventivo inviata a ${successCount}/${totalCount} utenti`);
      } else {
        console.log(`✅ Notifica Telegram preventivo inviata con successo a ${successCount} utenti`);
      }

      return true;
    } catch (error) {
      console.error('❌ Errore invio notifica Telegram preventivo:', error);
      return false;
    }
  }

  /**
   * Formatta il messaggio del preventivo pagato per Telegram
   */
  private static formatQuotePaidMessage(
    formData: any,
    productsInfo: any[],
    mongoId?: string
  ): string {
    const orderNumber = formData.orderId?.slice(-8).toUpperCase() || mongoId?.slice(-8).toUpperCase() || 'N/D';
    const customerName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'N/D';
    const customerEmail = formData.email || 'N/D';
    const customerPhone = formData.phone || 'N/D';

    const finalTotal = formData.finalPricing?.finalTotal || 0;
    const finalSubtotal = formData.finalPricing?.finalSubtotal || 0;
    const finalShipping = formData.finalPricing?.finalShipping || 0;

    const address = formData.address || 'N/D';
    const province = formData.province || '';
    const fullAddress = province ? `${address}, ${province}` : address;

    // Lista prodotti
    const itemsList = productsInfo.map((item, index) => {
      return `  ${index + 1}. <b>${item.name}</b> x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`;
    }).join('\n') || 'Nessun prodotto';

    // Costruisci l'URL per il preventivo nel pannello admin
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const quoteUrl = mongoId ? `${baseUrl}/admin/forms/${mongoId}` : null;

    // Costruisci il messaggio
    const message = `
💰 <b>PREVENTIVO PAGATO!</b> 💰

📋 <b>Preventivo:</b> #${orderNumber}
📅 <b>Data pagamento:</b> ${new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

👤 <b>Cliente:</b>
  • Nome: ${customerName}
  • Email: ${customerEmail}
  • Telefono: ${customerPhone}

📦 <b>Prodotti:</b>
${itemsList}

📍 <b>Indirizzo di spedizione:</b>
${fullAddress}

💰 <b>Totale:</b>
  • Subtotale: €${finalSubtotal.toFixed(2)}
  • Spedizione: €${finalShipping.toFixed(2)}
  • <b>TOTALE: €${finalTotal.toFixed(2)}</b>

${quoteUrl ? `🔗 <a href="${quoteUrl}">Visualizza preventivo nel pannello admin</a>` : '🔔 Controlla il pannello admin per gestire il preventivo.'}
`.trim();

    return message;
  }

  /**
   * Test per verificare la configurazione Telegram
   */
  static async testConnection(): Promise<boolean> {
    const config = this.getConfig();
    if (!config) {
      return false;
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${config.botToken}/getMe`
      );

      if (!response.ok) {
        console.error('❌ Bot token non valido');
        return false;
      }

      const data = await response.json();
      console.log('✅ Connessione Telegram OK. Bot:', data.result.username);
      return true;
    } catch (error) {
      console.error('❌ Errore test connessione Telegram:', error);
      return false;
    }
  }
}
