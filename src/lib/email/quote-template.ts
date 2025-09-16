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

export const createQuoteEmailHTML = (quoteData: QuoteEmailData): string => {
  const { 
    customerName,
    orderId,
    items,
    subtotal,
    shipping,
    total,
    customerEmail,
    customerPhone
  } = quoteData;
  
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="it">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Il tuo Preventivo - Olio Galia</title>
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
        
        .intro-text {
          color: #333333;
          font-size: 16px;
          line-height: 24px;
          margin: 0 0 30px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Quote info box */
        .quote-info-box {
          background-color: #f8f8f8;
          border-left: 4px solid #789262;
          padding: 20px;
          margin: 20px 0;
        }
        
        .quote-info-title {
          color: #556B2F;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 15px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .quote-detail-row {
          margin-bottom: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .quote-detail-label {
          color: #666666;
          font-size: 14px;
        }
        
        .quote-detail-value {
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
        
        /* Payment methods section */
        .payment-section {
          background-color: #f8f8f8;
          border: 2px solid #789262;
          padding: 25px;
          margin: 30px 0;
          border-radius: 8px;
        }
        
        .payment-title {
          color: #556B2F;
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 20px 0;
          text-align: center;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .payment-method {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        
        .payment-method-title {
          color: #556B2F;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .payment-method-text {
          color: #333333;
          font-size: 14px;
          line-height: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .bank-details {
          background-color: #f0f0f0;
          padding: 10px;
          margin-top: 8px;
          border-radius: 4px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
        }
        
        /* Contact section */
        .contact-section {
          background-color: #789262;
          color: #ffffff;
          padding: 20px;
          margin: 30px 0;
          text-align: center;
        }
        
        .contact-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        .contact-text {
          font-size: 14px;
          line-height: 20px;
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
          
          .payment-section {
            padding: 20px 15px !important;
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
                  <p class="tagline-text">Il tuo preventivo personalizzato è pronto</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td class="content-section">
                  
                  <!-- Greeting -->
                  <h2 class="greeting-text">Gentile ${customerName},</h2>
                  
                  <p class="intro-text">
                    Grazie per aver richiesto un preventivo per i nostri prodotti di qualità. 
                    Abbiamo preparato un'offerta personalizzata per lei, con i prezzi migliori 
                    per l'eccellenza del nostro olio extravergine d'oliva.
                  </p>
                  
                  <!-- Quote Info -->
                  <div class="quote-info-box">
                    <h3 class="quote-info-title">Dettagli Preventivo</h3>
                    <div class="quote-detail-row clearfix">
                      <span class="quote-detail-label">Numero Preventivo:</span>
                      <strong class="quote-detail-value">#${orderId}</strong>
                    </div>
                    <div class="quote-detail-row clearfix">
                      <span class="quote-detail-label">Data:</span>
                      <strong class="quote-detail-value">${new Date().toLocaleDateString('it-IT')}</strong>
                    </div>
                    <div class="quote-detail-row clearfix">
                      <span class="quote-detail-label">Validità:</span>
                      <strong class="quote-detail-value">30 giorni</strong>
                    </div>
                  </div>
                  
                  <!-- Items -->
                  <h3 class="items-title">Dettaglio Prodotti</h3>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="items-table">
                    ${items.map(item => `
                      <tr class="item-row">
                        <td class="item-cell">
                          <div class="item-name">${item.name}</div>
                          <div class="item-quantity">Quantità: ${item.quantity}</div>
                        </td>
                        <td class="item-cell item-price">€${item.totalPrice.toFixed(2)}</td>
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
                  
                  <!-- Payment Methods -->
                  <div class="payment-section">
                    <h3 class="payment-title">💳 Come Procedere al Pagamento</h3>
                    
                    <div class="payment-method">
                      <div class="payment-method-title">💰 Contanti (Ritiro in Loco)</div>
                      <div class="payment-method-text">
                        Ritiro presso la nostra sede con pagamento in contanti. 
                        <strong>Contattaci per concordare l'appuntamento.</strong>
                      </div>
                    </div>
                    
                    <div class="payment-method">
                      <div class="payment-method-title">🏦 Bonifico Bancario</div>
                      <div class="payment-method-text">
                        Effettua il bonifico e inviaci la ricevuta via email o WhatsApp.
                        <div class="bank-details">
                          <strong>Beneficiario:</strong> Olio Galia<br>
                          <strong>IBAN:</strong> IT00 0000 0000 0000 0000 0000 000<br>
                          <strong>Causale:</strong> Pagamento Preventivo #${orderId}
                        </div>
                      </div>
                    </div>
                    
                    <div class="payment-method">
                      <div class="payment-method-title">🅿️ PayPal</div>
                      <div class="payment-method-text">
                        Invia il pagamento tramite PayPal all'indirizzo: <strong>pagamenti@olio-galia.it</strong><br>
                        <em>Specifica il numero del preventivo nella causale.</em>
                      </div>
                    </div>
                    
                    <div class="payment-method">
                      <div class="payment-method-title">📱 Satispay</div>
                      <div class="payment-method-text">
                        Cerca "Olio Galia" su Satispay e invia il pagamento.<br>
                        <em>Aggiungi il numero preventivo nella descrizione.</em>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Contact Section -->
                  <div class="contact-section">
                    <div class="contact-title">📞 Dopo il Pagamento</div>
                    <div class="contact-text">
                      <strong>Comunicaci il pagamento effettuato tramite:</strong><br><br>
                      📧 Email: <strong>${customerEmail}</strong><br>
                      📱 WhatsApp: <strong>${customerPhone}</strong><br><br>
                      <em>Procederemo immediatamente alla preparazione del tuo ordine!</em>
                    </div>
                  </div>
                  
                  <p class="intro-text">
                    <strong>Questo preventivo è valido per 30 giorni dalla data odierna.</strong><br>
                    Per qualsiasi domanda o chiarimento, non esiti a contattarci. 
                    Saremo lieti di assisterla nella scelta del miglior olio per le sue esigenze.
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