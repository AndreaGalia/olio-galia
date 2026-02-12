# Accesso Portale Abbonamento - Soluzione Combinata

## Prerequisito: Email Subscription (attualmente mancanti)

Ad oggi il sistema **non invia nessuna email** per le subscription. Il webhook gestisce solo il salvataggio in MongoDB e un `console.log`. Le email sono inviate solo per gli ordini singoli.

Bisogna implementare l'invio email per questi eventi subscription:

| Evento | Email da inviare | Trigger |
|--------|-----------------|---------|
| **Nuovo abbonamento** | Conferma attivazione con dettagli + link portale | Webhook `checkout.session.completed` (mode: subscription) |
| **Rinnovo riuscito** | Conferma rinnovo con prossima data + link portale | Webhook `customer.subscription.updated` (quando `status === 'active'` e periodo aggiornato) |
| **Pagamento fallito** | Avviso con invito ad aggiornare la carta + link portale | Webhook `invoice.payment_failed` |
| **Abbonamento cancellato** | Conferma cancellazione | Webhook `customer.subscription.deleted` |

Tutte le email (tranne cancellazione) includono il link permanente al portale: `/manage-subscription/access?token={portalAccessToken}`

---

## Strategia

Due modalità di accesso al Customer Portal Stripe, nessun login richiesto:

1. **Link in email (primario)** - Ogni email di sistema include un link permanente tokenizzato per accedere al portale
2. **Magic Link (fallback)** - Se il cliente ha perso le email, può richiedere un link temporaneo dalla pagina `/manage-subscription`

In entrambi i casi l'accesso è verificato tramite la casella email del cliente. L'endpoint attuale che restituisce direttamente l'URL del portale viene eliminato.

---

## Flusso Completo

```
╔══════════════════════════════════════════════════════╗
║  ACCESSO PRIMARIO: Link in Email                     ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Cliente si abbona                                   ║
║      │                                               ║
║      ▼                                               ║
║  Webhook salva subscription + genera portalToken     ║
║      │                                               ║
║      ▼                                               ║
║  Email conferma con link:                            ║
║  /manage-subscription/access?token=xxx               ║
║      │                                               ║
║      ▼                                               ║
║  Cliente clicca → API verifica token → Portale       ║
║                                                      ║
║  (stesso link in ogni email successiva: rinnovo,     ║
║   pagamento fallito, etc.)                           ║
║                                                      ║
╚══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════╗
║  ACCESSO FALLBACK: Magic Link                        ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Cliente ha perso le email                           ║
║      │                                               ║
║      ▼                                               ║
║  Visita /manage-subscription                         ║
║      │                                               ║
║      ▼ (inserisce email)                             ║
║  API genera token temporaneo (15 min)                ║
║      │                                               ║
║      ▼                                               ║
║  Email con link: /manage-subscription/access?token=x ║
║      │                                               ║
║      ▼                                               ║
║  Messaggio: "Controlla la tua email"                 ║
║      │                                               ║
║      ▼                                               ║
║  Cliente clicca → API verifica token → Portale       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

## Struttura Dati

### Campo in collection `subscriptions` (token permanente)

```json
{
  "stripeSubscriptionId": "sub_xxx",
  "stripeCustomerId": "cus_xxx",
  "customerEmail": "mario@email.com",
  "portalAccessToken": "uuid-permanente",
  "...altri campi esistenti"
}
```

### Collection `portal_tokens` (token temporanei - magic link)

```json
{
  "token": "uuid-temporaneo",
  "stripeCustomerId": "cus_xxx",
  "customerEmail": "mario@email.com",
  "used": false,
  "expiresAt": "2025-07-01T12:15:00Z",
  "createdAt": "2025-07-01T12:00:00Z"
}
```

Index TTL su `expiresAt` per pulizia automatica.

---

## API: Un unico endpoint di verifica

Entrambi i flussi convergono sullo stesso endpoint e sulla stessa pagina `/manage-subscription/access?token=xxx`.

L'API di verifica cerca il token in due posti:

```
Token ricevuto
    │
    ├─ 1. Cerca in subscriptions.portalAccessToken (token permanente)
    │     → Se trovato e subscription attiva → crea portal session → redirect
    │
    ├─ 2. Cerca in portal_tokens (token temporaneo)
    │     → Se trovato, non scaduto, non usato → segna come usato → crea portal session → redirect
    │
    └─ Nessun match → errore "Link non valido o scaduto"
```

---

## File coinvolti

### Da CREARE

| File | Descrizione |
|------|-------------|
| `src/app/api/portal-access/route.ts` | Endpoint unico: riceve token, cerca in subscriptions poi in portal_tokens, crea portal session, restituisce URL |
| `src/app/(shop)/manage-subscription/access/page.tsx` | Pagina che legge token dalla query string, chiama `/api/portal-access`, fa redirect al portale. Mostra errore se token invalido/scaduto |

### Da MODIFICARE

| File | Modifica |
|------|----------|
| `src/types/subscription.ts` | Aggiungere `portalAccessToken?: string` a `SubscriptionDocument` |
| `src/services/subscriptionService.ts` | In `createSubscription`: generare `portalAccessToken` con `crypto.randomUUID()`. Aggiungere metodi: `findByPortalToken(token)`, `saveTemporaryToken(email, token, expiresAt)`, `findAndUseTemporaryToken(token)` |
| `src/app/api/create-portal-session/route.ts` | Riscrivere: non restituisce più URL portale. Cerca customer Stripe per email, genera token temporaneo, salva in `portal_tokens`, invia email con magic link, restituisce `{ sent: true }` |
| `src/app/(shop)/manage-subscription/page.tsx` | Dopo submit mostra messaggio "Ti abbiamo inviato un'email con il link" invece di fare redirect. Aggiungere nota: "Il link per gestire il tuo abbonamento si trova anche nelle email di conferma e rinnovo" |
| `src/app/api/webhooks/stripe/route.ts` | **4 modifiche:** (1) Dopo salvataggio subscription: inviare email conferma con link portale. (2) In `customer.subscription.updated`: recuperare subscription da MongoDB, inviare email rinnovo con link portale. (3) In `invoice.payment_failed`: recuperare subscription da MongoDB, inviare email pagamento fallito con link portale. (4) In `customer.subscription.deleted`: recuperare subscription da MongoDB, inviare email cancellazione |
| `src/lib/email/resend.ts` | Aggiungere 5 template: `sendSubscriptionConfirmation(data)`, `sendSubscriptionRenewal(data)`, `sendSubscriptionPaymentFailed(data)`, `sendSubscriptionCanceled(data)`, `sendPortalAccessEmail(email, link)` |
| `src/data/locales/it.json` | Aggiungere testi per: messaggio "email inviata", errore token scaduto, pagina access |
| `src/data/locales/en.json` | Stessi testi in inglese |

### Da NON toccare

- Configurazione Stripe Customer Portal
- Flusso ordini singoli (parte `session.mode === 'payment'` del webhook)
- Carrello

---

## Sicurezza

| Aspetto | Token permanente (in email) | Token temporaneo (magic link) |
|---------|---------------------------|-------------------------------|
| **Dove vive** | Campo `portalAccessToken` in `subscriptions` | Documento in collection `portal_tokens` |
| **Scadenza** | Mai (valido finché subscription attiva) | 15 minuti |
| **Uso** | Illimitato | Singolo (segnato come `used`) |
| **Generato quando** | Creazione subscription | Richiesta dal form `/manage-subscription` |
| **Pulizia** | Automatica (subscription cancellata = token inutile) | TTL index MongoDB |

### Protezioni aggiuntive

| Protezione | Dettaglio |
|-----------|-----------|
| **Nessun URL portale esposto** | Nessun endpoint restituisce l'URL del portale Stripe direttamente al frontend |
| **Rate limiting magic link** | Limitare a max 3 richieste per email ogni 10 minuti (opzionale, implementabile con conteggio in `portal_tokens`) |
| **Token permanente revocato** | Se subscription cancellata, il token permanente non funziona più (check `status !== 'canceled'`) |
| **Token non prevedibile** | Generato con `crypto.randomUUID()` (128 bit di entropia) |

---

## Email

### 1. Conferma Abbonamento (automatica dopo pagamento)

Oggetto: **Il tuo abbonamento è attivo - Olio Galia**

> Ciao {nome},
>
> Il tuo abbonamento è stato attivato!
>
> **Prodotto:** {productName}
> **Frequenza:** {intervallo}
> **Zona:** {zona}
>
> **[Gestisci Abbonamento]** → /manage-subscription/access?token={portalAccessToken}
>
> Conserva questa email per accedere al portale in futuro.
> Se perdi questa email, puoi richiedere un nuovo link su oliogalia.com/manage-subscription

### 2. Rinnovo Riuscito (automatica ad ogni rinnovo)

Oggetto: **Il tuo abbonamento è stato rinnovato - Olio Galia**

> Ciao {nome},
>
> Il tuo abbonamento è stato rinnovato con successo!
>
> **Prodotto:** {productName}
> **Prossimo rinnovo:** {nextRenewalDate}
>
> Stiamo preparando la tua spedizione.
>
> **[Gestisci Abbonamento]** → /manage-subscription/access?token={portalAccessToken}

### 3. Pagamento Fallito (automatica)

Oggetto: **Problema con il pagamento del tuo abbonamento - Olio Galia**

> Ciao {nome},
>
> Non siamo riusciti a processare il pagamento per il tuo abbonamento.
>
> **Prodotto:** {productName}
>
> Per evitare l'interruzione del servizio, aggiorna il tuo metodo di pagamento:
>
> **[Aggiorna Metodo di Pagamento]** → /manage-subscription/access?token={portalAccessToken}
>
> Se il problema persiste, contattaci a info@oliogalia.com

### 4. Abbonamento Cancellato (automatica)

Oggetto: **Il tuo abbonamento è stato cancellato - Olio Galia**

> Ciao {nome},
>
> Il tuo abbonamento è stato cancellato.
>
> **Prodotto:** {productName}
>
> Ci dispiace vederti andare. Se cambi idea, puoi sempre abbonarti di nuovo dal nostro sito.
>
> **[Visita lo Shop]** → /products

### 5. Magic Link (su richiesta)

Oggetto: **Accedi al tuo abbonamento - Olio Galia**

> Ciao,
>
> Hai richiesto di accedere al portale di gestione del tuo abbonamento.
>
> **[Gestisci Abbonamento]** → /manage-subscription/access?token={temporaryToken}
>
> Questo link è valido per 15 minuti e può essere usato una sola volta.
>
> Se non hai richiesto tu questo accesso, ignora questa email.

---

## Pagina `/manage-subscription` aggiornata

La pagina pubblica diventa un form di fallback con contesto:

> **Gestisci il tuo Abbonamento**
>
> Il link per gestire il tuo abbonamento si trova nelle email di conferma e rinnovo che ti abbiamo inviato.
>
> **Non trovi l'email?**
> Inserisci il tuo indirizzo email e ti invieremo un nuovo link di accesso.
>
> [Campo email] [Invia link]
>
> *Riceverai un'email con un link valido per 15 minuti.*

---

## Ordine di implementazione consigliato

| Step | Cosa | Motivo |
|------|------|--------|
| 1 | Aggiungere `portalAccessToken` ai tipi e al service | Base per tutto il resto |
| 2 | Creare `/api/portal-access` (endpoint unico di verifica) | Serve a entrambi i flussi |
| 3 | Creare `/manage-subscription/access` (pagina) | Frontend per il redirect |
| 4 | Template email: conferma, rinnovo, pagamento fallito, cancellazione | Servono per i webhook |
| 5 | Modificare webhook `checkout.session.completed`: generare token + inviare email conferma | Attiva il flusso primario |
| 6 | Modificare webhook `customer.subscription.updated`: inviare email rinnovo con link portale | Email ad ogni rinnovo |
| 7 | Modificare webhook `invoice.payment_failed`: inviare email pagamento fallito con link portale | Avviso al cliente |
| 8 | Modificare webhook `customer.subscription.deleted`: inviare email cancellazione | Conferma cancellazione |
| 9 | Riscrivere `/api/create-portal-session` → magic link | Attiva il flusso fallback |
| 10 | Template email magic link | Necessario per step 9 |
| 11 | Aggiornare pagina `/manage-subscription` | UI del fallback |
| 12 | Traduzioni it/en | Testi per le nuove pagine/email |
