import { SubscriptionEmailData } from '@/types/subscription';

const emailWrapper = (tagline: string, content: string): string => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="it">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Olio Galia</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    * { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    .clearfix:after { content: ""; display: table; clear: both; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .header-section, .content-section, .footer-section { padding: 20px 15px !important; }
      .logo-text { font-size: 24px !important; }
      .greeting-text { font-size: 20px !important; }
      .cta-button { padding: 12px 24px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body bgcolor="#f5f5f5" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width: 100%; background-color: #f5f5f5; margin: 0; padding: 0;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0;" class="email-container">
          <!-- Header -->
          <tr>
            <td class="header-section" style="background-color: #556B2F; padding: 30px 20px; text-align: center;">
              <h1 class="logo-text" style="color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 2px; margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', Times, serif;">OLIO GALIA</h1>
              <p style="color: #D6C7A1; font-size: 14px; font-style: italic; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${tagline}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content-section" style="padding: 30px 20px; background-color: #ffffff;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer-section" style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <h4 style="color: #556B2F; font-size: 18px; font-weight: bold; margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', Times, serif;">OLIO GALIA</h4>
              <p style="color: #666666; font-size: 14px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Grazie per aver scelto la qualit&agrave; italiana.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const ctaButton = (href: string, text: string): string => `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
  <tr>
    <td align="center">
      <a href="${href}" class="cta-button" style="display: inline-block; background-color: #556B2F; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 4px; font-size: 16px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;

const infoBox = (title: string, rows: string): string => `
<div style="background-color: #f8f8f8; border-left: 4px solid #789262; padding: 20px; margin: 20px 0;">
  <h3 style="color: #556B2F; font-size: 18px; font-weight: bold; margin: 0 0 15px 0; font-family: Georgia, 'Times New Roman', Times, serif;">${title}</h3>
  ${rows}
</div>`;

const detailRow = (label: string, value: string): string => `
<div class="clearfix" style="margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <span style="color: #666666; font-size: 14px;">${label}</span>
  <strong style="color: #333333; font-size: 14px; float: right;">${value}</strong>
</div>`;

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

export const createSubscriptionConfirmationHTML = (data: SubscriptionEmailData): string => {
  const content = `
    <h2 style="color: #556B2F; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif;" class="greeting-text">Gentile ${data.customerName},</h2>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Il suo abbonamento &egrave; stato attivato con successo! Ricever&agrave; <strong>${data.productName}</strong> comodamente a casa sua con la frequenza selezionata.
    </p>
    ${infoBox('Dettagli Abbonamento',
      detailRow('Prodotto:', data.productName) +
      detailRow('Frequenza:', INTERVAL_LABELS[data.interval] || data.interval) +
      detailRow('Zona:', ZONE_LABELS[data.shippingZone] || data.shippingZone) +
      (data.amount ? detailRow('Importo:', `&euro;${data.amount}`) : '')
    )}
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Pu&ograve; gestire il suo abbonamento in qualsiasi momento tramite il portale dedicato:
    </p>
    ${ctaButton(data.portalLink, 'Gestisci Abbonamento')}
    <p style="color: #666666; font-size: 13px; text-align: center; margin-top: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Conservi questa email: il link sopra le permetter&agrave; di accedere al portale di gestione in qualsiasi momento.
    </p>`;
  return emailWrapper('Abbonamento attivato con successo!', content);
};

export const createSubscriptionRenewalHTML = (data: SubscriptionEmailData): string => {
  const content = `
    <h2 style="color: #556B2F; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif;" class="greeting-text">Gentile ${data.customerName},</h2>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Il suo abbonamento per <strong>${data.productName}</strong> &egrave; stato rinnovato con successo.
    </p>
    ${infoBox('Dettagli Rinnovo',
      detailRow('Prodotto:', data.productName) +
      detailRow('Frequenza:', INTERVAL_LABELS[data.interval] || data.interval) +
      (data.amount ? detailRow('Importo:', `&euro;${data.amount}`) : '') +
      (data.nextBillingDate ? detailRow('Prossimo rinnovo:', data.nextBillingDate) : '')
    )}
    ${ctaButton(data.portalLink, 'Gestisci Abbonamento')}`;
  return emailWrapper('Il tuo abbonamento &egrave; stato rinnovato', content);
};

export const createSubscriptionPaymentFailedHTML = (data: SubscriptionEmailData): string => {
  const content = `
    <h2 style="color: #556B2F; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif;" class="greeting-text">Gentile ${data.customerName},</h2>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Purtroppo il pagamento per il suo abbonamento a <strong>${data.productName}</strong> non &egrave; andato a buon fine. La preghiamo di aggiornare il metodo di pagamento per evitare l'interruzione del servizio.
    </p>
    <div style="background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 20px; margin: 20px 0;">
      <p style="color: #856404; font-size: 14px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <strong>Azione richiesta:</strong> Aggiorni il suo metodo di pagamento per mantenere attivo l'abbonamento.
      </p>
    </div>
    ${ctaButton(data.portalLink, 'Aggiorna Metodo di Pagamento')}`;
  return emailWrapper('Problema con il pagamento dell\'abbonamento', content);
};

export const createSubscriptionCancelScheduledHTML = (data: SubscriptionEmailData): string => {
  const content = `
    <h2 style="color: #556B2F; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif;" class="greeting-text">Gentile ${data.customerName},</h2>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Confermiamo che il suo abbonamento per <strong>${data.productName}</strong> &egrave; stato cancellato. Non ricever&agrave; ulteriori spedizioni e non verranno effettuati ulteriori addebiti.
    </p>
    ${infoBox('Dettagli',
      detailRow('Prodotto:', data.productName) +
      detailRow('Stato:', 'Cancellazione programmata') +
      (data.nextBillingDate ? detailRow('Attivo fino al:', data.nextBillingDate) : '')
    )}
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Se cambia idea, pu&ograve; riattivare il suo abbonamento prima della scadenza dal portale dedicato:
    </p>
    ${ctaButton(data.portalLink, 'Riattiva Abbonamento')}`;
  return emailWrapper('Abbonamento cancellato', content);
};

export const createSubscriptionCanceledHTML = (data: SubscriptionEmailData): string => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.com';
  const content = `
    <h2 style="color: #556B2F; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif;" class="greeting-text">Gentile ${data.customerName},</h2>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Il suo abbonamento per <strong>${data.productName}</strong> &egrave; ufficialmente terminato. Le manca gi&agrave; il nostro olio?
    </p>
    ${infoBox('Riepilogo',
      detailRow('Prodotto:', data.productName) +
      detailRow('Stato:', 'Terminato')
    )}
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Pu&ograve; riattivare il suo abbonamento o esplorare i nostri prodotti in qualsiasi momento. Sar&agrave; sempre il benvenuto!
    </p>
    ${ctaButton(siteUrl + '/products', 'Scopri i Nostri Abbonamenti')}`;
  return emailWrapper('Ci manchi! Torna a gustare il nostro olio', content);
};

export const createSubscriptionPausedHTML = (data: SubscriptionEmailData): string => {
  const content = `
    <h2 style="color: #556B2F; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif;" class="greeting-text">Gentile ${data.customerName},</h2>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Il suo abbonamento per <strong>${data.productName}</strong> &egrave; stato messo in pausa. Non verranno effettuati addebiti fino alla riattivazione.
    </p>
    ${infoBox('Dettagli Abbonamento',
      detailRow('Prodotto:', data.productName) +
      detailRow('Frequenza:', INTERVAL_LABELS[data.interval] || data.interval) +
      detailRow('Stato:', 'In pausa')
    )}
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Pu&ograve; riattivare il suo abbonamento in qualsiasi momento tramite il portale dedicato:
    </p>
    ${ctaButton(data.portalLink, 'Riattiva Abbonamento')}`;
  return emailWrapper('Abbonamento in pausa', content);
};

export const createSubscriptionResumedHTML = (data: SubscriptionEmailData): string => {
  const content = `
    <h2 style="color: #556B2F; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif;" class="greeting-text">Gentile ${data.customerName},</h2>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Il suo abbonamento per <strong>${data.productName}</strong> &egrave; stato riattivato con successo! Le spedizioni riprenderanno regolarmente.
    </p>
    ${infoBox('Dettagli Abbonamento',
      detailRow('Prodotto:', data.productName) +
      detailRow('Frequenza:', INTERVAL_LABELS[data.interval] || data.interval) +
      detailRow('Stato:', 'Attivo') +
      (data.nextBillingDate ? detailRow('Prossimo rinnovo:', data.nextBillingDate) : '')
    )}
    ${ctaButton(data.portalLink, 'Gestisci Abbonamento')}`;
  return emailWrapper('Abbonamento riattivato', content);
};

export const createSubscriptionUpcomingRenewalHTML = (data: SubscriptionEmailData): string => {
  const content = `
    <h2 style="color: #556B2F; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif;" class="greeting-text">Gentile ${data.customerName},</h2>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Le ricordiamo che il suo abbonamento per <strong>${data.productName}</strong> verr&agrave; rinnovato a breve.
    </p>
    ${infoBox('Dettagli Rinnovo',
      detailRow('Prodotto:', data.productName) +
      detailRow('Frequenza:', INTERVAL_LABELS[data.interval] || data.interval) +
      (data.amount ? detailRow('Importo:', `&euro;${data.amount}`) : '') +
      (data.nextBillingDate ? detailRow('Data rinnovo:', data.nextBillingDate) : '')
    )}
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Se desidera modificare o cancellare l'abbonamento prima del rinnovo, pu&ograve; farlo dal portale dedicato:
    </p>
    ${ctaButton(data.portalLink, 'Gestisci Abbonamento')}`;
  return emailWrapper('Prossimo rinnovo abbonamento', content);
};

export const createPortalAccessMagicLinkHTML = (magicLink: string): string => {
  const content = `
    <h2 style="color: #556B2F; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', Times, serif;" class="greeting-text">Accesso al Portale Abbonamento</h2>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      Ha richiesto l'accesso al portale di gestione del suo abbonamento. Clicchi il pulsante qui sotto per accedere:
    </p>
    ${ctaButton(magicLink, 'Accedi al Portale')}
    <div style="background-color: #f8f8f8; border-left: 4px solid #789262; padding: 20px; margin: 20px 0;">
      <p style="color: #666666; font-size: 13px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <strong>Nota:</strong> Questo link &egrave; valido per <strong>15 minuti</strong> e pu&ograve; essere usato una sola volta.
        Se non ha richiesto questo accesso, ignori questa email.
      </p>
    </div>`;
  return emailWrapper('Accesso al portale abbonamento', content);
};
