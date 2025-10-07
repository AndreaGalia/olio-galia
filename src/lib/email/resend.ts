// lib/email/resend.ts
import { EmailOrderData, ShippingNotificationData, DeliveryNotificationData } from '@/types/email';
import { Resend } from 'resend';
import { createOrderConfirmationHTML, createShippingNotificationHTML } from './templates';
import { createDeliveryNotificationHTML } from './delivery-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendOrderConfirmation(orderData: EmailOrderData): Promise<boolean> {
    try {
      const htmlContent = createOrderConfirmationHTML(orderData);
      
      const result = await resend.emails.send({
        from: 'Ordini <onboarding@resend.dev>', // Cambia con il tuo dominio
        // Per test usa: 'Ordini <onboarding@resend.dev>'
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
        from: 'Olio Galia <onboarding@resend.dev>', // Cambia con il tuo dominio
        // Per test usa: 'Olio Galia <onboarding@resend.dev>'
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

  static async sendDeliveryNotification(deliveryData: DeliveryNotificationData): Promise<boolean> {
    try {
      const htmlContent = createDeliveryNotificationHTML(deliveryData);
      
      const result = await resend.emails.send({
        from: 'Olio Galia <onboarding@resend.dev>', // Cambia con il tuo dominio
        // Per test usa: 'Olio Galia <onboarding@resend.dev>'
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
}