# Setup Stripe per Abbonamenti

Guida passo-passo per configurare Stripe e attivare il sistema di abbonamenti.

---

## 1. Creare i Price Ricorrenti

Per ogni combinazione **prodotto × zona × intervallo** che vuoi offrire:

1. Vai su **Stripe Dashboard** → **Products**
2. Seleziona il prodotto (o creane uno nuovo)
3. Clicca **"Add price"**
4. Seleziona **"Recurring"**
5. Imposta l'**importo** (prezzo prodotto + spedizione per quella zona)
6. Imposta l'**intervallo di fatturazione**:
   - `Every 1 month` → corrisponde a **month** (Mensile)
   - `Every 2 months` → corrisponde a **bimonth** (Bimestrale)
   - `Every 3 months` → corrisponde a **quarter** (Trimestrale)
   - `Every 6 months` → corrisponde a **semester** (Semestrale)
7. Valuta: **EUR**
8. Clicca **"Add price"**
9. Copia il **Price ID** generato (es. `price_1Abc123...`)

### Esempio per Olio EVO 500ml

| Zona | Intervallo | Importo (prodotto + spedizione) | Price ID |
|------|------------|--------------------------------|----------|
| Italia | Mensile | €XX,XX | `price_xxx` |
| Italia | Trimestrale | €XX,XX | `price_xxx` |
| Europa | Mensile | €XX,XX | `price_xxx` |
| Europa | Trimestrale | €XX,XX | `price_xxx` |
| ... | ... | ... | ... |

> Non serve creare tutte le 16 combinazioni (4 zone × 4 intervalli). Crea solo quelle che vuoi offrire. Le combinazioni senza Price ID non verranno mostrate al cliente.

---

## 2. Aggiungere Eventi Webhook

L'endpoint webhook è lo stesso degli ordini singoli (`/api/webhooks/stripe`).

1. Vai su **Stripe Dashboard** → **Developers** → **Webhooks**
2. Seleziona il webhook endpoint esistente (es. `https://tuodominio.com/api/webhooks/stripe`)
3. Clicca **"Update details"** o **"Add events"**
4. Aggiungi questi 3 eventi:

| Evento | A cosa serve |
|--------|-------------|
| `customer.subscription.updated` | Aggiorna stato e periodo dell'abbonamento in MongoDB |
| `customer.subscription.deleted` | Segna l'abbonamento come cancellato |
| `invoice.payment_failed` | Segna l'abbonamento come scaduto (past_due) |

> `checkout.session.completed` dovrebbe essere già configurato per gli ordini singoli. Lo stesso evento gestisce anche le subscription (il codice distingue tramite `session.mode`).

### Lista completa eventi che devono essere attivi

| Evento | Per cosa |
|--------|---------|
| `checkout.session.completed` | Ordini singoli + Nuove subscription |
| `customer.subscription.updated` | Aggiornamento subscription |
| `customer.subscription.deleted` | Cancellazione subscription |
| `invoice.payment_failed` | Pagamento fallito subscription |

---

## 3. Configurare il Customer Portal

Il Customer Portal permette ai clienti di gestire il proprio abbonamento (modificare carta, cancellare, vedere fatture).

1. Vai su **Stripe Dashboard** → **Settings** → **Billing** → **Customer Portal**
2. Attiva il portale
3. Configura le sezioni:

### Sezioni da abilitare

| Sezione | Impostazione |
|---------|-------------|
| **Invoice history** | Attiva (i clienti possono vedere e scaricare le fatture) |
| **Payment methods** | Attiva "Customers can update their payment methods" |
| **Cancel subscriptions** | Attiva "Customers can cancel subscriptions" → scegli se cancellare subito o a fine periodo |
| **Pause subscriptions** | (Opzionale) Attiva se vuoi permettere la pausa |

### Return URL

Imposta il **Default return URL** a:

```
https://tuodominio.com/manage-subscription
```

Questo è il link dove il cliente torna dopo aver finito nel portale.

---

## 4. Inserire i Price ID nell'Admin

Dopo aver creato i Price ricorrenti su Stripe:

1. Vai su **Admin** → **Prodotti** → seleziona il prodotto
2. Nella sezione verde **"Configurazione Abbonamento"**:
   - Spunta **"Abilita Abbonamento"**
   - Inserisci i **Price ID** nelle caselle corrispondenti (zona × intervallo)
   - Lascia vuote le combinazioni che non vuoi offrire
3. **Salva** il prodotto

---

## Checklist Finale

- [ ] Price ricorrenti creati su Stripe per le combinazioni desiderate
- [ ] Eventi webhook aggiunti: `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Customer Portal configurato con return URL
- [ ] Price ID inseriti nell'admin del prodotto
- [ ] Checkbox "Abilita Abbonamento" attivata nel prodotto
- [ ] Test con carta di prova (`4242 4242 4242 4242`)
