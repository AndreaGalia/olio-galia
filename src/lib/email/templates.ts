import { EmailOrderDataExtended, ShippingNotificationData, DeliveryNotificationData } from "@/types/email";

interface QuoteEmailData {
  customerName: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  customerEmail: string;
  customerPhone: string;
}

export const createOrderConfirmationHTML = (orderData: EmailOrderDataExtended): string => {
  const { 
    customerName, 
    orderNumber, 
    orderDate, 
    items, 
    subtotal, 
    shipping, 
    total, 
    shippingAddress,
    receiptUrl,
    hasInvoice 
  } = orderData;
  
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="it">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Conferma Ordine - Olio Galia</title>
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
        /* Reset styles for email clients */
        * {
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        table, td {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        
        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
        }
        
        /* Email-safe fonts */
        .email-font {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .serif-font {
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        /* Main container */
        .email-wrapper {
          width: 100% !important;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
        }
        
        /* Header styles */
        .header-section {
          background-color: #556B2F;
          padding: 30px 20px;
          text-align: center;
        }
        
        .logo-text {
          color: #ffffff;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 2px;
          margin: 0 0 8px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .tagline-text {
          color: #D6C7A1;
          font-size: 14px;
          font-style: italic;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Content styles */
        .content-section {
          padding: 30px 20px;
          background-color: #ffffff;
        }
        
        .greeting-text {
          color: #556B2F;
          font-size: 22px;
          font-weight: bold;
          margin: 0 0 20px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .thank-you-text {
          color: #333333;
          font-size: 16px;
          line-height: 24px;
          margin: 0 0 30px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Order info box */
        .order-info-box {
          background-color: #f8f8f8;
          border-left: 4px solid #789262;
          padding: 20px;
          margin: 20px 0;
        }
        
        .order-info-title {
          color: #556B2F;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 15px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .order-detail-row {
          margin-bottom: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .order-detail-label {
          color: #666666;
          font-size: 14px;
        }
        
        .order-detail-value {
          color: #333333;
          font-size: 14px;
          font-weight: bold;
          float: right;
        }
        
        /* Items table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .items-title {
          color: #556B2F;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0 15px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .item-row {
          border-bottom: 1px solid #e0e0e0;
        }
        
        .item-cell {
          padding: 12px 0;
          vertical-align: top;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .item-name {
          color: #333333;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .item-quantity {
          color: #666666;
          font-size: 14px;
        }
        
        .item-price {
          color: #556B2F;
          font-size: 16px;
          font-weight: bold;
          text-align: right;
        }
        
        /* Total section */
        .total-box {
          background-color: #556B2F;
          color: #ffffff;
          padding: 20px;
          margin: 20px 0;
        }
        
        .total-row {
          margin-bottom: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .total-label {
          font-size: 14px;
        }
        
        .total-value {
          font-size: 14px;
          float: right;
        }
        
        .total-final-row {
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          margin-top: 12px;
          padding-top: 12px;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .total-final-label {
          font-size: 18px;
          font-weight: bold;
        }
        
        .total-final-value {
          font-size: 18px;
          font-weight: bold;
          float: right;
        }
        
        /* Receipt button */
        .receipt-section {
          text-align: center;
          margin: 30px 0;
        }
        
        .receipt-button {
          display: inline-block;
          background-color: #556B2F;
          color: #ffffff !important;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: bold;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .receipt-description {
          margin-top: 12px;
          color: #666666;
          font-size: 14px;
          font-style: italic;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Footer */
        .footer-section {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        }
        
        .footer-brand {
          color: #556B2F;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 8px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .footer-text {
          color: #666666;
          font-size: 14px;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
          }
          
          .header-section,
          .content-section,
          .footer-section {
            padding: 20px 15px !important;
          }
          
          .logo-text {
            font-size: 24px !important;
          }
          
          .greeting-text {
            font-size: 20px !important;
          }
          
          .item-cell {
            display: block !important;
            width: 100% !important;
          }
          
          .item-price {
            text-align: left !important;
            margin-top: 8px;
          }
          
          .receipt-button {
            padding: 12px 24px !important;
            font-size: 14px !important;
          }
        }
        
        /* Clear floats */
        .clearfix:after {
          content: "";
          display: table;
          clear: both;
        }
      </style>
    </head>
    <body bgcolor="#f5f5f5" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-wrapper">
        <tr>
          <td style="padding: 20px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="margin: 0 auto;">
              
              <!-- Header -->
              <tr>
                <td class="header-section">
                  <h1 class="logo-text">OLIO GALIA</h1>
                  <p class="tagline-text">Eccellenza dell'olio extravergine d'oliva</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td class="content-section">
                  
                  <!-- Greeting -->
                  <h2 class="greeting-text">Gentile ${customerName},</h2>
                  
                  <p class="thank-you-text">
                    La ringraziamo per aver scelto <strong>Olio Galia</strong>. 
                    Il suo ordine è stato ricevuto con successo e verrà preparato con la massima cura.
                  </p>
                  
                  <!-- Order Info -->
                  <div class="order-info-box">
                    <h3 class="order-info-title">Dettagli Ordine</h3>
                    <div class="order-detail-row clearfix">
                      <span class="order-detail-label">Numero Ordine:</span>
                      <strong class="order-detail-value">#${orderNumber}</strong>
                    </div>
                    <div class="order-detail-row clearfix">
                      <span class="order-detail-label">Data:</span>
                      <strong class="order-detail-value">${orderDate}</strong>
                    </div>
                  </div>
                  
                  <!-- Items -->
                  <h3 class="items-title">Riepilogo Ordine</h3>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="items-table">
                    ${items.map(item => `
                      <tr class="item-row">
                        <td class="item-cell">
                          <div class="item-name">${item.name}</div>
                          <div class="item-quantity">Quantità: ${item.quantity}</div>
                        </td>
                        <td class="item-cell item-price">€${item.price.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </table>
                  
                  <!-- Total -->
                  <div class="total-box">
                    <div class="total-row clearfix">
                      <span class="total-label">Subtotale:</span>
                      <span class="total-value">€${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row clearfix">
                      <span class="total-label">Spedizione:</span>
                      <span class="total-value">€${shipping.toFixed(2)}</span>
                    </div>
                    <div class="total-final-row clearfix">
                      <span class="total-final-label">Totale:</span>
                      <span class="total-final-value">€${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  ${receiptUrl ? `
                  <!-- Receipt/Invoice Button -->
                  <div class="receipt-section">
                    <a href="${receiptUrl}" class="receipt-button">
                      ${hasInvoice ? 'Scarica Ricevuta e Fattura' : 'Scarica Ricevuta'}
                    </a>
                    <p class="receipt-description">
                      ${hasInvoice ? 
                        'Ricevuta di pagamento e fattura fiscale disponibili per il download' : 
                        'Ricevuta di pagamento disponibile per il download'
                      }
                    </p>
                  </div>
                  ` : ''}
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td class="footer-section">
                  <h4 class="footer-brand">OLIO GALIA</h4>
                  <p class="footer-text">Grazie per aver scelto la qualità italiana.</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const createShippingNotificationHTML = (shippingData: ShippingNotificationData): string => {
  const { 
    customerName, 
    orderNumber, 
    shippingTrackingId,
    shippingCarrier = 'Corriere Espresso',
    expectedDelivery 
  } = shippingData;
  
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="it">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Il tuo ordine è in viaggio - Olio Galia</title>
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
        /* Reset styles for email clients */
        * {
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        table, td {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        
        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
        }
        
        /* Email-safe fonts */
        .email-font {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .serif-font {
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        /* Main container */
        .email-wrapper {
          width: 100% !important;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
        }
        
        /* Header styles */
        .header-section {
          background-color: #556B2F;
          padding: 30px 20px;
          text-align: center;
        }
        
        .logo-text {
          color: #ffffff;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 2px;
          margin: 0 0 8px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .tagline-text {
          color: #D6C7A1;
          font-size: 14px;
          font-style: italic;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Content styles */
        .content-section {
          padding: 30px 20px;
          background-color: #ffffff;
        }
        
        .greeting-text {
          color: #556B2F;
          font-size: 22px;
          font-weight: bold;
          margin: 0 0 20px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .thank-you-text {
          color: #333333;
          font-size: 16px;
          line-height: 24px;
          margin: 0 0 30px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Order info box */
        .order-info-box {
          background-color: #f8f8f8;
          border-left: 4px solid #789262;
          padding: 20px;
          margin: 20px 0;
        }
        
        .order-info-title {
          color: #556B2F;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 15px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .order-detail-row {
          margin-bottom: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .order-detail-label {
          color: #666666;
          font-size: 14px;
        }
        
        .order-detail-value {
          color: #333333;
          font-size: 14px;
          font-weight: bold;
          float: right;
        }
        
        /* Tracking ID highlight */
        .tracking-highlight {
          background-color: #556B2F;
          color: #ffffff;
          padding: 15px 20px;
          border-radius: 4px;
          text-align: center;
          margin: 20px 0;
          font-family: 'Courier New', Courier, monospace;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 2px;
        }
        
        /* Items title */
        .items-title {
          color: #556B2F;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0 15px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        /* Total section */
        .total-box {
          background-color: #556B2F;
          color: #ffffff;
          padding: 20px;
          margin: 20px 0;
        }
        
        .total-row {
          margin-bottom: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .total-label {
          font-size: 14px;
        }
        
        .total-value {
          font-size: 14px;
          float: right;
        }
        
        .total-final-row {
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          margin-top: 12px;
          padding-top: 12px;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .total-final-label {
          font-size: 18px;
          font-weight: bold;
        }
        
        .total-final-value {
          font-size: 18px;
          font-weight: bold;
          float: right;
        }
        
        /* Footer */
        .footer-section {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        }
        
        .footer-brand {
          color: #556B2F;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 8px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .footer-text {
          color: #666666;
          font-size: 14px;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
          }
          
          .header-section,
          .content-section,
          .footer-section {
            padding: 20px 15px !important;
          }
          
          .logo-text {
            font-size: 24px !important;
          }
          
          .greeting-text {
            font-size: 20px !important;
          }
          
          .tracking-highlight {
            font-size: 16px !important;
            padding: 12px 16px !important;
          }
        }
        
        /* Clear floats */
        .clearfix:after {
          content: "";
          display: table;
          clear: both;
        }
      </style>
    </head>
    <body bgcolor="#f5f5f5" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-wrapper">
        <tr>
          <td style="padding: 20px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="margin: 0 auto;">
              
              <!-- Header -->
              <tr>
                <td class="header-section">
                  <h1 class="logo-text">OLIO GALIA</h1>
                  <p class="tagline-text">Il tuo ordine è in viaggio!</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td class="content-section">
                  
                  <!-- Greeting -->
                  <h2 class="greeting-text">Gentile ${customerName},</h2>
                  
                  <p class="thank-you-text">
                    Ottime notizie! Il suo ordine <strong>#${orderNumber}</strong> è stato spedito e 
                    ora è in viaggio verso di lei. Potrà seguire lo stato della spedizione utilizzando 
                    l'ID di tracciamento qui sotto.
                  </p>
                  
                  <!-- Order Info -->
                  <div class="order-info-box">
                    <h3 class="order-info-title">Dettagli Spedizione</h3>
                    <div class="order-detail-row clearfix">
                      <span class="order-detail-label">Numero Ordine:</span>
                      <strong class="order-detail-value">#${orderNumber}</strong>
                    </div>
                    <div class="order-detail-row clearfix">
                      <span class="order-detail-label">Corriere:</span>
                      <strong class="order-detail-value">${shippingCarrier}</strong>
                    </div>
                    ${expectedDelivery ? `
                    <div class="order-detail-row clearfix">
                      <span class="order-detail-label">Consegna prevista:</span>
                      <strong class="order-detail-value">${expectedDelivery}</strong>
                    </div>
                    ` : ''}
                  </div>
                  
                  <!-- Tracking ID -->
                  <h3 class="items-title">ID di Tracciamento</h3>
                  <div class="tracking-highlight">${shippingTrackingId}</div>
                  
                  <!-- Status Timeline -->
                  <div class="total-box">
                    <div class="total-row clearfix">
                      <span class="total-label">✓ Ordine confermato e pagato</span>
                    </div>
                    <div class="total-row clearfix">
                      <span class="total-label">✓ Ordine preparato e imballato</span>
                    </div>
                    <div class="total-final-row clearfix">
                      <span class="total-final-label">🚚 In transito presso il corriere</span>
                    </div>
                  </div>
                  
                  <p class="thank-you-text">
                    <strong>Grazie per aver scelto Olio Galia.</strong><br>
                    Non vediamo l'ora che riceva il suo olio extravergine d'oliva di qualità superiore.
                    Per qualsiasi domanda, non esiti a contattarci.
                  </p>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td class="footer-section">
                  <h4 class="footer-brand">OLIO GALIA</h4>
                  <p class="footer-text">L'eccellenza dell'olio extravergine d'oliva italiano.</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};