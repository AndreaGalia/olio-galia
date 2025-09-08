// app/api/save-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import { OrderDetails } from '@/types/checkoutSuccessTypes';
import { EmailOrderData } from '@/types/email';
import { EmailService } from '@/lib/email/resend';
import { log } from 'console';

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
    console.log('✅ Ordine salvato su MongoDB:', mongoId);

    // Prepara dati per l'email
    // Prepara dati per l'email
const emailData: EmailOrderData = {
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
  console.error('Errore nel controllo fattura:', error);
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
    // Aggiorna emailData con i dati della ricevuta
    emailData.receiptUrl = dataReceipt.receiptUrl ? `${process.env.NEXT_PUBLIC_BASE_URL}${dataReceipt.receiptUrl}` : null;
  }
} catch (error) {
  console.error('Errore nel controllo ricevuta:', error);
}

    let emailSent = false;
    let emailError = null;

    // Invia email solo se abbiamo l'email del cliente
    if (emailData.customerEmail && emailData.customerEmail !== 'N/D') {
      try {
        console.log('📧 Inviando email di conferma...');
        emailSent = await EmailService.sendOrderConfirmation(emailData);
        
        if (emailSent) {
          console.log('✅ Email di conferma inviata con successo');
        } else {
          console.warn('⚠️ Errore nell\'invio email');
          emailError = 'Errore nell\'invio dell\'email';
        }
      } catch (error) {
        console.error('❌ Errore nell\'invio email:', error);
        emailError = error instanceof Error ? error.message : 'Errore sconosciuto nell\'invio email';
        // Non interrompiamo il processo per errori email
      }
    } else {
      console.warn('⚠️ Email del cliente non disponibile, salto invio email');
      emailError = 'Email del cliente non disponibile';
    }

    return NextResponse.json({
      success: true,
      message: 'Ordine salvato con successo',
      mongoId,
      sessionId,
      duplicate: false,
      emailSent,
      emailError
    });

  } catch (error) {
    console.error('Errore nel salvare l\'ordine:', error);
    
    const message = error instanceof Error ? error.message : 'Errore nel salvare l\'ordine';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}