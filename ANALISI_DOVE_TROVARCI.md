# Analisi Feature — "Dove Trovarci" (Punti Vendita)

> Stato: **tutte le fasi implementate — in attesa di test in locale**
> Data: 1 agosto 2026

## Per iniziare

Le categorie devono esistere prima di poter aggiungere punti vendita. Il seed è una
**migrazione** nel registry di `/admin/tools`, come gli altri seed del progetto:

1. Vai su `/admin/tools`
2. Trova **"Seed Categorie Punti Vendita"**
3. Lancia prima il **dry run** per vedere cosa verrebbe scritto, poi esegui davvero

Crea 5 categorie (supermercati, macellerie, alimentari, mercati, ristoranti) e gli indici
su `pointsOfSale`. È idempotente: rilanciandola le categorie esistenti vengono saltate, a
meno di usare **Force** che ne aggiorna nome e icona mantenendo l'`id` — così i punti
vendita già associati restano collegati.

Poi: `/admin/dove-trovarci` → "Nuovo punto vendita" → compila l'indirizzo → "Trova sulla
mappa" → salva. Il punto compare su `/dove-trovarci`.

In alternativa le categorie si creano a mano da `/admin/dove-trovarci/categorie`: in quel
caso gli indici su `pointsOfSale` non vengono creati (irrilevante con poche decine di punti,
ma lo slug non avrà il vincolo di unicità a livello di database — l'unicità resta comunque
garantita dal service).

---

## 1. Obiettivo

Nuova pagina pubblica `/dove-trovarci` che mostra i luoghi fisici dove vengono venduti i prodotti Olio Galia (supermercati, macellerie, negozi d'alimentari, mercati, ecc.), con:

- **Vista per categorie** — filtro che raggruppa i punti vendita per tipologia
- **Mappa con tutti i punti** — un marker per ogni punto vendita
- **Interazione bidirezionale** — cliccando una scheda dalla lista la mappa fa zoom/pan sul punto corretto; cliccando un marker si evidenzia la scheda corrispondente
- **Backoffice admin** — CRUD completo su punti vendita e categorie

Stile visivo identico alle altre pagine pubbliche, secondo `style-guide/style-guide.md`.

---

## 2. Decisioni prese

| Tema | Scelta | Motivazione |
|---|---|---|
| **Libreria mappe** | Leaflet + OpenStreetMap | Gratis, nessuna API key né billing, ~40KB, tile stilizzabili via CSS per aderire alla palette sabbia/olive |
| **Coordinate** | Geocoding automatico + correzione manuale | L'admin scrive l'indirizzo, un bottone chiama Nominatim (OSM, gratuito) e riempie lat/lng; i campi restano editabili |
| **Categorie** | Gestibili da admin | Collection dedicata con nome IT/EN, icona e ordine — nuove tipologie senza toccare il codice |
| **Campi extra** | Prodotti disponibili in quel punto | Selezione multipla dal catalogo, con link alle schede prodotto (utile per SEO e conversione) |

### Esclusi esplicitamente (da richiesta)
Telefono, orari di apertura, foto del negozio. Lo schema li accoglierebbe come campi opzionali in futuro senza migrazione dei dati esistenti.

---

## 3. Assunzioni da confermare

Non bloccano l'inizio dello sviluppo — se una è sbagliata si corregge in corsa.

1. **Route unica IT/EN**: `/dove-trovarci` per entrambe le lingue, coerente con `/sostenibilita` e `/smaltimento-rifiuti` (slug italiano, contenuto tradotto via i18n).
2. **Nessuna pagina di dettaglio** per singolo punto vendita: tutto vive nella pagina unica lista + mappa. Il deep-link avviene con query param `?punto=<slug>` che apre la pagina già zoomata su quel punto (condivisibile via WhatsApp).
3. **Ambito geografico Italia**, mappa centrata sulla Sicilia all'avvio ma con auto-fit sui bounds reali dei punti caricati (se domani si aggiunge un punto a Torino, la mappa si adatta da sola).
4. **Filtro per città/provincia** oltre a quello per categoria: previsto ma da attivare solo oltre ~20 punti vendita, altrimenti è rumore. Il campo provincia viene comunque salvato fin da subito.
5. **Volume atteso**: decine di punti vendita, non migliaia. Sotto i ~50 marker Leaflet non ha bisogno di clustering; oltre servirà `leaflet.markercluster`.

---

## 4. Architettura

### 4.1 Modello dati (MongoDB)

Due nuove collection. Nota: la collection `sellers` già esistente riguarda i **venditori a provvigione** — concetto diverso, nessun riuso.

**Collection `pointOfSaleCategories`** — segue il pattern di `categories` (prodotti):

```ts
// src/types/pointOfSale.ts
export interface POSCategoryDocument {
  _id?: ObjectId;
  id: string;                      // slug stabile: 'supermercato', 'macelleria'
  translations: {
    it: { name: string; description?: string };
    en: { name: string; description?: string };
  };
  icon?: string;                   // nome icona lucide-react, es. 'ShoppingCart'
  displayOrder: number;
  metadata: { createdAt: Date; updatedAt: Date; isActive: boolean };
}
```

**Collection `pointsOfSale`**:

```ts
export interface PointOfSaleDocument {
  _id?: ObjectId;
  slug: string;                    // per il deep-link ?punto=<slug>, unico
  name: string;                    // nome insegna — non tradotto
  categoryId: string;              // ref a POSCategoryDocument.id
  address: {
    street: string;
    city: string;
    province: string;              // sigla, es. 'CT'
    postalCode?: string;
    country: string;               // default 'IT'
  };
  coordinates: { lat: number; lng: number };
  productIds: string[];            // prodotti disponibili in questo punto
  notes?: { it: string; en: string };   // riga breve opzionale, es. "banco 12"
  displayOrder?: number;
  metadata: { createdAt: Date; updatedAt: Date; isActive: boolean };
}
```

Indici consigliati: `{ slug: 1 }` unico, `{ 'metadata.isActive': 1, categoryId: 1 }`.
Cancellazione = **soft delete** (`isActive: false`), come per FAQ e categorie.

### 4.2 Service layer

`src/services/pointOfSaleService.ts` — classe statica sul modello di `FAQService` / `SellerService`:

- `getAllPublic()` — punti attivi + categorie attive, join dei prodotti (solo `id`, `name`, `slug`, `image`) in una sola risposta
- `getAllAdmin(filters)` — include gli inattivi
- `getById(id)`, `create(input)`, `update(id, input)`, `softDelete(id)`, `toggleActive(id)`
- `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()` — con guardia: **non eliminare una categoria che ha punti vendita associati** (restituire errore esplicito, come il `productCount` in `/api/admin/categories`)
- Generazione slug da `name` + città, con deduplica (`bar-centrale-catania-2`)

### 4.3 API routes

| Metodo | Endpoint | Auth | Descrizione |
|---|---|---|---|
| GET | `/api/points-of-sale` | pubblica | Punti attivi + categorie, payload unico per la pagina |
| GET/POST | `/api/admin/points-of-sale` | `withAuth` | Lista admin / creazione |
| GET/PUT/DELETE | `/api/admin/points-of-sale/[id]` | `withAuth` | Dettaglio / modifica / soft delete |
| POST | `/api/admin/points-of-sale/[id]/toggle-active` | `withAuth` | Attiva/disattiva |
| GET/POST | `/api/admin/points-of-sale/categories` | `withAuth` | CRUD categorie |
| PUT/DELETE | `/api/admin/points-of-sale/categories/[id]` | `withAuth` | Modifica / elimina categoria |
| GET | `/api/admin/geocode?q=<indirizzo>` | `withAuth` | **Proxy server-side a Nominatim** |

**Perché il proxy di geocoding**: Nominatim richiede uno `User-Agent` identificativo e non è pensato per chiamate dirette dal browser (CORS + rate limit 1 req/s). Il proxy imposta l'header, applica un throttle e restituisce solo `{ lat, lng, displayName }`. È dietro `withAuth`, quindi il volume è per definizione minimo.

### 4.4 Pagina pubblica

```
src/app/(marketing)/dove-trovarci/
├── layout.tsx     # generatePageMetadata (SEO, keywords)
└── page.tsx       # server component: fetch dati → passa al client

src/components/doveTrovarciPage/
├── DoveTrovarciHero.tsx        # titolo + descrizione, stile hero come FaqHeroSection
├── PointOfSaleSection.tsx      # orchestratore client: stato selectedId + filtro
├── CategoryFilter.tsx          # pattern di FaqCategoryFilter
├── PointOfSaleList.tsx         # lista raggruppata per categoria
├── PointOfSaleCard.tsx         # nome, indirizzo, prodotti, link "Indicazioni"
└── StoreMap.tsx                # Leaflet — dynamic import ssr:false
```

**Layout**

- Desktop: mappa `lg:sticky lg:top-0 lg:h-screen` a sinistra, lista scrollabile a destra — riprende la struttura della pagina prodotto già descritta nella style guide
- Mobile: mappa in alto `h-[50vh]` sticky, lista sotto
- Sfondo `bg-sabbia-chiaro`, bordi `border-olive/20`, angoli netti, nessuna ombra, nessun gradiente

**Interazione bidirezionale** (il cuore della feature)

- Stato `selectedId` sollevato in `PointOfSaleSection`
- Click su card → `map.flyTo([lat, lng], 16, { duration: 1.2 })` + apertura popup del marker + marker evidenziato
- Click su marker → `selectedId` aggiornato → la card fa `scrollIntoView({ behavior: 'smooth', block: 'center' })` e si evidenzia con `border-olive`
- Cambio filtro categoria → `map.fitBounds()` sui soli punti visibili
- `?punto=<slug>` all'arrivo → selezione + zoom automatici

**Note tecniche Leaflet**

- Import dinamico `ssr: false` obbligatorio (Leaflet accede a `window` a import-time)
- Import di `leaflet/dist/leaflet.css` dentro il componente client
- Le icone marker di default si rompono con i bundler: si usa `L.divIcon` con SVG inline colorato `bg-olive` — risolve il bug e centra lo stile brand
- Tile layer **CARTO Positron** (neutro, chiaro) con filtro CSS leggero (`sepia(.2) saturate(.85)`) per virare verso la palette sabbia
- **L'attribution OSM va mantenuta**: è un requisito della licenza ODbL, non un dettaglio estetico

### 4.5 Backoffice admin

```
src/app/admin/dove-trovarci/
├── page.tsx           # lista + ricerca + filtro categoria + toggle attivo + elimina
├── create/page.tsx
├── [id]/page.tsx      # modifica
└── categorie/page.tsx # CRUD categorie
```

Riuso diretto dei componenti admin esistenti: `AdminLayout`, `NotificationBanner`, `ConfirmDeleteModal`, `ActionButtons`, `EmptyState`, `LoadingSpinner`, `Pagination`, e soprattutto **`RelatedProductsSelector`** per l'associazione dei prodotti (funziona già com'è, basta passargli `productIds`).

**Form punto vendita** — nuovo componente `src/components/admin/pointsOfSale/PointOfSaleForm.tsx`:

1. Nome insegna
2. Categoria (select alimentata dalle categorie attive)
3. Indirizzo: via, città, provincia, CAP
4. Bottone **"Trova sulla mappa"** → chiama `/api/admin/geocode` → compila lat/lng
5. Lat/Lng in campi numerici sempre editabili a mano
6. **Mini-mappa di anteprima** con il pin nella posizione corrente — verifica visiva immediata prima di salvare
7. Prodotti disponibili (`RelatedProductsSelector`)
8. Note IT/EN (opzionale), ordine di visualizzazione, attivo/inattivo

Validazione: lat/lng obbligatorie e in range (`-90..90`, `-180..180`), categoria esistente, nome non vuoto, slug unico.

Aggiunta della card "Dove Trovarci" nella griglia sezioni di `src/app/admin/dashboard/page.tsx`.

### 4.6 Integrazioni trasversali

- **i18n**: nuova chiave `doveTrovarciPage` in `src/data/locales/it.json` e `en.json` + `navbar.menu.whereToFind` + `footer.info.whereToFind`. Nessun testo hardcoded, come da style guide.
- **Navbar**: voce nel menu desktop (array a `Navbar.tsx:42`) e nel menu mobile
- **Footer**: link nella colonna "Info"
- **Sitemap**: entry in `src/app/sitemap.ts` (`priority: 0.7`, `changeFrequency: 'monthly'`)
- **SEO**: `generatePageMetadata` con keyword local-oriented ("dove comprare olio galia", "rivenditori olio extravergine sicilia", ecc.)

---

## 5. Fasi e task

### Fase 0 — Setup (~30 min)
- [ ] `npm i leaflet` + `npm i -D @types/leaflet`
- [ ] Verifica impatto bundle sulla route pubblica

### Fase 1 — Dati e backend (~3h)
- [ ] `src/types/pointOfSale.ts` — `PointOfSaleDocument`, `POSCategoryDocument`, input types
- [ ] `src/services/pointOfSaleService.ts` — CRUD punti + categorie, generazione slug, join prodotti
- [ ] `GET /api/points-of-sale` (pubblica)
- [ ] `/api/admin/points-of-sale` + `[id]` + `[id]/toggle-active`
- [ ] `/api/admin/points-of-sale/categories` + `[id]`
- [ ] `GET /api/admin/geocode` — proxy Nominatim con User-Agent e throttle
- [ ] Migrazione di seed con le categorie di partenza — registrata in `src/lib/migrations/index.ts` ed eseguibile da `/admin/tools`, come gli altri seed del progetto

### Fase 2 — Admin CRUD (~4h)
- [ ] `/admin/dove-trovarci/categorie` — CRUD categorie con guardia sull'eliminazione
- [ ] `PointOfSaleForm.tsx` — form completo con geocoding e mini-mappa di anteprima
- [ ] `/admin/dove-trovarci` — lista, ricerca, filtro categoria, toggle, elimina
- [ ] `/admin/dove-trovarci/create` e `/admin/dove-trovarci/[id]`
- [ ] Card sezione nella dashboard admin

### Fase 3 — Pagina pubblica, lista e filtri (~3h)
- [ ] Route `(marketing)/dove-trovarci` con `layout.tsx` + `page.tsx`
- [ ] `DoveTrovarciHero`, `CategoryFilter`, `PointOfSaleList`, `PointOfSaleCard`
- [ ] Link "Indicazioni stradali" (deep link Google Maps con le coordinate)
- [ ] Chip dei prodotti disponibili con link alle schede prodotto
- [ ] Verifica aderenza style guide: `border-olive/20`, niente rounded/shadow/gradient, tracking uppercase

### Fase 4 — Mappa e interazione (~4h)
- [ ] `StoreMap.tsx` con dynamic import `ssr: false`
- [ ] Marker custom `divIcon` in palette brand + stato "selezionato"
- [ ] `flyTo` + apertura popup al click sulla card
- [ ] `scrollIntoView` + evidenziazione della card al click sul marker
- [ ] `fitBounds` iniziale e al cambio filtro
- [ ] Deep link `?punto=<slug>`
- [ ] Styling tile + attribution

### Fase 5 — i18n, SEO, navigazione (~2h)
- [ ] Chiavi `doveTrovarciPage` in `it.json` e `en.json`
- [ ] Voce navbar (desktop + mobile) e footer
- [ ] Entry in `sitemap.ts`
- [ ] JSON-LD `ItemList` di `Store` — opzionale ma utile per la local SEO

### Fase 6 — QA (~2h)
- [ ] Mobile: mappa sticky, touch/pinch, lista scrollabile senza conflitti di gesture
- [ ] Stato vuoto (nessun punto vendita), categoria senza punti, punto senza prodotti
- [ ] Coordinate malformate o mancanti → il punto non deve rompere la mappa
- [ ] Marker sovrapposti (due negozi nella stessa via)
- [ ] `npm run build` pulito, nessun errore di hydration

**Totale stimato: ~18-19 ore** (circa 3 giornate di lavoro).

---

## 5-bis. Scostamenti rispetto al piano

Cose emerse durante lo sviluppo e risolte diversamente da come previsto:

- **Mappa non sticky su mobile.** Una mappa sticky sotto la navbar fissa avrebbe avuto il
  bordo superiore coperto. Al suo posto: cliccando una card su viewport < 1024px la pagina
  scorre automaticamente sulla mappa. Stesso risultato, nessun conflitto con la navbar.
- **Picker admin con pin trascinabile.** Era listato come opzione più costosa in fase di
  analisi, ma costava poche righe in più della sola anteprima: incluso.
- **Geocoding con scelta tra più risultati.** Nominatim spesso restituisce più corrispondenze
  per lo stesso indirizzo. Invece di prendere la prima, la form le elenca e lascia scegliere.
- **`invalidateSize` + `ResizeObserver` sulla mappa pubblica.** Senza, i tile restano grigi
  quando il container non ha ancora l'altezza definitiva al momento del mount.
- **Categorie vuote nascoste dal filtro pubblico.** `getAllPublic` restituisce solo le
  categorie con almeno un punto vendita visibile: evita filtri che non filtrano nulla.

---

## 6. Rischi e mitigazioni

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Nominatim rate-limit o blocco (1 req/s, User-Agent obbligatorio) | Medio | Chiamate solo da admin autenticato, throttle nel proxy, e lat/lng sempre inseribili a mano come fallback |
| Errori di hydration / `window is not defined` con Leaflet | Alto se ignorato | `dynamic(..., { ssr: false })` da subito, mai import statico |
| Icone marker rotte dal bundler (problema noto Leaflet + webpack) | Basso | `L.divIcon` con SVG inline — evita del tutto il caricamento di immagini esterne |
| Attribution OSM rimossa per motivi estetici | Legale | Va mantenuta: è condizione della licenza ODbL |
| Crescita oltre ~50 punti vendita | Basso, futuro | Aggiungere `leaflet.markercluster` e attivare il filtro per provincia |
| Geocoding che restituisce coordinate imprecise | Medio | Mini-mappa di anteprima nel form: l'admin vede il pin e corregge prima di salvare |

---

## 7. Estensioni future (fuori scope)

- Orari di apertura, telefono, foto del punto vendita (campi opzionali, nessuna migrazione necessaria)
- Ricerca "vicino a me" con geolocalizzazione del browser e ordinamento per distanza
- Pagina di dettaglio per punto vendita con schema.org `Store` completo (utile se si punta sulla local SEO)
- Form "proponi un punto vendita" per i negozianti interessati
