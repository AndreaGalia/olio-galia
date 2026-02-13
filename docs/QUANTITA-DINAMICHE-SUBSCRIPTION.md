# Quantita Dinamiche per Abbonamenti - Changelog

Data: 13 Febbraio 2026

Riferimento sistema: `docs/SUBSCRIPTION-SYSTEM.md`

---

## Panoramica

Aggiunta la possibilita di gestire **quantita multiple per prodotto** negli abbonamenti Stripe.
Prima la matrice dei prezzi era solo `zona x intervallo`. Ora e `quantita x zona x intervallo`.

L'admin decide quante opzioni di quantita offrire per ogni prodotto (1, 2, 3, 4... senza limiti hardcoded).
Il frontend rileva automaticamente le quantita disponibili dal dato salvato.

---

## Bug fix: matrici che si svuotavano al salvataggio

### Problema

Nella pagina di modifica prodotto, salvando dopo aver compilato solo un tab quantita (es. "1 Bottiglia"), i prezzi degli altri tab (es. "2 Bottiglie", "3 Bottiglie") venivano cancellati.

### Causa

La funzione `validateAndEnrichSubscriptionPrices` nell'API accettava solo stringhe:

```typescript
// PRIMA (bug)
for (const [interval, priceId] of Object.entries(intervals)) {
  if (!priceId || typeof priceId !== 'string' || !priceId.trim()) continue;
  // ...
}
```

Quando il prodotto veniva caricato dal DB, i tab non modificati contenevano oggetti `{ priceId: "price_xxx", amount: 29.90 }` (formato arricchito), mentre i tab appena editati contenevano stringhe `"price_xxx"` (dal campo input). La validazione scartava gli oggetti perche non erano stringhe.

### Fix

La funzione ora accetta entrambi i formati:

```typescript
// DOPO (fix)
for (const [interval, entry] of Object.entries(intervals)) {
  let id: string | undefined;
  if (typeof entry === 'string' && entry.trim()) {
    id = entry.trim();
  } else if (entry && typeof entry === 'object' && 'priceId' in entry) {
    id = (entry as any).priceId.trim();
  }
  if (!id) continue;
  // ...
}
```

| File modificato | Modifica |
|-----------------|----------|
| `src/app/api/admin/products/[id]/route.ts` | `validateAndEnrichSubscriptionPrices` accetta string e oggetti |
| `src/app/api/admin/products/route.ts` | Stessa fix (funzione duplicata per la route POST) |

---

## Nuovo formato dati: `subscriptionPrices`

### Struttura in MongoDB

Il campo `subscriptionPrices` sul prodotto ha questa struttura (le chiavi quantita sono stringhe numeriche):

```json
{
  "subscriptionPrices": {
    "1": {
      "italia": {
        "month": { "priceId": "price_xxx", "amount": 29.90 },
        "bimonth": { "priceId": "price_yyy", "amount": 54.90 },
        "quarter": { "priceId": "price_zzz", "amount": 79.90 }
      },
      "europa": { ... }
    },
    "2": {
      "italia": {
        "month": { "priceId": "price_aaa", "amount": 49.90 },
        ...
      }
    },
    "5": {
      "italia": { ... }
    }
  }
}
```

Le chiavi quantita (`"1"`, `"2"`, `"5"`) sono **dinamiche**: l'admin aggiunge/rimuove quelle che vuole. Non esiste un limite hardcoded.

### Compatibilita con vecchio formato

Il campo legacy `stripeRecurringPriceIds` (zona x intervallo, senza quantita) rimane supportato come fallback per qty=1. La logica di lookup nel checkout e nel frontend controlla prima `subscriptionPrices`, poi fa fallback su `stripeRecurringPriceIds`.

---

## Modifiche ai tipi TypeScript

| File | Prima | Dopo |
|------|-------|------|
| `src/types/subscription.ts` | `SubscriptionQuantity = 1 \| 2 \| 3` | `SubscriptionQuantity = number` |
| `src/types/subscription.ts` | `QuantityPriceMap = { [qty in 1\|2\|3]?: ... }` | `QuantityPriceMap = Record<number, ...>` |
| `src/types/subscription.ts` | `SUBSCRIPTION_QUANTITIES = [1, 2, 3]` | Rimosso (non serve piu) |

---

## Admin: tab quantita dinamici

### Comportamento

- I tab vengono generati dinamicamente dalle chiavi presenti in `subscriptionPrices`
- Bottone **"+ Aggiungi"**: crea un nuovo tab con quantita incrementale (es. se esiste 1 e 2, il prossimo e 3)
- Bottone **"x"** su ogni tab: rimuove quel tab quantita (deve restarne almeno 1)
- La pagina di creazione parte con un solo tab "1 Bottiglia"
- La pagina di modifica mostra i tab gia salvati nel prodotto

### File modificati

| File | Modifica |
|------|----------|
| `src/app/admin/products/[id]/edit/page.tsx` | Tab dinamici con add/remove, derivati da `Object.keys(subscriptionPrices)` |
| `src/app/admin/products/create/page.tsx` | Tab dinamici con add/remove, init con solo `'1'` |

### Codice chiave (logica comune a entrambe le pagine)

```typescript
// Derive tab dalla struttura dati
const qtyTabs = subscriptionPrices
  ? Object.keys(subscriptionPrices).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b)
  : [];
if (qtyTabs.length === 0) qtyTabs.push(1);
const nextQty = Math.max(...qtyTabs) + 1;
```

---

## Frontend: auto-detect quantita

### Comportamento

Il `SubscriptionForm.tsx` rileva automaticamente le quantita disponibili senza array hardcoded:

```typescript
const availableQuantities: number[] = (() => {
  const qtys: number[] = [];
  if (hasNewFormat && productAny.subscriptionPrices) {
    for (const key of Object.keys(productAny.subscriptionPrices)) {
      const n = Number(key);
      if (!isNaN(n) && hasNewFormatQty(n)) qtys.push(n);
    }
  }
  if (hasLegacyPrices && !qtys.includes(1)) qtys.push(1);
  return qtys.sort((a, b) => a - b);
})();
```

- Se c'e solo 1 quantita disponibile, lo step quantita viene comunque mostrato (UX consistente)
- Le label si adattano dinamicamente: "1 pz", "2 pz", "5 pz", etc.
- Cambiando quantita si resetta la selezione zona/intervallo

### File modificati

| File | Modifica |
|------|----------|
| `src/components/subscriptionPage/SubscriptionForm.tsx` | Auto-detect quantita, label dinamiche, rimosso import `SUBSCRIPTION_QUANTITIES` |

---

## API: validazione quantita

### `create-subscription-session`

La validazione non usa piu un array hardcoded `[1, 2, 3]`:

```typescript
// PRIMA
const VALID_QUANTITIES: SubscriptionQuantity[] = [1, 2, 3];
if (!VALID_QUANTITIES.includes(quantity)) { ... }

// DOPO
if (!quantity || quantity < 1 || !Number.isInteger(quantity)) { ... }
```

La vera validazione avviene implicitamente: se la combinazione `qty/zona/intervallo` non esiste in `subscriptionPrices`, la sessione non viene creata.

| File | Modifica |
|------|----------|
| `src/app/api/create-subscription-session/route.ts` | Validazione generica (intero >= 1), rimosso `VALID_QUANTITIES` |

---

## Notifiche (email + Telegram)

La quantita viene gia tracciata nei metadata della sessione Stripe e salvata nel documento subscription. Le email e le notifiche Telegram mostrano la quantita solo quando e > 1 (nessuna modifica necessaria per questo changelog, era gia implementato nella sessione precedente).

---

## Flusso completo aggiornato

```
ADMIN                           STRIPE DASHBOARD
  |                                    |
  |  1. Crea Price ricorrenti         |
  |     (uno per ogni combo            |
  |      qty x zona x intervallo)      |
  |                                    |
  |  2. Nel pannello admin:            |
  |     - Abilita "Subscribable"       |
  |     - Click "+ Aggiungi" per       |
  |       ogni quantita desiderata     |
  |     - Inserisci i Price ID         |
  |       nelle griglie zona x freq    |
  |     - Salva (validazione Stripe)   |
  |                                    |

CLIENTE (Frontend)
  |
  |  1. Pagina prodotto -> "Abbonati"
  |  2. Seleziona quantita (auto-detect dal dato)
  |  3. Seleziona zona spedizione
  |  4. Seleziona frequenza (con prezzo mostrato)
  |  5. Checkout Stripe
  |  6. Webhook salva subscription con quantity
  |  7. Email/Telegram includono quantita
```

---

## Riepilogo file modificati

| File | Tipo modifica |
|------|---------------|
| `src/types/subscription.ts` | Tipi: `SubscriptionQuantity = number`, `QuantityPriceMap = Record<number, ...>`, rimosso `SUBSCRIPTION_QUANTITIES` |
| `src/app/api/admin/products/[id]/route.ts` | Bug fix validazione + supporto quantita dinamiche |
| `src/app/api/admin/products/route.ts` | Bug fix validazione + supporto quantita dinamiche |
| `src/app/api/create-subscription-session/route.ts` | Validazione generica quantita |
| `src/app/admin/products/[id]/edit/page.tsx` | Tab quantita dinamici con add/remove |
| `src/app/admin/products/create/page.tsx` | Tab quantita dinamici con add/remove, init con solo qty=1 |
| `src/components/subscriptionPage/SubscriptionForm.tsx` | Auto-detect quantita, label dinamiche |
