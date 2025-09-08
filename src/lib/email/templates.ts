import { EmailOrderDataExtended } from "@/types/email";

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
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Conferma Ordine - Olio Galia</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        /* Sfondo scuro per tutti i client */
        html {
          background-color: #2C3E2D !important;
          min-height: 100vh;
        }
        
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #E8E8E8;
          background-color: #2C3E2D !important;
          padding: 20px;
          min-height: 100vh;
          margin: 0 !important;
        }
        
        /* Wrapper esterno per garantire sfondo scuro */
        .email-wrapper {
          background-color: #2C3E2D !important;
          width: 100%;
          min-height: 100vh;
          padding: 20px 0;
          margin: 0;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        
        .header {
          background-color: #556B2F;
          color: #ECE8DF;
          padding: 40px 30px;
          text-align: center;
        }
        
        .logo {
          font-family: "Cormorant Garamond", serif;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: 2px;
        }
        
        .tagline {
          font-size: 14px;
          font-style: italic;
          color: #D6C7A1;
        }
        
        .content {
          padding: 40px 30px;
          background-color: #FFFFFF;
        }
        
        .greeting {
          font-family: "Cormorant Garamond", serif;
          font-size: 24px;
          color: #556B2F;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .thank-you {
          margin-bottom: 30px;
          color: #556B2F;
          font-size: 16px;
          line-height: 1.6;
        }
        
        .order-info {
          background-color: #ECE8DF;
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
          border-left: 4px solid #789262;
        }
        
        .order-info h3 {
          font-family: "Cormorant Garamond", serif;
          color: #556B2F;
          font-size: 20px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .order-detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #556B2F;
        }
        
        .order-detail span {
          color: #789262;
        }
        
        .order-detail strong {
          font-weight: 600;
        }
        
        .items-list {
          margin: 30px 0;
        }
        
        .items-list h3 {
          font-family: "Cormorant Garamond", serif;
          color: #556B2F;
          font-size: 20px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #ECE8DF;
        }
        
        .item:last-child {
          border-bottom: none;
        }
        
        .item-details {
          flex: 1;
        }
        
        .item-name {
          font-weight: 600;
          color: #556B2F;
          margin-bottom: 4px;
        }
        
        .item-quantity {
          color: #789262;
          font-size: 14px;
        }
        
        .item-price {
          font-weight: 600;
          color: #556B2F;
          font-size: 16px;
        }
        
        .total-section {
          background-color: #789262;
          color: #FFFFFF;
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .total-final {
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          font-weight: 700;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          margin-top: 15px;
          font-family: "Cormorant Garamond", serif;
        }
        
        /* Stili per il bottone ricevuta/fattura */
        .receipt-section {
          margin: 30px 0;
          text-align: center;
        }
        
        .receipt-button {
          display: inline-block;
          background: linear-gradient(135deg, #556B2F 0%, #789262 100%);
          color: #FFFFFF;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-family: "Cormorant Garamond", serif;
          font-size: 18px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(85, 107, 47, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .receipt-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(85, 107, 47, 0.4);
        }
        
        .receipt-button-icon {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 8px;
          vertical-align: middle;
          fill: currentColor;
        }
        
        .invoice-badge {
          display: inline-block;
          background: linear-gradient(45deg, #D6C7A1, #C8B99C);
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 12px;
          margin-left: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .receipt-description {
          margin-top: 12px;
          color: #789262;
          font-size: 14px;
          font-style: italic;
        }
        
        .footer {
          background-color: #ECE8DF;
          color: #789262;
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        
        .footer-brand {
          font-family: "Cormorant Garamond", serif;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #556B2F;
        }
        
        /* Stili specifici per client desktop */
        @media screen and (min-width: 600px) {
          .email-wrapper {
            background-color: #2C3E2D !important;
          }
          
          body {
            background-color: #2C3E2D !important;
          }
          
          html {
            background-color: #2C3E2D !important;
          }
        }
        
        @media (max-width: 600px) {
          .email-wrapper {
            padding: 10px 0;
          }
          
          body {
            padding: 10px;
          }
          
          .header, .content, .footer {
            padding: 25px 20px;
          }
          
          .logo {
            font-size: 28px;
          }
          
          .greeting {
            font-size: 20px;
          }
          
          .item {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .item-price {
            margin-top: 8px;
          }
          
          .receipt-button {
            padding: 14px 24px;
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body bgcolor="#2C3E2D">
      <div class="email-wrapper">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo">OLIO GALIA</div>
            <div class="tagline">Eccellenza dell'olio extravergine d'oliva</div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Gentile ${customerName},
            </div>
            
            <p class="thank-you">
              La ringraziamo per aver scelto <strong>Olio Galia</strong>. 
              Il suo ordine è stato ricevuto con successo e verrà preparato con la massima cura.
            </p>
            
            <!-- Order Info -->
            <div class="order-info">
              <h3>Dettagli Ordine</h3>
              <div class="order-detail">
                <span>Numero Ordine:</span>
                <strong>#${orderNumber}</strong>
              </div>
              <div class="order-detail">
                <span>Data:</span>
                <strong>${orderDate}</strong>
              </div>
            </div>
            
            <!-- Items -->
            <div class="items-list">
              <h3>Riepilogo Ordine</h3>
              ${items.map(item => `
                <div class="item">
                  <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Quantità: ${item.quantity}</div>
                  </div>
                  <div class="item-price">€${item.price.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            
            <!-- Total -->
            <div class="total-section">
              <div class="total-row">
                <span>Subtotale:</span>
                <span>€${subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Spedizione:</span>
                <span>€${shipping.toFixed(2)}</span>
              </div>
              <div class="total-final">
                <span>Totale:</span>
                <span>€${total.toFixed(2)}</span>
              </div>
            </div>
            
            ${receiptUrl ? `
            <!-- Receipt/Invoice Button -->
            <div class="receipt-section">
              <a href="${receiptUrl}" class="receipt-button" target="_blank" rel="noopener noreferrer">
                <svg class="receipt-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                ${hasInvoice ? 'Scarica Ricevuta e Fattura' : 'Scarica Ricevuta'}
                ${hasInvoice ? '<span class="invoice-badge">Fattura Inclusa</span>' : ''}
              </a>
              <div class="receipt-description">
                ${hasInvoice ? 
                  'Ricevuta di pagamento e fattura fiscale disponibili per il download' : 
                  'Ricevuta di pagamento disponibile per il download'
                }
              </div>
            </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-brand">OLIO GALIA</div>
            <p>Grazie per aver scelto la qualità italiana.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};