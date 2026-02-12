# Implementazione Eventi Stripe Webhook - Changelog

Data: 12 Febbraio 2026

Riferimento piano originale: `docs/STRIPE-WEBHOOK-EVENTS.md`

---

## Cosa e stato implementato

Sono stati aggiunti i 4 eventi mancanti descritti nel piano. Per ognuno: handler webhook, aggiornamento DB, email al cliente, notifica Telegram admin.

---

## 1. `customer.subscription.paused`

**Trigger:** L'abbonamento viene messo in pausa dal portale Stripe o via API.

| Livello | Azione |
|---------|--------|
| **DB** | `updateSubscriptionStatus(id, 'paused')` |
| **Email** | `sendSubscriptionPaused` — informa il cliente che l'abbonamento e in pausa, nessun addebito fino alla riattivazione, CTA per riattivare dal portale |
| **Telegram** | `sendSubscriptionPausedNotification` — notifica admin con cliente e prodotto |

---

## 2. `customer.subscription.resumed`

**Trigger:** L'abbonamento viene riattivato dopo una pausa.

| Livello | Azione |
|---------|--------|
| **DB** | `updateSubscriptionStatus(id, 'active', { currentPeriodStart, currentPeriodEnd })` |
| **Email** | `sendSubscriptionResumed` — conferma riattivazione con data prossimo rinnovo, CTA gestione portale |
| **Telegram** | `sendSubscriptionResumedNotification` — notifica admin con cliente, prodotto e prossimo rinnovo |

---

## 3. `invoice.payment_succeeded`

**Trigger:** Un pagamento ricorrente va a buon fine.

| Livello | Azione |
|---------|--------|
| **DB** | `updateSubscriptionStatus(subId, 'active')` — utile per ripristinare da `past_due` |
| **Email** | Nessuna (evita ridondanza con la renewal email gia inviata da `customer.subscription.updated`) |
| **Telegram** | Nessuna |

**Logica speciale:**
- Se `billing_reason === 'subscription_create'` → SKIP (gia gestito da `checkout.session.completed`)
- Se `subscription` non presente nella invoice → SKIP

---

## 4. `invoice.upcoming`

**Trigger:** Stripe invia questo evento ~3 giorni prima del prossimo rinnovo (configurabile dalla dashboard).

| Livello | Azione |
|---------|--------|
| **DB** | Nessun aggiornamento (evento puramente informativo) |
| **Email** | `sendSubscriptionUpcomingRenewal` — reminder con importo, data rinnovo e CTA per gestire/cancellare prima del rinnovo |
| **Telegram** | `sendSubscriptionUpcomingRenewalNotification` — notifica admin con cliente, prodotto, importo e data rinnovo |

**Dati estratti dalla invoice:**
- `amount_due` → importo in centesimi, convertito in euro
- `next_payment_attempt` → timestamp della data di rinnovo, formattato in italiano

---

## File modificati

| File | Modifiche |
|------|-----------|
| `src/app/api/webhooks/stripe/route.ts` | +4 handler (`paused`, `resumed`, `payment_succeeded`, `upcoming`) con email + Telegram |
| `src/lib/email/subscription-templates.ts` | +3 template HTML: `createSubscriptionPausedHTML`, `createSubscriptionResumedHTML`, `createSubscriptionUpcomingRenewalHTML` |
| `src/lib/email/resend.ts` | +3 metodi: `sendSubscriptionPaused`, `sendSubscriptionResumed`, `sendSubscriptionUpcomingRenewal` + import aggiornati |
| `src/types/emailTemplate.ts` | +3 template keys in `SYSTEM_TEMPLATE_KEYS`, `TEMPLATE_VARIABLES`, `TEMPLATE_NAMES` |
| `src/lib/telegram/telegram.ts` | +3 metodi: `sendSubscriptionPausedNotification`, `sendSubscriptionResumedNotification`, `sendSubscriptionUpcomingRenewalNotification` |

---

## Template keys registrate per MongoDB

I nuovi template sono stati registrati nel sistema di template DB (`emailTemplate.ts`) con supporto per override da MongoDB:

| Template Key | Nome visualizzato | Variabili disponibili |
|-------------|-------------------|----------------------|
| `subscription_paused` | Abbonamento in Pausa | `logoUrl`, `customerName`, `productName`, `interval`, `portalLink` |
| `subscription_resumed` | Abbonamento Riattivato | `logoUrl`, `customerName`, `productName`, `interval`, `nextBillingDate`, `portalLink` |
| `subscription_upcoming_renewal` | Prossimo Rinnovo Abbonamento | `logoUrl`, `customerName`, `productName`, `interval`, `amount`, `nextBillingDate`, `portalLink` |

Come per gli altri template, funzionano con fallback: se il template esiste in MongoDB viene usato quello (personalizzabile da admin), altrimenti si usa il template HTML hardcoded.

---

## Configurazione Stripe Dashboard

Per attivare i nuovi eventi, andare in **Developers > Webhooks** e aggiungere:

- `customer.subscription.paused`
- `customer.subscription.resumed`
- `invoice.payment_succeeded`
- `invoice.upcoming`

Per `invoice.upcoming`, configurare i giorni di anticipo in:
**Settings > Billing > Subscriptions > Upcoming renewal events** (default: 3 giorni)

---

## Mappa completa degli eventi gestiti (dopo implementazione)

| Evento | DB | Email | Telegram | Note |
|--------|-----|-------|----------|------|
| `checkout.session.completed` (subscription) | Crea documento | Conferma | Nuovo abbonamento | Idempotenza |
| `customer.subscription.updated` | Status + period | Rinnovo (se active) | - | Tutti i cambi stato |
| `customer.subscription.deleted` | → `canceled` | Cancellazione | - | Definitiva |
| `customer.subscription.paused` | → `paused` | Pausa | Pausa | **NUOVO** |
| `customer.subscription.resumed` | → `active` + period | Riattivazione | Riattivazione | **NUOVO** |
| `invoice.payment_failed` | → `past_due` | Pagamento fallito | - | Aggiorna metodo pagamento |
| `invoice.payment_succeeded` | → `active` | - | - | **NUOVO** - Ripristino da past_due, no email (ridondante) |
| `invoice.upcoming` | - | Reminder rinnovo | Rinnovo imminente | **NUOVO** - Solo informativo |
