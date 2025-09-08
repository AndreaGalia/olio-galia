// lib/email/resend.ts
import { EmailOrderData } from '@/types/email';
import { Resend } from 'resend';
import {createOrderConfirmationHTML } from './templates';

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
}