// types/checkoutSuccess.ts
import { ShippingZone } from './shipping';

// ===== ORDER ITEM =====
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// ===== CUSTOMER =====
export interface Customer {
  name?: string;
  email?: string;
  phone?: string;
}

// ===== SHIPPING =====
export interface Shipping {
  address?: string;
  method?: string;
  addressDetails?: {
    line1?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    state?: string;
  };
  // Nuovi campi per sistema zone
  zone?: ShippingZone; // Zona di spedizione selezionata
  selectedCity?: string; // Città selezionata dall'utente nel carrello
  selectedCountry?: string; // Paese selezionato dall'utente
  selectedCountryCode?: string; // Codice ISO paese
  cost?: number; // Costo spedizione in centesimi
  stripeShippingRateId?: string; // ID Shipping Rate Stripe (shr_xxx)
}

// ===== PRICING =====
export interface Pricing {
  subtotal: number;
  shippingCost: number;
  total: number;
}

// ===== ORDER DETAILS =====
export interface OrderDetails {
  id: string;
  customer?: Customer;
  shipping?: Shipping;
  items?: OrderItem[];
  pricing?: Pricing;
  total: number;
  status: string;
  created: string;
  currency?: string;
  paymentStatus?: string;
  paymentIntent?: string;
  shippingStatus?: string;
}

// ===== INVOICE STATUS =====
export interface InvoiceStatus {
  hasInvoice: boolean;
  invoiceReady: boolean;
  invoiceNumber: string | null;
  checking: boolean;
}

// ===== RECEIPT STATUS =====
export interface ReceiptStatus {
  isPaid: boolean;
  hasReceipt: boolean;
  receiptUrl: string | null;
  checking: boolean;
}

// ===== COMPONENT PROPS =====
export interface SuccessHeroSectionProps {
  sessionId: string | null;
  orderDetails: OrderDetails | null;
  invoiceStatus: InvoiceStatus;
  receiptStatus: ReceiptStatus;
}

export interface WhatsAppButtonProps {
  orderDetails: OrderDetails;
  sessionId: string;
}

export interface ReceiptButtonProps {
  receiptStatus: ReceiptStatus;
  invoiceStatus: InvoiceStatus;
}

export interface OrderSummaryDisplayProps {
  orderDetails: OrderDetails | null;
  loading: boolean;
}

export interface TimelineProcessProps {
  currentStep?: 'confirmation' | 'preparation' | 'shipping';
}

export interface CallToActionProps {
  className?: string;
}

// ===== API RESPONSES =====
export interface OrderDetailsResponse {
  success: boolean;
  data?: OrderDetails;
  error?: string;
}

export interface InvoiceCheckResponse {
  hasInvoice: boolean;
  invoiceReady: boolean;
  invoiceNumber: string | null;
}

export interface ReceiptCheckResponse {
  isPaid: boolean;
  hasReceipt: boolean;
  receiptUrl: string | null;
}

export interface StockUpdateResponse {
  success: boolean;
  message?: string;
}

// ===== HOOKS =====
export interface UseOrderDetailsReturn {
  orderDetails: OrderDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseInvoiceStatusReturn {
  invoiceStatus: InvoiceStatus;
  checkInvoiceStatus: () => Promise<void>;
}

export interface UseReceiptStatusReturn {
  receiptStatus: ReceiptStatus;
  checkReceiptStatus: () => Promise<void>;
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
} as const;