// types/email.ts
export interface EmailOrderData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string | null;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  discount?: {
    code: string;
    amount: number; // importo scontato in EUR (es. 5.00)
  };
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface EmailOrderDataExtended extends EmailOrderData {
  receiptUrl?: string | null;
  hasInvoice?: boolean;
  locale?: 'it' | 'en';
}

export interface ShippingNotificationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  trackingUrl: string;  // URL completo per tracking (non più solo ID)
  shippingCarrier?: string;
  expectedDelivery?: string;
  locale?: 'it' | 'en';
}

export interface DeliveryNotificationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderId?: string;  // MongoDB _id per link feedback
  shippingTrackingId?: string;
  deliveryDate?: string;
  locale?: 'it' | 'en';
}

export interface NewsletterWelcomeData {
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface ReviewRequestData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderType?: 'order' | 'quote';
  locale?: 'it' | 'en';
}

export interface QuoteEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  customerPhone: string;
}
