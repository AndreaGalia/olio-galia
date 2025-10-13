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
}

export interface ShippingNotificationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  shippingTrackingId: string;
  shippingCarrier?: string;
  expectedDelivery?: string;
}

export interface DeliveryNotificationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  shippingTrackingId?: string;
  deliveryDate?: string;
}

export interface NewsletterWelcomeData {
  firstName: string;
  lastName: string;
  email: string;
}
