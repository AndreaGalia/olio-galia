import { DeliveryNotificationData } from "@/types/email";

export const createDeliveryNotificationHTML = (deliveryData: DeliveryNotificationData): string => {
  const { 
    customerName, 
    orderNumber, 
    shippingTrackingId,
    deliveryDate = new Date().toLocaleDateString('it-IT')
  } = deliveryData;
  
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="it">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ordine consegnato - Olio Galia</title>
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
        
        /* Delivery status highlight */
        .delivery-highlight {
          background-color: #556B2F;
          color: #ffffff;
          padding: 15px 20px;
          border-radius: 4px;
          text-align: center;
          margin: 20px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
          font-size: 18px;
          font-weight: bold;
        }
        
        /* Items title */
        .items-title {
          color: #556B2F;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0 15px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }
        
        /* Total section - Success status */
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
          
          .delivery-highlight {
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
                  <p class="tagline-text">Ordine consegnato con successo!</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td class="content-section">
                  
                  <!-- Greeting -->
                  <h2 class="greeting-text">Gentile ${customerName},</h2>
                  
                  <p class="thank-you-text">
                    È con grande piacere che le confermiamo la <strong>consegna avvenuta con successo</strong> 
                    del suo ordine <strong>#${orderNumber}</strong>. Speriamo che sia soddisfatto della 
                    qualità del nostro olio extravergine d'oliva e che possa gustarne tutto l'aroma autentico.
                  </p>
                  
                  <!-- Order Info -->
                  <div class="order-info-box">
                    <h3 class="order-info-title">Dettagli Consegna</h3>
                    <div class="order-detail-row clearfix">
                      <span class="order-detail-label">Numero Ordine:</span>
                      <strong class="order-detail-value">#${orderNumber}</strong>
                    </div>
                    <div class="order-detail-row clearfix">
                      <span class="order-detail-label">Data Consegna:</span>
                      <strong class="order-detail-value">${deliveryDate}</strong>
                    </div>
                    ${shippingTrackingId ? `
                    <div class="order-detail-row clearfix">
                      <span class="order-detail-label">ID Spedizione:</span>
                      <strong class="order-detail-value">${shippingTrackingId}</strong>
                    </div>
                    ` : ''}
                  </div>
                  
                  <!-- Delivery Status -->
                  <h3 class="items-title">Stato Ordine</h3>
                  <div class="delivery-highlight">✅ CONSEGNATO CON SUCCESSO</div>
                  
                  <!-- Status Timeline -->
                  <div class="total-box">
                    <div class="total-row clearfix">
                      <span class="total-label">✓ Ordine ricevuto e confermato</span>
                    </div>
                    <div class="total-row clearfix">
                      <span class="total-label">✓ Prodotto preparato con cura</span>
                    </div>
                    <div class="total-row clearfix">
                      <span class="total-label">✓ Spedizione avviata</span>
                    </div>
                    <div class="total-final-row clearfix">
                      <span class="total-final-label">🏆 Consegnato con successo!</span>
                    </div>
                  </div>
                  
                  <p class="thank-you-text">
                    <strong>Grazie per aver scelto Olio Galia.</strong><br>
                    La sua fiducia è molto importante per noi. Speriamo che il nostro olio 
                    extravergine d'oliva arricchisca le sue tavole con il sapore autentico della tradizione italiana.
                  </p>
                  
                  <p class="thank-you-text" style="font-style: italic; color: #666666;">
                    Se è soddisfatto del nostro servizio, ci farebbe molto piacere 
                    ricevere un suo feedback per aiutare altri clienti nelle loro scelte.
                  </p>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td class="footer-section">
                  <h4 class="footer-brand">OLIO GALIA</h4>
                  <p class="footer-text">L'eccellenza dell'olio extravergine d'oliva italiano a casa sua.</p>
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