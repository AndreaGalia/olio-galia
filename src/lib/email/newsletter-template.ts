// lib/email/newsletter-template.ts
import { NewsletterWelcomeData } from '@/types/email';

export function createNewsletterWelcomeHTML(data: NewsletterWelcomeData): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto nella Newsletter Olio Galia</title>
  <style>
    body {
      font-family: 'Roboto', Arial, sans-serif;
      background-color: #ECE8DF;
      margin: 0;
      padding: 0;
      color: #556B2F;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(85, 107, 47, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #556B2F 0%, #789262 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ECE8DF;
      font-size: 32px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }
    .header .icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      color: #556B2F;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message {
      color: #556B2F;
      line-height: 1.8;
      font-size: 16px;
      margin-bottom: 25px;
    }
    .benefits {
      background-color: #F5F3EF;
      border-left: 4px solid #789262;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .benefits h3 {
      color: #556B2F;
      font-size: 18px;
      margin: 0 0 15px 0;
    }
    .benefits ul {
      margin: 0;
      padding-left: 20px;
      color: #556B2F;
    }
    .benefits li {
      margin-bottom: 10px;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #789262 0%, #556B2F 100%);
      color: #ECE8DF;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.3s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #F5F3EF;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #D6C7A1;
    }
    .footer p {
      margin: 5px 0;
      color: #B2A98C;
      font-size: 14px;
    }
    .footer a {
      color: #789262;
      text-decoration: none;
    }
    .social-icons {
      margin-top: 20px;
    }
    .social-icons a {
      display: inline-block;
      margin: 0 10px;
      color: #789262;
      font-size: 24px;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="icon">🌿</div>
      <h1>Benvenuto nella famiglia Olio Galia!</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Ciao ${data.firstName},
      </div>

      <div class="message">
        Grazie per esserti iscritto alla nostra newsletter! Siamo felici di averti con noi e non vediamo l'ora di condividere con te la passione per l'olio extravergine di oliva di qualità.
      </div>

      <div class="message">
        La nostra newsletter ti terrà aggiornato su:
      </div>

      <div class="benefits">
        <h3>✨ Cosa riceverai:</h3>
        <ul>
          <li>🎁 <strong>Offerte esclusive</strong> riservate agli iscritti</li>
          <li>📦 <strong>Nuovi prodotti</strong> in anteprima</li>
          <li>🌱 <strong>Ricette e consigli</strong> per utilizzare al meglio il nostro olio</li>
          <li>📰 <strong>Storie e novità</strong> dal nostro frantoio</li>
          <li>🎉 <strong>Eventi e degustazioni</strong> speciali</li>
        </ul>
      </div>

      <div class="message">
        Nel frattempo, scopri la nostra selezione di oli extravergini di oliva e scegli quello perfetto per te!
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com'}/products" class="cta-button">
          Scopri i nostri prodotti
        </a>
      </div>

      <div class="message" style="margin-top: 30px; font-size: 14px; color: #B2A98C;">
        Se hai domande o desideri maggiori informazioni, non esitare a contattarci. Siamo sempre a tua disposizione!
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Olio Galia</strong></p>
      <p>Olio Extravergine di Oliva di Qualità</p>
      <p style="margin-top: 15px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com'}">Visita il sito</a> |
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com'}/contact">Contattaci</a>
      </p>

      <div class="social-icons">
        <a href="#" title="Facebook">📘</a>
        <a href="#" title="Instagram">📷</a>
        <a href="#" title="Twitter">🐦</a>
      </div>

      <p style="margin-top: 20px; font-size: 12px;">
        Hai ricevuto questa email perché ti sei iscritto alla newsletter di Olio Galia.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
