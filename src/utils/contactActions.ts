// utils/contactActions.ts

export const openEmail = (email: string = 'info@oliogalia.it') => {
  window.open(`mailto:${email}`);
};

export const openWhatsApp = (phone: string = '3661368797', message: string = '') => {
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
};

export const openPhone = (phone: string) => {
  window.open(`tel:${phone}`);
};