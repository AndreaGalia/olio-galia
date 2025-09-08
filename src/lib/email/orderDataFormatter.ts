// Utility per formattare dati ordine da Stripe/MongoDB

import { EmailOrderData } from "@/types/email";

export function formatOrderDataForEmail(stripeSession: any, orderFromDB: any): EmailOrderData {
  // Estrai i dati dalla sessione Stripe e dall'ordine MongoDB
  const customerName = stripeSession.customer_details?.name || 'Cliente';
  const customerEmail = stripeSession.customer_details?.email;
  
  // Formatta gli item
  const items = stripeSession.line_items?.data?.map((item: any) => ({
    name: item.description || item.price?.product?.name || 'Prodotto',
    quantity: item.quantity || 1,
    price: (item.amount_total || 0) / 100, // Stripe usa centesimi
    image: item.price?.product?.images?.[0] || null
  })) || [];

  // Calcola totali
  const subtotal = (stripeSession.amount_subtotal || 0) / 100;
  const shipping = (stripeSession.shipping_cost?.amount_total || 0) / 100;
  const total = (stripeSession.amount_total || 0) / 100;

  // Formatta indirizzo
  const shippingAddress = {
    name: stripeSession.shipping?.name || customerName,
    street: stripeSession.shipping?.address?.line1 || '',
    city: stripeSession.shipping?.address?.city || '',
    postalCode: stripeSession.shipping?.address?.postal_code || '',
    country: stripeSession.shipping?.address?.country || 'IT'
  };

  return {
    customerName,
    customerEmail,
    orderNumber: orderFromDB?.orderNumber || stripeSession.id,
    orderDate: new Date().toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    items,
    subtotal,
    shipping,
    total,
    shippingAddress
  };
}