# Magic Link per Manage Subscription

## Problema attuale

Chiunque conosca l'email di un cliente può accedere al suo Stripe Customer Portal. L'API `/api/create-portal-session` accetta una email e restituisce direttamente l'URL del portale senza alcuna verifica di identità.

---

## Soluzione: Magic Link via Email

Invece di reindirizzare subito al portale Stripe, il sistema invia un'email con un link temporaneo. Solo chi ha accesso alla casella email può aprire il portale.

### Flusso aggiornato

```
Cliente visita /manage-subscription
    │
    ▼ (inserisce email)
API /api/create-portal-session
    │
    ├─ Cerca customer Stripe per email
    ├─ Se non trovato → errore "Nessun abbonamento trovato"
    ├─ Genera un token univoco (es. crypto.randomUUID o jwt con scadenza)
    ├─ Salva token in MongoDB (collection: portal_tokens) con scadenza 15 minuti
    ├─ Invia email con link: /manage-subscription/verify?token=xxx
    │
    ▼
Frontend mostra: "Ti abbiamo inviato un'email con il link per accedere al portale"

    ... il cliente apre l'email ...

Cliente clicca il link → /manage-subscription/verify?token=xxx
    │
    ▼
API /api/verify-portal-token (GET o POST)
    │
    ├─ Cerca token in MongoDB
    ├─ Verifica che non sia scaduto (< 15 minuti)
    ├─ Verifica che non sia già stato usato (one-time use)
    ├─ Segna token come usato
    ├─ Crea Stripe Billing Portal Session per quel customer
    ├─ Redirect a portalSession.url
    │
    ▼
Stripe Customer Portal
```

---

## Struttura dati: Collection `portal_tokens`

```json
{
  "token": "uuid-random-string",
  "stripeCustomerId": "cus_xxx",
  "customerEmail": "mario@email.com",
  "used": false,
  "expiresAt": "2025-07-01T12:15:00Z",
  "createdAt": "2025-07-01T12:00:00Z"
}
```

Index TTL su `expiresAt` per pulizia automatica MongoDB.

---

## File coinvolti

### Da CREARE

| File | Descrizione |
|------|-------------|
| `src/app/api/verify-portal-token/route.ts` | Verifica token, crea portal session, redirect |
| `src/app/(shop)/manage-subscription/verify/page.tsx` | Pagina che legge il token dalla query string e chiama l'API di verifica |

### Da MODIFICARE

| File | Modifica |
|------|----------|
| `src/app/api/create-portal-session/route.ts` | Non restituisce più `{ url }`. Genera token, salva in MongoDB, invia email. Restituisce `{ sent: true }` |
| `src/app/(shop)/manage-subscription/page.tsx` | Dopo il submit, mostra messaggio "Controlla la tua email" invece di fare redirect |
| `src/lib/email/resend.ts` | Aggiungere metodo `sendPortalAccessEmail(email, link)` (o template dedicato) |

### Da NON toccare

- Stripe Customer Portal (configurazione invariata)
- Webhook subscription (invariato)
- Tutto il resto del flusso subscription

---

## Sicurezza

| Aspetto | Dettaglio |
|---------|-----------|
| **Scadenza token** | 15 minuti dalla generazione |
| **Uso singolo** | Il token viene segnato come `used: true` dopo il primo utilizzo |
| **TTL MongoDB** | I token scaduti vengono eliminati automaticamente |
| **Rate limiting** | (Opzionale) Limitare le richieste per email a max 3 ogni 10 minuti per evitare spam |
| **Nessun dato esposto** | L'API non restituisce più l'URL del portale. Il link arriva solo via email |

---

## Template Email

Oggetto: **Accedi al tuo abbonamento - Olio Galia**

Contenuto:
> Ciao {nome},
>
> Hai richiesto di accedere al portale di gestione del tuo abbonamento.
>
> Clicca il bottone qui sotto per accedere:
>
> **[Gestisci Abbonamento]** → link con token
>
> Questo link è valido per 15 minuti e può essere usato una sola volta.
>
> Se non hai richiesto tu questo accesso, ignora questa email.

---

## Impatto UX

| Prima | Dopo |
|-------|------|
| Inserisci email → redirect immediato al portale | Inserisci email → ricevi email → clicca link → portale |
| 1 step | 3 step (ma sicuro) |

Il trade-off è un passaggio in più per il cliente, ma garantisce che solo il proprietario dell'email possa accedere al portale.
