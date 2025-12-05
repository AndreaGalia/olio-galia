// app/api/save-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import { CustomerService } from '@/services/customerService';
import { OrderDetails } from '@/types/checkoutSuccessTypes';
import { EmailOrderData, EmailOrderDataExtended } from '@/types/email';
import { EmailService } from '@/lib/email/resend';
import { TelegramService } from '@/lib/telegram/telegram';
import { WahaService } from '@/services/wahaService';
import { WhatsAppTemplates } from '@/lib/whatsapp/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID richiesto' },
        { status: 400 }
      );
    }

    // Verifica se l'ordine esiste già per evitare duplicati
    const orderExists = await OrderService.orderExists(sessionId);
    if (orderExists) {
      return NextResponse.json({
        success: true,
        message: 'Ordine già esistente',
        duplicate: true,
        emailSent: false // Email non inviata perché ordine già esistente
      });
    }

    // Recupera i dettagli dell'ordine da Stripe
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
      throw new Error('Impossibile recuperare dettagli ordine');
    }

    const orderDetails: OrderDetails = await orderDetailsResponse.json();

    // Salva l'ordine in MongoDB
    const mongoId = await OrderService.createOrder(orderDetails);

    // Crea o aggiorna il cliente automaticamente
    try {
      // Converti il totale da euro a centesimi
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
    } catch (customerError) {
      // Non bloccare il processo se c'è un errore nel salvare il cliente
    }

    // Prepara dati per l'email
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
    city: '', // Aggiungi se hai city nell'interfaccia
    postalCode: '', // Aggiungi se hai postal code nell'interfaccia  
    country: 'IT' // Default o aggiungi se hai country nell'interfaccia
  },
  // Aggiungi i campi per ricevuta/fattura (inizialmente vuoti)
  receiptUrl: null,
  hasInvoice: false
};

emailData.orderNumber = emailData.orderNumber.slice(-8).toUpperCase();

// Controlla fattura
try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/download-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (response.ok) {
    const dataInvoice = await response.json();
    // Aggiorna emailData con i dati della fattura
    emailData.hasInvoice = dataInvoice.hasInvoice || false;
  }
} catch (error) {
  // Errore nel controllo fattura
}

// Controlla ricevuta
try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/download-receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (response.ok) {
    const dataReceipt = await response.json();
    if (dataReceipt.receiptUrl) {
      const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
      emailData.receiptUrl = `${baseUrl}${dataReceipt.receiptUrl}`;
    } else {
      emailData.receiptUrl = null;
    }
  }
} catch (error) {
  // Errore nel controllo ricevuta
}

    // Invia notifica Telegram con link diretto all'ordine
    let telegramSent = false;
    let telegramError = null;
    try {
      telegramSent = await TelegramService.sendOrderNotification(orderDetails, mongoId);
      if (!telegramSent) {
        telegramError = 'Errore nell\'invio della notifica Telegram';
      }
    } catch (error) {
      telegramError = error instanceof Error ? error.message : 'Errore sconosciuto nell\'invio notifica Telegram';
      // Non interrompiamo il processo per errori Telegram
    }

    let emailSent = false;
    let emailError = null;

    // Invia email solo se abbiamo l'email del cliente
    if (emailData.customerEmail && emailData.customerEmail !== 'N/D') {
      try {
        emailSent = await EmailService.sendOrderConfirmation(emailData);

        if (!emailSent) {
          emailError = 'Errore nell\'invio dell\'email';
        }
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'Errore sconosciuto nell\'invio email';
        // Non interrompiamo il processo per errori email
      }
    } else {
      emailError = 'Email del cliente non disponibile';
    }

    // Invia notifica WhatsApp (solo se abilitata e configurata)
    let whatsappSent = false;
    let whatsappError = null;
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

          whatsappSent = whatsappResult.success;
          if (!whatsappSent) {
            whatsappError = whatsappResult.error || 'Errore nell\'invio della notifica WhatsApp';
          }
        }
      } catch (error) {
        whatsappError = error instanceof Error ? error.message : 'Errore sconosciuto nell\'invio WhatsApp';
      }
    } else {
      whatsappError = 'Telefono del cliente non disponibile';
    }

    return NextResponse.json({
      success: true,
      message: 'Ordine salvato con successo',
      mongoId,
      sessionId,
      duplicate: false,
      emailSent,
      emailError,
      telegramSent,
      telegramError,
      whatsappSent,
      whatsappError
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore nel salvare l\'ordine';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}