import { ObjectId } from 'mongodb';

export interface DiscountCodeSendRecipient {
  email: string;
  customerName?: string;
  success: boolean;
  error?: string;
}

export interface DiscountCodeSendDocument {
  _id?: ObjectId;
  couponCode: string;
  discountDescription: string;
  expiryDate?: string;
  customMessage: string;
  locale: 'it' | 'en';
  sentAt: Date;
  sentBy: string;
  recipients: DiscountCodeSendRecipient[];
  stripeVerified: boolean;
  totalSent: number;
  totalFailed: number;
}
