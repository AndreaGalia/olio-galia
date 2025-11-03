// lib/email/resend.ts
import { EmailOrderData, ShippingNotificationData, DeliveryNotificationData, NewsletterWelcomeData } from '@/types/email';
import { Resend } from 'resend';
import { createOrderConfirmationHTML, createShippingNotificationHTML } from './templates';
import { createDeliveryNotificationHTML } from './delivery-template';
import { createNewsletterWelcomeHTML } from './newsletter-template';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'Olio Galia <onboarding@resend.dev>';

export class EmailService {
  static async sendOrderConfirmation(orderData: EmailOrderData): Promise<boolean> {
    try {
      const htmlContent = createOrderConfirmationHTML(orderData);
      
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [orderData.customerEmail],
        subject: `Conferma Ordine #${orderData.orderNumber} - Grazie per il tuo acquisto!`,
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
      
      return false;
    }
  }

  static async sendShippingNotification(shippingData: ShippingNotificationData): Promise<boolean> {
    try {
      const htmlContent = createShippingNotificationHTML(shippingData);
      
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [shippingData.customerEmail],
        subject: `🚚 Il tuo ordine #${shippingData.orderNumber} è in viaggio! - Olio Galia`,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': shippingData.orderNumber,
          'X-Shipping-Tracking-ID': shippingData.shippingTrackingId,
        },
      });

      if (result.error) {
        return false;
      }

      return true;
    } catch (error) {
      
      return false;
    }
  }

  static async sendDeliveryNotification(deliveryData: DeliveryNotificationData, feedbackUrl?: string): Promise<boolean> {
    try {
      const htmlContent = createDeliveryNotificationHTML(deliveryData, feedbackUrl);

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [deliveryData.customerEmail],
        subject: `✅ Ordine #${deliveryData.orderNumber} consegnato con successo! - Olio Galia`,
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

      return false;
    }
  }

  static async sendNewsletterWelcome(newsletterData: NewsletterWelcomeData): Promise<boolean> {
    try {
      const htmlContent = createNewsletterWelcomeHTML(newsletterData);

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: [newsletterData.email],
        subject: '🌿 Benvenuto nella famiglia Olio Galia!',
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

      return false;
    }
  }
}