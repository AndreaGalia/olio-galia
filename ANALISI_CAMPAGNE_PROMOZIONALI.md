# Analisi: Campagne Promozionali su Prodotti (sconti + visibilità FE)

Data analisi: 2026-07-06

## 0. Obiettivo

L'admin vuole poter creare **campagne di sconto su prodotti specifici** (es. "-15% su Olio Premium fino al 31/08"), che:
1. si riflettano realmente sul prezzo pagato al checkout (Stripe);
2. siano **visibili sul sito** (badge, prezzo barrato, ecc.) prima ancora che il cliente arrivi al checkout.

Questo documento descrive lo stato attuale del codice (prodotti, carrello, Stripe, admin), cosa permette l'API di Stripe, e propone un'architettura per implementare la feature.

---

## 1. Stato attuale del codice

### 1.1 Modello prodotto

File: `src/types/products.ts`

- I prodotti vivono in **MongoDB**, collection `products` (nessun ORM/Prisma, client Mongo nativo tramite `connectToDatabase()`).
- Non esiste un DB "di Stripe": Stripe è solo il motore di pagamento. Il prodotto Mongo (`ProductDocument`) contiene tutte le traduzioni + un riferimento opzionale a Stripe:
  - `stripeProductId` / `stripePriceId` — collegamento manuale a un Product/Price creato **manualmente in Stripe Dashboard** (o via API admin), non generato automaticamente dal form prodotto.
  - `price` (string) — prezzo mostrato sul sito, **inserito a mano dall'admin**, non sincronizzato in automatico con Stripe.
  - `originalPrice` (string, opzionale) — prezzo "barrato". **Esiste già** come campo manuale.
  - `variants[]` — ogni variante ha il suo `stripeProductId`/`stripePriceId`/`price`/`originalPrice` indipendenti.
  - `customBadge` e `translations.badge` — campi testo liberi già presenti nello schema e nel form admin (es. "NOVITÀ", "BIO"), **ma non renderizzati da nessuna parte nel frontend** (verificato via grep: usati solo in admin, mai in un componente pubblico).
  - `isSubscribable` + `subscriptionPrices[qty][zona][intervallo]` — sistema abbonamento, con Price ID Stripe ricorrenti dedicati, indipendenti dal prezzo one-shot.

`ProductService.ts` (`getProducts`, `getProductById`, `searchProducts`) legge da Mongo e localizza il documento — **punto unico** da cui passano tutte le pagine pubbliche (catalogo, homepage, pagina prodotto, ricerca). Questo è rilevante: è il posto giusto per iniettare un eventuale prezzo promozionale calcolato.

### 1.2 Dove il prezzo/originalPrice è già mostrato oggi

- **Pagina singolo prodotto** (`src/components/singleProductPage/ProductInfoSection.tsx:118-131`): se `originalPrice` è valorizzato, mostra prezzo barrato + prezzo attuale.
- **Carrello** (`src/components/cartPage/CartItem.tsx`, `src/hooks/useCartCalculations.ts`): calcola un "risparmio totale" facendo `(originalPrice - price) * quantity` per riga, sommato in `OrderSummary.tsx` come riga "Hai risparmiato -€X".
- **Griglia prodotti / Homepage** (`HomepageProductCard*`, riusata sia da `ProductsGrid.tsx` che dalla home): **NON mostra `originalPrice` né alcun badge**. Mostra solo nome e prezzo secco (`HomepageProductCardFooter.tsx:14`). C'è già un overlay pattern per "Sold Out" / "Lista d'attesa" su `HomepageProductCardImage.tsx:27-43` — stesso punto naturale per un badge "PROMO".

Conclusione: **esiste già un'infrastruttura di visualizzazione sconto**, ma (a) è manuale/statica, senza data di inizio/fine, (b) non è collegata a Stripe in alcun modo, (c) è mostrata solo in 2 punti su 4 (manca su griglia catalogo e homepage, i punti con più traffico).

### 1.3 Carrello

`src/contexts/CartContext.tsx`: carrello client-side in `localStorage`, contiene solo `{id, quantity}`. **Nessuna logica di sconto/coupon nel carrello** — i totali "veri" con eventuale sconto vengono calcolati solo lato Stripe al momento del checkout.

### 1.4 Integrazione Stripe — checkout

File: `src/app/api/create-checkout-session/route.ts`

- I `line_items` della Checkout Session **non sono un catalogo statico**: per ogni riga del carrello, il server fa `stripe.products.retrieve(id)` + `stripe.prices.list({product: id, active: true})` e usa `prices.data[0]` (linee 208-228). Quindi il prezzo pagato è sempre quello **attivo su Stripe in quel momento**, non quello scritto in Mongo.
- `allow_promotion_codes: true` (linea 380) è **già attivo**: il cliente può digitare un codice promo Stripe nel form di checkout.
- Non c'è alcun uso di `discounts` (auto-apply) né di coupon prodotto-specifici.
- Gli sconti applicati (via codice manuale del cliente) vengono letti a posteriori da `src/app/api/order-details/route.ts:135-152` espandendo `total_details.breakdown.discounts` della sessione, e salvati nell'ordine (`pricing.discount.code/amount`), visibili in `src/app/admin/orders/[id]/page.tsx:1080-1090`.

### 1.5 Feature già esistente: invio codici sconto (commit `1b2f661`)

`/admin/discount-codes` (vedi `DISCOUNT_CODE_FEATURE.md`): l'admin **crea manualmente un coupon in Stripe Dashboard**, l'app lo verifica (`stripe.promotionCodes.list` / `stripe.coupons.retrieve`) e invia il codice via email a una lista di clienti. Storico in Mongo (`discount_code_sends`).

Questa è una feature **ortogonale** a quella richiesta ora: serve per sconti "1-a-1" via email/codice manuale, non per sconti visibili pubblicamente su un prodotto del catalogo. Va mantenuta così com'è.

### 1.6 Admin gestione prodotti

`src/app/admin/products/create|[id]/edit` + API `src/app/api/admin/products/route.ts`: form ricco (prezzo, categorie, media, varianti, subscription), collegamento a Stripe **manuale** (l'admin incolla `stripeProductId`/`stripePriceId` già creati). La GET admin arricchisce la lista con `stripeData.price` letto live da Stripe solo per mostrarlo in tabella (nessuna scrittura automatica verso Stripe).

---

## 2. Cosa permette l'API di Stripe

Sì, è possibile creare sconti mirati a prodotti specifici via API Stripe, ma con alcuni limiti importanti da conoscere prima di scegliere l'architettura:

- **`stripe.coupons.create()`** supporta `applies_to: { products: ['prod_xxx', ...] }` — un coupon può essere vincolato a uno o più `Product` Stripe specifici (percentuale o importo fisso). Confermato nei types della libreria (`stripe@18.5.0`).
- **`stripe.promotionCodes.create()`** avvolge un coupon in un codice leggibile (es. `ESTATE15`), con vincoli aggiuntivi (scadenza, redemption massime, importo minimo, singolo cliente).
- **Checkout Session**: per applicare uno sconto **senza che il cliente digiti nulla**, si usa il parametro `discounts` in `stripe.checkout.sessions.create(...)`. Vincoli Stripe:
  - `discounts` e `allow_promotion_codes: true` sono **mutuamente esclusivi** nella stessa richiesta (oggi il codice ha sempre `allow_promotion_codes: true`, quindi andrebbe reso condizionale).
  - Il parametro `discounts` accetta **un solo elemento** — Stripe non permette di applicare in automatico due coupon differenti nella stessa sessione. Se nel carrello ci sono due prodotti con **due campagne diverse**, un singolo coupon Stripe non basta a rappresentarle entrambe in automatico nella stessa sessione.
  - Un coupon con `applies_to.products` sconta **solo le righe di quel prodotto**, quindi per una singola campagna su un solo prodotto (o un gruppo di prodotti con lo stesso sconto %) funziona bene.
- **Importante**: i coupon/promotion code di Stripe **non hanno alcun effetto sul sito** finché non si arriva alla Checkout Session. Stripe non "sa" che un prodotto è in offerta ai fini della pagina prodotto o della griglia — quella parte va comunque costruita lato nostro (Mongo + FE), indipendentemente da come si applica lo sconto al pagamento.

**In sintesi**: l'API Stripe basta per *applicare* lo sconto al pagamento in modo affidabile, ma la *fonte di verità* e la *visualizzazione* della campagna (quali prodotti, quanto sconto, quando inizia/finisce, badge da mostrare) devono comunque vivere in un nostro modello dati (Mongo), perché è quello che pilota il frontend.

---

## 3. Opzioni architetturali per l'enforcement al checkout

| Opzione | Come funziona | Pro | Contro |
|---|---|---|---|
| **A. Coupon Stripe con `applies_to.products`, auto-applicato via `discounts`** | Alla creazione/modifica campagna, l'app chiama `stripe.coupons.create({percent_off, applies_to:{products:[...]}})`. Al checkout, se il carrello contiene prodotti di *quella* campagna, si passa `discounts:[{coupon: id}]` invece di `allow_promotion_codes`. | Sconto "certificato" da Stripe, compare nel breakdown ordini già gestito da `order-details/route.ts`; riusa concetti già noti al team (coupon). | Max **una campagna attiva alla volta per sessione** (limite Stripe: un solo discount); va disattivato `allow_promotion_codes` quando una campagna è attiva → il cliente non può più inserire un codice manuale extra nello stesso checkout; serve comunque gestire scadenza/attivazione lato nostro. |
| **B. Prezzo dinamico via `price_data` nella riga di checkout** | Non si tocca il catalogo Price di Stripe: in `buildLineItems()` (create-checkout-session), se il prodotto ha una campagna attiva, si calcola il prezzo scontato e si passa una riga `price_data:{currency, unit_amount: prezzoScontato, product: stripeProductId}` invece di `price: priceId`. | Nessun limite sul numero di campagne simultanee (ogni riga calcola il proprio sconto in autonomia); `allow_promotion_codes` resta sempre attivo → il cliente può cumulare un codice manuale sopra al prezzo già scontato; nessuna chiamata a `coupons.create`, tutta la logica resta in Mongo (stesso posto da cui pilotiamo il FE) → **una sola fonte di verità** per prezzo mostrato e prezzo pagato. | Lo sconto non compare come "discount" separato nel breakdown Stripe (è già dentro il prezzo di riga) — per il riepilogo ordine admin si perde la riga "codice XY: -€Z", ma si può comunque salvare il dettaglio campagna nei metadata dell'ordine. |
| **C. Cambiare il Price attivo su Stripe (creare nuovo Price scontato, disattivare il vecchio)** | La campagna crea un nuovo `Price` su Stripe per il prodotto e disattiva quello corrente; a fine campagna si ripristina. | "Verità" unica lato Stripe. | Fragile: richiede un job schedulato per ripristinare a fine campagna, rischio di race condition con `prices.list().data[0]` (ordine non garantito se ci sono più prezzi attivi), impatta anche eventuali abbonamenti collegati allo stesso Price. Sconsigliato. |

### Raccomandazione

**Opzione B (prezzo dinamico via `price_data`, campagna come dato in Mongo)** è la più adatta a questo progetto perché:
- Il sito ha già un pattern identico: `originalPrice`/`price` sono già manuali e "vincono" per la UI. Basta rendere quel prezzo *calcolato* invece che digitato a mano, e riusarlo anche in checkout invece che nel form.
- Non ha il limite "una sola campagna per sessione" dell'opzione A: ogni prodotto in offerta nel carrello ha lo sconto corretto indipendentemente dagli altri.
- Lascia intatta la feature "codici sconto via email" esistente (`allow_promotion_codes`), che resta sempre disponibile in aggiunta.
- Non richiede di toccare/duplicare oggetti `Price` su Stripe.

L'unico compromesso è la reportistica ordini: la riga "sconto applicato" nel dettaglio ordine admin (oggi popolata da `total_details.breakdown.discounts` di Stripe) andrebbe integrata con le info di campagna salvate nei metadata dell'ordine al momento della creazione della sessione — comunque fattibile.

---

## 4. Architettura proposta

### 4.1 Nuovo modello dati: `PromotionCampaign`

Nuova collection Mongo `promotion_campaigns`:

```ts
interface PromotionCampaign {
  _id?: string;
  id: string;               // slug interno, es. "black-friday-2026"
  name: string;              // etichetta admin
  badgeLabel: { it: string; en: string }; // es. "-15%", "SALDI ESTATE"
  discountType: 'percent' | 'fixed';
  discountValue: number;     // 15 (=%) oppure 5.00 (=€)
  productIds: string[];      // id locali dei prodotti Mongo coinvolti (product.id, non stripeProductId)
  variantIds?: string[];     // opzionale: limita a varianti specifiche
  startDate: Date;
  endDate: Date;
  active: boolean;           // toggle manuale admin, indipendente dalle date
  metadata: { createdAt: Date; updatedAt: Date; createdBy: string };
}
```

Una campagna è "effettivamente attiva" per un prodotto quando `active === true` **e** `now` è tra `startDate` e `endDate`.

### 4.2 Punto di calcolo centralizzato

Aggiungere in `ProductService.localizeProduct` (o subito dopo, in `getProducts`/`getProductById`) un merge con le campagne attive: se il prodotto (o variante) è coperto da una campagna attiva, sovrascrivere a runtime:
- `originalPrice` = prezzo di listino attuale (se non già impostato manualmente)
- `price` = prezzo scontato calcolato
- aggiungere un campo nuovo `activePromotion?: { label: string; discountType; discountValue; endsAt: string }` da usare per il badge.

Così facendo **tutto il resto del sito funziona senza modifiche**: carrello, `useCartCalculations` (già calcola i risparmi da `originalPrice` vs `price`), pagina prodotto, ecc. ereditano il prezzo corretto senza toccarli.

### 4.3 Frontend — dove mostrare la promozione

1. **Badge sulla card prodotto** (griglia catalogo + homepage, componente condiviso `HomepageProductCard*`): aggiungere un overlay in `HomepageProductCardImage.tsx`, stesso pattern già usato per "Sold Out"/"Lista d'attesa" (righe 27-43), con `activePromotion.label` (es. "-15%").
2. **Prezzo barrato sulla card**: estendere `HomepageProductCardFooter.tsx` per mostrare `originalPrice` barrato accanto al prezzo scontato quando presente (oggi mostra solo `product.price`).
3. **Pagina prodotto**: già pronta (`ProductInfoSection.tsx`), basta che arrivi `originalPrice` valorizzato dal backend.
4. **Carrello**: già pronto (riga "hai risparmiato").
5. *(Facoltativo, da decidere insieme)*: banner homepage/PLP con countdown o elenco "prodotti in offerta", eventualmente una sezione "Offerte" con filtro categorie riusando `CategoryFilter.tsx`.

### 4.4 Vincolo trasversale: rispettare lo stile già esistente del sito

**Qualunque componente nuovo (badge promo, banner, form admin) deve seguire lo stile già definito in `src/app/globals.css` e in `style-guide/style-guide.md`, senza introdurre pattern visivi nuovi.** Nello specifico:

- **Non modificare `globals.css`** per fare l'override di un singolo componente (regola esplicita della style guide): eventuali dimensioni/spaziature custom vanno fatte con classi Tailwind esistenti o, se proprio necessario, con `style={{}}` inline (come già fatto per l'`<h1>` del nome prodotto in `ProductInfoSection.tsx`).
- **Colori**: solo i token già definiti in `@theme` (`bg-olive`, `text-olive`, `bg-sabbia`, `bg-sabbia-chiaro`, `bg-beige`, `border-olive/20`, ecc.) — mai esadecimali hardcoded. Un badge "-15%" o "PROMO" dovrebbe quindi usare, ad esempio, `bg-olive text-beige` (coerente col bottone "Aggiungi al carrello") oppure `bg-sabbia text-olive`, non un colore "sconto" arbitrario (niente rosso/arancione tipici dei badge sconto generici, per restare nella palette brand).
- **Tipografia**: badge/etichette usano sempre `font-serif` (= font `termina`, uppercase, tracking largo) definito in `globals.css:88-96`, con le classi di dimensione già presenti (`termina-8`, `termina-9`, `termina-11`, `termina-13`...) invece di `text-[Npx]` arbitrari. Il prezzo barrato riusa lo stesso pattern già presente in `ProductInfoSection.tsx:122` e `CartItem.tsx:26-32`: `font-serif termina-13 text-black line-through`.
- **Niente elementi decorativi pesanti**: no `rounded-*`, no `shadow-*`, no `bg-gradient-to-r`, no `animate-pulse` — vietati esplicitamente dalla style guide (sezione "Da evitare"). Un badge promo deve essere un rettangolo netto (`bg-olive`, angoli vivi), non una "pill" arrotondata con ombra come si vede in molti e-commerce generici.
- **Overlay/badge sulla card prodotto**: riusare esattamente il pattern già presente per "Sold Out"/"Lista d'attesa" in `HomepageProductCardImage.tsx:27-43` (`absolute inset-0` o un angolo con `absolute top-2 left-2`), stessa palette (`bg-olive/70` o `bg-olive`), stesso font (`font-serif termina-11 text-beige tracking-[3.4px] uppercase`).
- **Form/pagine admin nuove** (`/admin/promotions`): seguire lo stile già usato in `/admin/discount-codes` (bordi netti, niente ombre, coerenza con gli altri form admin), non introdurre una libreria UI o un tema diverso.
- **Traduzioni**: qualunque testo statico nuovo (label badge di default, testi form) va aggiunto sia in `src/data/locales/it.json` che in `en.json` tramite `useT()`/`translate()` — mai stringhe hardcoded in italiano o inglese nel componente, come da regola della style guide ("Traduzioni").

In pratica: **prima di scrivere il componente badge/prezzo scontato, va riletto `style-guide/style-guide.md` e riusato quanto già presente** (pattern bottone, pattern overlay, pattern prezzo barrato) invece di crearne uno nuovo da zero.

### 4.4 Backend — checkout

In `create-checkout-session/route.ts::buildLineItems`: dopo aver recuperato `price` da Stripe, controllare se il prodotto ha una campagna attiva (stessa funzione di calcolo usata da `ProductService`, estratta in un helper condiviso `src/lib/promotions/getActivePromotionForProduct.ts`) e in tal caso costruire la riga con `price_data` scontato invece che `price: price.id`. Salvare comunque nei `metadata`/negli item della sessione il riferimento alla campagna (es. `metadata.appliedCampaigns`) per riconciliare poi in `order-details`.

### 4.6 Admin — nuova sezione `/admin/promotions`

- `page.tsx`: lista campagne (nome, prodotti coinvolti, sconto, stato, date), stile coerente con `/admin/discount-codes`.
- `create/page.tsx` e `[id]/edit/page.tsx`: form con selezione multipla prodotti (riuso di `RelatedProductsSelector.tsx`, già esistente per selezionare prodotti in altre schermate admin), tipo/valore sconto, date, badge label IT/EN, toggle attiva/pausa.
- API: `src/app/api/admin/promotions/route.ts` (GET lista, POST crea) e `[id]/route.ts` (GET/PUT/DELETE) — solo Mongo, **nessuna chiamata a Stripe è necessaria** con l'opzione B.
- Voce "Campagne Promozionali" in `/admin/dashboard` Azioni Rapide (stesso pattern usato per "Codici Sconto").

### 4.7 Fuori scope (fase 1, da confermare)

- Abbonamenti (`subscriptionPrices`): hanno Price ID ricorrenti dedicati per zona/intervallo; applicare uno sconto lì richiederebbe toccare Stripe Subscriptions/Invoices, meccanismo diverso da Checkout one-shot. Consigliato escludere le campagne dai prodotti in abbonamento nella prima versione.
- Regole automatiche (es. "10% sopra i 50€ di spesa"): non richieste ora, ma il modello `PromotionCampaign` potrebbe essere esteso in futuro con `minCartAmount`.

---

## 5. Piano di sviluppo (fasi)

1. **Tipi + collection**: `src/types/promotionCampaign.ts`, indice Mongo su `productIds` + `active` + date.
2. **Helper condiviso**: `src/lib/promotions/getActivePromotions.ts` (carica campagne attive, funzione `resolvePromotionForProduct(productId, variantId?)`).
3. **API Admin CRUD**: `src/app/api/admin/promotions/route.ts` + `[id]/route.ts`.
4. **UI Admin**: `/admin/promotions` (lista, create, edit), voce dashboard.
5. **Integrazione `ProductService`**: merge prezzo scontato + `activePromotion` in `localizeProduct`.
6. **FE display**: badge in `HomepageProductCardImage.tsx`, prezzo barrato in `HomepageProductCardFooter.tsx`, eventuale badge anche in `RelatedProductsSection.tsx` (usa lo stesso `HomepageProductCard`, quindi in gran parte gratis).
7. **Checkout**: modifica `buildLineItems` in `create-checkout-session/route.ts` per usare `price_data` scontato quando applicabile.
8. **Riconciliazione ordini**: salvare la campagna applicata nei metadata sessione/ordine, mostrarla in `admin/orders/[id]`.
9. **Test manuale**: creare una campagna su 1 prodotto, verificare badge su griglia/home/PDP, aggiungere al carrello, verificare "hai risparmiato", completare un checkout di test e controllare l'importo pagato + il dettaglio ordine.

---

## 6. Domande aperte (da decidere insieme prima di implementare)

1. **Visualizzazione**: solo badge "-X%" + prezzo barrato, o anche una sezione dedicata "Offerte" in homepage/menu?
2. **Cumulabilità**: se un prodotto è già in campagna, deve essere comunque permesso inserire un codice sconto manuale (`allow_promotion_codes`) sopra al prezzo già scontato? (Con l'opzione B tecnicamente sì, di default — va confermato se è il comportamento voluto lato business.)
3. **Granularità**: campagne per singolo prodotto/variante, o anche per intera categoria?
4. **Scadenza automatica**: la campagna deve "spegnersi" da sola a `endDate` (calcolato a runtime, consigliato) o deve essere l'admin a disattivarla manualmente?
5. **Reportistica**: serve un minimo di analytics per campagna (quanti ordini, quanto fatturato) fin dalla prima versione, o si può aggiungere dopo?
