# Flusso Completo Abbonamenti - Olio Galia

## 1. Scoperta (Pagina Prodotto)

Il cliente naviga su una pagina prodotto (es. `/products/olio-evo-500ml`).

Se il prodotto ha `isSubscribable: true`, sotto il bottone "Aggiungi al Carrello" e la sezione "Preventivo" appare un **banner verde**:

> **Abbonati e Risparmia**
> Ricevi questo prodotto a casa tua con regolarità. Spedizione inclusa!
> [Scopri l'Abbonamento]

Il cliente clicca su **"Scopri l'Abbonamento"**.

---

## 2. Pagina Subscribe (`/products/[slug]/subscribe`)

Il cliente viene portato alla pagina dedicata all'abbonamento.

**Layout:** 2 colonne
- **Sinistra:** galleria immagini del prodotto
- **Destra:** nome prodotto, descrizione, prezzo base e il form di abbonamento

### Step 2a — Selezione Zona di Spedizione

Il cliente vede 4 card radio (vengono mostrate solo le zone per cui esiste almeno un Price ID configurato):

| Zona | Descrizione |
|------|-------------|
| **Italia** | Spedizione nazionale |
| **Europa** | Paesi europei |
| **America** | Nord/Centro/Sud America |
| **Resto del Mondo** | Spedizione internazionale |

Il cliente seleziona la sua zona (es. **Italia**).

### Step 2b — Selezione Frequenza di Consegna

Dopo aver scelto la zona, appaiono le frequenze disponibili (solo quelle con Price ID configurato per quella zona):

| Intervallo | Label |
|------------|-------|
| **month** | Ogni mese |
| **bimonth** | Ogni 2 mesi |
| **quarter** | Ogni 3 mesi |
| **semester** | Ogni 6 mesi |

Il cliente seleziona la frequenza (es. **Ogni 3 mesi**).

### Step 2c — Conferma

Sotto i selettori appare una nota:

> La spedizione è inclusa nel prezzo dell'abbonamento. Riceverai il prodotto direttamente a casa tua con la frequenza selezionata.

Il cliente clicca il bottone **"Abbonati Ora"**.

---

## 3. Redirect a Stripe Checkout

### Cosa succede dietro le quinte:

1. Il frontend chiama `POST /api/create-subscription-session` con:
   ```json
   {
     "productId": "local_xxx",
     "shippingZone": "italia",
     "interval": "quarter"
   }
   ```

2. L'API:
   - Cerca il prodotto in MongoDB
   - Verifica che `isSubscribable === true`
   - Prende il Price ID ricorrente da `stripeRecurringPriceIds.italia.quarter`
   - Crea una **Stripe Checkout Session** con `mode: 'subscription'`
   - Abilita `shipping_address_collection` per raccogliere l'indirizzo
   - Salva nei metadata: `type`, `productId`, `productName`, `shippingZone`, `interval`
   - Ritorna il `sessionId`

3. Il frontend carica Stripe.js e fa `redirectToCheckout({ sessionId })`

### Il cliente su Stripe Checkout:

- Inserisce **email**
- Inserisce **indirizzo di spedizione**
- Inserisce **carta di credito**
- Vede il riepilogo: prodotto, prezzo ricorrente (spedizione inclusa), frequenza
- Clicca **"Abbonati"**

---

## 4. Pagamento e Attivazione

Stripe processa il primo pagamento e attiva l'abbonamento.

### Webhook `checkout.session.completed` (mode: subscription)

Stripe invia un webhook al nostro endpoint `POST /api/webhooks/stripe`.

Il webhook:

1. Riconosce `session.mode === 'subscription'`
2. Estrae `stripeSubscriptionId` dalla session
3. Controlla idempotenza (subscription già salvata?)
4. Salva in MongoDB (collection `subscriptions`):
   ```json
   {
     "stripeSubscriptionId": "sub_xxx",
     "stripeCustomerId": "cus_xxx",
     "productId": "local_xxx",
     "productName": "Olio EVO 500ml",
     "customerEmail": "mario.rossi@email.com",
     "customerName": "Mario Rossi",
     "shippingZone": "italia",
     "interval": "quarter",
     "status": "active",
     "shippingAddress": {
       "line1": "Via Roma 1",
       "city": "Milano",
       "postalCode": "20100",
       "country": "IT"
     },
     "createdAt": "2025-...",
     "updatedAt": "2025-..."
   }
   ```
5. Logga l'evento

---

## 5. Pagina di Successo (`/checkout/subscription-success`)

Dopo il pagamento, Stripe redirige il cliente a questa pagina.

Il cliente vede:

- Icona verde di conferma
- **"Abbonamento Attivato!"**
- Messaggio: "Il tuo abbonamento è stato attivato con successo"
- Info: "Riceverai una email di conferma con tutti i dettagli"
- **Prossimi passi:**
  1. Conferma via email con i dettagli dell'abbonamento
  2. Preparazione e spedizione del primo ordine
  3. Rinnovo automatico alla frequenza scelta
- Due bottoni:
  - **"Gestisci Abbonamento"** → `/manage-subscription`
  - **"Continua lo Shopping"** → `/products`

---

## 6. Vita dell'Abbonamento (Automatica)

### Rinnovo automatico

Stripe addebita automaticamente la carta del cliente alla frequenza scelta. Per ogni rinnovo:

- Stripe crea un nuovo `invoice`
- Se il pagamento va a buon fine → l'abbonamento resta `active`
- Se il pagamento fallisce → webhook `invoice.payment_failed` → status diventa `past_due`

### Eventi webhook gestiti

| Evento Stripe | Azione |
|---------------|--------|
| `customer.subscription.updated` | Aggiorna status e periodo in MongoDB |
| `customer.subscription.deleted` | Segna come `canceled` con data cancellazione |
| `invoice.payment_failed` | Segna come `past_due` |

---

## 7. Gestione Abbonamento (`/manage-subscription`)

Il cliente (in qualsiasi momento) può visitare `/manage-subscription`.

### Step 7a — Inserimento Email

Il cliente inserisce l'email usata per l'abbonamento e clicca **"Accedi al Portale"**.

### Step 7b — Dietro le quinte

1. Il frontend chiama `POST /api/create-portal-session` con `{ email }`
2. L'API:
   - Cerca il customer Stripe per email (`stripe.customers.list({ email })`)
   - Se non trovato → errore "Nessun abbonamento trovato per questa email"
   - Se trovato → crea una **Stripe Billing Portal Session**
   - Ritorna l'URL del portale

3. Il frontend fa `window.location.href = url`

### Step 7c — Stripe Customer Portal

Il cliente viene reindirizzato al portale Stripe dove può:

- **Vedere** i dettagli dell'abbonamento (prodotto, prezzo, prossimo addebito)
- **Modificare** la carta di credito
- **Cambiare** il piano (se configurato)
- **Sospendere** l'abbonamento (se abilitato nel portale)
- **Cancellare** l'abbonamento
- **Vedere** lo storico delle fatture
- **Scaricare** le ricevute

Al termine, il cliente clicca "Torna a Olio Galia" e viene riportato a `/manage-subscription`.

---

## 8. Cancellazione

Se il cliente cancella dal portale Stripe:

1. Stripe invia webhook `customer.subscription.deleted`
2. Il nostro webhook aggiorna MongoDB: `status: 'canceled'`, `canceledAt: new Date()`
3. L'abbonamento non verrà più rinnovato

---

## Flusso Admin

### Configurazione Prodotto

1. **Admin** → `/admin/products/create` (o `/admin/products/[id]/edit`)
2. Nella sezione verde **"Configurazione Abbonamento"**:
   - Spunta **"Abilita Abbonamento"**
   - Appare una griglia 4 zone × 4 intervalli
   - Per ogni combinazione disponibile, inserire il **Stripe Price ID** ricorrente (es. `price_xxx`)
   - Lasciare vuote le combinazioni non disponibili
3. Salva il prodotto

### Prerequisito: creare i Price su Stripe

Prima di configurare l'admin, bisogna creare i Price ricorrenti su Stripe Dashboard:

1. Vai su **Stripe Dashboard** → **Products** → seleziona il prodotto
2. Clicca **"Add price"**
3. Seleziona **"Recurring"**
4. Imposta importo (prodotto + spedizione per quella zona)
5. Imposta intervallo (monthly, every 2 months, every 3 months, every 6 months)
6. Copia il **Price ID** generato (es. `price_1Abc...`)
7. Ripeti per ogni combinazione zona/intervallo desiderata

### Visualizzare Abbonamenti

1. **Admin** → `/admin/subscriptions`
2. Dashboard con:
   - **3 card statistiche**: Totale, Attivi, Cancellati
   - **Filtri**: per stato (attivi, cancellati, scaduti, in pausa) e per zona
   - **Tabella**: email, nome cliente, prodotto, zona, intervallo, stato, data creazione
   - **Paginazione** (20 per pagina)

---

## Schema Riassuntivo

```
Pagina Prodotto
    │
    ▼ (click "Scopri l'Abbonamento")
Pagina Subscribe (/products/[slug]/subscribe)
    │
    ├─ Seleziona Zona
    ├─ Seleziona Intervallo
    │
    ▼ (click "Abbonati Ora")
API create-subscription-session
    │
    ▼ (redirect)
Stripe Checkout (mode: subscription)
    │
    ├─ Email + Indirizzo + Carta
    │
    ▼ (pagamento ok)
Webhook checkout.session.completed
    │
    ├─ Salva in MongoDB (collection: subscriptions)
    │
    ▼ (redirect)
Pagina Successo (/checkout/subscription-success)
    │
    ▼ (in qualsiasi momento)
Gestione (/manage-subscription)
    │
    ├─ Inserisci email
    │
    ▼ (redirect)
Stripe Customer Portal
    │
    ├─ Modifica carta
    ├─ Cancella abbonamento
    ├─ Scarica fatture
    │
    ▼ (eventi automatici)
Webhook: subscription.updated / deleted / invoice.payment_failed
    │
    ▼
Aggiornamento status in MongoDB
```
