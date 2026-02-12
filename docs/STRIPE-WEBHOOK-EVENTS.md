# Gestione Eventi Stripe Webhook - Abbonamenti

## Stato Attuale

### Eventi GIA gestiti in `src/app/api/webhooks/stripe/route.ts`

| Evento | Azione DB | Email | Note |
|--------|-----------|-------|------|
| `checkout.session.completed` (mode=subscription) | Crea `SubscriptionDocument` in MongoDB | `sendSubscriptionConfirmation` + Telegram | Idempotenza con `subscriptionExists()` |
| `customer.subscription.updated` | `updateSubscriptionStatus()` con `currentPeriodStart/End` | `sendSubscriptionRenewal` (se active) | Gestisce tutti i cambi di stato |
| `customer.subscription.deleted` | Status → `canceled`, salva `canceledAt` | `sendSubscriptionCanceled` | Cancellazione definitiva |
| `invoice.payment_failed` | Status → `past_due` | `sendSubscriptionPaymentFailed` | Invita ad aggiornare metodo di pagamento |

---

## Eventi DA Implementare

### 1. `customer.subscription.paused`

**Quando scatta:** L'abbonamento viene messo in pausa (dal portale Stripe o via API).

**Azioni da implementare:**

#### a) Aggiornamento DB
```typescript
// Nel webhook handler
if (event.type === 'customer.subscription.paused') {
  const subscription = event.data.object as Stripe.Subscription;
  console.log(`⏸️ Subscription paused: ${subscription.id}`);
  await SubscriptionService.updateSubscriptionStatus(subscription.id, 'paused');
}
```

#### b) Email al cliente
Creare `createSubscriptionPausedHTML` in `src/lib/email/subscription-templates.ts`:
- **Subject:** "Abbonamento in pausa"
- **Contenuto:** Informare che l'abbonamento e in pausa, nessun addebito fino alla riattivazione
- **CTA:** Link al portale per riattivare

#### c) Metodo EmailService
Aggiungere in `src/lib/email/resend.ts`:
```typescript
static async sendSubscriptionPaused(data: SubscriptionEmailData): Promise<boolean>
```

#### d) Notifica Telegram (opzionale)
Aggiungere notifica admin in `TelegramService`.

---

### 2. `customer.subscription.resumed`

**Quando scatta:** L'abbonamento viene riattivato dopo una pausa.

**Azioni da implementare:**

#### a) Aggiornamento DB
```typescript
if (event.type === 'customer.subscription.resumed') {
  const subscription = event.data.object as Stripe.Subscription;
  console.log(`▶️ Subscription resumed: ${subscription.id}`);

  const periodStart = new Date((subscription as any).current_period_start * 1000);
  const periodEnd = new Date((subscription as any).current_period_end * 1000);

  await SubscriptionService.updateSubscriptionStatus(subscription.id, 'active', {
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
  });
}
```

#### b) Email al cliente
Creare `createSubscriptionResumedHTML` in `src/lib/email/subscription-templates.ts`:
- **Subject:** "Abbonamento riattivato"
- **Contenuto:** Conferma riattivazione, prossima data di rinnovo
- **CTA:** Link al portale gestione

#### c) Metodo EmailService
```typescript
static async sendSubscriptionResumed(data: SubscriptionEmailData): Promise<boolean>
```

---

### 3. `invoice.payment_succeeded`

**Quando scatta:** Un pagamento ricorrente va a buon fine (ogni rinnovo).

**Nota importante:** Questo evento e diverso da `customer.subscription.updated`. L'`updated` cambia lo stato, mentre `invoice.payment_succeeded` conferma il pagamento effettivo.

**Azioni da implementare:**

#### a) Estrazione dati dalla invoice
```typescript
if (event.type === 'invoice.payment_succeeded') {
  const invoice = event.data.object as Stripe.Invoice;

  // Ignora la prima invoice (gia gestita da checkout.session.completed)
  if (invoice.billing_reason === 'subscription_create') {
    return NextResponse.json({ received: true });
  }

  const subId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : (invoice.subscription as Stripe.Subscription)?.id;

  if (!subId) return NextResponse.json({ received: true });

  console.log(`💰 Invoice payment succeeded for subscription: ${subId}`);

  // Se era past_due, ripristina ad active
  await SubscriptionService.updateSubscriptionStatus(subId, 'active');
}
```

#### b) Email al cliente (opzionale - ricevuta pagamento)
Creare `createSubscriptionPaymentSucceededHTML`:
- **Subject:** "Pagamento abbonamento confermato"
- **Contenuto:** Conferma pagamento, importo, prossimo rinnovo
- **Nota:** Valutare se inviare questa email o se basta la renewal email gia presente. Potrebbe essere ridondante con `customer.subscription.updated` che gia invia `sendSubscriptionRenewal`.

#### c) Logica consigliata
- Se `billing_reason === 'subscription_create'` → **SKIP** (gia gestito da checkout)
- Se `billing_reason === 'subscription_cycle'` → Rinnovo normale, conferma pagamento
- Se `billing_reason === 'subscription_update'` → Aggiornamento piano

---

### 4. `invoice.upcoming`

**Quando scatta:** Stripe invia questo evento ~3 giorni prima del prossimo rinnovo (configurabile nella dashboard Stripe).

**Azioni da implementare:**

#### a) Nessun aggiornamento DB necessario
Questo evento e puramente informativo, non richiede modifiche allo stato.

#### b) Email al cliente (reminder)
Creare `createSubscriptionUpcomingRenewalHTML` in `src/lib/email/subscription-templates.ts`:
- **Subject:** "Prossimo rinnovo abbonamento"
- **Contenuto:** Avviso che il rinnovo avverra tra X giorni, importo, link per gestire
- **CTA:** Link al portale per modificare o cancellare prima del rinnovo

```typescript
if (event.type === 'invoice.upcoming') {
  const invoice = event.data.object as Stripe.Invoice;

  const subId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : (invoice.subscription as Stripe.Subscription)?.id;

  if (!subId) return NextResponse.json({ received: true });

  console.log(`📅 Upcoming invoice for subscription: ${subId}`);

  const dbSub = await SubscriptionService.findByStripeSubscriptionId(subId);
  if (dbSub) {
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const portalLink = `${baseUrl}/manage-subscription/access?token=${dbSub.portalAccessToken}`;

    const amount = invoice.amount_due ? (invoice.amount_due / 100).toFixed(2) : undefined;

    const emailData: SubscriptionEmailData = {
      customerName: dbSub.customerName,
      customerEmail: dbSub.customerEmail,
      productName: dbSub.productName,
      interval: dbSub.interval,
      shippingZone: dbSub.shippingZone,
      portalLink,
      amount,
    };

    await EmailService.sendSubscriptionUpcomingRenewal(emailData);
  }
}
```

#### c) Metodo EmailService
```typescript
static async sendSubscriptionUpcomingRenewal(data: SubscriptionEmailData): Promise<boolean>
```

---

## Riepilogo Modifiche Necessarie

### File da modificare

| File | Modifiche |
|------|-----------|
| `src/app/api/webhooks/stripe/route.ts` | Aggiungere 4 nuovi handler per gli eventi |
| `src/lib/email/subscription-templates.ts` | Aggiungere 3-4 nuovi template HTML |
| `src/lib/email/resend.ts` | Aggiungere 3-4 nuovi metodi di invio |
| `src/types/emailTemplate.ts` | Aggiungere nuovi template enum (se necessario) |

### Nuovi template email

| Template | Evento | Priorita |
|----------|--------|----------|
| `createSubscriptionPausedHTML` | `customer.subscription.paused` | Alta |
| `createSubscriptionResumedHTML` | `customer.subscription.resumed` | Alta |
| `createSubscriptionPaymentSucceededHTML` | `invoice.payment_succeeded` | Media (valutare se ridondante) |
| `createSubscriptionUpcomingRenewalHTML` | `invoice.upcoming` | Alta |

### Configurazione Stripe Dashboard

Verificare che nella sezione **Developers > Webhooks** siano attivi questi eventi:
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `invoice.payment_succeeded`
- `invoice.upcoming`

Per `invoice.upcoming`, configurare anche il numero di giorni di anticipo in:
**Settings > Billing > Subscriptions > Upcoming renewal events** (default: 3 giorni)

---

## Eventi NON gestiti (per scelta)

| Evento | Motivo |
|--------|--------|
| `customer.subscription.trial_will_end` | Non usiamo trial periods |
| `customer.subscription.pending_update_applied` | Non necessario per il nostro flusso |
