/**
 * Script per eliminare e ricreare i template email di sistema
 * con possibilità di specificare credenziali MongoDB custom
 *
 * Esegui con:
 * npm run reseed-templates
 *
 * Oppure doppio click su reseed-templates.bat
 *
 * Questo script:
 * 1. Elimina i vecchi template di sistema
 * 2. Ricrea i 6 template email di sistema nel database:
 *    - order_confirmation
 *    - shipping_notification
 *    - delivery_notification
 *    - quote_email
 *    - review_request
 *    - newsletter_welcome
 */

import { MongoClient, Db } from 'mongodb';
import { EmailTemplateDocument, TEMPLATE_VARIABLES } from '../types/emailTemplate';

// ===================================================================
// CONFIGURAZIONE - Modifica qui le tue credenziali
// ===================================================================
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ancegalia_db_user:Maxinda7007@cluster0.1ujsktk.mongodb.net/';
const dbName = process.env.MONGODB_DB_NAME || 'ecommerce';
// ===================================================================

let client: MongoClient;

async function getDatabase(): Promise<Db> {
  client = new MongoClient(mongoUri);
  await client.connect();
  console.log('✅ Connesso a MongoDB');
  return client.db(dbName);
}

async function reseedEmailTemplates() {
  console.log('🔄 Inizio re-seeding template email...\n');
  console.log(`📍 Database: ${dbName}`);
  console.log(`📍 URI: ${mongoUri.substring(0, 30)}...\n`);

  try {
    const db = await getDatabase();
    const collection = db.collection<EmailTemplateDocument>('email_templates');

    // 1. Elimina i vecchi template di sistema
    const existingCount = await collection.countDocuments({ isSystem: true });

    if (existingCount > 0) {
      console.log(`🗑️  Eliminazione di ${existingCount} template di sistema esistenti...`);
      const deleteResult = await collection.deleteMany({ isSystem: true });
      console.log(`✅ Eliminati ${deleteResult.deletedCount} template\n`);
    } else {
      console.log('ℹ️  Nessun template di sistema da eliminare\n');
    }

    // 2. Crea i nuovi template
    console.log('📝 Creazione nuovi template...\n');

    // Template di sistema da creare
    const systemTemplates: Omit<EmailTemplateDocument, '_id'>[] = [
      {
        templateKey: 'order_confirmation',
        name: 'Conferma Ordine',
        isSystem: true,
        translations: {
          it: {
            subject: 'Conferma Ordine #{{orderNumber}} - Grazie per il tuo acquisto!',
            htmlBody: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conferma Ordine - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Eccellenza dell'olio extravergine d'oliva</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Gentile {{customerName}},</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        La ringraziamo per aver scelto <strong style="font-weight: bold;">OLIO GALIA</strong>.
        Il suo ordine è stato ricevuto con successo e verrà preparato con la massima cura.
      </p>

      <!-- Order Details -->
      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 20px 0;">
        <h3 style="color: #556B2F; margin: 0 0 15px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Dettagli Ordine</h3>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Numero Ordine:</strong> #{{orderNumber}}</p>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Data:</strong> {{orderDate}}</p>
      </div>

      <!-- Items -->
      <h3 style="color: #556B2F; margin: 20px 0 10px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Riepilogo Ordine</h3>
      <table style="width: 100%; border-collapse: collapse;">
        {{items}}
      </table>

      <!-- Total -->
      <div style="background-color: #556B2F; color: #ffffff; padding: 20px; margin: 20px 0;">
        <div style="margin-bottom: 8px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          <span>Subtotale:</span>
          <span style="float: right;">€{{subtotal}}</span>
        </div>
        <div style="margin-bottom: 8px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          <span>Spedizione:</span>
          <span style="float: right;">€{{shipping}}</span>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.3); margin-top: 12px; padding-top: 12px; font-size: 18px; font-weight: bold; font-family: 'Roboto', Helvetica, Arial, sans-serif;">
          <span>Totale:</span>
          <span style="float: right;">€{{total}}</span>
        </div>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 20px 0 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Riceverà un'email di conferma quando il suo ordine sarà spedito.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Grazie per aver scelto la qualità italiana.</p>
    </div>

  </div>
</body>
</html>`
          },
          en: {
            subject: 'Order Confirmation #{{orderNumber}} - Thank you for your purchase!',
            htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Excellence in extra virgin olive oil</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Dear {{customerName}},</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Thank you for choosing <strong style="font-weight: bold;">OLIO GALIA</strong>.
        Your order has been successfully received and will be prepared with the utmost care.
      </p>

      <!-- Order Details -->
      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 20px 0;">
        <h3 style="color: #556B2F; margin: 0 0 15px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Order Details</h3>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Order Number:</strong> #{{orderNumber}}</p>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Date:</strong> {{orderDate}}</p>
      </div>

      <!-- Items -->
      <h3 style="color: #556B2F; margin: 20px 0 10px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        {{items}}
      </table>

      <!-- Total -->
      <div style="background-color: #556B2F; color: #ffffff; padding: 20px; margin: 20px 0;">
        <div style="margin-bottom: 8px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          <span>Subtotal:</span>
          <span style="float: right;">€{{subtotal}}</span>
        </div>
        <div style="margin-bottom: 8px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          <span>Shipping:</span>
          <span style="float: right;">€{{shipping}}</span>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.3); margin-top: 12px; padding-top: 12px; font-size: 18px; font-weight: bold; font-family: 'Roboto', Helvetica, Arial, sans-serif;">
          <span>Total:</span>
          <span style="float: right;">€{{total}}</span>
        </div>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 20px 0 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        You will receive a confirmation email when your order is shipped.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Thank you for choosing Italian quality.</p>
    </div>

  </div>
</body>
</html>`
          }
        },
        availableVariables: TEMPLATE_VARIABLES.order_confirmation || [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      },
      {
        templateKey: 'shipping_notification',
        name: 'Notifica Spedizione',
        isSystem: true,
        translations: {
          it: {
            subject: 'Ordine #{{orderNumber}} spedito - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ordine Spedito - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Eccellenza dell'olio extravergine d'oliva</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Il tuo ordine è in viaggio</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Gentile {{customerName}},
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Il tuo ordine <strong>#{{orderNumber}}</strong> è stato spedito e sarà presto nelle tue mani.
      </p>

      <!-- Shipping Details -->
      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 20px 0;">
        <h3 style="color: #556B2F; margin: 0 0 15px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Dettagli Spedizione</h3>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Corriere:</strong> {{shippingCarrier}}</p>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Consegna prevista:</strong> {{expectedDelivery}}</p>
      </div>

      <!-- Track Shipment Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{trackingUrl}}" style="display: inline-block; background-color: #556B2F; color: #ffffff; text-decoration: none; padding: 15px 40px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase; font-size: 16px; letter-spacing: 1px; border-radius: 4px;">Traccia la Spedizione</a>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 20px 0 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Grazie per aver scelto <strong style="font-weight: bold;">OLIO GALIA</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">L'eccellenza dell'olio italiano</p>
    </div>

  </div>
</body>
</html>`
          },
          en: {
            subject: 'Order #{{orderNumber}} shipped - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Excellence in extra virgin olive oil</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Your order is on its way</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Dear {{customerName}},
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Your order <strong>#{{orderNumber}}</strong> has been shipped and will soon be in your hands.
      </p>

      <!-- Shipping Details -->
      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 20px 0;">
        <h3 style="color: #556B2F; margin: 0 0 15px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Shipping Details</h3>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Carrier:</strong> {{shippingCarrier}}</p>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Expected delivery:</strong> {{expectedDelivery}}</p>
      </div>

      <!-- Track Shipment Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{trackingUrl}}" style="display: inline-block; background-color: #556B2F; color: #ffffff; text-decoration: none; padding: 15px 40px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase; font-size: 16px; letter-spacing: 1px; border-radius: 4px;">Track Shipment</a>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 20px 0 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Thank you for choosing <strong style="font-weight: bold;">OLIO GALIA</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">The excellence of Italian oil</p>
    </div>

  </div>
</body>
</html>`
          }
        },
        availableVariables: TEMPLATE_VARIABLES.shipping_notification || [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      },
      {
        templateKey: 'delivery_notification',
        name: 'Notifica Consegna',
        isSystem: true,
        translations: {
          it: {
            subject: 'Ordine #{{orderNumber}} consegnato - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ordine Consegnato - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Eccellenza dell'olio extravergine d'oliva</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Ordine consegnato</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Gentile {{customerName}},
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Il tuo ordine <strong>#{{orderNumber}}</strong> è stato consegnato con successo il <strong>{{deliveryDate}}</strong>.
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Ci auguriamo che tu sia soddisfatto del nostro olio extravergine d'oliva di qualità.
      </p>

      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 15px; color: #333; line-height: 1.6; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          La tua opinione è importante per noi. Ci piacerebbe sapere cosa pensi del tuo acquisto!
        </p>
        <div style="text-align: center;">
          <a href="{{feedbackUrl}}" style="display: inline-block; background-color: #556B2F; color: #ffffff; text-decoration: none; padding: 12px 30px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Lascia una Recensione</a>
        </div>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 30px 0 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Grazie per aver scelto <strong style="font-weight: bold;">OLIO GALIA</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">L'eccellenza dell'olio italiano</p>
    </div>

  </div>
</body>
</html>`
          },
          en: {
            subject: 'Order #{{orderNumber}} delivered - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delivered - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Excellence in extra virgin olive oil</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Order delivered</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Dear {{customerName}},
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Your order <strong>#{{orderNumber}}</strong> was successfully delivered on <strong>{{deliveryDate}}</strong>.
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        We hope you are satisfied with our quality extra virgin olive oil.
      </p>

      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 15px; color: #333; line-height: 1.6; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          Your opinion matters to us. We would love to know what you think about your purchase!
        </p>
        <div style="text-align: center;">
          <a href="{{feedbackUrl}}" style="display: inline-block; background-color: #556B2F; color: #ffffff; text-decoration: none; padding: 12px 30px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Leave a Review</a>
        </div>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 30px 0 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Thank you for choosing <strong style="font-weight: bold;">OLIO GALIA</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">The excellence of Italian oil</p>
    </div>

  </div>
</body>
</html>`
          }
        },
        availableVariables: TEMPLATE_VARIABLES.delivery_notification || [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      },
      {
        templateKey: 'quote_email',
        name: 'Email Preventivo',
        isSystem: true,
        translations: {
          it: {
            subject: 'Il tuo preventivo personalizzato - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preventivo - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Eccellenza dell'olio extravergine d'oliva</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Il tuo preventivo personalizzato</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Gentile {{customerName}},
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Grazie per aver richiesto un preventivo. Di seguito troverai i dettagli della tua richiesta.
      </p>

      <!-- Quote Details -->
      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 20px 0;">
        <h3 style="color: #556B2F; margin: 0 0 15px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Preventivo #{{orderId}}</h3>
        <table style="width: 100%; margin: 15px 0; border-collapse: collapse;">
          {{items}}
        </table>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #556B2F;">
          <p style="margin: 0; font-size: 18px; color: #556B2F; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Totale: €{{total}}</strong></p>
        </div>
      </div>

      <!-- Payment Instructions -->
      <div style="background-color: #556B2F; color: #ffffff; padding: 24px; margin: 30px 0;">
        <h3 style="color: #ffffff; margin: 0 0 20px; font-size: 20px; text-align: center; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Istruzioni per il Pagamento</h3>

        <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #D6C7A1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500;">Beneficiario</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">{{beneficiary}}</p>
        </div>

        <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #D6C7A1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500;">IBAN</p>
          <p style="margin: 0; font-size: 15px; font-weight: bold; font-family: 'Courier New', Courier, monospace; letter-spacing: 0; white-space: nowrap; overflow-x: auto;">{{iban}}</p>
        </div>

        <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #D6C7A1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500;">Importo</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; font-family: 'Roboto', Helvetica, Arial, sans-serif;">€{{total}}</p>
        </div>

        <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px;">
          <p style="margin: 0 0 12px; color: #D6C7A1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500;">Causale</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Preventivo #{{orderId}}</p>
        </div>

        <p style="margin: 24px 0 0; text-align: center; color: #D6C7A1; font-size: 14px; line-height: 1.6; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          Effettua il bonifico utilizzando questi dati.<br>
          Il tuo ordine sarà processato alla ricezione del pagamento.
        </p>
      </div>

      <!-- Contact Info -->
      <div style="background-color: rgba(214, 199, 161, 0.15); padding: 20px; margin: 30px 0;">
        <h3 style="color: #556B2F; margin: 0 0 15px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Hai domande?</h3>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Email:</strong> {{supportEmail}}</p>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Telefono:</strong> {{supportPhone}}</p>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 30px 0 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Grazie per aver scelto <strong style="font-weight: bold;">OLIO GALIA</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">L'eccellenza dell'olio italiano</p>
    </div>

  </div>
</body>
</html>`
          },
          en: {
            subject: 'Your personalized quote - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Excellence in extra virgin olive oil</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Your personalized quote</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Dear {{customerName}},
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Thank you for requesting a quote. Below you will find the details of your request.
      </p>

      <!-- Quote Details -->
      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 20px 0;">
        <h3 style="color: #556B2F; margin: 0 0 15px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Quote #{{orderId}}</h3>
        <table style="width: 100%; margin: 15px 0; border-collapse: collapse;">
          {{items}}
        </table>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #556B2F;">
          <p style="margin: 0; font-size: 18px; color: #556B2F; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Total: €{{total}}</strong></p>
        </div>
      </div>

      <!-- Payment Instructions -->
      <div style="background-color: #556B2F; color: #ffffff; padding: 24px; margin: 30px 0;">
        <h3 style="color: #ffffff; margin: 0 0 20px; font-size: 20px; text-align: center; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Payment Instructions</h3>

        <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #D6C7A1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500;">Beneficiary</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">{{beneficiary}}</p>
        </div>

        <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #D6C7A1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500;">IBAN</p>
          <p style="margin: 0; font-size: 15px; font-weight: bold; font-family: 'Courier New', Courier, monospace; letter-spacing: 0; white-space: nowrap; overflow-x: auto;">{{iban}}</p>
        </div>

        <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #D6C7A1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500;">Amount</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; font-family: 'Roboto', Helvetica, Arial, sans-serif;">€{{total}}</p>
        </div>

        <div style="background-color: rgba(255, 255, 255, 0.1); padding: 20px;">
          <p style="margin: 0 0 12px; color: #D6C7A1; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500;">Payment Reference</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Quote #{{orderId}}</p>
        </div>

        <p style="margin: 24px 0 0; text-align: center; color: #D6C7A1; font-size: 14px; line-height: 1.6; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          Make the bank transfer using these details.<br>
          Your order will be processed upon receipt of payment.
        </p>
      </div>

      <!-- Contact Info -->
      <div style="background-color: rgba(214, 199, 161, 0.15); padding: 20px; margin: 30px 0;">
        <h3 style="color: #556B2F; margin: 0 0 15px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Have questions?</h3>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Email:</strong> {{supportEmail}}</p>
        <p style="margin: 8px 0; color: #333; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;"><strong>Phone:</strong> {{supportPhone}}</p>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 30px 0 0; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Thank you for choosing <strong style="font-weight: bold;">OLIO GALIA</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">The excellence of Italian oil</p>
    </div>

  </div>
</body>
</html>`
          }
        },
        availableVariables: TEMPLATE_VARIABLES.quote_email || [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      },
      {
        templateKey: 'review_request',
        name: 'Richiesta Recensione',
        isSystem: true,
        translations: {
          it: {
            subject: 'La tua opinione è importante - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Richiesta Feedback - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Eccellenza dell'olio extravergine d'oliva</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; text-align: center; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">La tua opinione è importante</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; text-align: center; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Gentile {{customerName}},
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; text-align: center; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Ci auguriamo che tu stia apprezzando il nostro olio extravergine d'oliva.
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; text-align: center; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Il tuo feedback è prezioso per noi. Potresti dedicare qualche minuto per condividere la tua esperienza?
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{feedbackUrl}}" style="display: inline-block; background-color: #556B2F; color: #ffffff; text-decoration: none; padding: 15px 40px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase; font-size: 16px; letter-spacing: 1px;">Lascia la tua Recensione</a>
      </div>

      <!-- Order Reference -->
      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          Riferimento: {{orderType}} <strong>#{{orderNumber}}</strong>
        </p>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 30px 0 0; text-align: center; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Grazie per la tua fiducia in <strong style="font-weight: bold;">OLIO GALIA</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">L'eccellenza dell'olio italiano</p>
    </div>

  </div>
</body>
</html>`
          },
          en: {
            subject: 'Your opinion matters - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback Request - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Excellence in extra virgin olive oil</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <h2 style="color: #556B2F; margin: 0 0 20px; font-size: 24px; text-align: center; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Your opinion matters</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; text-align: center; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Dear {{customerName}},
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; text-align: center; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        We hope you are enjoying our extra virgin olive oil.
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; text-align: center; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Your feedback is valuable to us. Could you spare a few minutes to share your experience?
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{feedbackUrl}}" style="display: inline-block; background-color: #556B2F; color: #ffffff; text-decoration: none; padding: 15px 40px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase; font-size: 16px; letter-spacing: 1px;">Leave Your Review</a>
      </div>

      <!-- Order Reference -->
      <div style="background-color: #f8f8f8; border-left: 3px solid #556B2F; padding: 20px; margin: 30px 0; text-align: center;">
        <p style="margin: 0; color: #666; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          Reference: {{orderType}} <strong>#{{orderNumber}}</strong>
        </p>
      </div>

      <p style="color: #333; line-height: 1.6; margin: 30px 0 0; text-align: center; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Thank you for your trust in <strong style="font-weight: bold;">OLIO GALIA</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">The excellence of Italian oil</p>
    </div>

  </div>
</body>
</html>`
          }
        },
        availableVariables: TEMPLATE_VARIABLES.review_request || [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      },
      {
        templateKey: 'newsletter_welcome',
        name: 'Benvenuto Newsletter',
        isSystem: true,
        translations: {
          it: {
            subject: 'Benvenuto - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Eccellenza dell'olio extravergine d'oliva</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #556B2F; margin: 0 0 24px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Benvenuto, {{firstName}}</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Grazie per esserti iscritto alla newsletter di <strong style="font-weight: bold;">OLIO GALIA</strong>.
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Riceverai aggiornamenti sui nostri prodotti, offerte esclusive e contenuti dedicati alla qualità dell'olio extravergine d'oliva italiano.
      </p>

      <!-- What you'll receive -->
      <div style="background-color: rgba(214, 199, 161, 0.15); border-left: 3px solid #556B2F; padding: 24px; margin: 30px 0;">
        <h3 style="color: #556B2F; margin: 0 0 16px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Cosa riceverai:</h3>
        <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          <li>Offerte esclusive riservate agli iscritti</li>
          <li>Nuovi prodotti in anteprima</li>
          <li>Ricette e consigli per l'uso dell'olio</li>
          <li>Aggiornamenti dal nostro frantoio</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0 0;">
        <a href="{{siteUrl}}/products" style="display: inline-block; background-color: #556B2F; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; font-family: 'termina', Helvetica, Arial, sans-serif;">
          Scopri i prodotti
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 24px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">L'eccellenza dell'olio italiano</p>
    </div>

  </div>
</body>
</html>`
          },
          en: {
            subject: 'Welcome - OLIO GALIA',
            htmlBody: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome - OLIO GALIA</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://use.typekit.net/wff0hru.css');
  </style>
</head>
<body style="font-family: 'Roboto', Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; letter-spacing: 0.05em;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #556B2F; color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e0e0e0;">
      <img src="{{logoUrl}}" alt="OLIO GALIA" style="max-width: 200px; height: auto; display: block; margin: 0 auto 12px;" />
      <p style="margin: 8px 0 0; color: #D6C7A1; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">Excellence in extra virgin olive oil</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #556B2F; margin: 0 0 24px; font-size: 24px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">Welcome, {{firstName}}</h2>

      <p style="color: #333; line-height: 1.6; margin: 0 0 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        Thank you for subscribing to the <strong style="font-weight: bold;">OLIO GALIA</strong> newsletter.
      </p>

      <p style="color: #333; line-height: 1.6; margin: 0 0 30px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
        You will receive updates about our products, exclusive offers, and content dedicated to the quality of Italian extra virgin olive oil.
      </p>

      <!-- What you'll receive -->
      <div style="background-color: rgba(214, 199, 161, 0.15); border-left: 3px solid #556B2F; padding: 24px; margin: 30px 0;">
        <h3 style="color: #556B2F; margin: 0 0 16px; font-size: 18px; font-family: 'termina', Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase;">What you'll receive:</h3>
        <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">
          <li>Exclusive offers for subscribers</li>
          <li>New products in preview</li>
          <li>Recipes and tips for using olive oil</li>
          <li>Updates from our mill</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0 0;">
        <a href="{{siteUrl}}/products" style="display: inline-block; background-color: #556B2F; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; font-family: 'termina', Helvetica, Arial, sans-serif;">
          Discover products
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f8f8; padding: 24px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 16px; color: #556B2F; font-weight: 500; font-family: 'termina', Helvetica, Arial, sans-serif; text-transform: uppercase;">OLIO GALIA</p>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px; font-family: 'Roboto', Helvetica, Arial, sans-serif; letter-spacing: 0.05em;">The excellence of Italian oil</p>
    </div>

  </div>
</body>
</html>`
          }
        },
        availableVariables: TEMPLATE_VARIABLES.newsletter_welcome || [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      }
    ];

    // Inserisci i template nel database
    console.log(`📝 Creazione di ${systemTemplates.length} template di sistema...\n`);

    const result = await collection.insertMany(systemTemplates);

    console.log(`✅ Re-seeding completato con successo!`);
    console.log(`📊 Creati ${result.insertedCount} template:\n`);

    systemTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.templateKey})`);
    });

    console.log('\n🎉 Database popolato con successo!');
    console.log('💡 Ora puoi accedere a /admin/email-templates per gestire i template.\n');

    // Chiudi la connessione
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante il re-seeding:', error);
    if (client) {
      await client.close();
    }
    process.exit(1);
  }
}

// Esegui lo script
reseedEmailTemplates();
