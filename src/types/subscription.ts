// types/subscription.ts

export type SubscriptionInterval = 'month' | 'bimonth' | 'quarter' | 'semester';

export type ShippingZone = 'italia' | 'europa' | 'america' | 'mondo';

export type RecurringPriceMap = {
  [zone in ShippingZone]?: {
    [interval in SubscriptionInterval]?: string;
  };
};

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'paused' | 'incomplete';

export interface SubscriptionDocument {
  _id?: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  productId: string;
  productName: string;
  customerEmail: string;
  customerName: string;
  shippingZone: ShippingZone;
  interval: SubscriptionInterval;
  status: SubscriptionStatus;
  portalAccessToken?: string;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  canceledAt?: Date;
}

export interface PortalTokenDocument {
  _id?: string;
  token: string;
  stripeCustomerId: string;
  customerEmail: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface SubscriptionEmailData {
  customerName: string;
  customerEmail: string;
  productName: string;
  interval: SubscriptionInterval;
  shippingZone: ShippingZone;
  portalLink: string;
  nextBillingDate?: string;
  amount?: string;
}

export const SUBSCRIPTION_INTERVALS: {
  value: SubscriptionInterval;
  labelIt: string;
  labelEn: string;
  months: number;
}[] = [
  { value: 'month', labelIt: 'Ogni mese', labelEn: 'Every month', months: 1 },
  { value: 'bimonth', labelIt: 'Ogni 2 mesi', labelEn: 'Every 2 months', months: 2 },
  { value: 'quarter', labelIt: 'Ogni 3 mesi', labelEn: 'Every 3 months', months: 3 },
  { value: 'semester', labelIt: 'Ogni 6 mesi', labelEn: 'Every 6 months', months: 6 },
];

export const SHIPPING_ZONES: {
  value: ShippingZone;
  labelIt: string;
  labelEn: string;
}[] = [
  { value: 'italia', labelIt: 'Italia', labelEn: 'Italy' },
  { value: 'europa', labelIt: 'Europa', labelEn: 'Europe' },
  { value: 'america', labelIt: 'America', labelEn: 'Americas' },
  { value: 'mondo', labelIt: 'Resto del Mondo', labelEn: 'Rest of World' },
];
