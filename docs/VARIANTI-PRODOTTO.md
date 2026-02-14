# Varianti Prodotto - Piano di Implementazione

Data: 13 Febbraio 2026

---

## Panoramica

Aggiunta della possibilità di creare **varianti per prodotto**. Un prodotto resta un singolo documento in MongoDB, ma può avere più varianti (es: "Beauty Oil" con variante "Zagara" e variante "Gelsomino"). Ogni variante ha il proprio prodotto Stripe e prezzo Stripe separato.

**Esempio concreto:**
- Prodotto: "Beauty Oil"
- Variante 1: "Zagara" → `prod_zagara` / `price_zagara` su Stripe → €28.00
- Variante 2: "Gelsomino" → `prod_gelsomino` / `price_gelsomino` su Stripe → €28.00

I prodotti **senza varianti** continuano a funzionare esattamente come prima (nessuna breaking change).

---

## Fase 1: Modello dati

### File: `src/types/products.ts`

Aggiungere l'interfaccia `ProductVariant` e il campo `variants` a `BaseProduct`:

```typescript
// Variante di un prodotto (es: fragranza, formato, colore)
export interface ProductVariantTranslations {
  variantName: string;    // "Zagara", "Gelsomino"
  description?: string;   // Descrizione specifica variante (opzionale)
}

export interface ProductVariant {
  variantId: string;              // ID univoco: "zagara", "gelsomino"
  stripeProductId: string;        // prod_xxx (diverso per ogni variante)
  stripePriceId: string;          // price_xxx (diverso per ogni variante)
  price: string;                  // Prezzo (può variare tra varianti)
  originalPrice?: string;         // Prezzo originale (per sconti)
  inStock: boolean;
  stockQuantity: number;
  images: string[];               // Immagini della variante (obbligatorie, ogni variante ha le sue foto)
  color?: string;                 // Colore specifico della variante
  translations: {
    it: ProductVariantTranslations;
    en: ProductVariantTranslations;
  };
}
```

In `BaseProduct`, aggiungere:

```typescript
export interface BaseProduct {
  // ... campi esistenti ...
  variants?: ProductVariant[];          // Array varianti (opzionale)
  variantLabel?: {                      // Label per il selettore UI
    it: string;                         // "Fragranza", "Formato", "Colore"
    en: string;                         // "Fragrance", "Format", "Color"
  };
}
```

### Logica

- Se `variants` è `undefined` o array vuoto → prodotto senza varianti (comportamento attuale)
- Se `variants` ha almeno 1 elemento → il prodotto usa le varianti
- I campi `stripeProductId`, `stripePriceId`, `price`, `inStock`, `stockQuantity` a livello root vengono **ignorati** quando ci sono varianti (si usano quelli della variante selezionata)
- I campi `weight`, `size`, `category`, `translations`, `slug` restano a livello root (condivisi tra varianti)
- Le `images` a livello root restano le foto generiche del prodotto (usate nella ProductCard del catalogo)
- Ogni variante ha le **proprie immagini obbligatorie** — nella pagina prodotto si mostrano le foto della variante selezionata

---

## Fase 2: ID composto nel carrello

### Convenzione ID

Per distinguere un prodotto senza varianti da uno con variante nel carrello:

```
Senza varianti:  "local_beauty-oil"        (come oggi)
Con variante:    "local_beauty-oil::zagara" (productId::variantId)
```

Il separatore `::` è stato scelto perché non appare mai in slug o ID esistenti.

### File: `src/contexts/CartContext.tsx`

Nessuna modifica strutturale. Il `CartItem` resta `{ id: string, quantity: number }`. L'unica differenza è che `id` ora può contenere `::`.

### Helper functions (nuovo file): `src/utils/variantHelpers.ts`

```typescript
// Parsing dell'ID composto
export function parseCartItemId(cartItemId: string): {
  productId: string;
  variantId: string | null;
} {
  const parts = cartItemId.split('::');
  return {
    productId: parts[0],
    variantId: parts.length > 1 ? parts[1] : null,
  };
}

// Costruzione dell'ID composto
export function buildCartItemId(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

// Dato un prodotto e un variantId, restituisce prezzo/stock/immagini corretti
export function getVariantOrProduct(product: Product, variantId: string | null) {
  if (!variantId || !product.variants?.length) {
    return {
      price: product.price,
      originalPrice: product.originalPrice,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      images: product.images,
      stripeProductId: product.stripeProductId,
      stripePriceId: product.stripePriceId,
      variantName: null,
    };
  }

  const variant = product.variants.find(v => v.variantId === variantId);
  if (!variant) throw new Error(`Variante ${variantId} non trovata`);

  return {
    price: variant.price,
    originalPrice: variant.originalPrice,
    inStock: variant.inStock,
    stockQuantity: variant.stockQuantity,
    images: variant.images,
    stripeProductId: variant.stripeProductId,
    stripePriceId: variant.stripePriceId,
    variantName: variant.translations, // verrà localizzato dal chiamante
  };
}
```

---

## Fase 3: Pagina prodotto (selettore variante)

### File: `src/components/singleProductPage/ProductInfoSection.tsx`

Aggiungere state per la variante selezionata e un selettore UI:

```
Stato attuale:
  [Prezzo] [Quantità] [Aggiungi al carrello]

Con varianti:
  [Selettore: Zagara | Gelsomino]    ← NUOVO
  [Prezzo variante] [Quantità] [Aggiungi al carrello]
```

**Logica:**

1. Se `product.variants` esiste e ha elementi → mostra il selettore
2. La prima variante è selezionata di default
3. Quando cambia variante: aggiorna prezzo, stock, immagini mostrate
4. `handleAddToCart` usa `buildCartItemId(product.id, selectedVariant.variantId)`

**UI del selettore** (bottoni stile toggle, coerente col design):

```tsx
{product.variants && product.variants.length > 0 && (
  <div className="mb-4">
    <label className="text-sm font-medium text-olive mb-2 block">
      {product.variantLabel?.[locale] || 'Variante'}
    </label>
    <div className="flex gap-2 flex-wrap">
      {product.variants.map((variant) => (
        <button
          key={variant.variantId}
          onClick={() => setSelectedVariant(variant)}
          className={`px-4 py-2 border transition-colors ${
            selectedVariant?.variantId === variant.variantId
              ? 'bg-olive text-beige border-olive'
              : 'border-olive/20 text-olive hover:bg-olive/10'
          }`}
        >
          {variant.translations[locale].variantName}
        </button>
      ))}
    </div>
  </div>
)}
```

### File: `src/components/singleProductPage/ProductImageGallery.tsx`

Quando l'utente seleziona una variante, la gallery mostra le immagini della variante selezionata. Il componente riceve già `images` come prop, quindi basta passare `selectedVariant.images` dalla pagina prodotto.

---

## Fase 4: Carrello e calcoli

### File: `src/hooks/useCartCalculations.ts`

Il `products.find()` ora deve considerare l'ID composto:

```typescript
// PRIMA
const product = products.find((p: Product) => p.id === cartItem.id);
const price = parseFloat(product.price);

// DOPO
const { productId, variantId } = parseCartItemId(cartItem.id);
const product = products.find((p: Product) => p.id === productId);
if (!product) return total;
const resolved = getVariantOrProduct(product, variantId);
const price = parseFloat(resolved.price);
```

### File: `src/hooks/useCartWeight.ts`

Stessa modifica per il parsing dell'ID. Il peso resta quello del prodotto padre (le varianti condividono lo stesso peso/formato fisico).

### File: `src/components/cartPage/CartItem.tsx`

Mostrare il nome della variante sotto il nome del prodotto:

```
Beauty Oil              ← product.name (invariato)
  Fragranza: Zagara     ← variant.translations[locale].variantName (NUOVO)
€28.00 | 250ml
```

Il componente riceve già `product` come prop. Dovrà ricevere anche `variantId` (o il `cartItem.id` completo) per estrarre il nome della variante.

### File: `src/components/cartPage/CheckoutWizard.tsx` (riga 120)

Il `products.find()` deve usare `parseCartItemId`:

```typescript
// PRIMA
const product = products.find((p: Product) => p.id === cartItem.id);

// DOPO
const { productId } = parseCartItemId(cartItem.id);
const product = products.find((p: Product) => p.id === productId);
```

### File: `src/app/(shop)/cart/page.tsx` (righe 93-100)

La funzione `canUseStripeCheckout()` deve verificare gli ID Stripe delle varianti:

```typescript
// PRIMA
return cartProducts.every(product =>
  product?.stripeProductId && product?.stripePriceId
);

// DOPO
return cart.every(cartItem => {
  const { productId, variantId } = parseCartItemId(cartItem.id);
  const product = products.find((p: Product) => p.id === productId);
  if (!product) return false;
  const resolved = getVariantOrProduct(product, variantId);
  return resolved.stripeProductId && resolved.stripePriceId;
});
```

---

## Fase 5: Checkout (create-checkout-session)

### File: `src/app/api/create-checkout-session/route.ts`

### Funzione `mapLocalIdsToStripeIds`

Questa è la modifica chiave. Deve gestire l'ID composto:

```typescript
const mapLocalIdsToStripeIds = async (items: CartItem[]) => {
  const { db } = await connectToDatabase();
  const mappedItems: CartItem[] = [];

  for (const item of items) {
    // Parse ID composto (es: "local_beauty-oil::zagara")
    const { productId, variantId } = parseCartItemId(item.id);

    if (productId.startsWith('local_')) {
      const mongoProduct = await db.collection('products').findOne({ id: productId });
      if (!mongoProduct) throw new Error(`Prodotto non trovato: ${productId}`);

      let stripeProductId: string;

      if (variantId && mongoProduct.variants?.length) {
        // Prodotto con variante → usa stripeProductId della variante
        const variant = mongoProduct.variants.find(
          (v: any) => v.variantId === variantId
        );
        if (!variant) throw new Error(`Variante "${variantId}" non trovata per "${productId}"`);
        if (!variant.stripeProductId) throw new Error(`Variante "${variantId}" non configurata su Stripe`);
        stripeProductId = variant.stripeProductId;
      } else {
        // Prodotto senza variante → comportamento attuale
        if (!mongoProduct.stripeProductId) {
          throw new Error(`Prodotto non disponibile per checkout online`);
        }
        stripeProductId = mongoProduct.stripeProductId;
      }

      mappedItems.push({ ...item, id: stripeProductId });
    } else {
      mappedItems.push(item);
    }
  }

  return mappedItems;
};
```

### Funzione `calculateCartWeight`

Stessa logica: parsing dell'ID composto, ma il peso si prende dal prodotto padre:

```typescript
const calculateCartWeight = async (items: CartItem[]): Promise<number> => {
  const { db } = await connectToDatabase();
  let totalGrams = 0;

  for (const item of items) {
    const { productId } = parseCartItemId(item.id);
    const product = await db.collection('products').findOne({
      $or: [{ id: productId }, { stripeProductId: productId }]
    });
    if (product?.weight) {
      totalGrams += product.weight * item.quantity;
    }
  }
  return totalGrams;
};
```

### Resto del flusso checkout

`buildLineItems` lavora già con gli ID Stripe mappati → **nessuna modifica**. Stripe riceve i `price_id` corretti della variante e crea i line items di conseguenza.

---

## Fase 6: Post-pagamento (webhook → ordine → email)

### File: `src/app/api/webhooks/stripe/route.ts` — NESSUNA MODIFICA

Il webhook riceve l'evento `checkout.session.completed` e chiama `/api/order-details`. I dati arrivano da Stripe con i nomi dei prodotti Stripe.

### File: `src/app/api/order-details/route.ts` — NESSUNA MODIFICA

Estrae i line items dalla sessione Stripe. Ogni line item ha:
- `name`: il nome del prodotto su Stripe (es: "Beauty Oil - Zagara")
- `price`: il prezzo Stripe della variante
- `quantity`: la quantità

Il nome viene direttamente da Stripe, quindi se il prodotto su Stripe si chiama "Beauty Oil - Zagara", apparirà così nell'ordine.

### File: `src/app/api/save-order/route.ts` — NESSUNA MODIFICA

Salva l'ordine con i dati ricevuti da `/api/order-details`. Il campo `items` dell'ordine contiene `name`, `quantity`, `price`, `image` — tutti provenienti da Stripe.

### File: `src/lib/email/resend.ts` — NESSUNA MODIFICA

L'email di conferma ordine usa i dati dell'ordine salvato:
```
{{items}} → iterazione su items[].name, items[].quantity, items[].price
```

Se su Stripe il prodotto si chiama "Beauty Oil - Zagara", nell'email apparirà:

```
✓ Beauty Oil - Zagara    x1    €28.00
✓ Beauty Oil - Gelsomino x1    €28.00
```

### File: `src/types/email.ts` — NESSUNA MODIFICA

L'interfaccia `EmailOrderData.items` ha già `name: string` che conterrà il nome completo con variante.

### Notifiche Telegram / WhatsApp — NESSUNA MODIFICA

Usano gli stessi dati dell'ordine con i nomi provenienti da Stripe.

### Pagina success (`checkout/success`) — NESSUNA MODIFICA

Mostra i line items dell'ordine con nome e prezzo da Stripe.

---

## Fase 7: Pagina catalogo (ProductCard)

### File: `src/components/productsPage/ProductCard.tsx`

Per i prodotti con varianti, mostrare "da €X" se i prezzi differiscono:

```typescript
// Se ha varianti con prezzi diversi
if (product.variants?.length) {
  const prices = product.variants.map(v => parseFloat(v.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    // Tutte le varianti stesso prezzo → mostra prezzo normale
    displayPrice = `€${minPrice.toFixed(2)}`;
  } else {
    // Prezzi diversi → mostra "da €X"
    displayPrice = `da €${minPrice.toFixed(2)}`;
  }
}
```

Il click sulla card porta alla pagina prodotto dove l'utente seleziona la variante.

---

## Fase 8: Admin Panel

La gestione varianti deve essere integrata nelle pagine di creazione e modifica prodotto dell'admin panel. Stile e struttura devono essere coerenti con le sezioni esistenti (Stripe, Abbonamenti, Immagini, ecc.).

### File da modificare

1. `src/app/admin/products/create/page.tsx` — Form creazione prodotto
2. `src/app/admin/products/[id]/edit/page.tsx` — Form modifica prodotto
3. `src/app/api/admin/products/route.ts` — API POST (creazione)
4. `src/app/api/admin/products/[id]/route.ts` — API PUT (aggiornamento)

### Nuova sezione "Varianti Prodotto" nel form

Aggiungere dopo la sezione "Configurazione Stripe" e prima di "Configurazione Abbonamento". UI simile alla sezione abbonamenti con checkbox di attivazione + contenuto condizionale.

#### Checkbox di attivazione

```
[x] Questo prodotto ha varianti
    Attiva per prodotti con più versioni (es: fragranze diverse, formati diversi).
    Quando attivo, i campi Stripe/prezzo/stock del prodotto base vengono ignorati
    e ogni variante avrà i propri.
```

Quando la checkbox è attiva, i campi `stripeProductId`, `stripePriceId`, `price`, `originalPrice` nella sezione "Informazioni Base" e "Configurazione Stripe" vengono **disabilitati** (grayed out) con un avviso: "Questi campi sono gestiti a livello di variante".

#### Campo "Label Variante"

Due input per IT/EN:
```
Label Variante (IT): [Fragranza          ]
Label Variante (EN): [Fragrance          ]
```

Questo è il testo mostrato nel selettore sulla pagina prodotto (es: "Fragranza", "Formato", "Colore").

#### Lista varianti con tab dinamici

Stessa UI dei tab quantità abbonamento. Ogni variante è un tab:

```
[Zagara] [Gelsomino] [+ Aggiungi]
```

Ogni tab contiene:

**Informazioni variante:**
```
ID Variante:        [zagara]              ← auto-generato dal nome IT, editabile
Nome IT *:          [Zagara]
Nome EN *:          [Orange Blossom]
Descrizione IT:     [Profumo delicato...] ← opzionale
Descrizione EN:     [Delicate scent...]   ← opzionale
```

**Configurazione Stripe variante:**
```
Stripe Product ID *: [prod_xxxxxxxxxxxxx]
Stripe Price ID *:   [price_xxxxxxxxxxxxx]
Prezzo (€) *:        [28.00]
Prezzo Originale (€): [32.00]             ← opzionale, per sconti
```

**Stock variante:**
```
Stock disponibile:   [50] unità
```

**Immagini variante (obbligatorie):**

Stessa UI della sezione immagini esistente, ma per ogni singola variante. Ogni variante ha le proprie foto.

```
[https://esempio.com/beauty-oil-zagara-1.jpg] [Rimuovi]
[https://esempio.com/beauty-oil-zagara-2.jpg] [Rimuovi]
[+ Aggiungi Immagine]
```

**Pulsante rimuovi variante:**
```
[Rimuovi variante "Zagara"] ← rosso, con conferma
```

### Stato nel form (`ProductFormData` / `ProductWithStripe`)

#### Create page — aggiungere a `ProductFormData`:

```typescript
// In ProductFormData aggiungere:
hasVariants: boolean;
variantLabel: {
  it: string;
  en: string;
};
variants: Array<{
  variantId: string;
  stripeProductId: string;
  stripePriceId: string;
  price: string;
  originalPrice: string;
  stockQuantity: number;
  inStock: boolean;
  images: string[];
  translations: {
    it: { variantName: string; description: string };
    en: { variantName: string; description: string };
  };
}>;
```

Default:
```typescript
hasVariants: false,
variantLabel: { it: '', en: '' },
variants: [],
```

#### Edit page — il prodotto caricato da MongoDB contiene già `variants` e `variantLabel`, quindi vengono pre-popolati automaticamente nel form.

### Validazione al submit

Quando `hasVariants` è attivo:

1. Almeno 1 variante deve essere presente
2. Ogni variante deve avere:
   - `variantId` non vuoto e univoco tra le varianti
   - Nome IT e Nome EN non vuoti
   - `stripeProductId` (formato `prod_xxx`) e `stripePriceId` (formato `price_xxx`)
   - Prezzo > 0
   - Almeno 1 immagine
3. I campi `stripeProductId`/`stripePriceId`/`price` a livello root **non** vengono validati (sono ignorati)

### API backend

#### POST `/api/admin/products` (creazione)

Se il body contiene `hasVariants: true`:
- Salvare `variants` e `variantLabel` nel documento MongoDB
- **Non** validare `stripeProductId`/`stripePriceId` a livello root (possono essere vuoti)
- Validare che ogni variante abbia `stripeProductId` e `stripePriceId` con formato corretto
- Validare che ogni variante abbia almeno un'immagine
- Impostare `inStock` di ogni variante in base a `stockQuantity > 0`

#### PUT `/api/admin/products/[id]` (aggiornamento)

Stessa logica del POST. Se il prodotto passa da "senza varianti" a "con varianti" (o viceversa), aggiornare di conseguenza.

#### Gestione stock varianti

Nella sezione "Gestione Stock Rapida" della pagina edit, se il prodotto ha varianti, mostrare lo stock per variante invece dello stock singolo:

```
Gestione Stock Rapida
  Zagara:    [50] unità
  Gelsomino: [30] unità
```

Ogni aggiornamento stock deve aggiornare sia MongoDB che Stripe metadata (`available_quantity`) del prodotto Stripe della variante specifica.

### Esempio documento MongoDB risultante

```json
{
  "id": "local_1707840000_abc123",
  "category": "beauty",
  "size": "250ml",
  "weight": 250,
  "images": ["/img/beauty-oil-generic.jpg"],
  "variantLabel": {
    "it": "Fragranza",
    "en": "Fragrance"
  },
  "variants": [
    {
      "variantId": "zagara",
      "stripeProductId": "prod_zagara_xxx",
      "stripePriceId": "price_zagara_xxx",
      "price": "28.00",
      "originalPrice": null,
      "inStock": true,
      "stockQuantity": 50,
      "images": [
        "/img/beauty-oil-zagara-1.jpg",
        "/img/beauty-oil-zagara-2.jpg"
      ],
      "translations": {
        "it": { "variantName": "Zagara", "description": "Profumo di fiori d'arancio" },
        "en": { "variantName": "Orange Blossom", "description": "Orange blossom scent" }
      }
    },
    {
      "variantId": "gelsomino",
      "stripeProductId": "prod_gelsomino_xxx",
      "stripePriceId": "price_gelsomino_xxx",
      "price": "28.00",
      "originalPrice": null,
      "inStock": true,
      "stockQuantity": 30,
      "images": [
        "/img/beauty-oil-gelsomino-1.jpg",
        "/img/beauty-oil-gelsomino-2.jpg"
      ],
      "translations": {
        "it": { "variantName": "Gelsomino", "description": "Profumo di gelsomino" },
        "en": { "variantName": "Jasmine", "description": "Jasmine scent" }
      }
    }
  ],
  "translations": {
    "it": { "name": "Beauty Oil", "description": "Olio di bellezza multi-uso", ... },
    "en": { "name": "Beauty Oil", "description": "Multi-use beauty oil", ... }
  },
  "slug": { "it": "beauty-oil", "en": "beauty-oil" },
  "metadata": { "isActive": true, "featured": false, ... }
}
```

---

## Fase 9: ProductService (localizzazione varianti)

### File: `src/services/productService.ts`

La funzione `localizeProduct` deve localizzare anche le varianti:

```typescript
private static localizeProduct(product: ProductDocument, locale: SupportedLocale): Product {
  // ... localizzazione esistente ...

  // Localizza varianti
  if (product.variants?.length) {
    localizedProduct.variants = product.variants.map(variant => ({
      ...variant,
      // Il frontend accederà a variant.translations[locale].variantName
      // Non serve ulteriore trasformazione qui
    }));
  }

  return localizedProduct;
}
```

---

## Riepilogo file da modificare

| File | Tipo modifica | Complessità |
|------|--------------|-------------|
| `src/types/products.ts` | Aggiunta interfacce `ProductVariant`, campo `variants` | Bassa |
| `src/utils/variantHelpers.ts` | **Nuovo file** - Helper per parsing ID e risoluzione variante | Bassa |
| `src/components/singleProductPage/ProductInfoSection.tsx` | Selettore variante + logica UI | Media |
| `src/components/singleProductPage/ProductImageGallery.tsx` | Mostrare immagini della variante selezionata | Bassa |
| `src/hooks/useCartCalculations.ts` | Parsing ID composto per prezzo corretto | Bassa |
| `src/hooks/useCartWeight.ts` | Parsing ID composto (peso dal padre) | Bassa |
| `src/components/cartPage/CartItem.tsx` | Mostrare nome variante | Bassa |
| `src/components/cartPage/CheckoutWizard.tsx` | Parsing ID nel `products.find()` | Bassa |
| `src/app/(shop)/cart/page.tsx` | `canUseStripeCheckout()` con varianti | Bassa |
| `src/app/api/create-checkout-session/route.ts` | Mapping variante → Stripe ID | Media |
| `src/components/productsPage/ProductCard.tsx` | Mostrare "da €X" per varianti | Bassa |
| `src/services/productService.ts` | Localizzazione varianti | Bassa |
| `src/app/admin/products/create/page.tsx` | Sezione varianti nel form creazione | Media-Alta |
| `src/app/admin/products/[id]/edit/page.tsx` | Sezione varianti nel form modifica + stock per variante | Media-Alta |
| `src/app/api/admin/products/route.ts` | Validazione e salvataggio varianti (POST) | Media |
| `src/app/api/admin/products/[id]/route.ts` | Validazione e aggiornamento varianti (PUT) | Media |
| `src/app/api/admin/products/update-stock/route.ts` | Aggiornamento stock per singola variante | Bassa |

## File che NON richiedono modifiche

| File | Motivo |
|------|--------|
| `src/app/api/webhooks/stripe/route.ts` | I dati arrivano da Stripe con nomi corretti |
| `src/app/api/order-details/route.ts` | Legge line items da Stripe (nomi inclusi) |
| `src/app/api/save-order/route.ts` | Salva dati ordine da Stripe invariati |
| `src/lib/email/resend.ts` | Template usa `item.name` da Stripe |
| `src/types/email.ts` | Struttura email invariata |
| `src/contexts/CartContext.tsx` | Il tipo `CartItem` resta `{ id: string, quantity: number }` |
| `src/app/(shop)/checkout/success/page.tsx` | Mostra dati ordine da Stripe |
| Notifiche Telegram/WhatsApp | Usano dati ordine da Stripe |

---

## Requisiti Stripe

Per ogni variante, creare su Stripe:

1. **Prodotto** con nome descrittivo (es: "Beauty Oil - Zagara")
2. **Prezzo** one-time in EUR associato al prodotto
3. Configurare `metadata.available_quantity` per gestire lo stock

I `prod_xxx` e `price_xxx` risultanti vanno inseriti nel campo `variants` del documento MongoDB.

---

## Ordine di implementazione consigliato

1. **Fase 1** - Modello dati (`types/products.ts`)
2. **Fase 2** - Helper functions (`utils/variantHelpers.ts`)
3. **Fase 8** - Admin Panel (creazione/modifica prodotti con varianti) — permette di inserire dati reali da subito
4. **Fase 5** - Checkout API (backend sicuro prima del frontend)
5. **Fase 9** - ProductService (localizzazione)
6. **Fase 3** - Pagina prodotto (UI selettore)
7. **Fase 4** - Carrello e calcoli
8. **Fase 7** - ProductCard catalogo

Le fasi 6 (post-pagamento) non richiedono lavoro — funzionano automaticamente grazie a Stripe.
