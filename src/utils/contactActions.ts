// utils/contactActions.ts

export const openEmail = (email?: string) => {
  const emailAddress = email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';
  window.open(`mailto:${emailAddress}`);
};

export const openWhatsApp = (phone: string, message: string = '') => {
  // Rimuove spazi, + e altri caratteri non numerici dal numero
  const cleanPhone = phone.replace(/[\s+\-()]/g, '');
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
};

export const openPhone = (phone: string) => {
  window.open(`tel:${phone}`);
};