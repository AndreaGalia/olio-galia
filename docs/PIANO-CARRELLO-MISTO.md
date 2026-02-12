# Piano Implementazione: Carrello Misto (One-Time + Subscriptions)

## Panoramica

Un singolo carrello che gestisce sia acquisti singoli che abbonamenti ricorrenti nella stessa sessione di checkout Stripe.

**Principio chiave**: Stripe Checkout con `mode: 'subscription'` supporta `add_invoice_items` per addebitare prodotti one-time nella prima fattura dell'abbonamento.

---

## Architettura del Flusso

```
Utente aggiunge prodotti al carrello (singoli + ricorrenti)
    │
    ▼
/cart - CheckoutWizard (modificato)
    │
    ├── Se TUTTI one-time → mode: 'payment' (flusso attuale, invariato)
    ├── Se TUTTI subscription → mode: 'subscription'
    └── Se MISTO → mode: 'subscription' + add_invoice_items per i one-time
    │
    ▼
Stripe Checkout (hosted page)
    │
    ▼
Webhook gestisce:
    ├── checkout.session.completed (sempre)
    ├── invoice.payment_succeeded (pagamenti ricorrenti successivi)
    ├── customer.subscription.updated
    └── customer.subscription.deleted
```

---

## FASE 1: Modifica Schema MongoDB

### 1.1 Collection `products` - Nuovi campi

Aggiungere i seguenti campi al documento prodotto:

```typescript
// In src/types/products.ts - ProductDocument
{
  // ... campi esistenti ...

  // NUOVI CAMPI SUBSCRIPTION
  subscriptionEnabled: boolean;           // default: false
  stripeRecurringPriceIds?: {             // Price ID ricorrenti per ogni intervallo
    month?: string;                       // price_xxx (mensile)
    bimonth?: string;                     // price_xxx (bimestrale)
    quarter?: string;                     // price_xxx (trimestrale)
  };
  subscriptionDiscount?: number;          // Sconto % per chi si abbona (es: 10 = 10%)
  subscriptionIntervals?: string[];       // Intervalli disponibili: ['month', 'bimonth', 'quarter']
}
```

### 1.2 Nuova Collection `subscriptions`

```typescript
// src/types/subscription.ts
interface SubscriptionDocument {
  _id?: string;
  stripeSubscriptionId: string;        // sub_xxx
  stripeCustomerId: string;            // cus_xxx
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  items: {
    productId: string;                 // ID prodotto MongoDB
    productName: string;
    quantity: number;
    interval: string;                  // 'month' | 'bimonth' | 'quarter'
    pricePerUnit: number;              // Prezzo unitario in EUR
    stripePriceId: string;             // price_xxx ricorrente
  }[];
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  shippingAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    canceledAt?: Date;
    shippingZone?: string;
  };
}
```

---

## FASE 2: Modifiche Frontend

### 2.1 CartContext - Nuovo tipo CartItem

**File**: `src/contexts/CartContext.tsx`

```typescript
// PRIMA (attuale)
interface CartItem {
  id: string;
  quantity: number;
}

// DOPO
interface CartItem {
  id: string;
  quantity: number;
  purchaseType: 'one_time' | 'subscription';   // default: 'one_time'
  subscriptionInterval?: 'month' | 'bimonth' | 'quarter';
}
```

Modifiche necessarie:
- `addToCart()`: accetta `purchaseType` e `subscriptionInterval` come parametri opzionali
- `updatePurchaseType()`: nuova funzione per cambiare tipo acquisto di un item
- `hasSubscriptions()`: helper che ritorna `true` se almeno un item e' subscription
- `hasOneTimeItems()`: helper che ritorna `true` se almeno un item e' one-time
- `getCartMode()`: ritorna `'payment' | 'subscription' | 'mixed'`
- La serializzazione su localStorage deve includere i nuovi campi

### 2.2 Pagina Dettaglio Prodotto

**File**: `src/app/(shop)/products/[slug]/page.tsx` e `src/components/singleProductPage/ProductInfoSection.tsx`

Aggiungere un selettore sotto il pulsante "Aggiungi al carrello":

```
[ Acquisto Singolo ]  [ Abbonati e Risparmia -10% ]
                      ├── Ogni mese
                      ├── Ogni 2 mesi
                      └── Ogni 3 mesi
```

Il selettore appare SOLO se il prodotto ha `subscriptionEnabled: true`.

### 2.3 Pagina Carrello

**File**: `src/app/(shop)/cart/page.tsx` e componenti in `src/components/cartPage/`

Per ogni item nel carrello, mostrare:
- Badge "Abbonamento mensile" o "Acquisto singolo"
- Possibilita' di cambiare tipo (toggle)
- Se subscription: mostrare l'intervallo selezionato con dropdown per cambiarlo
- Banner informativo in cima se il carrello e' misto:
  "Il tuo carrello contiene sia acquisti singoli che abbonamenti. Gli acquisti singoli verranno addebitati solo nella prima fattura."

### 2.4 CheckoutWizard

**File**: `src/components/cartPage/CheckoutWizard.tsx`

Aggiungere step di riepilogo che mostra chiaramente:
- Sezione "Acquisti singoli" con totale
- Sezione "Abbonamenti" con totale mensile/periodo
- Totale prima fattura (singoli + primo periodo abbonamento)

### 2.5 Hook useCheckout

**File**: `src/hooks/useCheckout.ts`

```typescript
// PRIMA
startCheckout(items, needsInvoice, shippingZone)

// DOPO
startCheckout(items, needsInvoice, shippingZone)
// items ora contiene purchaseType e subscriptionInterval per ogni item
```

Il body della request a `/api/create-checkout-session` diventa:

```typescript
{
  items: [
    { id: "prod_xxx", quantity: 2, purchaseType: "one_time" },
    { id: "prod_yyy", quantity: 1, purchaseType: "subscription", subscriptionInterval: "month" }
  ],
  needsInvoice: false,
  shippingZone: "italia"
}
```

---

## FASE 3: Modifiche API

### 3.1 create-checkout-session (modifica principale)

**File**: `src/app/api/create-checkout-session/route.ts`

```typescript
interface CartItem {
  id: string;
  quantity: number;
  purchaseType: 'one_time' | 'subscription';
  subscriptionInterval?: 'month' | 'bimonth' | 'quarter';
}

export async function POST(request: NextRequest) {
  const { items, needsInvoice, shippingZone } = await request.json();

  const subscriptionItems = items.filter(i => i.purchaseType === 'subscription');
  const oneTimeItems = items.filter(i => i.purchaseType === 'one_time');

  const hasSubscriptions = subscriptionItems.length > 0;
  const hasOneTime = oneTimeItems.length > 0;

  if (hasSubscriptions) {
    // ========== MODE: SUBSCRIPTION (o MISTO) ==========

    // 1. Line items = solo prodotti ricorrenti
    const lineItems = subscriptionItems.map(item => {
      const product = findProduct(item.id);
      const recurringPriceId = product.stripeRecurringPriceIds[item.subscriptionInterval];
      return {
        price: recurringPriceId,
        quantity: item.quantity,
      };
    });

    // 2. Add invoice items = prodotti singoli (addebitati solo prima fattura)
    const addInvoiceItems = hasOneTime
      ? oneTimeItems.map(item => ({
          price: item.stripePriceId,  // price one-time
          quantity: item.quantity,
        }))
      : undefined;

    // 3. Spedizione come invoice item (non supporta shipping_options)
    //    Calcola il costo e crea un Price ad-hoc o usa uno pre-creato
    const shippingCost = await calculateShippingForSubscription(items, shippingZone);
    if (shippingCost > 0 && addInvoiceItems) {
      addInvoiceItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Spedizione' },
          unit_amount: shippingCost,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: lineItems,
      ...(addInvoiceItems && { add_invoice_items: addInvoiceItems }),
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart?payment_canceled=true`,
      locale: 'it',
      shipping_address_collection: { allowed_countries: COUNTRIES.ALL },
      metadata: {
        shipping_zone: shippingZone,
        cart_type: hasOneTime ? 'mixed' : 'subscription_only',
        one_time_items: JSON.stringify(oneTimeItems.map(i => i.id)),
      },
      ...(needsInvoice ? createInvoiceConfig(true) : {}),
    });

    return NextResponse.json({ sessionId: session.id });

  } else {
    // ========== MODE: PAYMENT (flusso attuale invariato) ==========
    // ... codice esistente senza modifiche ...
  }
}
```

### 3.2 Webhook Stripe (espansione)

**File**: `src/app/api/webhooks/stripe/route.ts`

Aggiungere gestione dei nuovi eventi:

```typescript
export async function POST(request: NextRequest) {
  // ... verifica firma webhook (invariata) ...

  switch (event.type) {

    // ESISTENTE - invariato
    case 'checkout.session.completed': {
      const session = event.data.object;

      // Salva ordine come adesso
      await OrderService.createOrder(orderDetails);

      // NUOVO: Se la sessione ha una subscription, salvala
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await SubscriptionService.createSubscription(subscription, session);
      }
      break;
    }

    // NUOVO - Pagamento ricorrente riuscito (ogni mese/periodo)
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;

      // Ignora la prima fattura (gia' gestita da checkout.session.completed)
      if (invoice.billing_reason === 'subscription_create') break;

      // Salva come nuovo ordine ricorrente
      if (invoice.subscription) {
        await OrderService.createRecurringOrder(invoice);
        // Invia email conferma pagamento ricorrente
        await EmailService.sendRecurringPaymentConfirmation(invoice);
        // Notifica Telegram
        await TelegramService.sendRecurringPaymentNotification(invoice);
      }
      break;
    }

    // NUOVO - Subscription aggiornata
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      await SubscriptionService.updateSubscription(subscription);
      break;
    }

    // NUOVO - Subscription cancellata
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await SubscriptionService.cancelSubscription(subscription.id);
      break;
    }

    // NUOVO - Pagamento fallito
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await SubscriptionService.markPaymentFailed(invoice.subscription);
        await EmailService.sendPaymentFailedNotification(invoice);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### 3.3 Nuovo Service: SubscriptionService

**File**: `src/services/subscriptionService.ts`

```typescript
class SubscriptionService {
  static async createSubscription(stripeSubscription, checkoutSession) { ... }
  static async updateSubscription(stripeSubscription) { ... }
  static async cancelSubscription(subscriptionId: string) { ... }
  static async getByCustomerEmail(email: string) { ... }
  static async markPaymentFailed(subscriptionId: string) { ... }
  static async getActiveSubscriptions() { ... }  // Per admin
}
```

---

## FASE 4: Admin Panel

### 4.1 Form Prodotto (Create/Edit)

**File**: `src/app/admin/products/create/page.tsx` e `src/app/admin/products/[id]/edit/page.tsx`

Aggiungere sezione "Abbonamento Ricorrente":

```
┌──────────────────────────────────────────────────────┐
│ Abbonamento Ricorrente                               │
│                                                      │
│ [x] Abilita acquisto ricorrente                      │
│                                                      │
│ Intervalli disponibili:                              │
│ [x] Mensile    - Stripe Price ID: [price_xxx      ]  │
│ [x] Bimestrale - Stripe Price ID: [price_yyy      ]  │
│ [ ] Trimestrale                                      │
│                                                      │
│ Sconto abbonamento: [ 10 ] %                         │
│                                                      │
│ Nota: Devi creare i Price ricorrenti su Stripe       │
│ Dashboard prima di inserire gli ID qui.              │
└──────────────────────────────────────────────────────┘
```

### 4.2 Nuova pagina Admin: Gestione Abbonamenti

**File**: `src/app/admin/subscriptions/page.tsx`

Tabella con:
- Cliente (nome, email)
- Prodotti in abbonamento
- Intervallo
- Stato (attivo, in pausa, cancellato)
- Prossimo pagamento
- Azioni (visualizza su Stripe, cancella)

---

## FASE 5: Customer Portal (Gestione Abbonamenti Utente)

### 5.1 Stripe Customer Portal

Stripe offre un portale hosted dove il cliente puo' gestire i propri abbonamenti.

```typescript
// Nuovo endpoint: src/app/api/create-portal-session/route.ts
export async function POST(request: NextRequest) {
  const { customerEmail } = await request.json();

  // Trova il customer Stripe tramite email
  const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
  if (customers.data.length === 0) throw new Error('Customer not found');

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

### 5.2 Link "Gestisci Abbonamenti" nel sito

Aggiungere un link nel footer o nella pagina di conferma ordine che porta al Customer Portal di Stripe.

---

## FASE 6: Configurazione Stripe Dashboard

### 6.1 Creare i Price ricorrenti

Per ogni prodotto che supporta abbonamento, creare su Stripe Dashboard:
1. Andare su Products > selezionare il prodotto
2. "Add a price" > Recurring
3. Impostare l'intervallo (monthly, every 2 months, every 3 months)
4. Copiare il `price_xxx` nel campo corrispondente nell'admin del sito

### 6.2 Configurare il Customer Portal

Su Stripe Dashboard > Settings > Customer Portal:
- Abilitare cancellazione abbonamento
- Abilitare cambio metodo di pagamento
- Personalizzare look & feel

### 6.3 Aggiungere eventi Webhook

Su Stripe Dashboard > Developers > Webhooks:
Aggiungere gli eventi:
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## File da Modificare/Creare (Riepilogo)

### File da MODIFICARE:
| File | Modifica |
|------|----------|
| `src/types/products.ts` | Aggiungere campi subscription al ProductDocument |
| `src/contexts/CartContext.tsx` | Nuovo tipo CartItem con purchaseType/interval |
| `src/hooks/useCheckout.ts` | Passare purchaseType nella request |
| `src/hooks/useCheckoutHandler.ts` | Nessuna modifica sostanziale |
| `src/app/api/create-checkout-session/route.ts` | Logica branching payment/subscription/misto |
| `src/app/api/webhooks/stripe/route.ts` | Gestire 4 nuovi eventi |
| `src/app/admin/products/create/page.tsx` | Sezione abbonamento nel form |
| `src/app/admin/products/[id]/edit/page.tsx` | Sezione abbonamento nel form |
| `src/app/api/admin/products/route.ts` | Salvare nuovi campi subscription |
| `src/components/singleProductPage/ProductInfoSection.tsx` | Toggle acquisto/abbonamento |
| `src/components/cartPage/CheckoutWizard.tsx` | Riepilogo misto |

### File da CREARE:
| File | Descrizione |
|------|-------------|
| `src/types/subscription.ts` | Tipi TypeScript per subscriptions |
| `src/services/subscriptionService.ts` | CRUD subscriptions su MongoDB |
| `src/app/admin/subscriptions/page.tsx` | Pagina admin gestione abbonamenti |
| `src/app/api/create-portal-session/route.ts` | Endpoint per Customer Portal Stripe |
| `src/components/cartPage/SubscriptionBadge.tsx` | Badge "Abbonamento" nel carrello |
| `src/components/singleProductPage/SubscriptionSelector.tsx` | Selettore intervallo abbonamento |

---

## Limitazioni e Rischi

1. **Spedizione**: `mode: 'subscription'` non supporta `shipping_options`. La spedizione va gestita come line item aggiuntivo o inclusa nel prezzo
2. **Complessita' webhook**: Da 1 evento gestito si passa a 5. Servono test accurati
3. **Carrello misto complesso**: L'utente potrebbe confondersi se non e' chiara la distinzione tra addebito una tantum e ricorrente
4. **Stripe Price da creare manualmente**: Per ogni prodotto + ogni intervallo serve un Price su Stripe Dashboard
5. **Fatturazione**: La gestione fattura con `mode: 'subscription'` e' diversa da `mode: 'payment'`
6. **Stock management**: I prodotti ricorrenti devono avere stock "infinito" o gestione stock separata

---

## Ordine di Implementazione Consigliato

1. Schema MongoDB + tipi TypeScript (FASE 1)
2. Admin: form prodotto con campi subscription (FASE 4.1)
3. API create-checkout-session con branching (FASE 3.1)
4. Frontend: selettore subscription nel dettaglio prodotto (FASE 2.2)
5. Frontend: CartContext aggiornato (FASE 2.1)
6. Frontend: carrello con badge e riepilogo misto (FASE 2.3, 2.4)
7. Webhook espanso (FASE 3.2)
8. SubscriptionService (FASE 3.3)
9. Admin: pagina gestione abbonamenti (FASE 4.2)
10. Customer Portal (FASE 5)
11. Configurazione Stripe Dashboard (FASE 6)

---

## Stima Complessita'

- **Alta**: Richiede modifiche a ~15 file e creazione di ~6 nuovi file
- **Rischio medio-alto**: La gestione del carrello misto introduce edge case complessi
- **Testing necessario**: Webhook con eventi multipli, carrello misto, spedizione senza shipping_options
