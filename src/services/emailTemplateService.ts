import { getDatabase } from '@/lib/mongodb';
import {
  EmailTemplateDocument,
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput
} from '@/types/emailTemplate';
import { ObjectId } from 'mongodb';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'Olio Galia <onboarding@resend.dev>';

export class EmailTemplateService {
  private static readonly COLLECTION_NAME = 'email_templates';

  /**
   * Ottiene tutti i template (admin)
   */
  static async getAllTemplates(): Promise<EmailTemplateDocument[]> {
    const db = await getDatabase();
    const collection = db.collection<EmailTemplateDocument>(this.COLLECTION_NAME);
    return await collection.find({}).sort({ 'metadata.createdAt': -1 }).toArray();
  }

  /**
   * Ottiene template per templateKey e lingua
   * Usato da EmailService per caricare template dal DB
   */
  static async getTemplateByKey(
    templateKey: string,
    locale: 'it' | 'en' = 'it'
  ): Promise<{ subject: string; htmlBody: string } | null> {
    const db = await getDatabase();
    const collection = db.collection<EmailTemplateDocument>(this.COLLECTION_NAME);

    const template = await collection.findOne({
      templateKey,
      'metadata.isActive': true
    });

    if (!template) return null;

    return {
      subject: template.translations[locale].subject,
      htmlBody: template.translations[locale].htmlBody
    };
  }

  /**
   * Ottiene template per ID
   */
  static async getTemplateById(id: string): Promise<EmailTemplateDocument | null> {
    const db = await getDatabase();
    const collection = db.collection<EmailTemplateDocument>(this.COLLECTION_NAME);

    try {
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error('Error fetching template by ID:', error);
      return null;
    }
  }

  /**
   * Crea nuovo template
   */
  static async createTemplate(input: CreateEmailTemplateInput): Promise<string> {
    const db = await getDatabase();
    const collection = db.collection<EmailTemplateDocument>(this.COLLECTION_NAME);

    // Verifica che templateKey non esista già
    const existing = await collection.findOne({ templateKey: input.templateKey });
    if (existing) {
      throw new Error(`Template key "${input.templateKey}" già esistente`);
    }

    const newTemplate: EmailTemplateDocument = {
      templateKey: input.templateKey,
      name: input.name,
      isSystem: false, // Solo i template seedati sono system
      translations: {
        it: {
          subject: input.subjectIT,
          htmlBody: input.htmlBodyIT,
        },
        en: {
          subject: input.subjectEN,
          htmlBody: input.htmlBodyEN,
        },
      },
      availableVariables: input.availableVariables || [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
    };

    const result = await collection.insertOne(newTemplate);
    return result.insertedId.toString();
  }

  /**
   * Aggiorna template esistente
   */
  static async updateTemplate(id: string, input: UpdateEmailTemplateInput): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<EmailTemplateDocument>(this.COLLECTION_NAME);

    const updateData: any = {
      'metadata.updatedAt': new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.subjectIT !== undefined) updateData['translations.it.subject'] = input.subjectIT;
    if (input.htmlBodyIT !== undefined) updateData['translations.it.htmlBody'] = input.htmlBodyIT;
    if (input.subjectEN !== undefined) updateData['translations.en.subject'] = input.subjectEN;
    if (input.htmlBodyEN !== undefined) updateData['translations.en.htmlBody'] = input.htmlBodyEN;
    if (input.availableVariables !== undefined) updateData.availableVariables = input.availableVariables;
    if (input.isActive !== undefined) updateData['metadata.isActive'] = input.isActive;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      throw new Error('Template non trovato');
    }
  }

  /**
   * Elimina template (solo non-system)
   */
  static async deleteTemplate(id: string): Promise<void> {
    const db = await getDatabase();
    const collection = db.collection<EmailTemplateDocument>(this.COLLECTION_NAME);

    const template = await collection.findOne({ _id: new ObjectId(id) });
    if (!template) {
      throw new Error('Template non trovato');
    }

    if (template.isSystem) {
      throw new Error('Impossibile eliminare template di sistema');
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      throw new Error('Template non trovato');
    }
  }

  /**
   * Invia email di test
   */
  static async sendTestEmail(
    templateId: string,
    testEmail: string,
    locale: 'it' | 'en' = 'it'
  ): Promise<boolean> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error('Template non trovato');
    }

    const { subject, htmlBody } = template.translations[locale];

    // Sostituisci variabili con dati di esempio
    const testHtmlBody = this.replaceVariablesWithTestData(
      htmlBody,
      template.availableVariables
    );
    const testSubject = this.replaceVariablesWithTestData(
      subject,
      template.availableVariables
    );

    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [testEmail],
        subject: `[TEST] ${testSubject}`,
        html: testHtmlBody,
      });

      return !result.error;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }

  /**
   * Sostituisce variabili con dati di test
   */
  private static replaceVariablesWithTestData(
    content: string,
    variables: string[]
  ): string {
    let result = content;

    const testData: Record<string, string> = {
      logoUrl: process.env.LOGO_URL || process.env.NEXT_PUBLIC_LOGO_URL || 'https://oliogalia.com/logo.png',
      customerName: 'Mario Rossi',
      orderNumber: 'ORD-TEST-12345',
      orderDate: new Date().toLocaleDateString('it-IT'),
      items: '<tr><td>Olio EVO Premium 500ml x 2</td><td>€30.00</td></tr>',
      subtotal: '30.00',
      shipping: '5.00',
      total: '35.00',
      shippingTrackingId: 'TRACK-TEST-12345',
      shippingCarrier: 'DHL Express',
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT'),
      deliveryDate: new Date().toLocaleDateString('it-IT'),
      feedbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com'}/feedback/test`,
      orderId: 'PREV-TEST-67890',
      customerEmail: 'test@example.com',
      customerPhone: '+39 123 456 7890',
      orderType: 'ordine',
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'test@example.com',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com',
      receiptUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com'}/receipt/test`,
      hasInvoice: 'Sì',
      shippingAddress: 'Via Roma 123, 00100 Roma (RM), Italia',
      iban: process.env.BANK_IBAN || 'IT00 0000 0000 0000 0000 0000 000',
      beneficiary: process.env.BANK_BENEFICIARY || 'OLIO GALIA S.r.l.',
      supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL || 'info@oliogalia.com',
      supportPhone: process.env.SUPPORT_PHONE || '+39 123 456 7890',
    };

    variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      result = result.replace(regex, testData[variable] || `[${variable}]`);
    });

    return result;
  }
}
