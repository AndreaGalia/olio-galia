// lib/email/resend.ts
import { EmailOrderData, ShippingNotificationData, DeliveryNotificationData } from '@/types/email';
import { Resend } from 'resend';
import { createOrderConfirmationHTML, createShippingNotificationHTML } from './templates';
import { createDeliveryNotificationHTML } from './delivery-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendOrderConfirmation(orderData: EmailOrderData): Promise<boolean> {
    try {
      console.log('📧 Preparando email di conferma ordine...');
      
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
        console.error('❌ Errore Resend:', result.error);
        return false;
      }

      console.log('✅ Email inviata con successo:', {
        messageId: result.data?.id,
        to: orderData.customerEmail,
        orderNumber: orderData.orderNumber
      });

      return true;
    } catch (error) {
      console.error('❌ Errore nell\'invio email:', error);
      return false;
    }
  }

  static async sendShippingNotification(shippingData: ShippingNotificationData): Promise<boolean> {
    try {
      console.log('🚚 Preparando email di notifica spedizione...');
      
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
        console.error('❌ Errore Resend (spedizione):', result.error);
        return false;
      }

      console.log('✅ Email spedizione inviata con successo:', {
        messageId: result.data?.id,
        to: shippingData.customerEmail,
        orderNumber: shippingData.orderNumber,
        trackingId: shippingData.shippingTrackingId
      });

      return true;
    } catch (error) {
      console.error('❌ Errore nell\'invio email spedizione:', error);
      return false;
    }
  }

  static async sendDeliveryNotification(deliveryData: DeliveryNotificationData): Promise<boolean> {
    try {
      console.log('📦 Preparando email di conferma consegna...');
      
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
        console.error('❌ Errore Resend (consegna):', result.error);
        return false;
      }

      console.log('✅ Email consegna inviata con successo:', {
        messageId: result.data?.id,
        to: deliveryData.customerEmail,
        orderNumber: deliveryData.orderNumber,
        deliveryDate: deliveryData.deliveryDate
      });

      return true;
    } catch (error) {
      console.error('❌ Errore nell\'invio email consegna:', error);
      return false;
    }
  }
}