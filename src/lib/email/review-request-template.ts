import { ReviewRequestData } from "@/types/email";

export const createReviewRequestHTML = (reviewData: ReviewRequestData, feedbackUrl: string): string => {
  const {
    customerName,
    orderNumber,
    orderType = 'order'
  } = reviewData;

  const orderTypeLabel = orderType === 'order' ? 'ordine' : 'preventivo';
  const orderTypeCapitalized = orderType === 'order' ? 'Ordine' : 'Preventivo';

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="it">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ci piacerebbe il tuo feedback! - Olio Galia</title>
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
          background: linear-gradient(135deg, #ECE8DF 0%, #D6C7A1 100%);
          margin: 0;
          padding: 0;
        }

        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        /* Header styles - più caldo e amichevole */
        .header-section {
          background: linear-gradient(135deg, #789262 0%, #556B2F 100%);
          padding: 40px 20px;
          text-align: center;
        }

        .logo-text {
          color: #ffffff;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 3px;
          margin: 0 0 12px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .tagline-text {
          color: #ECE8DF;
          font-size: 16px;
          font-style: italic;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* Emoji header */
        .emoji-header {
          font-size: 64px;
          margin: 20px 0;
          text-align: center;
          line-height: 1;
        }

        /* Content styles */
        .content-section {
          padding: 40px 30px;
          background-color: #ffffff;
        }

        .greeting-text {
          color: #556B2F;
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 20px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
          text-align: center;
        }

        .main-text {
          color: #333333;
          font-size: 17px;
          line-height: 28px;
          margin: 0 0 20px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          text-align: center;
        }

        /* Friendly highlight box */
        .friendly-box {
          background: linear-gradient(135deg, #fff9f0 0%, #fef6ed 100%);
          border-left: 5px solid #789262;
          border-radius: 8px;
          padding: 25px;
          margin: 30px 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .friendly-box-text {
          color: #556B2F;
          font-size: 16px;
          line-height: 26px;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-style: italic;
        }

        /* Order reference */
        .order-reference {
          background-color: #f8f8f8;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
        }

        .order-reference-label {
          color: #666666;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 8px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .order-reference-value {
          color: #556B2F;
          font-size: 20px;
          font-weight: bold;
          margin: 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }

        /* CTA Button - più grande e amichevole */
        .cta-container {
          text-align: center;
          margin: 40px 0;
        }

        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #789262 0%, #556B2F 100%);
          color: #ffffff;
          padding: 18px 45px;
          text-decoration: none;
          border-radius: 50px;
          font-family: Georgia, "Times New Roman", Times, serif;
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(85, 107, 47, 0.3);
          transition: all 0.3s ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(85, 107, 47, 0.4);
        }

        /* Stars decoration */
        .stars-decoration {
          font-size: 32px;
          text-align: center;
          margin: 20px 0;
          line-height: 1;
        }

        /* Footer - più caldo */
        .footer-section {
          background: linear-gradient(135deg, #f8f8f8 0%, #ECE8DF 100%);
          padding: 30px 20px;
          text-align: center;
          border-top: 3px solid #D6C7A1;
        }

        .footer-brand {
          color: #556B2F;
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 10px 0;
          font-family: Georgia, "Times New Roman", Times, serif;
        }

        .footer-text {
          color: #666666;
          font-size: 14px;
          margin: 0 0 8px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .footer-emoji {
          font-size: 24px;
          margin: 15px 0 0 0;
        }

        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            border-radius: 0 !important;
          }

          .header-section,
          .content-section,
          .footer-section {
            padding: 25px 20px !important;
          }

          .logo-text {
            font-size: 26px !important;
          }

          .emoji-header {
            font-size: 48px !important;
          }

          .greeting-text {
            font-size: 20px !important;
          }

          .main-text {
            font-size: 16px !important;
          }

          .cta-button {
            padding: 15px 35px !important;
            font-size: 16px !important;
          }
        }
      </style>
    </head>
    <body bgcolor="#ECE8DF" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-wrapper">
        <tr>
          <td style="padding: 30px 15px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="margin: 0 auto;">

              <!-- Header -->
              <tr>
                <td class="header-section">
                  <h1 class="logo-text">OLIO GALIA</h1>
                  <p class="tagline-text">Ci piacerebbe sapere cosa ne pensi! 😊</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td class="content-section">

                  <!-- Emoji Header -->
                  <div class="emoji-header">💚</div>

                  <!-- Greeting -->
                  <h2 class="greeting-text">Ciao ${customerName}!</h2>

                  <p class="main-text">
                    Speriamo che tu stia godendo del nostro olio extravergine d'oliva e che abbia
                    arricchito le tue tavole con il sapore autentico della tradizione siciliana! 🌿
                  </p>

                  <!-- Order Reference -->
                  <div class="order-reference">
                    <p class="order-reference-label">${orderTypeCapitalized}</p>
                    <p class="order-reference-value">#${orderNumber}</p>
                  </div>

                  <!-- Friendly Message -->
                  <div class="friendly-box">
                    <p class="friendly-box-text">
                      💬 La tua opinione è <strong>davvero importante</strong> per noi e per aiutare
                      altri clienti a scoprire la qualità del nostro olio. Ci dedicheresti
                      <strong>qualche minuto</strong> per condividere la tua esperienza?
                    </p>
                  </div>

                  <p class="main-text">
                    Che sia una parola gentile, un suggerimento o semplicemente un "mi piace" ⭐,
                    ogni tuo feedback ci aiuta a crescere e migliorare sempre di più!
                  </p>

                  <!-- Stars Decoration -->
                  <div class="stars-decoration">⭐ ⭐ ⭐ ⭐ ⭐</div>

                  <!-- CTA Button -->
                  <div class="cta-container">
                    <a href="${feedbackUrl}" class="cta-button">
                      ✨ Lascia la Tua Recensione
                    </a>
                  </div>

                  <p class="main-text" style="font-size: 15px; color: #666666; margin-top: 30px;">
                    <strong>Grazie di cuore per la tua fiducia! 🙏</strong><br>
                    Siamo felici di averti come cliente e speriamo di continuare
                    a deliziarti con i nostri prodotti.
                  </p>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td class="footer-section">
                  <h4 class="footer-brand">OLIO GALIA</h4>
                  <p class="footer-text">L'eccellenza dell'olio extravergine d'oliva italiano</p>
                  <p class="footer-text" style="font-style: italic;">Fatto con ❤️ in Sicilia</p>
                  <div class="footer-emoji">🫒🌿</div>
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
