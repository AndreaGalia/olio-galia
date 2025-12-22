import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AdminOrderService } from '@/services/adminOrderService';
import { EmailService } from '@/lib/email/resend';
import { generateFeedbackUrl } from '@/lib/feedback/token';
import { WahaService } from '@/services/wahaService';
import { WhatsAppTemplates } from '@/lib/whatsapp/templates';

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

        // Costruisci il tracking URL completo basato sul corriere
        // NOTA: Aggiorna questi URL con quelli corretti per i tuoi corrieri
        const carrierName = body.shippingCarrier || 'DHL'; // Prendi dal body o default
        let trackingUrl = '';

        switch (carrierName.toUpperCase()) {
          case 'DHL':
            trackingUrl = `https://www.dhl.it/it/it/tracking-privati.html?submit=1&tracking-id=${shippingTrackingId}`;
            break;
          case 'UPS':
            trackingUrl = `https://www.ups.com/track?tracknum=${shippingTrackingId}`;
            break;
          case 'FEDEX':
            trackingUrl = `https://www.fedex.com/fedextrack/?tracknumbers=${shippingTrackingId}`;
            break;
          case 'POSTE ITALIANE':
          case 'POSTE':
            trackingUrl = `https://www.poste.it/cerca/index.html#/risultati-spedizioni/${shippingTrackingId}`;
            break;
          case 'SDA':
            trackingUrl = `https://www.sda.it/wps/portal/Servizi_online/dettaglio-spedizione?locale=it&tracing.letteraVettura=${shippingTrackingId}`;
            break;
          case 'BRT':
            trackingUrl = `https://vas.brt.it/vas/sped_det_show.hsm?referer=sped_numspe_par.htm&Nspediz=${shippingTrackingId}`;
            break;
          case 'GLS':
            trackingUrl = `https://gls-group.com/IT/it/ricerca-pacchi?match=${shippingTrackingId}`;
            break;
          default:
            // Fallback: se non riconosciuto, usa un generico o lascia vuoto
            trackingUrl = `https://parcelsapp.com/en/tracking/${shippingTrackingId}`;
        }

        const shippingNotificationData = {
          customerName: updatedOrder.customerName || updatedOrder.customer?.name || 'Cliente',
          customerEmail: updatedOrder.customerEmail || updatedOrder.customer?.email || '',
          orderNumber: orderNumber.slice(-8).toUpperCase(),
          trackingUrl,  // Passa il link completo invece del solo ID
          shippingCarrier: carrierName,
          expectedDelivery: body.expectedDelivery || undefined
        };

        const emailSent = await EmailService.sendShippingNotification(shippingNotificationData);

        if (emailSent) {

        } else {

        }
      } catch (emailError) {

        // Non blocchiamo la response per un errore di email
      }

      // Invia notifica WhatsApp spedizione
      const customerPhone = updatedOrder.customer?.phone;
      if (customerPhone) {
        try {
          const isEnabled = await WahaService.isNotificationTypeEnabled('shippingUpdate');
          if (isEnabled) {
            const orderNumber = updatedOrder.orderId || updatedOrder.sessionId || updatedOrder.id;
            const whatsappMessage = await WhatsAppTemplates.shippingUpdate({
              orderId: orderNumber.slice(-8).toUpperCase(),
              customerName: updatedOrder.customerName || updatedOrder.customer?.name || 'Cliente',
              trackingNumber: shippingTrackingId,
              carrier: 'Corriere Espresso'
            });

            await WahaService.sendTextMessage(customerPhone, whatsappMessage);
          }
        } catch (whatsappError) {
          console.error('⚠️ Error sending WhatsApp shipping notification:', whatsappError);
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

      // Invia notifica WhatsApp consegna
      const customerPhone = updatedOrder.customer?.phone;
      if (customerPhone) {
        try {
          const isEnabled = await WahaService.isNotificationTypeEnabled('deliveryConfirmation');
          if (isEnabled) {
            const whatsappMessage = await WhatsAppTemplates.deliveryConfirmation({
              orderId: orderNumber.slice(-8).toUpperCase(),
              customerName: updatedOrder.customerName || updatedOrder.customer?.name || 'Cliente',
              type: 'order'
            });

            await WahaService.sendTextMessage(customerPhone, whatsappMessage);
          }
        } catch (whatsappError) {
          console.error('⚠️ Error sending WhatsApp delivery notification:', whatsappError);
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