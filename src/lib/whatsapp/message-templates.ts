// lib/whatsapp/message-templates.ts
import {
  WhatsAppOrderData,
  WhatsAppQuoteData,
  WhatsAppShippingData,
  WhatsAppDeliveryData,
  WhatsAppNewsletterData,
} from '@/types/whatsapp';

/**
 * Formatta un numero in valuta EUR
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Template messaggio WhatsApp per conferma ordine
 */
export function createOrderWhatsAppMessage(data: WhatsAppOrderData): string {
  const itemsList = data.items
    .map((item) => `• ${item.quantity}x ${item.name} - ${formatCurrency(item.price)}`)
    .join('\n');

  return `🌿 *Olio Galia - Conferma Ordine*

Ciao ${data.customerName}! 👋

Grazie per il tuo ordine! Abbiamo ricevuto con successo il tuo acquisto.

📦 *Dettagli Ordine #${data.orderNumber}*
📅 Data: ${data.orderDate}

*Prodotti ordinati:*
${itemsList}

💰 *Totale: ${formatCurrency(data.total)}*

${data.trackingUrl ? `🔗 Traccia il tuo ordine:\n${data.trackingUrl}\n\n` : ''}Ti invieremo un'altra notifica quando il tuo ordine sarà spedito.

Per qualsiasi domanda, rispondi a questo messaggio o contattaci.

Grazie per aver scelto Olio Galia! 🫒`;
}

/**
 * Template messaggio WhatsApp per preventivo
 */
export function createQuoteWhatsAppMessage(data: WhatsAppQuoteData): string {
  const itemsList = data.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name}\n  ${formatCurrency(item.unitPrice)} cad. = ${formatCurrency(item.totalPrice)}`
    )
    .join('\n');

  return `🌿 *Olio Galia - Il tuo Preventivo*

Ciao ${data.customerName}! 👋

Abbiamo preparato il tuo preventivo personalizzato.

📋 *Preventivo #${data.quoteNumber}*

*Prodotti richiesti:*
${itemsList}

*Riepilogo:*
Subtotale: ${formatCurrency(data.subtotal)}
Spedizione: ${formatCurrency(data.shipping)}
━━━━━━━━━━━━━━━━━
💰 *Totale: ${formatCurrency(data.total)}*

📧 Troverai tutti i dettagli anche nella tua email.

Per procedere con l'ordine o per qualsiasi domanda, rispondi a questo messaggio o contattaci direttamente.

Grazie per l'interesse! 🫒`;
}

/**
 * Template messaggio WhatsApp per notifica spedizione
 */
export function createShippingWhatsAppMessage(data: WhatsAppShippingData): string {
  let message = `🚚 *Olio Galia - Ordine Spedito!*

Ciao ${data.customerName}! 👋

Ottime notizie! Il tuo ordine è stato spedito e presto sarà da te.

📦 *Ordine #${data.orderNumber}*`;

  if (data.shippingTrackingId) {
    message += `\n🔍 Tracking: ${data.shippingTrackingId}`;
  }

  if (data.expectedDelivery) {
    message += `\n📅 Consegna prevista: ${data.expectedDelivery}`;
  }

  message += `

Ti aggiorneremo quando il pacco sarà consegnato.

Grazie per la tua pazienza! 🫒`;

  return message;
}

/**
 * Template messaggio WhatsApp per conferma consegna
 */
export function createDeliveryWhatsAppMessage(data: WhatsAppDeliveryData, feedbackUrl?: string): string {

  return `✅ *Olio Galia - Ordine Consegnato!*

Ciao ${data.customerName}! 👋

Il tuo ordine è stato consegnato con successo! 🎉

📦 *Ordine #${data.orderNumber}*
${data.deliveryDate ? `📅 Consegnato il: ${data.deliveryDate}` : ''}

Ci auguriamo che tu sia soddisfatto del tuo acquisto!

${feedbackUrl ? `⭐ *Lascia un feedback sulla tua esperienza:*
${feedbackUrl}

La tua opinione è molto importante per noi e ci aiuta a migliorare! 💚
` : 'Se hai ricevuto tutto correttamente e vuoi condividere la tua esperienza, ci farebbe molto piacere! 💚'}
Per qualsiasi necessità, assistenza o feedback, siamo sempre qui per te.

Grazie per aver scelto Olio Galia! 🫒`;
}

/**
 * Template messaggio WhatsApp per benvenuto newsletter
 */
export function createNewsletterWelcomeWhatsAppMessage(data: WhatsAppNewsletterData): string {
  return `🌿 *Benvenuto nella famiglia Olio Galia!*

Ciao ${data.firstName}! 👋

Grazie per esserti iscritto alla nostra newsletter! 💚

Siamo felici di averti con noi. Da oggi riceverai:

✨ *Offerte esclusive* riservate agli iscritti
📰 *Notizie e curiosità* sul mondo dell'olio
🎁 *Anteprime* sui nuovi prodotti
🍽️ *Ricette tradizionali* della nostra terra

📧 Troverai tutti i dettagli anche nella tua email.

Per qualsiasi domanda o curiosità, rispondi a questo messaggio o contattaci direttamente.

Ti aspettiamo sul nostro sito per scoprire i nostri oli! 🫒

_Benvenuto nella famiglia!_`;
}
