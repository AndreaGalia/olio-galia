# Implementazione Sistema Subscription

## Panoramica

Sistema di abbonamento ricorrente per l'e-commerce Olio Galia. I clienti possono abbonarsi a un prodotto con 4 intervalli (mensile, bimestrale, trimestrale, semestrale) e 4 zone di spedizione (Italia, Europa, America, Mondo). La spedizione è inclusa nel prezzo ricorrente Stripe.

**Flusso separato:** Il carrello e il checkout singolo NON sono stati toccati.

---

## Architettura

### Flusso cliente
1. Pagina prodotto → Banner "Abbonati e Risparmia" (se `isSubscribable: true`)
2. Pagina `/products/[slug]/subscribe` → Selezione zona + intervallo
3. Stripe Checkout (mode: subscription) → Pagamento
4. Redirect a `/checkout/subscription-success`
5. Gestione abbonamento via `/manage-subscription` → Stripe Customer Portal

### Flusso admin
1. Creare Price ricorrenti su Stripe (uno per ogni combo zona×intervallo)
2. Admin → Crea/Modifica prodotto → Sezione "Abbonamento" → Inserire Price ID
3. Admin → `/admin/subscriptions` → Visualizzare abbonamenti

---

## File creati

| File | Descrizione |
|------|-------------|
| `src/types/subscription.ts` | Tipi TypeScript (SubscriptionInterval, RecurringPriceMap, etc.) |
| `src/services/subscriptionService.ts` | Service layer MongoDB per collection `subscriptions` |
| `src/app/api/create-subscription-session/route.ts` | API: crea Stripe Checkout Session in mode subscription |
| `src/app/api/create-portal-session/route.ts` | API: crea Stripe Customer Portal session |
| `src/hooks/useSubscriptionCheckout.ts` | Hook React per il flusso checkout subscription |
| `src/components/subscriptionPage/SubscriptionForm.tsx` | Form con selettori zona/intervallo |
| `src/app/(shop)/products/[slug]/subscribe/page.tsx` | Pagina subscribe dedicata |
| `src/app/(shop)/checkout/subscription-success/page.tsx` | Pagina successo abbonamento |
| `src/app/(shop)/manage-subscription/page.tsx` | Pagina gestione (email → Stripe Portal) |
| `src/app/api/admin/subscriptions/route.ts` | API admin: lista abbonamenti con filtri |
| `src/app/admin/subscriptions/page.tsx` | Pagina admin: tabella abbonamenti |

## File modificati

| File | Modifica |
|------|----------|
| `src/types/products.ts` | Aggiunto `isSubscribable` e `stripeRecurringPriceIds` a BaseProduct |
| `src/data/locales/it.json` | Sezione `subscription` con testi IT |
| `src/data/locales/en.json` | Sezione `subscription` con testi EN |
| `src/app/api/webhooks/stripe/route.ts` | Handler per subscription events |
| `src/app/api/admin/products/route.ts` | Salvataggio campi subscription nel POST |
| `src/app/api/admin/products/[id]/route.ts` | Salvataggio campi subscription nel PUT |
| `src/app/admin/products/create/page.tsx` | UI sezione abbonamento (griglia Price ID) |
| `src/app/admin/products/[id]/edit/page.tsx` | UI sezione abbonamento (griglia Price ID) |
| `src/components/singleProductPage/ProductInfoSection.tsx` | Banner CTA "Abbonati e Risparmia" |

## File NON toccati
- `src/contexts/CartContext.tsx`
- `src/hooks/useCheckout.ts`
- `src/app/api/create-checkout-session/route.ts`
- `src/app/(shop)/cart/page.tsx`
- Tutti i componenti del carrello

---

## Prerequisiti Stripe (manuali)

1. **Creare Price ricorrenti** per ogni prodotto × zona × intervallo nella dashboard Stripe
2. **Configurare Customer Portal**: Settings > Billing > Customer Portal
3. **Aggiungere eventi webhook**: `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Webhook Events gestiti

| Evento | Azione |
|--------|--------|
| `checkout.session.completed` (mode: subscription) | Salva subscription in MongoDB, notifica Telegram |
| `customer.subscription.updated` | Aggiorna status in MongoDB |
| `customer.subscription.deleted` | Segna come canceled |
| `invoice.payment_failed` | Segna come past_due |

---

## Collection MongoDB: `subscriptions`

```json
{
  "stripeSubscriptionId": "sub_xxx",
  "stripeCustomerId": "cus_xxx",
  "stripePriceId": "price_xxx",
  "productId": "local_xxx",
  "productName": "Olio EVO 500ml",
  "customerEmail": "cliente@email.com",
  "customerName": "Mario Rossi",
  "shippingZone": "italia",
  "interval": "month",
  "status": "active",
  "shippingAddress": { ... },
  "createdAt": "2025-...",
  "updatedAt": "2025-..."
}
```
