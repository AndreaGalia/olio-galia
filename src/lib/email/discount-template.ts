const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com';
const LOGO_URL = process.env.LOGO_URL || process.env.NEXT_PUBLIC_LOGO_URL || '';

/**
 * Template hardcoded di fallback per l'invio di codici sconto ai clienti.
 * Usa placeholder {{variabile}} sostituiti da EmailService.replaceVariables().
 * Se in DB esiste un template con key 'discount_code', viene usato quello.
 *
 * Variabili: logoUrl, customerName, discountCode, discountDescription,
 *            expiryRow (blocco HTML con data scadenza, vuoto se non presente),
 *            customMessage, siteUrl
 */
export function createDiscountCodeHTML(locale: 'it' | 'en'): string {
  const isIt = locale === 'it';

  const tagline = isIt ? 'Un\'eccellenza italiana' : 'An Italian excellence';
  const greeting = isIt ? 'Gentile {{customerName}},' : 'Dear {{customerName}},';
  const codeLabel = isIt ? 'Il tuo codice sconto' : 'Your discount code';
  const howToUse = isIt
    ? 'Inserisca il codice al momento del pagamento per applicare lo sconto al suo prossimo ordine.'
    : 'Enter the code at checkout to apply the discount to your next order.';
  const cta = isIt ? 'Vai al negozio' : 'Visit the shop';
  const taglineFooter = isIt ? 'L\'eccellenza dell\'olio italiano' : 'Excellence in Italian olive oil';
  const footerNote = isIt
    ? 'Ha ricevuto questa email perché è un cliente Olio Galia.'
    : 'You received this email because you are an Olio Galia customer.';

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isIt ? 'Il tuo codice sconto' : 'Your discount code'} - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <style>@import url('https://use.typekit.net/wff0hru.css');</style>
</head>
<body style="font-family: 'EB Garamond', Georgia, serif; background-color: #E0D3B7; margin: 0; padding: 20px; letter-spacing: 0.03em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #577657; padding: 36px 30px; text-align: center; border-bottom: 1px solid rgba(87, 118, 87, 0.2);">
      <img src="${LOGO_URL}" alt="OLIO GALIA" style="max-width: 180px; height: auto; display: block; margin: 0 auto 14px;" />
      <p style="margin: 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #E0D3B7;">
        ${tagline}
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 48px 40px 40px;">

      <!-- Greeting -->
      <h2 style="color: #577657; margin: 0 0 28px; font-size: 17px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 3.4px; line-height: 20px;">
        ${greeting}
      </h2>

      <!-- Custom message -->
      <p style="color: #000; line-height: 1.7; margin: 0 0 32px; font-family: 'EB Garamond', Georgia, serif; font-size: 15px; letter-spacing: 0.03em;">
        {{customMessage}}
      </p>

      <!-- Separator -->
      <div style="border-top: 1px solid rgba(87, 118, 87, 0.2); margin-bottom: 32px;"></div>

      <!-- Discount code box -->
      <div style="background-color: #F4F1EA; border-left: 2px solid rgba(87, 118, 87, 0.4); padding: 28px; margin-bottom: 8px; text-align: center;">
        <p style="margin: 0 0 12px; color: #577657; font-family: 'termina', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.2em; line-height: 20px;">
          ${codeLabel}
        </p>
        <p style="margin: 0 0 14px; color: #577657; font-family: 'termina', Helvetica, Arial, sans-serif; font-size: 26px; font-weight: 400; letter-spacing: 6px; text-transform: uppercase; line-height: 1.2; border: 1px dashed rgba(87, 118, 87, 0.4); display: inline-block; padding: 10px 24px;">
          {{discountCode}}
        </p>
        <p style="margin: 0; color: #000; font-family: 'EB Garamond', Georgia, serif; font-size: 14px; letter-spacing: 0.03em; line-height: 1.6;">
          {{discountDescription}}
        </p>
      </div>

      <!-- Expiry row: valorizzata da EmailService, vuota se non presente -->
      {{expiryRow}}

      <!-- Separator -->
      <div style="border-top: 1px solid rgba(87, 118, 87, 0.2); margin-top: 32px; margin-bottom: 32px;"></div>

      <!-- How to use -->
      <p style="color: #000; line-height: 1.7; margin: 0 0 32px; font-family: 'EB Garamond', Georgia, serif; font-size: 14px; letter-spacing: 0.03em;">
        ${howToUse}
      </p>

      <!-- CTA -->
      <a href="${SITE_URL}"
         style="display: inline-block; background-color: #577657; color: #F4F1EA; padding: 12px 28px; text-decoration: none; font-family: 'termina', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 3.4px;">
        ${cta}
      </a>

    </div>

    <!-- Separator -->
    <div style="border-top: 1px solid rgba(87, 118, 87, 0.2);"></div>

    <!-- Footer -->
    <div style="background-color: #F4F1EA; padding: 28px 40px; text-align: center;">
      <p style="margin: 0 0 6px; font-size: 11px; color: #577657; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.25em;">
        OLIO GALIA
      </p>
      <p style="color: #000; margin: 0 0 16px; font-family: 'EB Garamond', Georgia, serif; font-size: 13px; letter-spacing: 0.03em; font-style: italic;">
        ${taglineFooter}
      </p>
      <p style="color: #000; margin: 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; font-size: 11px; letter-spacing: 0.05em; line-height: 1.6;">
        ${footerNote}<br>
        <a href="${SITE_URL}" style="color: #000; text-decoration: underline;">oliogalia.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

export function getDiscountCodeEmailSubject(locale: 'it' | 'en'): string {
  return locale === 'it'
    ? 'Il tuo codice sconto esclusivo — Olio Galia'
    : 'Your exclusive discount code — Olio Galia';
}
