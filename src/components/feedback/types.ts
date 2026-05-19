// UI-specific types for the feedback page components

export interface OrderInfo {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderType: 'order' | 'quote';
  items: Array<{
    productId?: string | null;
    name: string;
    quantity: number;
  }>;
}

export interface UniqueProduct {
  productId?: string | null;
  productName: string;
  quantity: number;
}

export interface ProductFeedback {
  productId?: string | null;
  productName: string;
  rating: number;
  comment: string;
}

export interface ExistingFeedbackItem {
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
