// types/whatsapp.ts

/**
 * Template messaggi WhatsApp con placeholder dinamici
 */

export interface WhatsAppTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  placeholders: string[];
}

export interface WhatsAppTemplates {
  orderConfirmation: string;
  shippingUpdate: string;
  deliveryConfirmation: string;
  reviewRequest: string;
}

export const DEFAULT_TEMPLATES: WhatsAppTemplates = {
  orderConfirmation: `🎉 *Grazie per il tuo ordine, {customerName}!*

✅ *Ordine confermato*
🔢 *Numero ordine:* #{orderId}
💰 *Totale:* {total}

📦 *Prodotti ordinati:*
{items}

📧 Riceverai un'email con tutti i dettagli dell'ordine.

🚚 Ti aggiorneremo non appena il tuo ordine sarà spedito!

Grazie per aver scelto *Olio Galia* 🫒

_Per qualsiasi domanda, rispondi a questo messaggio._`,

  shippingUpdate: `📦 *Ciao {customerName}!*

Il tuo ordine *#{orderId}* è stato spedito! 🚚

📮 *Corriere:* {carrier}
🔍 *Numero tracking:* {trackingNumber}

⏱️ *Consegna prevista:* 2-3 giorni lavorativi

Ti avviseremo quando il pacco sarà consegnato!

*Olio Galia* 🫒`,

  deliveryConfirmation: `✅ *Consegna completata!*

Ciao {customerName},

Il tuo ordine *#{orderId}* è stato consegnato! 📦

Speriamo che tu sia soddisfatto dei nostri prodotti. 🫒

💚 Ci piacerebbe sapere cosa ne pensi! Riceverai a breve un link per lasciare una recensione.

Grazie per aver scelto *Olio Galia*!

_Per assistenza, rispondi a questo messaggio._`,

  reviewRequest: `⭐ *La tua opinione conta!*

Ciao {customerName},

Grazie per aver scelto *Olio Galia* per il tuo ordine *#{orderId}*.

Ci piacerebbe sapere cosa ne pensi dei nostri prodotti! 🫒

La tua recensione ci aiuta a migliorare e aiuta altri clienti a fare scelte consapevoli.

👉 *Lascia una recensione qui:*
{feedbackUrl}

⏱️ Ci vogliono solo 2 minuti!

Grazie mille per il tuo tempo 💚

*Olio Galia*`
};

export const TEMPLATE_PLACEHOLDERS = {
  orderConfirmation: [
    '{customerName}',
    '{orderId}',
    '{total}',
    '{items}'
  ],
  shippingUpdate: [
    '{customerName}',
    '{orderId}',
    '{carrier}',
    '{trackingNumber}'
  ],
  deliveryConfirmation: [
    '{customerName}',
    '{orderId}'
  ],
  reviewRequest: [
    '{customerName}',
    '{orderId}',
    '{feedbackUrl}'
  ]
};
