// types/whatsapp.ts

/**
 * Dati per messaggio WhatsApp di conferma ordine
 */
export interface WhatsAppOrderData {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  trackingUrl?: string;
}

/**
 * Dati per messaggio WhatsApp di preventivo
 */
export interface WhatsAppQuoteData {
  customerName: string;
  customerPhone: string;
  quoteNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
}

/**
 * Dati per messaggio WhatsApp di conferma spedizione
 */
export interface WhatsAppShippingData {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  shippingTrackingId?: string;
  expectedDelivery?: string;
}

/**
 * Dati per messaggio WhatsApp di conferma consegna
 */
export interface WhatsAppDeliveryData {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  orderId?: string;  // MongoDB _id per link feedback
  deliveryDate?: string;
}

/**
 * Dati per messaggio WhatsApp di benvenuto newsletter
 */
export interface WhatsAppNewsletterData {
  firstName: string;
  lastName: string;
  customerPhone: string;
}

/**
 * Risultato invio WhatsApp
 */
export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Configurazione WhatsApp
 */
export interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string; // Formato: whatsapp:+14155238886
  enabled: boolean;
}

/**
 * Risultato validazione numero telefono
 */
export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string; // Formato E.164: +393331234567
  nationalNumber?: string;
  countryCode?: string;
  error?: string;
}
