// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { OrderService } from '@/services/orderService';
import { CustomerService } from '@/services/customerService';
import { OrderDetails } from '@/types/checkoutSuccessTypes';
import { EmailOrderDataExtended } from '@/types/email';
import { EmailService } from '@/lib/email/resend';
import { TelegramService } from '@/lib/telegram/telegram';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ Webhook Error: No stripe-signature header');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    // Verifica la firma del webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    console.log(`✅ Webhook received: ${event.type}`);

    // Gestisci solo l'evento checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      console.log(`📦 Processing order for session: ${sessionId}`);

      // Verifica se l'ordine esiste già (idempotenza)
      const orderExists = await OrderService.orderExists(sessionId);
      if (orderExists) {
        console.log(`ℹ️ Order already exists for session: ${sessionId}`);
        // Return 200 per evitare retry di Stripe
        return NextResponse.json({
          received: true,
          duplicate: true,
          message: 'Order already processed'
        });
      }

      // Recupera i dettagli dell'ordine da Stripe
      try {
        const orderDetailsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/order-details?session_id=${sessionId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!orderDetailsResponse.ok) {
          throw new Error('Failed to fetch order details');
        }

        const orderDetails: OrderDetails = await orderDetailsResponse.json();

        // Salva l'ordine in MongoDB
        const mongoId = await OrderService.createOrder(orderDetails);
        console.log(`✅ Order saved with ID: ${mongoId}`);

        // Crea o aggiorna il cliente
        try {
          const totalInCents = Math.round((orderDetails.pricing?.total || orderDetails.total || 0) * 100);

          await CustomerService.createOrUpdateFromOrder(
            orderDetails.customer?.email || '',
            orderDetails.customer?.name?.split(' ')[0] || 'Cliente',
            orderDetails.customer?.name?.split(' ').slice(1).join(' ') || '',
            orderDetails.customer?.phone,
            orderDetails.shipping?.addressDetails,
            orderDetails.id,
            totalInCents,
            'order'
          );
          console.log(`✅ Customer created/updated`);
        } catch (customerError) {
          console.error('⚠️ Error creating/updating customer:', customerError);
          // Non bloccare il processo
        }

        // Prepara dati per l'email
        const emailData: EmailOrderDataExtended = {
          customerName: orderDetails.customer?.name || 'Cliente',
          customerEmail: orderDetails.customer?.email || '',
          orderNumber: typeof orderDetails.paymentIntent === 'string'
            ? orderDetails.paymentIntent
            : orderDetails.id,
          orderDate: new Date(orderDetails.created || new Date()).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          items: orderDetails.items?.map((item) => ({
            name: item.name || 'Prodotto',
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: item.image || null
          })) || [],
          subtotal: orderDetails.pricing?.subtotal || 0,
          shipping: orderDetails.pricing?.shippingCost || 0,
          total: orderDetails.pricing?.total || orderDetails.total || 0,
          shippingAddress: {
            name: orderDetails.customer?.name || '',
            street: orderDetails.shipping?.address || '',
            city: '',
            postalCode: '',
            country: 'IT'
          },
          receiptUrl: null,
          hasInvoice: false
        };

        emailData.orderNumber = emailData.orderNumber.slice(-8).toUpperCase();

        // Controlla fattura
        try {
          const invoiceResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/download-invoice`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            }
          );

          if (invoiceResponse.ok) {
            const dataInvoice = await invoiceResponse.json();
            emailData.hasInvoice = dataInvoice.hasInvoice || false;
          }
        } catch (error) {
          console.error('⚠️ Error checking invoice:', error);
        }

        // Controlla ricevuta
        try {
          const receiptResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/download-receipt`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            }
          );

          if (receiptResponse.ok) {
            const dataReceipt = await receiptResponse.json();
            if (dataReceipt.receiptUrl) {
              const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
              emailData.receiptUrl = `${baseUrl}${dataReceipt.receiptUrl}`;
            }
          }
        } catch (error) {
          console.error('⚠️ Error checking receipt:', error);
        }

        // Invia notifica Telegram
        try {
          const telegramSent = await TelegramService.sendOrderNotification(orderDetails, mongoId);
          if (telegramSent) {
            console.log(`✅ Telegram notification sent`);
          } else {
            console.error('⚠️ Failed to send Telegram notification');
          }
        } catch (error) {
          console.error('⚠️ Error sending Telegram notification:', error);
        }

        // Invia email
        if (emailData.customerEmail && emailData.customerEmail !== 'N/D') {
          try {
            const emailSent = await EmailService.sendOrderConfirmation(emailData);
            if (emailSent) {
              console.log(`✅ Email sent to: ${emailData.customerEmail}`);
            } else {
              console.error('⚠️ Failed to send email');
            }
          } catch (error) {
            console.error('⚠️ Error sending email:', error);
          }
        } else {
          console.log('ℹ️ No customer email available, skipping email');
        }

        console.log(`✅ Webhook processing completed for session: ${sessionId}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error processing order:', errorMessage);

        // Return 500 per far ritentare Stripe
        return NextResponse.json(
          { error: 'Error processing order', details: errorMessage },
          { status: 500 }
        );
      }
    }

    // Return 200 per tutti gli eventi (anche quelli non gestiti)
    return NextResponse.json({ received: true });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Webhook handler error:', errorMessage);

    return NextResponse.json(
      { error: 'Webhook handler error', details: errorMessage },
      { status: 500 }
    );
  }
}
