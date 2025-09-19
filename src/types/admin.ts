export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  lastLogin?: string;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  sessionId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  paymentStatus: OrderPaymentStatus;
  shippingStatus: OrderShippingStatus;
  created: string;
  itemCount: number;
}

export interface FormSummary {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: FormStatus;
  created: string;
  itemCount: number;
  finalTotal?: number;
}

export type OrderPaymentStatus = 'paid' | 'pending' | 'cancelled';
export type OrderShippingStatus = 'pending' | 'shipping' | 'shipped' | 'delivered';
export type FormStatus = 'pending' | 'quote_sent' | 'paid' | 'in_preparazione' | 'shipped' | 'confermato' | 'delivered' | 'cancelled';

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface StatusConfig {
  label: string;
  color: string;
}

export type StatusType = 'payment' | 'shipping' | 'form';

export interface FilterParams {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}