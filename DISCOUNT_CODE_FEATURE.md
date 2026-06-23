# Feature: Invio Codici Sconto ai Clienti

## Panoramica
L'admin inserisce un codice coupon Stripe già creato, seleziona i clienti che hanno fatto almeno un ordine, e invia l'email con il codice. Ogni invio viene salvato in MongoDB per storico. Il codice viene verificato su Stripe prima dell'invio.

---

## Scaletta implementazione

### Fase 1 — Tipi e template email

- [x] **1.1** `src/types/emailTemplate.ts` — aggiungere `'discount_code'` a `SYSTEM_TEMPLATE_KEYS`
- [x] **1.2** `src/types/emailTemplate.ts` — aggiungere variabili in `TEMPLATE_VARIABLES`:
  `customerName`, `discountCode`, `discountDescription`, `expiryRow`, `customMessage`, `siteUrl`, `logoUrl`
- [x] **1.3** `src/types/emailTemplate.ts` — aggiungere descrizioni variabili in `VARIABLE_DESCRIPTIONS`
- [x] **1.4** `src/types/emailTemplate.ts` — aggiungere `discount_code: 'Codice Sconto'` in `TEMPLATE_NAMES`
- [x] **1.5** `src/types/email.ts` — aggiungere interfaccia `DiscountCodeEmailData`
- [x] **1.6** `src/lib/email/discount-template.ts` — creare file con `createDiscountCodeHTML(locale)` e `getDiscountCodeEmailSubject(locale)`
- [x] **1.7** `src/lib/email/resend.ts` — aggiungere metodo `sendDiscountCode(data)` a `EmailService`

### Fase 2 — Backend: storico + verifica Stripe

- [x] **2.1** `src/types/discountCodeSend.ts` — tipo documento MongoDB (`DiscountCodeSendDocument`, `DiscountCodeSendRecipient`)
- [x] **2.2** `src/app/api/admin/orders/customers/route.ts` — `GET` che aggrega clienti unici dalla collection `orders` (email, nome, numero ordini, data ultimo ordine). Sorgente suggerita, non obbligatoria.
- [x] **2.3** `src/app/api/admin/discount-codes/verify/route.ts` — `POST` che verifica il coupon su Stripe (prova prima come promotion code, poi come coupon ID) e restituisce nome, tipo sconto, valore, scadenza
- [x] **2.4** `src/app/api/admin/discount-codes/send/route.ts` — `POST` che verifica su Stripe, invia email sequenzialmente, salva storico in `discount_code_sends`

### Fase 3 — Backend: storico invii

- [x] **3.1** `src/app/api/admin/discount-codes/route.ts` — `GET` lista storico paginata (senza recipients per alleggerire il payload)
- [x] **3.2** `src/app/api/admin/discount-codes/[id]/route.ts` — `GET` dettaglio singolo invio con lista completa destinatari ed esito

### Fase 4 — Pagina admin

- [x] **4.1** `src/app/admin/discount-codes/page.tsx` — pagina principale con form coupon, verifica Stripe, tab clienti/manuale, lista destinatari unificata, invio, storico
- [x] **4.2** `src/app/admin/discount-codes/[id]/page.tsx` — dettaglio singolo invio con riepilogo e tabella destinatari con esito
- [x] **4.3** `src/app/admin/dashboard/page.tsx` — aggiunta voce "Codici Sconto" nelle Azioni Rapide

---

## Variabili template email `discount_code`

| Variabile | Descrizione |
|---|---|
| `{{customerName}}` | Nome del cliente |
| `{{discountCode}}` | Codice coupon da inserire al checkout |
| `{{discountDescription}}` | Descrizione sconto (es. "10% su tutti i prodotti") |
| `{{expiryDate}}` | Data scadenza (stringa, vuota se nessuna scadenza) |
| `{{customMessage}}` | Messaggio personalizzato dell'admin |
| `{{siteUrl}}` | URL del sito per il CTA |
| `{{logoUrl}}` | URL del logo |

---

## Note tecniche

- Stripe: usare `stripe.promotionCodes.list({ code: '...' })` per cercare per codice leggibile, oppure `stripe.coupons.retrieve(id)` per ID coupon diretto. Gestire entrambi i casi.
- Se la verifica Stripe fallisce (coupon inesistente o scaduto), bloccare l'invio con errore 400 e messaggio chiaro.
- L'invio è bulk ma sequenziale (non parallelo) per non sovraccaricare Resend e rispettare i rate limit.
- Lo storico (`discount_code_sends`) è append-only: non si modifica mai, solo insert.
