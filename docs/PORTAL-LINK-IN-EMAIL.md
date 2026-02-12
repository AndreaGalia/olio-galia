# Accesso Portale solo da Link in Email

## Idea

Eliminare la pagina `/manage-subscription` pubblica. Il link per accedere al Customer Portal viene incluso direttamente nelle email che il sistema invia al cliente (conferma abbonamento, rinnovo, pagamento fallito). Nessun form email esposto pubblicamente.

---

## Flusso

```
Cliente si abbona
    │
    ▼
Webhook checkout.session.completed (mode: subscription)
    │
    ├─ Salva subscription in MongoDB
    ├─ Genera un token permanente (univoco per subscription)
    ├─ Salva token nel documento subscription
    ├─ Invia email di conferma CON link: /manage-subscription/access?token=xxx
    │
    ▼
Cliente riceve email di conferma
    │
    ├─ Vede dettagli abbonamento
    ├─ Vede bottone "Gestisci Abbonamento" con link tokenizzato
    │
    ▼ (clicca il link)
Pagina /manage-subscription/access?token=xxx
    │
    ▼
API /api/portal-access (POST con token)
    │
    ├─ Cerca subscription per token in MongoDB
    ├─ Se non trovato o subscription cancellata → errore
    ├─ Crea Stripe Billing Portal Session con stripeCustomerId
    ├─ Redirect a portalSession.url
    │
    ▼
Stripe Customer Portal
```

### Email successive (rinnovo, pagamento fallito)

Ogni email inviata relativa all'abbonamento include lo stesso link tokenizzato. Il cliente può sempre accedere al portale dall'ultima email ricevuta.

---

## Struttura dati: campo aggiunto a collection `subscriptions`

```json
{
  "stripeSubscriptionId": "sub_xxx",
  "stripeCustomerId": "cus_xxx",
  "customerEmail": "mario@email.com",
  "portalAccessToken": "random-uuid-generato-alla-creazione",
  "..."
}
```

Nessuna collection aggiuntiva. Il token vive dentro il documento subscription già esistente.

---

## File coinvolti

### Da CREARE

| File | Descrizione |
|------|-------------|
| `src/app/api/portal-access/route.ts` | Riceve token, cerca subscription, crea portal session, restituisce URL |
| `src/app/(shop)/manage-subscription/access/page.tsx` | Pagina che legge token dalla query string, chiama API, fa redirect al portale |

### Da MODIFICARE

| File | Modifica |
|------|----------|
| `src/services/subscriptionService.ts` | In `createSubscription`: generare e salvare `portalAccessToken` (crypto.randomUUID). Aggiungere metodo `findByPortalToken(token)` |
| `src/app/api/webhooks/stripe/route.ts` | Dopo aver salvato la subscription, inviare email di conferma con link tokenizzato |
| `src/lib/email/resend.ts` | Aggiungere metodo/template `sendSubscriptionConfirmation(email, productName, interval, portalLink)` |
| `src/app/(shop)/manage-subscription/page.tsx` | Rimuovere il form email. Sostituire con pagina informativa: "Il link per gestire il tuo abbonamento si trova nelle email che ti abbiamo inviato" |

### Da ELIMINARE (o svuotare)

| File | Motivo |
|------|--------|
| `src/app/api/create-portal-session/route.ts` | Non più necessario: l'accesso avviene solo via token |

### Da NON toccare

- Configurazione Stripe Customer Portal (invariata)
- Webhook subscription.updated / deleted / invoice.payment_failed (invariati)
- Flusso ordini singoli (invariato)

---

## Sicurezza

| Aspetto | Dettaglio |
|---------|-----------|
| **Nessun form pubblico** | Non esiste più un endpoint che accetta email e restituisce URL portale |
| **Token per subscription** | Ogni abbonamento ha il suo token univoco |
| **Token non scade** | È valido finché l'abbonamento è attivo (più semplice, meno manutenzione) |
| **Accesso solo da email** | Solo chi riceve le email dell'abbonamento può accedere |
| **Revoca automatica** | Se l'abbonamento viene cancellato, il token non funziona più |
| **Nessuna collection extra** | Il token è un campo del documento subscription |

---

## Email: Conferma Abbonamento

Oggetto: **Il tuo abbonamento è attivo - Olio Galia**

> Ciao {nome},
>
> Il tuo abbonamento è stato attivato con successo!
>
> **Prodotto:** {productName}
> **Frequenza:** {intervallo}
> **Zona:** {zona}
>
> Puoi gestire il tuo abbonamento in qualsiasi momento:
>
> **[Gestisci Abbonamento]** → /manage-subscription/access?token=xxx
>
> Da lì potrai modificare la carta, vedere le fatture o cancellare l'abbonamento.
>
> Conserva questa email per accedere al portale in futuro.

---

## Confronto con Magic Link

| | Magic Link | Link in Email |
|--|-----------|---------------|
| **Pagina pubblica** | Sì (form email) | No (solo pagina informativa) |
| **Collection extra** | Sì (portal_tokens) | No (campo in subscriptions) |
| **Token scade** | Sì (15 min) | No (valido finché subscription attiva) |
| **Invio email on-demand** | Sì (ogni richiesta) | No (solo nelle email di sistema) |
| **UX cliente** | Inserisce email → riceve link → clicca | Apre email già ricevuta → clicca |
| **Complessità** | Media (gestione scadenza, pulizia) | Bassa (solo un campo in più) |
| **Superficie di attacco** | Bassa (token temporaneo) | Molto bassa (nessun endpoint pubblico) |
| **Limite** | Nessuno | Il cliente deve conservare l'email |
