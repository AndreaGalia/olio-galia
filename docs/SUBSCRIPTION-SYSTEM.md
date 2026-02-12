# Sistema Abbonamenti - OLIO GALIA

Documentazione completa del flusso di gestione degli abbonamenti.

---

## Indice

1. [Panoramica Architettura](#1-panoramica-architettura)
2. [Strutture Dati](#2-strutture-dati)
3. [Setup Prodotto (Admin)](#3-setup-prodotto-admin)
4. [Flusso Utente: Sottoscrizione](#4-flusso-utente-sottoscrizione)
5. [Creazione Sessione Checkout](#5-creazione-sessione-checkout)
6. [Webhook Stripe](#6-webhook-stripe)
7. [Service Layer (MongoDB)](#7-service-layer-mongodb)
8. [Sistema Email](#8-sistema-email)
9. [Notifiche Telegram](#9-notifiche-telegram)
10. [Accesso al Portale di Gestione](#10-accesso-al-portale-di-gestione)
11. [Pagina Successo](#11-pagina-successo)
12. [Admin Dashboard Abbonamenti](#12-admin-dashboard-abbonamenti)
13. [Traduzioni](#13-traduzioni)
14. [Diagramma Flusso Completo](#14-diagramma-flusso-completo)

---

## 1. Panoramica Architettura

Il sistema abbonamenti si basa su **Stripe Subscriptions** con gestione lato server tramite webhook. Ogni prodotto puo' avere una matrice di prezzi ricorrenti (zona x frequenza), creati su Stripe Dashboard e referenziati nel database MongoDB.

### File Coinvolti

| Categoria | File | Ruolo |
|-----------|------|-------|
| **Tipi** | `src/types/subscription.ts` | Tipi TypeScript, interfacce, costanti |
| **Tipi** | `src/types/emailTemplate.ts` | Template keys per email subscription |
| **Service** | `src/services/subscriptionService.ts` | CRUD MongoDB, token management |
| **Webhook** | `src/app/api/webhooks/stripe/route.ts` | Gestione eventi Stripe |
| **API** | `src/app/api/create-subscription-session/route.ts` | Crea sessione checkout Stripe |
| **API** | `src/app/api/create-portal-session/route.ts` | Invia magic link per accesso portale |
| **API** | `src/app/api/portal-access/route.ts` | Verifica token e crea sessione portale |
| **API** | `src/app/api/admin/subscriptions/route.ts` | API admin per lista/statistiche |
| **API** | `src/app/api/admin/products/route.ts` | Creazione prodotto con prezzi ricorrenti |
| **API** | `src/app/api/admin/products/[id]/route.ts` | Modifica prodotto con prezzi ricorrenti |
| **Pagina** | `src/app/(shop)/products/[slug]/subscribe/page.tsx` | Pagina sottoscrizione prodotto |
| **Pagina** | `src/app/(shop)/checkout/subscription-success/page.tsx` | Pagina successo dopo checkout |
| **Pagina** | `src/app/(shop)/manage-subscription/page.tsx` | Richiesta link accesso portale |
| **Pagina** | `src/app/(shop)/manage-subscription/access/page.tsx` | Redirect token -> portale Stripe |
| **Pagina** | `src/app/admin/subscriptions/page.tsx` | Dashboard admin abbonamenti |
| **Pagina** | `src/app/admin/products/create/page.tsx` | Form creazione prodotto (prezzi ricorrenti) |
| **Pagina** | `src/app/admin/products/[id]/edit/page.tsx` | Form modifica prodotto (prezzi ricorrenti) |
| **Componente** | `src/components/subscriptionPage/SubscriptionForm.tsx` | Form selezione zona/intervallo |
| **Componente** | `src/components/singleProductPage/ProductInfoSection.tsx` | Banner CTA abbonamento su pagina prodotto |
| **Hook** | `src/hooks/useSubscriptionCheckout.ts` | Hook per avviare il checkout subscription |
| **Email** | `src/lib/email/resend.ts` | 5 metodi invio email subscription |
| **Email** | `src/lib/email/subscription-templates.ts` | 5 template HTML fallback |
| **Telegram** | `src/lib/telegram/telegram.ts` | Notifica Telegram nuovo abbonamento |
| **Traduzioni** | `src/data/locales/it.json` | Testi italiani |
| **Traduzioni** | `src/data/locales/en.json` | Testi inglesi |

### Collezioni MongoDB

| Collezione | Descrizione |
|------------|-------------|
| `subscriptions` | Documenti abbonamento (uno per ogni subscription attiva/cancellata) |
| `portal_tokens` | Token temporanei per magic link (scadenza 15 min, uso singolo) |
| `products` | Prodotti con campo `isSubscribable` e `stripeRecurringPriceIds` |
| `email_templates` | Template email personalizzabili da admin (override dei fallback HTML) |

---

## 2. Strutture Dati

### SubscriptionDocument (collezione `subscriptions`)

```typescript
interface SubscriptionDocument {
  _id?: string;
  stripeSubscriptionId: string;    // sub_xxx da Stripe
  stripeCustomerId: string;        // cus_xxx da Stripe
  stripePriceId: string;           // price_xxx usato nel checkout
  productId: string;               // ID prodotto MongoDB
  productName: string;             // Nome prodotto
  customerEmail: string;           // Email cliente
  customerName: string;            // Nome cliente
  shippingZone: ShippingZone;      // 'italia' | 'europa' | 'america' | 'mondo'
  interval: SubscriptionInterval;  // 'month' | 'bimonth' | 'quarter' | 'semester'
  status: SubscriptionStatus;      // 'active' | 'canceled' | 'past_due' | ...
  portalAccessToken?: string;      // UUID permanente per accesso portale
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  currentPeriodStart?: Date;       // Inizio periodo corrente
  currentPeriodEnd?: Date;         // Fine periodo corrente (prossimo rinnovo)
  createdAt: Date;
  updatedAt: Date;
  canceledAt?: Date;               // Data cancellazione (se cancellato)
}
```

### PortalTokenDocument (collezione `portal_tokens`)

```typescript
interface PortalTokenDocument {
  _id?: string;
  token: string;              // UUID temporaneo
  stripeCustomerId: string;   // cus_xxx per creare la sessione portale
  customerEmail: string;      // Email normalizzata (lowercase, trim)
  used: boolean;              // Marcato true dopo primo uso
  expiresAt: Date;            // Scadenza (15 minuti dalla creazione)
  createdAt: Date;
}
```

### SubscriptionEmailData (usato per tutte le email subscription)

```typescript
interface SubscriptionEmailData {
  customerName: string;
  customerEmail: string;
  productName: string;
  interval: SubscriptionInterval;
  shippingZone: ShippingZone;
  portalLink: string;              // URL completo al portale
  nextBillingDate?: string;        // Data formattata prossimo rinnovo
  amount?: string;                 // Importo formattato
}
```

### RecurringPriceMap (campo su Product)

```typescript
// Matrice 4 zone x 4 intervalli = fino a 16 price ID Stripe
type RecurringPriceMap = {
  [zone in ShippingZone]?: {
    [interval in SubscriptionInterval]?: string; // price_xxx
  };
};

// Sul prodotto:
{
  isSubscribable: boolean;
  stripeRecurringPriceIds: RecurringPriceMap;
}
```

### Costanti

```typescript
// Intervalli disponibili
SUBSCRIPTION_INTERVALS = [
  { value: 'month',    months: 1, labelIt: 'Ogni mese',    labelEn: 'Every month' },
  { value: 'bimonth',  months: 2, labelIt: 'Ogni 2 mesi',  labelEn: 'Every 2 months' },
  { value: 'quarter',  months: 3, labelIt: 'Ogni 3 mesi',  labelEn: 'Every 3 months' },
  { value: 'semester', months: 6, labelIt: 'Ogni 6 mesi',  labelEn: 'Every 6 months' },
];

// Zone di spedizione
SHIPPING_ZONES = [
  { value: 'italia',  labelIt: 'Italia',           labelEn: 'Italy' },
  { value: 'europa',  labelIt: 'Europa',           labelEn: 'Europe' },
  { value: 'america', labelIt: 'America',          labelEn: 'Americas' },
  { value: 'mondo',   labelIt: 'Resto del Mondo',  labelEn: 'Rest of World' },
];
```

---

## 3. Setup Prodotto (Admin)

### Prerequisiti su Stripe Dashboard

Prima di configurare un prodotto in abbonamento, bisogna creare i **Recurring Prices** su Stripe:

1. Vai su Stripe Dashboard > Products
2. Crea un prodotto o selezionane uno esistente
3. Aggiungi **Recurring Prices** per ogni combinazione zona/intervallo
4. Ogni prezzo deve **includere il costo di spedizione** per quella zona
5. Copia i `price_xxx` ID

### Configurazione nel Pannello Admin

**Creazione prodotto** (`/admin/products/create`):
- Attiva il checkbox "Abilita Abbonamento"
- Compila la griglia 4x4 con gli ID prezzo Stripe

**Modifica prodotto** (`/admin/products/{id}/edit`):
- Stessa griglia per aggiornare i prezzi ricorrenti
- Le combinazioni vuote vengono filtrate nel frontend

```
                    Mensile    Bimestrale   Trimestrale   Semestrale
Italia          |  price_xxx | price_xxx  | price_xxx   | price_xxx  |
Europa          |  price_xxx | price_xxx  | price_xxx   | price_xxx  |
America         |  price_xxx | price_xxx  | price_xxx   | price_xxx  |
Resto del Mondo |  price_xxx | price_xxx  | price_xxx   | price_xxx  |
```

---

## 4. Flusso Utente: Sottoscrizione

### 4.1 Banner CTA sulla pagina prodotto

Se il prodotto ha `isSubscribable: true`, nella pagina dettaglio prodotto (`ProductInfoSection.tsx`) appare un banner:

> **Abbonati e Risparmia**
> Ricevi questo prodotto a casa tua con regolarita'. Spedizione inclusa!
> [Scopri l'Abbonamento]

Il pulsante rimanda a `/products/{slug}/subscribe`.

### 4.2 Pagina Subscribe

**URL:** `/products/{slug}/subscribe`

1. Carica il prodotto dal database
2. Verifica che `isSubscribable === true` (altrimenti redirect)
3. Mostra immagine prodotto + prezzo minimo ("A partire da X/consegna")
4. Mostra il `SubscriptionForm`

### 4.3 SubscriptionForm (selezione zona + intervallo)

**Step 1 - Selezione zona:**
- Mostra solo le zone che hanno almeno un prezzo configurato
- Radio button con nome zona e bandierina

**Step 2 - Selezione intervallo:**
- Mostra solo gli intervalli disponibili per la zona selezionata
- Radio button con etichetta e prezzo

**Submit:**
- Chiama `startSubscription(productId, zona, intervallo)` dal hook `useSubscriptionCheckout`

---

## 5. Creazione Sessione Checkout

### Hook: useSubscriptionCheckout

```typescript
// src/hooks/useSubscriptionCheckout.ts
const { startSubscription, loading, error } = useSubscriptionCheckout();

// Chiamata:
await startSubscription(productId, shippingZone, interval);
```

### API: POST /api/create-subscription-session

**Input:**
```json
{
  "productId": "local_xxx",
  "shippingZone": "italia",
  "interval": "month"
}
```

**Processo:**
1. Valida i parametri
2. Recupera il prodotto da MongoDB
3. Verifica `isSubscribable === true`
4. Ottiene il `price_xxx` dalla matrice: `product.stripeRecurringPriceIds[zona][intervallo]`
5. Crea sessione Stripe:

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  shipping_address_collection: {
    allowed_countries: ['IT', 'DE', 'FR', ...41 paesi],
  },
  metadata: {
    type: 'subscription',
    productId,
    productName: product.name,
    shippingZone,
    interval,
    stripePriceId: priceId,
  },
  success_url: `${BASE_URL}/checkout/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${BASE_URL}/products/${product.slug}?subscription_canceled=true`,
});
```

**Output:**
```json
{ "sessionId": "cs_xxx" }
```

Il frontend riceve il `sessionId` e fa redirect a Stripe Checkout con `stripe.redirectToCheckout()`.

---

## 6. Webhook Stripe

**Endpoint:** `POST /api/webhooks/stripe`

Il webhook gestisce sia ordini singoli (`mode: 'payment'`) che abbonamenti (`mode: 'subscription'`). Di seguito solo la parte subscription.

### 6.1 checkout.session.completed (mode: subscription)

Triggato quando l'utente completa il pagamento del primo abbonamento.

```
1. Estrai stripeSubscriptionId dalla sessione
2. Controlla idempotenza: subscription gia' esiste?  ->  return 200 (duplicate)
3. Crea documento in MongoDB:
   - stripeSubscriptionId, stripeCustomerId, stripePriceId
   - productId, productName (da metadata)
   - customerEmail, customerName (da session.customer_details)
   - shippingZone, interval (da metadata)
   - status: 'active'
   - portalAccessToken: crypto.randomUUID()  <-- TOKEN PERMANENTE
   - shippingAddress (da shipping_details)
4. Recupera la subscription appena salvata (per avere il portalAccessToken)
5. Costruisci portalLink:
   -> {BASE_URL}/manage-subscription/access?token={portalAccessToken}
6. Invia email di conferma:
   -> EmailService.sendSubscriptionConfirmation(emailData)
7. Invia notifica Telegram:
   -> TelegramService.sendSubscriptionNotification(emailData)
```

### 6.2 customer.subscription.updated

Triggato da Stripe ad ogni rinnovo o cambio di stato.

```
1. Aggiorna status e periodo in MongoDB:
   - currentPeriodStart, currentPeriodEnd
2. Se status === 'active' (rinnovo avvenuto):
   - Recupera subscription da MongoDB
   - Costruisci portalLink con portalAccessToken permanente
   - Calcola nextBillingDate da currentPeriodEnd
   - Invia email di rinnovo:
     -> EmailService.sendSubscriptionRenewal(emailData)
```

### 6.3 invoice.payment_failed

Triggato quando il pagamento automatico del rinnovo fallisce.

```
1. Estrai stripeSubscriptionId dall'invoice
2. Aggiorna status in MongoDB: 'past_due'
3. Recupera subscription da MongoDB
4. Costruisci portalLink con portalAccessToken permanente
5. Invia email pagamento fallito:
   -> EmailService.sendSubscriptionPaymentFailed(emailData)
   (include CTA "Aggiorna Metodo di Pagamento" -> portale)
```

### 6.4 customer.subscription.deleted

Triggato quando l'abbonamento viene cancellato (dall'utente via portale o da admin Stripe).

```
1. Aggiorna status in MongoDB: 'canceled'
   - Imposta canceledAt: new Date()
2. Recupera subscription da MongoDB
3. Invia email cancellazione:
   -> EmailService.sendSubscriptionCanceled(emailData)
   (include CTA "Visita lo Shop")
```

---

## 7. Service Layer (MongoDB)

### SubscriptionService

**File:** `src/services/subscriptionService.ts`
**Collezioni:** `subscriptions`, `portal_tokens`

#### Metodi principali

| Metodo | Descrizione |
|--------|-------------|
| `createSubscription(data)` | Crea subscription con `portalAccessToken` UUID. Ritorna `_id`. |
| `subscriptionExists(stripeSubId)` | Check idempotenza per il webhook |
| `updateSubscriptionStatus(stripeSubId, status, extra?)` | Aggiorna status + campi extra. Se `canceled`, imposta `canceledAt`. |
| `findByEmail(email)` | Trova tutte le subscription di un cliente |
| `findByStripeSubscriptionId(id)` | Trova per ID Stripe (usato nel webhook) |
| `findByPortalToken(token)` | Trova subscription per token permanente (status != canceled) |
| `getAllSubscriptions(page, limit, filters?)` | Lista paginata per admin |
| `getStats()` | Statistiche: totali, per zona, per intervallo |

#### Metodi token temporanei

| Metodo | Descrizione |
|--------|-------------|
| `saveTemporaryToken(email, customerId, token, expiresAt)` | Salva token in `portal_tokens` |
| `findAndUseTemporaryToken(token)` | Trova token valido (non usato, non scaduto), lo marca come `used` |
| `countRecentTokenRequests(email, minutes)` | Conta richieste recenti per rate limiting |

---

## 8. Sistema Email

### 8.1 Pattern Generale

Ogni email segue questo flusso:

```
1. Prova a caricare template dal DB (EmailTemplateService.getTemplateByKey)
2. Se non trovato, usa il fallback HTML hardcoded
3. Sostituisci variabili {{nomeVariabile}} con i dati reali
4. Invia via Resend API
```

I template sono personalizzabili dall'admin tramite il pannello `/admin/email-templates`. Se l'admin non ha creato un template custom, viene usato quello hardcoded.

### 8.2 Template Keys nel Sistema

```typescript
// src/types/emailTemplate.ts
SYSTEM_TEMPLATE_KEYS = [
  // ... (template ordini esistenti) ...
  'subscription_confirmation',      // Conferma abbonamento attivato
  'subscription_renewal',           // Rinnovo avvenuto
  'subscription_payment_failed',    // Pagamento fallito
  'subscription_canceled',          // Abbonamento cancellato
  'portal_access_magic_link',       // Magic link accesso portale
];
```

### 8.3 Le 5 Email Subscription

#### 1. Conferma Abbonamento (`subscription_confirmation`)

- **Quando:** Dopo `checkout.session.completed` (subscription)
- **Soggetto:** "Abbonamento Attivato - {productName} - Olio Galia"
- **Contenuto:**
  - Saluto personalizzato
  - Box dettagli: prodotto, frequenza, zona, importo
  - CTA "Gestisci Abbonamento" (link permanente al portale)
  - Nota: "Conservi questa email per accedere al portale in qualsiasi momento"
- **Variabili:** `logoUrl`, `customerName`, `productName`, `interval`, `shippingZone`, `portalLink`, `amount`

#### 2. Rinnovo Abbonamento (`subscription_renewal`)

- **Quando:** `customer.subscription.updated` con status `active`
- **Soggetto:** "Abbonamento Rinnovato - {productName} - Olio Galia"
- **Contenuto:**
  - Conferma rinnovo avvenuto
  - Box dettagli: prodotto, frequenza, importo, prossima data rinnovo
  - CTA "Gestisci Abbonamento"
- **Variabili:** `logoUrl`, `customerName`, `productName`, `interval`, `nextBillingDate`, `portalLink`, `amount`

#### 3. Pagamento Fallito (`subscription_payment_failed`)

- **Quando:** `invoice.payment_failed`
- **Soggetto:** "Problema con il pagamento dell'abbonamento - Olio Galia"
- **Contenuto:**
  - Avviso pagamento non riuscito
  - Box giallo di warning con azione richiesta
  - CTA "Aggiorna Metodo di Pagamento" (link al portale)
- **Variabili:** `logoUrl`, `customerName`, `productName`, `portalLink`

#### 4. Cancellazione (`subscription_canceled`)

- **Quando:** `customer.subscription.deleted`
- **Soggetto:** "Abbonamento Cancellato - {productName} - Olio Galia"
- **Contenuto:**
  - Conferma cancellazione
  - Box riepilogo: prodotto, stato
  - Messaggio di cortesia
  - CTA "Visita lo Shop"
- **Variabili:** `logoUrl`, `customerName`, `productName`, `siteUrl`

#### 5. Magic Link Accesso Portale (`portal_access_magic_link`)

- **Quando:** Richiesta manuale da `/manage-subscription`
- **Soggetto:** "Accesso al Portale Abbonamento - Olio Galia"
- **Contenuto:**
  - Spiegazione della richiesta
  - CTA "Accedi al Portale" (magic link)
  - Nota: "Valido 15 minuti, uso singolo"
- **Variabili:** `logoUrl`, `magicLink`, `expirationMinutes`

### 8.4 Stile dei Template HTML

Tutti i template usano la stessa struttura base delle email ordine:

- **DOCTYPE:** XHTML 1.0 Transitional
- **Layout:** Table-based per massima compatibilita' email client
- **Header:** Sfondo `#556B2F` (olive green), logo "OLIO GALIA" in Georgia serif
- **Font primario:** Georgia, Times New Roman, serif (titoli)
- **Font secondario:** -apple-system, BlinkMacSystemFont, sans-serif (corpo)
- **Colori:** `#556B2F` (olive), `#789262` (salvia), `#D6C7A1` (beige), `#333` (testo)
- **CTA Button:** Sfondo olive, testo bianco, padding 16px 32px, border-radius 4px
- **Info Box:** Sfondo `#f8f8f8`, bordo sinistro 4px `#789262`
- **Footer:** Sfondo `#f8f8f8`, "OLIO GALIA" + tagline
- **Responsive:** Media query `max-width: 600px`

---

## 9. Notifiche Telegram

### Nuovo Abbonamento

**Quando:** Dopo `checkout.session.completed` (subscription)
**Metodo:** `TelegramService.sendSubscriptionNotification(data)`

**Formato messaggio:**

```
🔄 NUOVO ABBONAMENTO!

📋 Cliente: Mario Rossi (mario@email.com)
📦 Prodotto: Olio EVO Premium
🗺️ Zona: Italia
📅 Frequenza: Ogni mese
💰 Importo: €29.90
```

Il messaggio viene inviato a tutti i `TELEGRAM_CHAT_ID` configurati (supporta chat ID multipli separati da virgola).

---

## 10. Accesso al Portale di Gestione

Il sistema usa un **doppio meccanismo di token** per l'accesso al portale Stripe:

### 10.1 Token Permanente

- Generato automaticamente alla creazione della subscription (`crypto.randomUUID()`)
- Salvato nel campo `portalAccessToken` del documento subscription
- Incluso nelle email di conferma e rinnovo come link diretto
- **Valido finche' la subscription non e' canceled**
- Non scade, non ha limite di utilizzi

**URL:** `{BASE_URL}/manage-subscription/access?token={portalAccessToken}`

### 10.2 Magic Link (Token Temporaneo)

Per chi non trova l'email originale, puo' richiedere un magic link:

**Flusso:**

```
1. Utente va su /manage-subscription
2. Inserisce la sua email
3. POST /api/create-portal-session con { email }
4. Backend:
   a. Rate limiting: max 3 richieste ogni 10 minuti per email
   b. Cerca customer Stripe per email
   c. Se non trovato: errore 404
   d. Genera token UUID con scadenza 15 minuti
   e. Salva in collezione portal_tokens
   f. Invia email con magic link
   g. Risponde { sent: true }
5. Utente riceve email con link
6. Clicca il link -> /manage-subscription/access?token={token}
7. GET /api/portal-access?token={token}
8. Backend:
   a. Cerca prima in subscriptions.portalAccessToken (permanente)
   b. Se non trovato, cerca in portal_tokens (temporaneo)
   c. Se temporaneo: verifica non scaduto, non usato; marca come used
   d. Crea sessione Stripe billing portal
   e. Risponde { url: portalSession.url }
9. Frontend fa redirect a url del portale Stripe
```

### 10.3 Rate Limiting

- **Limite:** 3 richieste ogni 10 minuti per email
- **Implementazione:** `SubscriptionService.countRecentTokenRequests(email, 10)`
- **Risposta se superato:** HTTP 429 "Troppe richieste. Riprova tra qualche minuto."

### 10.4 Pagina /manage-subscription

**Stati della pagina:**

| Stato | Visualizzazione |
|-------|----------------|
| `idle` | Testo intro + form email + pulsante "Invia link" |
| `loading` | Pulsante "Invio in corso..." disabilitato |
| `sent` | Icona email + "Ti abbiamo inviato un'email con il link di accesso" + nota validita' |
| `error` | Messaggio errore rosso + form per riprovare |

### 10.5 Pagina /manage-subscription/access

**Stati della pagina:**

| Stato | Visualizzazione |
|-------|----------------|
| `loading` | Spinner + "Accesso al portale in corso..." |
| `error` | Icona errore + "Link non valido o scaduto" + CTA "Richiedi nuovo link" |
| (redirect) | Se token valido, redirect immediato al portale Stripe |

La pagina usa `<Suspense>` per wrappare `useSearchParams()` (requisito Next.js 15).

---

## 11. Pagina Successo

**URL:** `/checkout/subscription-success?session_id={cs_xxx}`

### Contenuto

1. **Icona successo** + titolo "Abbonamento Attivato!"
2. **Descrizione:** "Il tuo abbonamento e' stato attivato con successo..."
3. **Info email:** "Riceverai una email di conferma con tutti i dettagli"
4. **Timeline prossimi passi:**
   - Step 1: Conferma via email con dettagli abbonamento
   - Step 2: Preparazione e spedizione del primo ordine
   - Step 3: Rinnovo automatico alla frequenza scelta
5. **CTA:**
   - "Gestisci Abbonamento" -> `/manage-subscription`
   - "Continua lo Shopping" -> `/products`

---

## 12. Admin Dashboard Abbonamenti

**URL:** `/admin/subscriptions`

### Statistiche

Tre card in alto:
- **Totali:** Numero totale abbonamenti
- **Attivi:** Numero abbonamenti attivi (verde)
- **Cancellati:** Numero abbonamenti cancellati (rosso)

### Filtri

- **Per stato:** Attivo, Cancellato, Scaduto (past_due), In pausa
- **Per zona:** Italia, Europa, America, Mondo

### Tabella

| Colonna | Contenuto |
|---------|-----------|
| Cliente | Email + nome |
| Prodotto | Nome prodotto |
| Zona | Zona di spedizione |
| Intervallo | Mensile/Bimestrale/Trimestrale/Semestrale |
| Stato | Badge colorato (verde=attivo, rosso=cancellato, giallo=scaduto) |
| Data | Data creazione formattata |

### API

```
GET /api/admin/subscriptions?page=1&limit=20&status=active&zone=italia

Response:
{
  subscriptions: SubscriptionDocument[],
  total: number,
  hasMore: boolean,
  stats: {
    total: number,
    active: number,
    canceled: number,
    byZone: { italia: 5, europa: 2, ... },
    byInterval: { month: 3, quarter: 4, ... }
  }
}
```

---

## 13. Traduzioni

Tutte le stringhe del sistema subscription sono in `src/data/locales/it.json` e `en.json` sotto la chiave `subscription`.

### Chiavi principali

| Chiave | IT | EN |
|--------|----|----|
| `pageTitle` | Abbonati e Risparmia | Subscribe & Save |
| `zoneTitle` | Zona di spedizione | Shipping zone |
| `intervalTitle` | Frequenza di consegna | Delivery frequency |
| `subscribeButton` | Abbonati Ora | Subscribe Now |
| `shippingIncluded` | Spedizione inclusa nel prezzo | Shipping included in price |
| `successTitle` | Abbonamento Attivato! | Subscription Activated! |
| `manageTitle` | Gestisci il tuo Abbonamento | Manage your Subscription |
| `portalEmailIntro` | Il link per gestire il tuo abbonamento si trova nelle email di conferma e rinnovo. | The link to manage your subscription can be found in the confirmation and renewal emails. |
| `portalEmailFallback` | Non trovi l'email? Inserisci la tua email per ricevere un nuovo link di accesso. | Can't find the email? Enter your email to receive a new access link. |
| `sendLink` | Invia link | Send link |
| `sendingLink` | Invio in corso... | Sending... |
| `portalEmailSent` | Ti abbiamo inviato un'email con il link di accesso | We've sent you an email with the access link |
| `portalEmailNote` | Il link e' valido per 15 minuti e puo' essere usato una sola volta. | The link is valid for 15 minutes and can only be used once. |
| `accessLoading` | Accesso al portale in corso... | Accessing portal... |
| `accessError` | Link non valido o scaduto | Invalid or expired link |
| `accessErrorDesc` | Questo link non e' piu' valido. Richiedi un nuovo link di accesso. | This link is no longer valid. Request a new access link. |
| `requestNewLink` | Richiedi nuovo link | Request new link |
| `rateLimitError` | Troppe richieste. Riprova tra qualche minuto. | Too many requests. Please try again in a few minutes. |

---

## 14. Diagramma Flusso Completo

### A. Attivazione Abbonamento

```
UTENTE                           FRONTEND                          BACKEND                         STRIPE
  |                                 |                                 |                               |
  |-- Visita pagina prodotto ------>|                                 |                               |
  |                                 |-- (mostra banner CTA) -------->|                               |
  |-- Click "Scopri Abbonamento" -->|                                 |                               |
  |                                 |-- /products/{slug}/subscribe -->|                               |
  |                                 |-- Carica prodotto ------------->|                               |
  |                                 |<-- Dati prodotto + priceMap ----|                               |
  |<-- Form selezione zona ---------|                                 |                               |
  |-- Seleziona zona -------------->|                                 |                               |
  |<-- Form selezione intervallo ---|                                 |                               |
  |-- Seleziona intervallo -------->|                                 |                               |
  |-- Click "Abbonati Ora" -------->|                                 |                               |
  |                                 |-- POST /create-subscription --->|                               |
  |                                 |     session                     |-- checkout.sessions.create --->|
  |                                 |                                 |<-- sessionId ------------------|
  |                                 |<-- { sessionId } ---------------|                               |
  |                                 |-- stripe.redirectToCheckout --->|                               |
  |<-- Redirect a Stripe Checkout --|                                 |                               |
  |                                 |                                 |                               |
  |-- Completa pagamento ---------------------------------------------------------->|               |
  |                                 |                                 |<-- webhook: checkout.session   |
  |                                 |                                 |    .completed (subscription)   |
  |                                 |                                 |                               |
  |                                 |                                 |-- createSubscription() ------>|
  |                                 |                                 |   (genera portalAccessToken)   |
  |                                 |                                 |-- Invia email conferma ------>|
  |                                 |                                 |-- Invia Telegram notifica -->|
  |                                 |                                 |                               |
  |<-- Redirect a success page -----|                                 |                               |
  |-- Vede "Abbonamento Attivato!" -|                                 |                               |
  |-- Riceve email con link portale |                                 |                               |
```

### B. Rinnovo Automatico

```
STRIPE                          BACKEND                         UTENTE
  |                                |                               |
  |-- Addebita carta cliente ----->|                               |
  |-- webhook: customer.sub ------>|                               |
  |   .updated (active)           |                               |
  |                                |-- updateSubscriptionStatus -->|
  |                                |-- findByStripeSubId --------->|
  |                                |-- Invia email rinnovo ------->|
  |                                |                               |-- Riceve email
```

### C. Pagamento Fallito

```
STRIPE                          BACKEND                         UTENTE
  |                                |                               |
  |-- Tentativo pagamento FAIL --->|                               |
  |-- webhook: invoice ----------->|                               |
  |   .payment_failed            |                               |
  |                                |-- updateStatus: past_due ---->|
  |                                |-- findByStripeSubId --------->|
  |                                |-- Invia email pag. fallito -->|
  |                                |   (con link "Aggiorna        |-- Riceve email
  |                                |    Metodo di Pagamento")      |-- Click link
  |                                |                               |-- -> Portale Stripe
```

### D. Cancellazione

```
UTENTE                          STRIPE                          BACKEND
  |                                |                               |
  |-- Accede al Portale Stripe --->|                               |
  |-- Click "Cancella" ----------->|                               |
  |                                |-- webhook: customer.sub ----->|
  |                                |   .deleted                   |
  |                                |                               |-- updateStatus: canceled
  |                                |                               |-- Invia email cancellazione
  |<-- Riceve email conferma ------|-------------------------------|
```

### E. Accesso Portale via Magic Link

```
UTENTE                           FRONTEND                          BACKEND                     STRIPE
  |                                 |                                 |                            |
  |-- /manage-subscription -------->|                                 |                            |
  |<-- Form email ------------------|                                 |                            |
  |-- Inserisce email + "Invia" --->|                                 |                            |
  |                                 |-- POST /create-portal-session ->|                            |
  |                                 |                                 |-- Rate limit check         |
  |                                 |                                 |-- customers.list(email) -->|
  |                                 |                                 |<-- customer ----------------|
  |                                 |                                 |-- Genera token UUID        |
  |                                 |                                 |-- Salva in portal_tokens   |
  |                                 |                                 |-- Invia email magic link   |
  |                                 |<-- { sent: true } --------------|                            |
  |<-- "Email inviata!" ------------|                                 |                            |
  |                                 |                                 |                            |
  |-- Apre email, click link ------>|                                 |                            |
  |                                 |-- /manage-subscription/access ->|                            |
  |                                 |   ?token={token}               |                            |
  |                                 |-- GET /api/portal-access ------>|                            |
  |                                 |   ?token={token}               |                            |
  |                                 |                                 |-- Check permanent token    |
  |                                 |                                 |-- Check temporary token    |
  |                                 |                                 |-- Mark as used             |
  |                                 |                                 |-- billingPortal.create --->|
  |                                 |                                 |<-- portalSession.url ------|
  |                                 |<-- { url } --------------------|                            |
  |<-- Redirect a Portale Stripe ---|                                 |                            |
```

---

## Variabili d'Ambiente Necessarie

| Variabile | Descrizione |
|-----------|-------------|
| `STRIPE_SECRET_KEY` | Chiave segreta Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret per verifica firma webhook |
| `NEXT_PUBLIC_BASE_URL` | URL base del sito (es. https://oliogalia.com) |
| `NEXT_PUBLIC_SITE_URL` | URL alternativo del sito |
| `RESEND_API_KEY` | API key Resend per invio email |
| `FROM_EMAIL` | Indirizzo mittente email |
| `TELEGRAM_BOT_TOKEN` | Token bot Telegram |
| `TELEGRAM_CHAT_ID` | Chat ID Telegram (multipli separati da virgola) |
| `MONGODB_URI` | Connection string MongoDB |

---

## Configurazione Stripe Necessaria

1. **Prodotto con Recurring Prices** creati su Stripe Dashboard
2. **Customer Portal** configurato su Stripe (Settings > Billing > Customer Portal)
   - Abilita: cancellazione, cambio piano, aggiornamento metodo pagamento
3. **Webhook** endpoint configurato su Stripe con eventi:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
