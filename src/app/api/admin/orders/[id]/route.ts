import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AdminOrderService } from '@/services/adminOrderService';
import { EmailService } from '@/lib/email/resend';
import { WhatsAppService } from '@/lib/whatsapp/whatsapp';
import { WhatsAppShippingData, WhatsAppDeliveryData } from '@/types/whatsapp';
import { generateFeedbackUrl } from '@/lib/feedback/token';

export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    
    const orderDetails = await AdminOrderService.getOrderDetails(id);
    
    if (!orderDetails) {
      return NextResponse.json(
        { error: 'Ordine non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: orderDetails,
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nel recupero dei dettagli ordine' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { shippingTrackingId, shippingStatus } = body;

    if (!shippingStatus) {
      return NextResponse.json(
        { error: 'Stato spedizione è richiesto' },
        { status: 400 }
      );
    }

    // Solo per stato "shipped" è richiesto l'ID spedizione
    if (shippingStatus === 'shipped' && !shippingTrackingId) {
      return NextResponse.json(
        { error: 'ID spedizione è richiesto quando lo stato è "spedito"' },
        { status: 400 }
      );
    }

    const updatedOrder = await AdminOrderService.updateOrderShipping(id, {
      shippingTrackingId,
      shippingStatus
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Ordine non trovato' },
        { status: 404 }
      );
    }

    // Invia email di notifica spedizione se lo stato è 'shipped'
    if (shippingStatus === 'shipped') {
      try {
        const orderNumber = updatedOrder.orderId || updatedOrder.sessionId || updatedOrder.id;
        const shippingNotificationData = {
          customerName: updatedOrder.customerName || updatedOrder.customer?.name || 'Cliente',
          customerEmail: updatedOrder.customerEmail || updatedOrder.customer?.email || '',
          orderNumber: orderNumber.slice(-8).toUpperCase(), // Prende gli ultimi 8 caratteri
          shippingTrackingId,
          shippingCarrier: 'Corriere Espresso',
          expectedDelivery: undefined // Può essere aggiunto in futuro
        };

        const emailSent = await EmailService.sendShippingNotification(shippingNotificationData);

        if (emailSent) {

        } else {

        }
      } catch (emailError) {

        // Non blocchiamo la response per un errore di email
      }

      // Invia notifica WhatsApp se abbiamo il numero di telefono
      const customerPhone = updatedOrder.customer?.phone;
      if (customerPhone) {
        try {
          const orderNumber = updatedOrder.orderId || updatedOrder.sessionId || updatedOrder.id;
          const whatsappData: WhatsAppShippingData = {
            customerName: updatedOrder.customerName || updatedOrder.customer?.name || 'Cliente',
            customerPhone: customerPhone,
            orderNumber: orderNumber.slice(-8).toUpperCase(),
            shippingTrackingId,
            expectedDelivery: undefined,
          };

          const whatsappResult = await WhatsAppService.sendShippingNotification(whatsappData);

        } catch (whatsappError) {
          console.error('[WhatsApp] Errore:', whatsappError);
          // Non blocchiamo la response per errori WhatsApp
        }
      }
    }

    // Invia email di conferma consegna se lo stato è 'delivered'
    if (shippingStatus === 'delivered') {
      const orderNumber = updatedOrder.orderId || updatedOrder.sessionId || updatedOrder.id;
      const customerEmail = updatedOrder.customerEmail || updatedOrder.customer?.email || '';

      // Genera URL feedback sicuro con token JWT
      let feedbackUrl: string | undefined;
      try {
        feedbackUrl = await generateFeedbackUrl(id, 'order');
      } catch (error) {
        console.error('[Feedback] Errore nella generazione token:', error);
        // Continua senza link feedback se fallisce
      }

      try {
        const deliveryNotificationData = {
          customerName: updatedOrder.customerName || updatedOrder.customer?.name || 'Cliente',
          customerEmail: customerEmail,
          orderNumber: orderNumber.slice(-8).toUpperCase(), // Prende gli ultimi 8 caratteri
          orderId: id, // MongoDB _id per link feedback
          shippingTrackingId: updatedOrder.shippingTrackingId,
          deliveryDate: new Date().toLocaleDateString('it-IT')
        };

        const emailSent = await EmailService.sendDeliveryNotification(deliveryNotificationData, feedbackUrl);

        if (emailSent) {

        } else {

        }
      } catch (emailError) {

        // Non blocchiamo la response per un errore di email
      }

      // Invia notifica WhatsApp se abbiamo il numero di telefono
      const customerPhone = updatedOrder.customer?.phone;
      if (customerPhone) {
        try {
          const orderNumber = updatedOrder.orderId || updatedOrder.sessionId || updatedOrder.id;
          const whatsappData: WhatsAppDeliveryData = {
            customerName: updatedOrder.customerName || updatedOrder.customer?.name || 'Cliente',
            customerPhone: customerPhone,
            orderNumber: orderNumber.slice(-8).toUpperCase(),
            orderId: id, // MongoDB _id per link feedback
            deliveryDate: new Date().toLocaleDateString('it-IT'),
          };

          const whatsappResult = await WhatsAppService.sendDeliveryConfirmation(whatsappData, feedbackUrl);

        } catch (whatsappError) {
          console.error('[WhatsApp] Errore:', whatsappError);
          // Non blocchiamo la response per errori WhatsApp
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'ordine' },
      { status: 500 }
    );
  }
});