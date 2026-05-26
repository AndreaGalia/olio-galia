// lib/telegram/telegram.ts
import { OrderDetails } from '@/types/checkoutSuccessTypes';
import { GoalService } from '@/services/goalService';
import { SubscriptionEmailData } from '@/types/subscription';
import { getDatabase } from '@/lib/mongodb';

interface TelegramConfig {
  botToken: string;
  chatIds: string[];
}

interface ProductInfo {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface FormData {
  orderId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  finalPricing?: {
    finalSubtotal: number;
    finalShipping: number;
    finalTotal: number;
  };
}

export class TelegramService {
  static async isEnabled(): Promise<boolean> {
    try {
      const db = await getDatabase();
      const settings = await db.collection('admin_settings').findOne({});
      // Default true per retrocompatibilità se il campo non esiste
      return settings?.telegram?.enabled !== false;
    } catch {
      return true;
    }
  }

  private static getConfig(): TelegramConfig | null {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram non configurato. Aggiungi TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID alle variabili d\'ambiente.');
      return null;
    }

    const chatIds = chatId.split(',').map(id => id.trim()).filter(id => id.length > 0);

    if (chatIds.length === 0) {
      console.warn('⚠️ Nessun CHAT_ID valido trovato.');
      return null;
    }

    return { botToken, chatIds };
  }

  /**
   * Invia un messaggio a tutti i CHAT_ID configurati
   */
  private static async sendMessageToAllChats(message: string, context: string): Promise<boolean> {
    const config = this.getConfig();
    if (!config) return false;

    try {
      const results = await Promise.allSettled(
        config.chatIds.map(chatId =>
          fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML',
            }),
          })
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const totalCount = config.chatIds.length;

      if (successCount === 0) {
        console.error(`❌ Nessuna notifica Telegram ${context} inviata con successo`);
        return false;
      }

      if (successCount < totalCount) {
        console.warn(`⚠️ Notifica Telegram ${context} inviata a ${successCount}/${totalCount} utenti`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Errore invio notifica Telegram ${context}:`, error);
      return false;
    }
  }

  /**
   * Formatta le informazioni sull'obiettivo di fatturato
   */
  private static async formatGoalInfo(): Promise<string> {
    try {
      const progress = await GoalService.calculateProgress();

      if (!progress) {
        return ''; // Nessun obiettivo attivo
      }

      const percentage = Math.round(progress.percentage * 100) / 100;
      const progressBar = this.generateProgressBar(percentage);
      const statusEmoji = progress.isOnTrack ? '✅' : '⚠️';

      return `
📊 <b>OBIETTIVO DI FATTURATO ${statusEmoji}</b>
${progressBar}
  • Obiettivo: €${progress.goal.target.toFixed(2)}
  • Raggiunto: €${progress.currentRevenue.toFixed(2)} (${percentage.toFixed(1)}%)
  • Mancante: €${progress.remaining.toFixed(2)}
  • Giorni rimanenti: ${progress.daysRemaining}
  • ${progress.isOnTrack ? 'In linea con l\'obiettivo! 🎯' : 'Sotto l\'obiettivo previsto'}
`;
    } catch (error) {
      console.error('Errore formattazione obiettivo:', error);
      return ''; // In caso di errore, non mostrare nulla
    }
  }

  /**
   * Genera una barra di progresso visuale
   */
  private static generateProgressBar(percentage: number): string {
    const totalBars = 10;
    const filledBars = Math.round((percentage / 100) * totalBars);
    const emptyBars = totalBars - filledBars;

    const filled = '█'.repeat(Math.max(0, filledBars));
    const empty = '░'.repeat(Math.max(0, emptyBars));

    return `[${filled}${empty}] ${percentage.toFixed(1)}%`;
  }

  /**
   * Invia una notifica Telegram per un nuovo ordine
   */
  static async sendOrderNotification(orderDetails: OrderDetails, mongoId?: string): Promise<boolean> {
    const message = await this.formatOrderMessage(orderDetails, mongoId);
    return this.sendMessageToAllChats(message, 'ordine');
  }

  /**
   * Formatta il messaggio dell'ordine per Telegram
   */
  private static async formatOrderMessage(orderDetails: OrderDetails, mongoId?: string): Promise<string> {
    const orderNumber = typeof orderDetails.paymentIntent === 'string'
      ? orderDetails.paymentIntent.slice(-8).toUpperCase()
      : orderDetails.id.slice(-8).toUpperCase();

    const total = orderDetails.pricing?.total || orderDetails.total || 0;
    const subtotal = orderDetails.pricing?.subtotal || 0;
    const shippingCost = orderDetails.pricing?.shippingCost || 0;

    // Lista prodotti
    const itemsList = orderDetails.items?.map((item, index) => {
      return `  ${index + 1}. <b>${item.name}</b> x${item.quantity} - €${item.price?.toFixed(2)}`;
    }).join('\n') || 'Nessun prodotto';

    // Costruisci l'URL per l'ordine nel pannello admin
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const orderUrl = mongoId ? `${baseUrl}/admin/orders/${mongoId}` : null;

    // Recupera informazioni sull'obiettivo
    const goalInfo = await this.formatGoalInfo();

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

📦 <b>Prodotti:</b>
${itemsList}

💰 <b>Totale:</b>
  • Subtotale: €${subtotal.toFixed(2)}
  • Spedizione: €${shippingCost.toFixed(2)}
  • <b>TOTALE: €${total.toFixed(2)}</b>

${goalInfo}
${orderUrl ? `🔗 <a href="${orderUrl}">Visualizza ordine nel pannello admin</a>` : '🔔 Controlla il pannello admin per gestire l\'ordine.'}
`.trim();

    return message;
  }

  /**
   * Invia una notifica Telegram per un preventivo pagato
   */
  static async sendQuotePaidNotification(
    formData: FormData,
    productsInfo: ProductInfo[],
    mongoId?: string
  ): Promise<boolean> {
    const message = await this.formatQuotePaidMessage(formData, productsInfo, mongoId);
    return this.sendMessageToAllChats(message, 'preventivo pagato');
  }

  /**
   * Formatta un messaggio generico per preventivo (pagato o confermato)
   */
  private static async formatQuoteMessage(
    formData: FormData,
    productsInfo: ProductInfo[],
    mongoId: string | undefined,
    emoji: string,
    title: string,
    dateLabel: string
  ): Promise<string> {
    const orderNumber = formData.orderId?.slice(-8).toUpperCase() || mongoId?.slice(-8).toUpperCase() || 'N/D';

    const finalTotal = formData.finalPricing?.finalTotal || 0;
    const finalSubtotal = formData.finalPricing?.finalSubtotal || 0;
    const finalShipping = formData.finalPricing?.finalShipping || 0;

    const itemsList = productsInfo.map((item, index) =>
      `  ${index + 1}. <b>${item.name}</b> x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`
    ).join('\n') || 'Nessun prodotto';

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const quoteUrl = mongoId ? `${baseUrl}/admin/forms/${mongoId}` : null;

    // Recupera informazioni sull'obiettivo
    const goalInfo = await this.formatGoalInfo();

    return `
${emoji} <b>${title}</b> ${emoji}

📋 <b>Preventivo:</b> #${orderNumber}
📅 <b>${dateLabel}:</b> ${new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

📦 <b>Prodotti:</b>
${itemsList}

💰 <b>Totale:</b>
  • Subtotale: €${finalSubtotal.toFixed(2)}
  • Spedizione: €${finalShipping.toFixed(2)}
  • <b>TOTALE: €${finalTotal.toFixed(2)}</b>

${goalInfo}
${quoteUrl ? `🔗 <a href="${quoteUrl}">Visualizza preventivo nel pannello admin</a>` : '🔔 Controlla il pannello admin per gestire il preventivo.'}
`.trim();
  }

  /**
   * Formatta il messaggio del preventivo pagato per Telegram
   */
  private static async formatQuotePaidMessage(
    formData: FormData,
    productsInfo: ProductInfo[],
    mongoId?: string
  ): Promise<string> {
    return this.formatQuoteMessage(formData, productsInfo, mongoId, '💰', 'PREVENTIVO PAGATO!', 'Data pagamento');
  }

  /**
   * Invia una notifica Telegram per un preventivo confermato
   */
  static async sendQuoteConfirmedNotification(
    formData: FormData,
    productsInfo: ProductInfo[],
    mongoId?: string
  ): Promise<boolean> {
    const message = await this.formatQuoteConfirmedMessage(formData, productsInfo, mongoId);
    return this.sendMessageToAllChats(message, 'preventivo confermato');
  }

  /**
   * Formatta il messaggio del preventivo confermato per Telegram
   */
  private static async formatQuoteConfirmedMessage(
    formData: FormData,
    productsInfo: ProductInfo[],
    mongoId?: string
  ): Promise<string> {
    return this.formatQuoteMessage(formData, productsInfo, mongoId, '✅', 'PREVENTIVO CONFERMATO!', 'Data conferma');
  }

  /**
   * Invia una notifica Telegram per un nuovo abbonamento
   */
  static async sendSubscriptionNotification(data: SubscriptionEmailData): Promise<boolean> {
    const INTERVAL_LABELS: Record<string, string> = {
      month: 'Ogni mese',
      bimonth: 'Ogni 2 mesi',
      quarter: 'Ogni 3 mesi',
      semester: 'Ogni 6 mesi',
    };
    const ZONE_LABELS: Record<string, string> = {
      italia: 'Italia',
      europa: 'Europa',
      america: 'America',
      mondo: 'Resto del Mondo',
    };

    const message = `
🔄 <b>NUOVO ABBONAMENTO!</b>

📋 <b>Cliente:</b> ${data.customerName} (${data.customerEmail})
📦 <b>Prodotto:</b> ${data.productName}${(data.quantity && data.quantity > 1) ? `\n🔢 <b>Quantità:</b> ${data.quantity} bottiglie` : ''}
🗺️ <b>Zona:</b> ${ZONE_LABELS[data.shippingZone] || data.shippingZone}
📅 <b>Frequenza:</b> ${INTERVAL_LABELS[data.interval] || data.interval}${data.amount ? `\n💰 <b>Importo:</b> €${data.amount}` : ''}
`.trim();

    return this.sendMessageToAllChats(message, 'abbonamento');
  }

  /**
   * Invia una notifica Telegram per cancellazione programmata
   */
  static async sendSubscriptionCancelScheduledNotification(data: SubscriptionEmailData): Promise<boolean> {
    const message = `
🔔 <b>CANCELLAZIONE ABBONAMENTO PROGRAMMATA</b>

📋 <b>Cliente:</b> ${data.customerName} (${data.customerEmail})
📦 <b>Prodotto:</b> ${data.productName}${(data.quantity && data.quantity > 1) ? `\n🔢 <b>Quantità:</b> ${data.quantity} bottiglie` : ''}${data.nextBillingDate ? `\n📅 <b>Attivo fino al:</b> ${data.nextBillingDate}` : ''}
`.trim();

    return this.sendMessageToAllChats(message, 'cancellazione programmata');
  }

  /**
   * Invia una notifica Telegram per abbonamento terminato definitivamente
   */
  static async sendSubscriptionCanceledNotification(data: SubscriptionEmailData): Promise<boolean> {
    const message = `
❌ <b>ABBONAMENTO TERMINATO</b>

📋 <b>Cliente:</b> ${data.customerName} (${data.customerEmail})
📦 <b>Prodotto:</b> ${data.productName}${(data.quantity && data.quantity > 1) ? `\n🔢 <b>Quantità:</b> ${data.quantity} bottiglie` : ''}
`.trim();

    return this.sendMessageToAllChats(message, 'abbonamento terminato');
  }

  /**
   * Invia una notifica Telegram per abbonamento in pausa
   */
  static async sendSubscriptionPausedNotification(data: SubscriptionEmailData): Promise<boolean> {
    const message = `
⏸️ <b>ABBONAMENTO IN PAUSA</b>

📋 <b>Cliente:</b> ${data.customerName} (${data.customerEmail})
📦 <b>Prodotto:</b> ${data.productName}${(data.quantity && data.quantity > 1) ? `\n🔢 <b>Quantità:</b> ${data.quantity} bottiglie` : ''}
`.trim();

    return this.sendMessageToAllChats(message, 'abbonamento pausa');
  }

  /**
   * Invia una notifica Telegram per abbonamento riattivato
   */
  static async sendSubscriptionResumedNotification(data: SubscriptionEmailData): Promise<boolean> {
    const message = `
▶️ <b>ABBONAMENTO RIATTIVATO</b>

📋 <b>Cliente:</b> ${data.customerName} (${data.customerEmail})
📦 <b>Prodotto:</b> ${data.productName}${(data.quantity && data.quantity > 1) ? `\n🔢 <b>Quantità:</b> ${data.quantity} bottiglie` : ''}${data.nextBillingDate ? `\n📅 <b>Prossimo rinnovo:</b> ${data.nextBillingDate}` : ''}
`.trim();

    return this.sendMessageToAllChats(message, 'abbonamento riattivato');
  }

  /**
   * Invia una notifica Telegram per rinnovo imminente
   */
  static async sendSubscriptionUpcomingRenewalNotification(data: SubscriptionEmailData): Promise<boolean> {
    const message = `
📅 <b>RINNOVO ABBONAMENTO IMMINENTE</b>

📋 <b>Cliente:</b> ${data.customerName} (${data.customerEmail})
📦 <b>Prodotto:</b> ${data.productName}${(data.quantity && data.quantity > 1) ? `\n🔢 <b>Quantità:</b> ${data.quantity} bottiglie` : ''}${data.amount ? `\n💰 <b>Importo:</b> €${data.amount}` : ''}${data.nextBillingDate ? `\n📅 <b>Data rinnovo:</b> ${data.nextBillingDate}` : ''}
`.trim();

    return this.sendMessageToAllChats(message, 'rinnovo imminente');
  }

  /**
   * Invia il report giornaliero (visite interne + carrello)
   * Rispetta il flag telegram.enabled nelle impostazioni admin.
   */
  static async sendDailyReport(): Promise<boolean> {
    const enabled = await this.isEnabled();
    if (!enabled) {
      console.info('ℹ️ Telegram disabilitato da admin — report giornaliero non inviato');
      return false;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const dateLabel = yesterday.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const db = await getDatabase();

    const startOfYesterday = new Date(yesterday);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);
    const cartFilter = { timestamp: { $gte: startOfYesterday, $lte: endOfYesterday } };

    // Recupera dati visite e carrello in parallelo
    const [pageViewDoc, totalCartAdds, topCartProducts] = await Promise.all([
      db.collection('page_views').findOne({ date: yesterdayKey }),
      db.collection('cart_events').countDocuments(cartFilter),
      db.collection('cart_events').aggregate([
        { $match: cartFilter },
        { $group: { _id: '$productId', productName: { $last: '$productName' }, totalQuantity: { $sum: '$quantity' }, totalAdds: { $sum: 1 } } },
        { $sort: { totalAdds: -1 } },
        { $limit: 5 },
      ]).toArray(),
    ]);

    // Sezione visite
    let visitSection = '';
    if (pageViewDoc && pageViewDoc.total > 0) {
      const pages = pageViewDoc.pages as Record<string, number> ?? {};
      const topPages = Object.entries(pages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([p, v], i) => `  ${i + 1}. <code>${p.replace(/_/g, '.')}</code> (${v} visite)`)
        .join('\n');

      visitSection = `
🌐 <b>VISITE IERI</b>
  • Pagine viste: <b>${pageViewDoc.total}</b>

📄 <b>Pagine più visitate:</b>
${topPages || '  Nessun dato'}
`;
    } else {
      visitSection = `\n🌐 <b>VISITE IERI</b>\n  Nessuna visita registrata\n`;
    }

    // Sezione carrello
    let cartSection = '';
    if (totalCartAdds === 0) {
      cartSection = `\n🛒 <b>CARRELLO IERI</b>\n  Nessuna aggiunta al carrello\n`;
    } else {
      const productsText = topCartProducts
        .map((p, i) => `  ${i + 1}. ${p.productName} (${p.totalAdds} aggiunte, ${p.totalQuantity} unità)`)
        .join('\n');

      cartSection = `
🛒 <b>CARRELLO IERI</b>
  • Aggiunte totali: <b>${totalCartAdds}</b>

🏆 <b>Prodotti più aggiunti:</b>
${productsText}
`;
    }

    const message = `
📊 <b>REPORT GIORNALIERO</b>
📅 ${dateLabel}
${visitSection}${cartSection}`.trim();

    return this.sendMessageToAllChats(message, 'report giornaliero');
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
      return true;
    } catch (error) {
      console.error('❌ Errore test connessione Telegram:', error);
      return false;
    }
  }
}
