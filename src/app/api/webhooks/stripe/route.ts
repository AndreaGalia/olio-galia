// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { OrderService } from '@/services/orderService';
import { CustomerService } from '@/services/customerService';
import { SubscriptionService } from '@/services/subscriptionService';
import { OrderDetails } from '@/types/checkoutSuccessTypes';
import { EmailOrderDataExtended } from '@/types/email';
import { EmailService } from '@/lib/email/resend';
import { TelegramService } from '@/lib/telegram/telegram';
import { WahaService } from '@/services/wahaService';
import { WhatsAppTemplates } from '@/lib/whatsapp/templates';
import { SubscriptionInterval, ShippingZone, SubscriptionEmailData } from '@/types/subscription';

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

    // Gestisci eventi subscription
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`🔄 Subscription updated: ${subscription.id} → ${subscription.status}`);
      const periodStart = new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000);
      const periodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000);
      await SubscriptionService.updateSubscriptionStatus(
        subscription.id,
        subscription.status as 'active' | 'canceled' | 'past_due' | 'unpaid' | 'paused' | 'incomplete',
        {
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        }
      );

      // Send renewal email if subscription is active and period updated
      if (subscription.status === 'active') {
        try {
          const dbSub = await SubscriptionService.findByStripeSubscriptionId(subscription.id);
          if (dbSub) {
            const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
            const portalLink = `${baseUrl}/manage-subscription/access?token=${dbSub.portalAccessToken}`;
            const emailData: SubscriptionEmailData = {
              customerName: dbSub.customerName,
              customerEmail: dbSub.customerEmail,
              productName: dbSub.productName,
              interval: dbSub.interval,
              shippingZone: dbSub.shippingZone,
              portalLink,
              nextBillingDate: periodEnd.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }),
            };
            await EmailService.sendSubscriptionRenewal(emailData);
            console.log(`✅ Subscription renewal email sent to: ${dbSub.customerEmail}`);
          }
        } catch (emailError) {
          console.error('⚠️ Error sending subscription renewal email:', emailError);
        }
      }

      return NextResponse.json({ received: true });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`❌ Subscription canceled: ${subscription.id}`);
      await SubscriptionService.updateSubscriptionStatus(subscription.id, 'canceled');

      try {
        const dbSub = await SubscriptionService.findByStripeSubscriptionId(subscription.id);
        if (dbSub) {
          const emailData: SubscriptionEmailData = {
            customerName: dbSub.customerName,
            customerEmail: dbSub.customerEmail,
            productName: dbSub.productName,
            interval: dbSub.interval,
            shippingZone: dbSub.shippingZone,
            portalLink: '',
          };
          await EmailService.sendSubscriptionCanceled(emailData);
          console.log(`✅ Subscription canceled email sent to: ${dbSub.customerEmail}`);
        }
      } catch (emailError) {
        console.error('⚠️ Error sending subscription canceled email:', emailError);
      }

      return NextResponse.json({ received: true });
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as unknown as { subscription?: string | { id: string } };
      const subId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id;
      if (subId) {
        console.log(`⚠️ Invoice payment failed for subscription: ${subId}`);
        await SubscriptionService.updateSubscriptionStatus(subId, 'past_due');

        try {
          const dbSub = await SubscriptionService.findByStripeSubscriptionId(subId);
          if (dbSub) {
            const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
            const portalLink = `${baseUrl}/manage-subscription/access?token=${dbSub.portalAccessToken}`;
            const emailData: SubscriptionEmailData = {
              customerName: dbSub.customerName,
              customerEmail: dbSub.customerEmail,
              productName: dbSub.productName,
              interval: dbSub.interval,
              shippingZone: dbSub.shippingZone,
              portalLink,
            };
            await EmailService.sendSubscriptionPaymentFailed(emailData);
            console.log(`✅ Payment failed email sent to: ${dbSub.customerEmail}`);
          }
        } catch (emailError) {
          console.error('⚠️ Error sending payment failed email:', emailError);
        }
      }
      return NextResponse.json({ received: true });
    }

    if (event.type === 'customer.subscription.paused') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`⏸️ Subscription paused: ${subscription.id}`);
      await SubscriptionService.updateSubscriptionStatus(subscription.id, 'paused');

      try {
        const dbSub = await SubscriptionService.findByStripeSubscriptionId(subscription.id);
        if (dbSub) {
          const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
          const portalLink = `${baseUrl}/manage-subscription/access?token=${dbSub.portalAccessToken}`;
          const emailData: SubscriptionEmailData = {
            customerName: dbSub.customerName,
            customerEmail: dbSub.customerEmail,
            productName: dbSub.productName,
            interval: dbSub.interval,
            shippingZone: dbSub.shippingZone,
            portalLink,
          };
          await EmailService.sendSubscriptionPaused(emailData);
          console.log(`✅ Subscription paused email sent to: ${dbSub.customerEmail}`);
          await TelegramService.sendSubscriptionPausedNotification(emailData);
        }
      } catch (emailError) {
        console.error('⚠️ Error sending subscription paused email:', emailError);
      }

      return NextResponse.json({ received: true });
    }

    if (event.type === 'customer.subscription.resumed') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`▶️ Subscription resumed: ${subscription.id}`);

      const periodStart = new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000);
      const periodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000);

      await SubscriptionService.updateSubscriptionStatus(subscription.id, 'active', {
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      });

      try {
        const dbSub = await SubscriptionService.findByStripeSubscriptionId(subscription.id);
        if (dbSub) {
          const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
          const portalLink = `${baseUrl}/manage-subscription/access?token=${dbSub.portalAccessToken}`;
          const emailData: SubscriptionEmailData = {
            customerName: dbSub.customerName,
            customerEmail: dbSub.customerEmail,
            productName: dbSub.productName,
            interval: dbSub.interval,
            shippingZone: dbSub.shippingZone,
            portalLink,
            nextBillingDate: periodEnd.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' }),
          };
          await EmailService.sendSubscriptionResumed(emailData);
          console.log(`✅ Subscription resumed email sent to: ${dbSub.customerEmail}`);
          await TelegramService.sendSubscriptionResumedNotification(emailData);
        }
      } catch (emailError) {
        console.error('⚠️ Error sending subscription resumed email:', emailError);
      }

      return NextResponse.json({ received: true });
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as unknown as {
        billing_reason?: string;
        subscription?: string | { id: string };
      };

      // Skip prima invoice (già gestita da checkout.session.completed)
      if (invoice.billing_reason === 'subscription_create') {
        return NextResponse.json({ received: true });
      }

      const subId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id;

      if (subId) {
        console.log(`💰 Invoice payment succeeded for subscription: ${subId}`);
        // Ripristina ad active se era past_due
        await SubscriptionService.updateSubscriptionStatus(subId, 'active');
      }

      return NextResponse.json({ received: true });
    }

    if (event.type === 'invoice.upcoming') {
      const invoice = event.data.object as unknown as {
        subscription?: string | { id: string };
        amount_due?: number;
        next_payment_attempt?: number;
      };

      const subId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id;

      if (subId) {
        console.log(`📅 Upcoming invoice for subscription: ${subId}`);

        try {
          const dbSub = await SubscriptionService.findByStripeSubscriptionId(subId);
          if (dbSub) {
            const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
            const portalLink = `${baseUrl}/manage-subscription/access?token=${dbSub.portalAccessToken}`;
            const amount = invoice.amount_due ? (invoice.amount_due / 100).toFixed(2) : undefined;
            const nextBillingDate = invoice.next_payment_attempt
              ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })
              : undefined;

            const emailData: SubscriptionEmailData = {
              customerName: dbSub.customerName,
              customerEmail: dbSub.customerEmail,
              productName: dbSub.productName,
              interval: dbSub.interval,
              shippingZone: dbSub.shippingZone,
              portalLink,
              amount,
              nextBillingDate,
            };
            await EmailService.sendSubscriptionUpcomingRenewal(emailData);
            console.log(`✅ Upcoming renewal email sent to: ${dbSub.customerEmail}`);
            await TelegramService.sendSubscriptionUpcomingRenewalNotification(emailData);
          }
        } catch (emailError) {
          console.error('⚠️ Error sending upcoming renewal email:', emailError);
        }
      }

      return NextResponse.json({ received: true });
    }

    // Gestisci l'evento checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      // ===== SUBSCRIPTION MODE =====
      if (session.mode === 'subscription') {
        console.log(`📦 Processing subscription for session: ${sessionId}`);

        const stripeSubscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription as Stripe.Subscription)?.id || '';

        // Idempotenza
        const exists = await SubscriptionService.subscriptionExists(stripeSubscriptionId);
        if (exists) {
          console.log(`ℹ️ Subscription already exists: ${stripeSubscriptionId}`);
          return NextResponse.json({ received: true, duplicate: true });
        }

        try {
          const metadata = session.metadata || {};

          await SubscriptionService.createSubscription({
            stripeSubscriptionId,
            stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || '',
            stripePriceId: metadata.stripePriceId || '',
            productId: metadata.productId || '',
            productName: metadata.productName || '',
            customerEmail: session.customer_details?.email || '',
            customerName: session.customer_details?.name || '',
            shippingZone: (metadata.shippingZone || 'italia') as ShippingZone,
            interval: (metadata.interval || 'month') as SubscriptionInterval,
            status: 'active',
            shippingAddress: (() => {
              const sd = (session as unknown as Record<string, unknown>).shipping_details as { address?: Record<string, string> } | undefined;
              if (!sd?.address) return undefined;
              const addr = sd.address;
              return {
                line1: addr.line1 || undefined,
                line2: addr.line2 || undefined,
                city: addr.city || undefined,
                state: addr.state || undefined,
                postalCode: addr.postal_code || undefined,
                country: addr.country || undefined,
              };
            })(),
          });

          console.log(`✅ Subscription saved: ${stripeSubscriptionId}`);

          // Send confirmation email and Telegram notification
          try {
            const dbSub = await SubscriptionService.findByStripeSubscriptionId(stripeSubscriptionId);
            if (dbSub) {
              const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
              const portalLink = `${baseUrl}/manage-subscription/access?token=${dbSub.portalAccessToken}`;
              const emailData: SubscriptionEmailData = {
                customerName: dbSub.customerName,
                customerEmail: dbSub.customerEmail,
                productName: dbSub.productName,
                interval: dbSub.interval,
                shippingZone: dbSub.shippingZone,
                portalLink,
              };

              const emailSent = await EmailService.sendSubscriptionConfirmation(emailData);
              if (emailSent) {
                console.log(`✅ Subscription confirmation email sent to: ${dbSub.customerEmail}`);
              }

              const telegramSent = await TelegramService.sendSubscriptionNotification(emailData);
              if (telegramSent) {
                console.log(`✅ Subscription Telegram notification sent`);
              }
            }
          } catch (notifError) {
            console.error('⚠️ Error sending subscription notifications:', notifError);
          }
        } catch (subError) {
          console.error('❌ Error processing subscription:', subError);
          return NextResponse.json({ error: 'Error processing subscription' }, { status: 500 });
        }

        return NextResponse.json({ received: true });
      }

      // ===== PAYMENT MODE (ordine singolo esistente) =====
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

        // Invia notifica WhatsApp (solo se abilitata e configurata)
        if (orderDetails.customer?.phone) {
          try {
            const isEnabled = await WahaService.isNotificationTypeEnabled('orderConfirmation');
            if (isEnabled) {
              const whatsappMessage = await WhatsAppTemplates.orderConfirmation({
                orderId: emailData.orderNumber,
                customerName: orderDetails.customer.name || 'Cliente',
                total: Math.round((orderDetails.pricing?.total || orderDetails.total || 0) * 100),
                currency: orderDetails.currency || 'EUR',
                items: orderDetails.items?.map(item => ({
                  name: item.name || 'Prodotto',
                  quantity: item.quantity || 1
                })) || []
              });

              const whatsappResult = await WahaService.sendTextMessage(
                orderDetails.customer.phone,
                whatsappMessage
              );

              if (!whatsappResult.success) {
                console.error('⚠️ Failed to send WhatsApp notification:', whatsappResult.error);
              }
            }
          } catch (error) {
            console.error('⚠️ Error sending WhatsApp notification:', error);
          }
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
