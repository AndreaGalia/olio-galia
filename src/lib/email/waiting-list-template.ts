const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com';

/**
 * Template hardcoded di fallback per la notifica lista d'attesa.
 * Usa placeholder {{productName}} e {{productUrl}} che vengono sostituiti
 * da EmailService.replaceVariables() al momento dell'invio.
 * Se in DB esiste un template con key 'waiting_list_notification', viene usato quello.
 */
export function createWaitingListNotificationHTML(locale: 'it' | 'en'): string {
  const isIt = locale === 'it';

  const title = isIt
    ? 'Il prodotto che aspettavi è arrivato!'
    : 'The product you were waiting for is here!';

  const intro = isIt
    ? 'Ti scriviamo perché hai richiesto di essere avvisato sulla disponibilità di <strong>{{productName}}</strong>. È finalmente disponibile!'
    : 'We\'re writing because you asked to be notified about the availability of <strong>{{productName}}</strong>. It\'s finally here!';

  const cta = isIt ? 'Acquista ora' : 'Shop now';

  const footer = isIt
    ? 'Hai ricevuto questa email perché hai richiesto di essere avvisato sulla disponibilità di questo prodotto.'
    : 'You received this email because you requested to be notified about this product\'s availability.';

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Roboto', Arial, sans-serif;
      background-color: #E0D3B7;
      margin: 0;
      padding: 0;
      color: #000000;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background-color: #F4F1EA;
    }
    .header {
      background-color: #577657;
      padding: 40px 32px 32px;
      text-align: center;
    }
    .header-eyebrow {
      font-size: 11px;
      letter-spacing: 3.4px;
      text-transform: uppercase;
      color: #E0D3B7;
      margin: 0 0 12px;
    }
    .header h1 {
      color: #F4F1EA;
      font-size: 20px;
      font-weight: 400;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0;
      line-height: 1.4;
    }
    .content {
      padding: 40px 32px;
    }
    .content p {
      font-size: 14px;
      line-height: 1.8;
      color: #000000;
      margin: 0 0 20px;
    }
    .divider {
      border: none;
      border-top: 1px solid rgba(87, 118, 87, 0.2);
      margin: 28px 0;
    }
    .cta-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #577657;
      color: #F4F1EA;
      text-decoration: none;
      padding: 14px 40px;
      font-size: 11px;
      letter-spacing: 3.4px;
      text-transform: uppercase;
      font-family: 'Roboto', Arial, sans-serif;
    }
    .footer {
      background-color: #E0D3B7;
      padding: 24px 32px;
      text-align: center;
    }
    .footer p {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.5);
      margin: 4px 0;
      line-height: 1.6;
    }
    .footer a {
      color: #577657;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container { margin: 0; }
      .header { padding: 32px 20px 24px; }
      .content { padding: 28px 20px; }
      .footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="header-eyebrow">Olio Galia</p>
      <h1>${title}</h1>
    </div>

    <div class="content">
      <p>${intro}</p>
      <hr class="divider" />
      <div class="cta-wrapper">
        <a href="{{productUrl}}" class="cta-button">${cta}</a>
      </div>
      <hr class="divider" />
    </div>

    <div class="footer">
      <p><a href="${SITE_URL}">oliogalia.com</a></p>
      <p style="margin-top: 12px;">${footer}</p>
    </div>
  </div>
</body>
</html>`;
}

export function getWaitingListEmailSubject(locale: 'it' | 'en'): string {
  return locale === 'it'
    ? '{{productName}} è disponibile — Olio Galia'
    : '{{productName}} is now available — Olio Galia';
}
