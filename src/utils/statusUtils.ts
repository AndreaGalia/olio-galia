import type { OrderPaymentStatus, OrderShippingStatus, FormStatus, StatusConfig, StatusType } from '@/types/admin';

const paymentStatusConfig: Record<OrderPaymentStatus, StatusConfig> = {
  paid: { label: 'Pagato', color: 'text-green-600 bg-green-50 border-green-200' },
  pending: { label: 'In attesa', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  cancelled: { label: 'Annullato', color: 'text-red-600 bg-red-50 border-red-200' },
};

const shippingStatusConfig: Record<OrderShippingStatus, StatusConfig> = {
  pending: { label: 'In attesa', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  shipping: { label: 'In spedizione', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  shipped: { label: 'Spedito', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  delivered: { label: 'Consegnato', color: 'text-green-700 bg-green-100 border-green-300' },
};

const formStatusConfig: Record<FormStatus, StatusConfig> = {
  pending: { label: 'In attesa', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  quote_sent: { label: 'Preventivo inviato', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  paid: { label: 'Pagato', color: 'text-green-600 bg-green-50 border-green-200' },
  in_preparazione: { label: 'In preparazione', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  shipped: { label: 'Spedito', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  confermato: { label: 'Confermato', color: 'text-green-700 bg-green-100 border-green-300' },
  delivered: { label: 'Consegnato', color: 'text-green-700 bg-green-100 border-green-300' },
  cancelled: { label: 'Annullato', color: 'text-red-600 bg-red-50 border-red-200' },
};

export function getStatusConfig(status: string, type: StatusType): StatusConfig {
  const defaultConfig: StatusConfig = {
    label: status,
    color: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  switch (type) {
    case 'payment':
      return paymentStatusConfig[status as OrderPaymentStatus] || defaultConfig;
    case 'shipping':
      return shippingStatusConfig[status as OrderShippingStatus] || defaultConfig;
    case 'form':
      return formStatusConfig[status as FormStatus] || defaultConfig;
    default:
      return defaultConfig;
  }
}

export function getStatusLabel(status: string, type: StatusType): string {
  return getStatusConfig(status, type).label;
}

export function getStatusColor(status: string, type: StatusType): string {
  return getStatusConfig(status, type).color;
}