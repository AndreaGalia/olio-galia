// utils/analytics.ts
// Centralizza il firing di eventi analytics (Meta Pixel, Google Analytics, DB interno)

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface AddToCartParams {
  productId: string;
  variantId?: string;
  productName: string;
  price: number;
  quantity: number;
}

export function trackAddToCart(params: AddToCartParams) {
  const contentId = params.variantId || params.productId;
  const totalValue = params.price * params.quantity;

  // Meta Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [contentId],
      content_type: 'product',
      content_name: params.productName,
      value: totalValue,
      currency: 'EUR',
    });
  }

  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'EUR',
      value: totalValue,
      items: [
        {
          item_id: contentId,
          item_name: params.productName,
          price: params.price,
          quantity: params.quantity,
        },
      ],
    });
  }

  // Tracking interno su DB (fire and forget — non blocca l'utente)
  fetch('/api/cart-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }).catch(() => {});
}
