# Piano Implementazione: Flusso Separato (Subscription fuori dal Carrello)

## Panoramica

I prodotti in abbonamento hanno un flusso di checkout dedicato direttamente dalla pagina prodotto, senza passare dal carrello. Il carrello resta invariato per gli acquisti singoli (`mode: 'payment'`).

**Principio chiave**: Il carrello attuale non viene toccato. L'abbonamento viene gestito con un bottone "Abbonati" sulla pagina prodotto che porta direttamente a Stripe Checkout in `mode: 'subscription'`.

---

## Architettura del Flusso

```
FLUSSO 1 - Acquisto Singolo (INVARIATO):
/products/[slug] → Aggiungi al carrello → /cart → Stripe Checkout (mode: payment)

FLUSSO 2 - Abbonamento (NUOVO):
/products/[slug] → Seleziona intervallo → "Abbonati ora" → Stripe Checkout (mode: subscription)
                                                              │
                                                              ▼
                                                    /checkout/subscription-success
```

Due flussi completamente indipendenti, due tipi di checkout Stripe diversi.

---

## FASE 1: Modifica Schema MongoDB

### 1.1 Collection `products` - Nuovi campi

Identici al piano carrello misto:

```typescript
// In src/types/products.ts - ProductDocument
{
  // ... campi esistenti ...

  // NUOVI CAMPI SUBSCRIPTION
  subscriptionEnabled: boolean;           // default: false
  stripeRecurringPriceIds?: {
    month?: string;                       // price_xxx (mensile)
    bimonth?: string;                     // price_xxx (bimestrale)
    quarter?: string;                     // price_xxx (trimestrale)
  };
  subscriptionDiscount?: number;          // Sconto % per abbonati (es: 10)
  subscriptionIntervals?: string[];       // ['month', 'bimonth', 'quarter']
}
```

### 1.2 Nuova Collection `subscriptions`

```typescript
// src/types/subscription.ts
interface SubscriptionDocument {
  _id?: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  productId: string;              // Un solo prodotto per subscription
  productName: string;
  quantity: number;
  interval: string;               // 'month' | 'bimonth' | 'quarter'
  pricePerUnit: number;
  stripePriceId: string;
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
  shippingZone?: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    canceledAt?: Date;
  };
}
```

---

## FASE 2: Modifiche Frontend

### 2.1 CartContext - NESSUNA MODIFICA

Il CartContext resta esattamente com'e'. Il carrello gestisce solo acquisti singoli.

### 2.2 Pagina Dettaglio Prodotto

**File**: `src/components/singleProductPage/ProductInfoSection.tsx`

Aggiungere sotto il pulsante "Aggiungi al carrello" (solo se `subscriptionEnabled: true`):

```
┌──────────────────────────────────────────────────────┐
│  [  Aggiungi al Carrello  ]     ← pulsante esistente │
│                                                      │
│  ─── oppure ──────────────────────────────────────── │
│                                                      │
│  Abbonati e risparmia il 10%                         │
│                                                      │
│  Ricevi questo prodotto:                             │
│  ( ) Ogni mese        - 17,99 EUR/mese               │
│  (x) Ogni 2 mesi      - 17,99 EUR/ogni 2 mesi       │
│  ( ) Ogni 3 mesi      - 17,99 EUR/ogni 3 mesi       │
│                                                      │
│  Quantita': [ 1 ] [+] [-]                            │
│                                                      │
│  [  Abbonati Ora  ]                                  │
│                                                      │
│  Puoi cancellare in qualsiasi momento.               │
│  La spedizione e' inclusa nel prezzo.                │
└──────────────────────────────────────────────────────┘
```

**Nuovo componente**: `src/components/singleProductPage/SubscriptionSelector.tsx`

```typescript
interface SubscriptionSelectorProps {
  product: Product;
  onSubscribe: (interval: string, quantity: number) => void;
  loading: boolean;
}
```

### 2.3 Nuovo Hook: useSubscriptionCheckout

**File**: `src/hooks/useSubscriptionCheckout.ts`

```typescript
export function useSubscriptionCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSubscription = async (
    productId: string,
    interval: 'month' | 'bimonth' | 'quarter',
    quantity: number,
    shippingZone: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, interval, quantity, shippingZone }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Redirect a Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setLoading(false);
    }
  };

  return { startSubscription, loading, error };
}
```

### 2.4 Pagina Successo Abbonamento

**File**: `src/app/(shop)/checkout/subscription-success/page.tsx`

Pagina di conferma specifica per abbonamenti:
- "Grazie! Il tuo abbonamento e' attivo"
- Riepilogo: prodotto, intervallo, prezzo, prossima consegna
- Link al Customer Portal per gestire l'abbonamento
- Link per tornare allo shop

### 2.5 Pagina Carrello - NESSUNA MODIFICA

Il carrello resta invariato. Gestisce solo `mode: 'payment'`.

---

## FASE 3: Nuove API

### 3.1 Nuovo Endpoint: create-subscription-session

**File**: `src/app/api/create-subscription-session/route.ts`

```typescript
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface RequestBody {
  productId: string;
  interval: 'month' | 'bimonth' | 'quarter';
  quantity: number;
  shippingZone: string;
}

export async function POST(request: NextRequest) {
  try {
    const { productId, interval, quantity, shippingZone }: RequestBody = await request.json();

    // Validazioni
    if (!productId || !interval || !quantity) {
      throw new Error('Dati mancanti');
    }

    // Recupera prodotto da MongoDB
    const { db } = await connectToDatabase();
    const product = await db.collection('products').findOne({
      $or: [{ id: productId }, { stripeProductId: productId }],
      'metadata.isActive': true,
    });

    if (!product) throw new Error('Prodotto non trovato');
    if (!product.subscriptionEnabled) throw new Error('Abbonamento non disponibile per questo prodotto');

    // Recupera il Price ID ricorrente per l'intervallo selezionato
    const recurringPriceId = product.stripeRecurringPriceIds?.[interval];
    if (!recurringPriceId) {
      throw new Error(`Intervallo "${interval}" non disponibile per questo prodotto`);
    }

    // Crea la sessione di checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        price: recurringPriceId,
        quantity: quantity,
      }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug?.it || product.id}?subscription_canceled=true`,
      locale: 'it',
      shipping_address_collection: {
        allowed_countries: ['IT', 'AT', 'BE', 'FR', 'DE', 'ES', 'PT', 'NL', 'CH', 'GB'],
      },
      metadata: {
        type: 'subscription',
        product_id: product.id,
        interval: interval,
        shipping_zone: shippingZone,
      },
      // Configura subscription per periodi personalizzati
      subscription_data: {
        metadata: {
          product_id: product.id,
          product_name: product.translations?.it?.name || 'Prodotto',
          interval: interval,
          shipping_zone: shippingZone,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      interval,
      productName: product.translations?.it?.name,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore server';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

### 3.2 Webhook Stripe (espansione)

**File**: `src/app/api/webhooks/stripe/route.ts`

Aggiungere gestione eventi subscription allo switch esistente:

```typescript
switch (event.type) {

  // ESISTENTE - checkout completato (sia payment che subscription)
  case 'checkout.session.completed': {
    const session = event.data.object;

    if (session.mode === 'subscription') {
      // NUOVO: Gestisci subscription checkout
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      await SubscriptionService.createFromCheckout(subscription, session);

      // Invia notifiche
      await TelegramService.sendNewSubscriptionNotification(subscription, session);
      if (session.customer_details?.email) {
        await EmailService.sendSubscriptionConfirmation(subscription, session);
      }
    } else {
      // ESISTENTE: Gestisci payment checkout (codice attuale invariato)
      // ... tutto il codice esistente per checkout.session.completed ...
    }
    break;
  }

  // NUOVO - Pagamento ricorrente riuscito
  case 'invoice.payment_succeeded': {
    const invoice = event.data.object as Stripe.Invoice;

    // Ignora la prima fattura (gestita da checkout.session.completed)
    if (invoice.billing_reason === 'subscription_create') break;

    // Solo per rinnovi
    if (invoice.billing_reason === 'subscription_cycle' && invoice.subscription) {
      // Crea ordine ricorrente
      const orderId = await OrderService.createRecurringOrder(invoice);

      // Aggiorna subscription con nuovo periodo
      await SubscriptionService.updatePeriod(
        invoice.subscription as string,
        new Date((invoice.lines.data[0]?.period?.start || 0) * 1000),
        new Date((invoice.lines.data[0]?.period?.end || 0) * 1000)
      );

      // Notifiche
      await TelegramService.sendRecurringPaymentNotification(invoice, orderId);
      if (invoice.customer_email) {
        await EmailService.sendRecurringOrderConfirmation(invoice, orderId);
      }
    }
    break;
  }

  // NUOVO - Subscription aggiornata (cambio piano, pausa, etc.)
  case 'customer.subscription.updated': {
    const subscription = event.data.object as Stripe.Subscription;
    await SubscriptionService.updateStatus(
      subscription.id,
      subscription.status,
      subscription.cancel_at_period_end
    );
    break;
  }

  // NUOVO - Subscription cancellata definitivamente
  case 'customer.subscription.deleted': {
    const subscription = event.data.object as Stripe.Subscription;
    await SubscriptionService.markCanceled(subscription.id);

    // Notifica admin
    await TelegramService.sendSubscriptionCanceledNotification(subscription);
    break;
  }

  // NUOVO - Pagamento ricorrente fallito
  case 'invoice.payment_failed': {
    const invoice = event.data.object as Stripe.Invoice;
    if (invoice.subscription) {
      await SubscriptionService.markPaymentFailed(invoice.subscription as string);

      if (invoice.customer_email) {
        await EmailService.sendPaymentFailedNotification(invoice);
      }
    }
    break;
  }
}
```

### 3.3 Endpoint Customer Portal

**File**: `src/app/api/create-portal-session/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { email } = await request.json();

  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) {
    return NextResponse.json({ error: 'Nessun abbonamento trovato' }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/products`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

### 3.4 SubscriptionService

**File**: `src/services/subscriptionService.ts`

```typescript
export class SubscriptionService {

  // Crea subscription da checkout completato
  static async createFromCheckout(
    subscription: Stripe.Subscription,
    session: Stripe.Checkout.Session
  ): Promise<string> { ... }

  // Aggiorna stato
  static async updateStatus(
    subscriptionId: string,
    status: string,
    cancelAtPeriodEnd: boolean
  ): Promise<void> { ... }

  // Aggiorna periodo corrente
  static async updatePeriod(
    subscriptionId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> { ... }

  // Segna come cancellata
  static async markCanceled(subscriptionId: string): Promise<void> { ... }

  // Segna pagamento fallito
  static async markPaymentFailed(subscriptionId: string): Promise<void> { ... }

  // Lista tutte le subscription (per admin)
  static async listAll(page: number, limit: number): Promise<...> { ... }

  // Cerca per email cliente
  static async findByEmail(email: string): Promise<...> { ... }

  // Verifica se esiste gia' (idempotenza)
  static async exists(subscriptionId: string): Promise<boolean> { ... }
}
```

---

## FASE 4: Admin Panel

### 4.1 Form Prodotto (Create/Edit)

**File**: `src/app/admin/products/create/page.tsx` e `edit/page.tsx`

Stessa sezione del piano carrello misto:

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
└──────────────────────────────────────────────────────┘
```

### 4.2 Nuova pagina Admin: Gestione Abbonamenti

**File**: `src/app/admin/subscriptions/page.tsx`

Tabella con:
- Cliente (nome, email, telefono)
- Prodotto abbonato
- Quantita'
- Intervallo (mensile/bimestrale/trimestrale)
- Stato (attivo, cancellato, pagamento fallito)
- Prossimo rinnovo
- Totale per periodo
- Azioni: visualizza su Stripe

---

## FASE 5: Gestione Spedizione per Abbonamenti

### Opzione A: Spedizione inclusa nel prezzo ricorrente (CONSIGLIATA)

Il prezzo del Price ricorrente su Stripe include gia' la spedizione.
Esempio: Olio 19.99 EUR + spedizione 5.90 EUR = Price ricorrente a 25.89 EUR/mese.

Pro: Semplice, nessuna logica aggiuntiva.
Contro: Il prezzo mostrato e' piu' alto del prezzo singolo.

### Opzione B: Spedizione come line item separato

Creare un Price ricorrente per la spedizione e aggiungerlo come secondo line item.
Pro: Piu' trasparente per l'utente.
Contro: Serve un Price per ogni combinazione zona/peso.

### Opzione C: Spedizione gratuita per abbonati

Offrire la spedizione gratuita come incentivo per l'abbonamento.
Pro: Forte incentivo all'abbonamento, semplice da implementare.
Contro: Margini ridotti.

---

## FASE 6: Configurazione Stripe Dashboard

### 6.1 Creare Price ricorrenti

Per ogni prodotto con abbonamento:
1. Stripe Dashboard > Products > seleziona prodotto
2. "Add a price" > Recurring
3. Set interval (Monthly / Every 2 months / Every 3 months)
4. Set prezzo (con eventuale sconto rispetto al one-time)
5. Copia `price_xxx` nell'admin del sito

### 6.2 Configurare Customer Portal

Stripe Dashboard > Settings > Customer Portal:
- [x] Cancella abbonamento
- [x] Cambia metodo di pagamento
- [x] Visualizza storico fatture
- Personalizza brand/colori

### 6.3 Aggiungere eventi Webhook

Stripe Dashboard > Developers > Webhooks > aggiungi eventi:
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

(Nota: `checkout.session.completed` e' gia' configurato)

---

## File da Modificare/Creare (Riepilogo)

### File da MODIFICARE:
| File | Modifica |
|------|----------|
| `src/types/products.ts` | Aggiungere campi subscription al ProductDocument |
| `src/app/api/webhooks/stripe/route.ts` | Aggiungere gestione eventi subscription |
| `src/app/admin/products/create/page.tsx` | Sezione abbonamento nel form |
| `src/app/admin/products/[id]/edit/page.tsx` | Sezione abbonamento nel form |
| `src/app/api/admin/products/route.ts` | Salvare nuovi campi subscription |
| `src/components/singleProductPage/ProductInfoSection.tsx` | Aggiungere SubscriptionSelector |

### File da CREARE:
| File | Descrizione |
|------|-------------|
| `src/types/subscription.ts` | Tipi TypeScript per subscriptions |
| `src/services/subscriptionService.ts` | CRUD subscriptions su MongoDB |
| `src/hooks/useSubscriptionCheckout.ts` | Hook per avviare checkout subscription |
| `src/app/api/create-subscription-session/route.ts` | Endpoint creazione sessione subscription |
| `src/app/api/create-portal-session/route.ts` | Endpoint Customer Portal Stripe |
| `src/app/(shop)/checkout/subscription-success/page.tsx` | Pagina conferma abbonamento |
| `src/app/admin/subscriptions/page.tsx` | Admin: lista abbonamenti |
| `src/components/singleProductPage/SubscriptionSelector.tsx` | UI selezione intervallo |

### File NON TOCCATI (rispetto al piano carrello misto):
| File | Motivo |
|------|--------|
| `src/contexts/CartContext.tsx` | Il carrello non cambia |
| `src/hooks/useCheckout.ts` | Il checkout singolo non cambia |
| `src/hooks/useCheckoutHandler.ts` | Non cambia |
| `src/app/api/create-checkout-session/route.ts` | Non cambia |
| `src/app/(shop)/cart/page.tsx` | Non cambia |
| `src/components/cartPage/*` | Nessun componente del carrello cambia |

---

## Confronto con Piano Carrello Misto

| Aspetto | Carrello Misto | Flusso Separato |
|---------|---------------|-----------------|
| File da modificare | ~15 | ~6 |
| File da creare | ~6 | ~8 |
| Complessita' CartContext | Alta (nuovo tipo) | Nessuna |
| Complessita' Checkout API | Alta (branching) | Bassa (endpoint separato) |
| Complessita' Webhook | Alta | Media (stessa) |
| Spedizione | Complessa (no shipping_options in subscription) | Semplice (inclusa nel prezzo o gratuita) |
| UX utente | Un solo carrello per tutto | Due flussi da imparare |
| Rischio regressione | Alto (tocca codice esistente) | Basso (codice esistente invariato) |
| Carrello misto possibile | Si | No |
| Tempo implementazione | Lungo | Medio |

---

## Ordine di Implementazione Consigliato

1. Schema MongoDB + tipi TypeScript (FASE 1)
2. Admin: form prodotto con campi subscription (FASE 4.1)
3. Configurazione Stripe Dashboard: Price ricorrenti + webhook events (FASE 6)
4. API create-subscription-session (FASE 3.1)
5. Frontend: SubscriptionSelector nel dettaglio prodotto (FASE 2.2)
6. Hook useSubscriptionCheckout (FASE 2.3)
7. Pagina subscription-success (FASE 2.4)
8. Webhook espanso (FASE 3.2)
9. SubscriptionService (FASE 3.4)
10. Customer Portal endpoint (FASE 3.3)
11. Admin: pagina gestione abbonamenti (FASE 4.2)

---

## Stima Complessita'

- **Media**: Richiede modifiche a ~6 file e creazione di ~8 nuovi file
- **Rischio basso**: Il codice esistente (carrello, checkout payment) non viene toccato
- **Testing**: Principalmente sui nuovi endpoint e webhook, zero rischio regressione sul flusso attuale
- **Consigliato**: Questo approccio e' piu' sicuro e veloce da implementare
