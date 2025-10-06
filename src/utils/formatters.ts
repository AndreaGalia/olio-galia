/**
 * Formatta un valore in centesimi come valuta EUR
 */
export const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(cents / 100);
};

/**
 * Formatta una data in formato italiano
 */
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatta una data in formato corto
 */
export const formatDateShort = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Ottiene l'etichetta localizzata per lo stato
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    paid: 'Pagato',
    pending: 'In attesa',
    cancelled: 'Annullato',
    refunded: 'Rimborsato'
  };
  return labels[status] || status;
};

/**
 * Ottiene le classi CSS per lo stato
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Ottiene l'etichetta localizzata per la fonte del cliente
 */
export const getCustomerSourceLabel = (source: 'manual' | 'order' | 'quote'): string => {
  const labels: Record<string, string> = {
    manual: 'Manuale',
    order: 'Da Ordine',
    quote: 'Da Preventivo'
  };
  return labels[source];
};
