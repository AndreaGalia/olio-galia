// lib/email/resend.ts
import { EmailOrderData, ShippingNotificationData, DeliveryNotificationData, NewsletterWelcomeData, ReviewRequestData, QuoteEmailData } from '@/types/email';
import { Resend } from 'resend';
import { createOrderConfirmationHTML, createShippingNotificationHTML } from './templates';
import { createDeliveryNotificationHTML } from './delivery-template';
import { createNewsletterWelcomeHTML } from './newsletter-template';
import { createReviewRequestHTML } from './review-request-template';
import { createQuoteEmailHTML } from './quote-template';
import {
  createSubscriptionConfirmationHTML,
  createSubscriptionRenewalHTML,
  createSubscriptionPaymentFailedHTML,
  createSubscriptionCancelScheduledHTML,
  createSubscriptionCanceledHTML,
  createSubscriptionPausedHTML,
  createSubscriptionResumedHTML,
  createSubscriptionUpcomingRenewalHTML,
  createPortalAccessMagicLinkHTML,
} from './subscription-templates';
import { EmailTemplateService } from '@/services/emailTemplateService';
import { SubscriptionEmailData } from '@/types/subscription';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'Olio Galia <onboarding@resend.dev>';
const LOGO_URL = process.env.LOGO_URL || process.env.NEXT_PUBLIC_LOGO_URL || '';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL || 'info@oliogalia.com';
const SUPPORT_PHONE = process.env.SUPPORT_PHONE || '+39 123 456 7890';

export class EmailService {
  /**
   * Helper per sostituire variabili nel template
   * Sostituisce {{variabile}} con il valore corrispondente
   */
  private static replaceVariables(template: string, data: Record<string, any>): string {
    let result = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const value = data[key];
      result = result.replace(regex, value !== null && value !== undefined ? String(value) : '');
    });
    return result;
  }

  /**
   * Helper per ottenere template (DB o fallback hardcoded)
   * Garantisce backward compatibility: se template non esiste in DB, usa quello hardcoded
   */
  private static async getTemplate(
    templateKey: string,
    locale: 'it' | 'en',
    fallbackHtml: string,
    fallbackSubject: string
  ): Promise<{ subject: string; htmlBody: string }> {
    try {
      // Prova a caricare dal DB
      const dbTemplate = await EmailTemplateService.getTemplateByKey(templateKey, locale);
      if (dbTemplate && dbTemplate.htmlBody) {
        return dbTemplate;
      }
    } catch (error) {
      console.warn(`Template ${templateKey} non trovato in DB, uso fallback hardcoded`, error);
    }

    // Fallback: usa template hardcoded
    return {
      subject: fallbackSubject,
      htmlBody: fallbackHtml
    };
  }
  static async sendOrderConfirmation(orderData: EmailOrderData): Promise<boolean> {
    try {
      const locale = 'it'; // Default italiano

      // Ottieni template (DB o fallback hardcoded)
      const template = await this.getTemplate(
        'order_confirmation',
        locale,
        createOrderConfirmationHTML(orderData), // Fallback hardcoded
        `Conferma Ordine #${orderData.orderNumber} - Grazie per il tuo acquisto!`
      );

      // Prepara dati per sostituzione variabili
      const templateData = {
        logoUrl: LOGO_URL,
        customerName: orderData.customerName,
        orderNumber: orderData.orderNumber,
        orderDate: orderData.orderDate,
        items: orderData.items.map(item =>
          `<tr><td>${item.name}</td><td>x ${item.quantity}</td><td>€${item.price.toFixed(2)}</td></tr>`
        ).join(''),
        subtotal: orderData.subtotal.toFixed(2),
        shipping: orderData.shipping.toFixed(2),
        total: orderData.total.toFixed(2),
        shippingAddress: `${orderData.shippingAddress?.street || ''}, ${orderData.shippingAddress?.city || ''}`,
        receiptUrl: (orderData as any).receiptUrl || '',
        hasInvoice: (orderData as any).hasInvoice ? 'Sì' : 'No',
      };

      // Sostituisci variabili
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [orderData.customerEmail],
        subject,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': orderData.orderNumber,
        },
      });

      if (result.error) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return false;
    }
  }

  static async sendShippingNotification(shippingData: ShippingNotificationData): Promise<boolean> {
    try {
      const locale = 'it';

      const template = await this.getTemplate(
        'shipping_notification',
        locale,
        createShippingNotificationHTML(shippingData),
        `🚚 Il tuo ordine #${shippingData.orderNumber} è in viaggio! - Olio Galia`
      );

      const templateData = {
        logoUrl: LOGO_URL,
        customerName: shippingData.customerName,
        orderNumber: shippingData.orderNumber,
        trackingUrl: shippingData.trackingUrl,
        shippingCarrier: shippingData.shippingCarrier || 'Corriere Espresso',
        expectedDelivery: shippingData.expectedDelivery || '',
      };

      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [shippingData.customerEmail],
        subject,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': shippingData.orderNumber,
          'X-Shipping-Tracking-URL': shippingData.trackingUrl,
        },
      });

      if (result.error) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending shipping notification:', error);
      return false;
    }
  }

  static async sendDeliveryNotification(deliveryData: DeliveryNotificationData, feedbackUrl?: string): Promise<boolean> {
    try {
      const locale = 'it';

      const template = await this.getTemplate(
        'delivery_notification',
        locale,
        createDeliveryNotificationHTML(deliveryData, feedbackUrl),
        `✅ Ordine #${deliveryData.orderNumber} consegnato con successo! - Olio Galia`
      );

      const templateData = {
        logoUrl: LOGO_URL,
        customerName: deliveryData.customerName,
        orderNumber: deliveryData.orderNumber,
        shippingTrackingId: deliveryData.shippingTrackingId || '',
        deliveryDate: deliveryData.deliveryDate || new Date().toLocaleDateString('it-IT'),
        feedbackUrl: feedbackUrl || '',
      };

      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [deliveryData.customerEmail],
        subject,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': deliveryData.orderNumber,
          'X-Delivery-Date': deliveryData.deliveryDate || new Date().toISOString(),
        },
      });

      if (result.error) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending delivery notification:', error);
      return false;
    }
  }

  static async sendNewsletterWelcome(newsletterData: NewsletterWelcomeData): Promise<boolean> {
    try {
      const locale = 'it';

      const template = await this.getTemplate(
        'newsletter_welcome',
        locale,
        createNewsletterWelcomeHTML(newsletterData),
        '🌿 Benvenuto nella famiglia Olio Galia!'
      );

      const templateData = {
        logoUrl: LOGO_URL,
        firstName: newsletterData.firstName || '',
        lastName: newsletterData.lastName || '',
        email: newsletterData.email,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://oliogalia.com',
      };

      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [newsletterData.email],
        subject,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': `newsletter-${newsletterData.email}`,
        },
      });

      if (result.error) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending newsletter welcome:', error);
      return false;
    }
  }

  static async sendReviewRequest(reviewData: ReviewRequestData, feedbackUrl: string): Promise<boolean> {
    try {
      const locale = 'it';

      const template = await this.getTemplate(
        'review_request',
        locale,
        createReviewRequestHTML(reviewData, feedbackUrl),
        `💚 Ci piacerebbe il tuo feedback sul ${reviewData.orderType === 'order' ? 'Ordine' : 'Preventivo'} #${reviewData.orderNumber} - Olio Galia`
      );

      const templateData = {
        logoUrl: LOGO_URL,
        customerName: reviewData.customerName,
        orderNumber: reviewData.orderNumber,
        orderType: reviewData.orderType === 'order' ? 'ordine' : 'preventivo',
        feedbackUrl: feedbackUrl,
      };

      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [reviewData.customerEmail],
        subject,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': reviewData.orderNumber,
          'X-Email-Type': 'review-request',
        },
      });

      if (result.error) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending review request:', error);
      return false;
    }
  }

  static async sendQuoteEmail(quoteData: QuoteEmailData): Promise<boolean> {
    try {
      const locale = 'it';

      const template = await this.getTemplate(
        'quote_email',
        locale,
        createQuoteEmailHTML(quoteData),
        `Il tuo preventivo personalizzato - OLIO GALIA`
      );

      // Prepara items HTML per il template
      const itemsHtml = quoteData.items.map(item =>
        `<tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0; color: #333;">
            <strong>${item.name}</strong><br>
            <span style="color: #666; font-size: 14px;">Quantità: ${item.quantity} x €${item.unitPrice.toFixed(2)}</span>
          </td>
          <td style="padding: 12px 0; text-align: right; color: #556B2F; font-weight: bold;">
            €${item.totalPrice.toFixed(2)}
          </td>
        </tr>`
      ).join('');

      const templateData = {
        logoUrl: LOGO_URL,
        customerName: quoteData.customerName,
        orderId: quoteData.orderId,
        items: itemsHtml,
        subtotal: quoteData.subtotal.toFixed(2),
        shipping: quoteData.shipping.toFixed(2),
        total: quoteData.total.toFixed(2),
        customerEmail: quoteData.customerEmail,
        customerPhone: quoteData.customerPhone,
        iban: process.env.BANK_IBAN || 'IT00 0000 0000 0000 0000 0000 000',
        beneficiary: process.env.BANK_BENEFICIARY || 'OLIO GALIA',
        supportEmail: SUPPORT_EMAIL,
        supportPhone: SUPPORT_PHONE,
      };

      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [quoteData.customerEmail],
        subject,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': `quote-${quoteData.orderId}`,
          'X-Email-Type': 'quote',
        },
      });

      if (result.error) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending quote email:', error);
      return false;
    }
  }

  static async sendSubscriptionConfirmation(data: SubscriptionEmailData): Promise<boolean> {
    try {
      const locale = 'it';
      const template = await this.getTemplate(
        'subscription_confirmation',
        locale,
        createSubscriptionConfirmationHTML(data),
        `Abbonamento Attivato - ${data.productName} - Olio Galia`
      );
      const templateData = {
        logoUrl: LOGO_URL,
        customerName: data.customerName,
        productName: data.productName,
        interval: data.interval,
        shippingZone: data.shippingZone,
        portalLink: data.portalLink,
        amount: data.amount || '',
      };
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.customerEmail],
        subject,
        html: htmlContent,
        headers: { 'X-Email-Type': 'subscription-confirmation' },
      });
      if (result.error) return false;
      return true;
    } catch (error) {
      console.error('Error sending subscription confirmation:', error);
      return false;
    }
  }

  static async sendSubscriptionRenewal(data: SubscriptionEmailData): Promise<boolean> {
    try {
      const locale = 'it';
      const template = await this.getTemplate(
        'subscription_renewal',
        locale,
        createSubscriptionRenewalHTML(data),
        `Abbonamento Rinnovato - ${data.productName} - Olio Galia`
      );
      const templateData = {
        logoUrl: LOGO_URL,
        customerName: data.customerName,
        productName: data.productName,
        interval: data.interval,
        nextBillingDate: data.nextBillingDate || '',
        portalLink: data.portalLink,
        amount: data.amount || '',
      };
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.customerEmail],
        subject,
        html: htmlContent,
        headers: { 'X-Email-Type': 'subscription-renewal' },
      });
      if (result.error) return false;
      return true;
    } catch (error) {
      console.error('Error sending subscription renewal:', error);
      return false;
    }
  }

  static async sendSubscriptionPaymentFailed(data: SubscriptionEmailData): Promise<boolean> {
    try {
      const locale = 'it';
      const template = await this.getTemplate(
        'subscription_payment_failed',
        locale,
        createSubscriptionPaymentFailedHTML(data),
        `Problema con il pagamento dell'abbonamento - Olio Galia`
      );
      const templateData = {
        logoUrl: LOGO_URL,
        customerName: data.customerName,
        productName: data.productName,
        portalLink: data.portalLink,
      };
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.customerEmail],
        subject,
        html: htmlContent,
        headers: { 'X-Email-Type': 'subscription-payment-failed' },
      });
      if (result.error) return false;
      return true;
    } catch (error) {
      console.error('Error sending subscription payment failed:', error);
      return false;
    }
  }

  static async sendSubscriptionCancelScheduled(data: SubscriptionEmailData): Promise<boolean> {
    try {
      const locale = 'it';
      const template = await this.getTemplate(
        'subscription_cancel_scheduled',
        locale,
        createSubscriptionCancelScheduledHTML(data),
        `Abbonamento Cancellato - ${data.productName} - Olio Galia`
      );
      const templateData = {
        logoUrl: LOGO_URL,
        customerName: data.customerName,
        productName: data.productName,
        interval: data.interval,
        nextBillingDate: data.nextBillingDate || '',
        portalLink: data.portalLink,
      };
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.customerEmail],
        subject,
        html: htmlContent,
        headers: { 'X-Email-Type': 'subscription-cancel-scheduled' },
      });
      if (result.error) return false;
      return true;
    } catch (error) {
      console.error('Error sending subscription cancel scheduled:', error);
      return false;
    }
  }

  static async sendSubscriptionCanceled(data: SubscriptionEmailData): Promise<boolean> {
    try {
      const locale = 'it';
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.com';
      const template = await this.getTemplate(
        'subscription_canceled',
        locale,
        createSubscriptionCanceledHTML(data),
        `Ci manchi! Torna a gustare il nostro olio - Olio Galia`
      );
      const templateData = {
        logoUrl: LOGO_URL,
        customerName: data.customerName,
        productName: data.productName,
        siteUrl,
      };
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.customerEmail],
        subject,
        html: htmlContent,
        headers: { 'X-Email-Type': 'subscription-canceled' },
      });
      if (result.error) return false;
      return true;
    } catch (error) {
      console.error('Error sending subscription canceled:', error);
      return false;
    }
  }

  static async sendSubscriptionPaused(data: SubscriptionEmailData): Promise<boolean> {
    try {
      const locale = 'it';
      const template = await this.getTemplate(
        'subscription_paused',
        locale,
        createSubscriptionPausedHTML(data),
        `Abbonamento in Pausa - ${data.productName} - Olio Galia`
      );
      const templateData = {
        logoUrl: LOGO_URL,
        customerName: data.customerName,
        productName: data.productName,
        interval: data.interval,
        portalLink: data.portalLink,
      };
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.customerEmail],
        subject,
        html: htmlContent,
        headers: { 'X-Email-Type': 'subscription-paused' },
      });
      if (result.error) return false;
      return true;
    } catch (error) {
      console.error('Error sending subscription paused:', error);
      return false;
    }
  }

  static async sendSubscriptionResumed(data: SubscriptionEmailData): Promise<boolean> {
    try {
      const locale = 'it';
      const template = await this.getTemplate(
        'subscription_resumed',
        locale,
        createSubscriptionResumedHTML(data),
        `Abbonamento Riattivato - ${data.productName} - Olio Galia`
      );
      const templateData = {
        logoUrl: LOGO_URL,
        customerName: data.customerName,
        productName: data.productName,
        interval: data.interval,
        nextBillingDate: data.nextBillingDate || '',
        portalLink: data.portalLink,
      };
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.customerEmail],
        subject,
        html: htmlContent,
        headers: { 'X-Email-Type': 'subscription-resumed' },
      });
      if (result.error) return false;
      return true;
    } catch (error) {
      console.error('Error sending subscription resumed:', error);
      return false;
    }
  }

  static async sendSubscriptionUpcomingRenewal(data: SubscriptionEmailData): Promise<boolean> {
    try {
      const locale = 'it';
      const template = await this.getTemplate(
        'subscription_upcoming_renewal',
        locale,
        createSubscriptionUpcomingRenewalHTML(data),
        `Prossimo Rinnovo Abbonamento - ${data.productName} - Olio Galia`
      );
      const templateData = {
        logoUrl: LOGO_URL,
        customerName: data.customerName,
        productName: data.productName,
        interval: data.interval,
        amount: data.amount || '',
        nextBillingDate: data.nextBillingDate || '',
        portalLink: data.portalLink,
      };
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.customerEmail],
        subject,
        html: htmlContent,
        headers: { 'X-Email-Type': 'subscription-upcoming-renewal' },
      });
      if (result.error) return false;
      return true;
    } catch (error) {
      console.error('Error sending subscription upcoming renewal:', error);
      return false;
    }
  }

  static async sendPortalAccessMagicLink(email: string, link: string): Promise<boolean> {
    try {
      const locale = 'it';
      const template = await this.getTemplate(
        'portal_access_magic_link',
        locale,
        createPortalAccessMagicLinkHTML(link),
        `Accesso al Portale Abbonamento - Olio Galia`
      );
      const templateData = {
        logoUrl: LOGO_URL,
        magicLink: link,
        expirationMinutes: '15',
      };
      const htmlContent = this.replaceVariables(template.htmlBody, templateData);
      const subject = this.replaceVariables(template.subject, templateData);
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject,
        html: htmlContent,
        headers: { 'X-Email-Type': 'portal-magic-link' },
      });
      if (result.error) return false;
      return true;
    } catch (error) {
      console.error('Error sending portal access magic link:', error);
      return false;
    }
  }
}