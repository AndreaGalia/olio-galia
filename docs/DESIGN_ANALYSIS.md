# ANALISI DESIGN — Olio Galia

> **Data analisi:** Febbraio 2026
> **Progetto:** Olio Galia — E-commerce olio extravergine siciliano
> **Stack:** Next.js 15, Tailwind CSS v4, TypeScript

---

## 1. IDENTITÀ VISIVA & CONCEPT

Il sito di Olio Galia comunica un posizionamento **premium/artigianale mediterraneo**. Il design si ispira direttamente al paesaggio siciliano: colori naturali derivati dall'ulivo, dal terreno e dalla luce del Mediterraneo. Lo stile è **minimal-flat con connotazioni luxury**, evitando elementi decorativi superflui e puntando su tipografia autorevole, palette naturale e fotografia/video di forte impatto visivo.

**Parole chiave del concept:** Autenticità · Tradizione familiare · Qualità · Semplicità elegante · Territorio

---

## 2. PALETTE COLORI

### Colori principali (definiti come CSS Custom Properties in `globals.css`)

| Token | Nome | Hex | Uso principale |
|---|---|---|---|
| `--color-olive` | Verde Oliva | `#556B2F` | Primario — testi, bottoni CTA, navbar items, border |
| `--color-salvia` | Verde Salvia | `#789262` | Secondario — hover state, badge, accenti |
| `--color-sabbia` | Sabbia | `#D6C7A1` | Sfondo navbar, sfondo menu mobile |
| `--color-sabbia-chiaro` | Sabbia Chiaro | `#E5DCC0` | Sfondo globale homepage e pagine interne |
| `--color-beige` | Beige | `#ECE8DF` | Sfondi leggeri, testi su sfondo scuro |
| `--color-nocciola` | Nocciola | `#B2A98C` | Testi secondari, subtitle, label |

### Colori di sistema (non tokenizzati)

| Nome | Hex / Classe | Uso |
|---|---|---|
| Bianco | `#FFFFFF` | Sfondo cards prodotto, elemento di contrasto |
| Verde successo | `green-600` Tailwind | Solo stato "Aggiunto al carrello" |
| Rosso errore | `red-600` / `red-700` Tailwind | Sold out, messaggi di errore |

### Utilizzo degli overlay

I colori vengono usati con **opacità variabili** (sistema Tailwind `/XX`) per creare profondità:
- `olive/10`, `olive/20`, `olive/30` → sfondi e border sfumati
- `beige/20`, `beige/60`, `beige/80` → testi sul footer scuro
- `sabbia-chiaro/20` → separatori sottili sul video hero

### Gradienti ricorrenti

```
Gradient hero overlay:    from-olive/55 via-olive/35 to-olive/55
Gradient vignette:        radial-gradient(transparent → olive/25%)
Gradient banner uliveto:  from-olive/40 via-olive/20 to-olive/40
Gradient decorativo:      from-olive → salvia (135deg)
Gradient sfondo about:    from-beige via-sabbia to-beige (135deg)
```

---

## 3. TIPOGRAFIA

### Font stack

| Font | Tipo | Fonte | Uso |
|---|---|---|---|
| **termina** | Sans-serif geometrico | Adobe Typekit (`mew4ocs`) | **Tutti i titoli** (h1-h6), logo navbar |
| **Roboto** | Sans-serif umanista | Google Fonts (300/400/500/700) | **Tutto il testo body**, label, pulsanti |
| **Cormorant Garamond** | Serif classico | Google Fonts | Uso decorativo (aboutSection) |
| **SweetSansPro** | Sans-serif custom | Font locale woff2 | Font alternativo dichiarato (non predominante) |

### Regole tipografiche globali

```css
/* Tutti i titoli: uppercase forzato, peso 500, font termina */
h1, h2, h3, h4, h5, h6 {
  font-family: "termina", sans-serif;
  font-weight: 500;
  text-transform: uppercase;
}

/* Body: Roboto con letter-spacing aumentato */
body {
  font-family: var(--font-roboto), sans-serif;
  letter-spacing: 0.05em;  /* +10% rispetto al normale */
}
```

### Scale tipografica (titoli responsive)

I titoli principali seguono una scala gerarchica a due righe, con una tecnica di contrasto dimensionale:

```
Riga principale (grande):  text-lg → sm:text-3xl → md:text-4xl → lg:text-5xl
Riga secondaria (piccola): text-base → sm:text-xl → md:text-2xl → lg:text-3xl
```

Questo pattern si ripete su Hero, About, Products sections con coerenza totale.

### Stili ricorrenti

- **Tracking titoli navbar/logo:** `tracking-widest`
- **Tracking CTA buttons:** `tracking-wider`
- **Tracking badge/label:** `tracking-wide`
- **Peso prezzi:** `font-bold` (tw) su testo `text-olive`
- **Peso pulsanti:** `font-medium` o `font-semibold`
- **Stili paragrafi:** `leading-relaxed`, colore `text-nocciola`

---

## 4. LAYOUT & STRUTTURA PAGINA

### Architettura globale

```
┌─────────────────────────────────────────┐
│  NAVBAR  (sticky, z-30, bg-sabbia)      │
├─────────────────────────────────────────┤
│  <main>                                 │
│    {children — pagine/sezioni}          │
├─────────────────────────────────────────┤
│  FOOTER  (bg-olive, text-beige)         │
└─────────────────────────────────────────┘
```

### Container

- **Max-width standard:** `max-w-7xl` (1280px) con `mx-auto px-4 sm:px-6`
- **Max-width ridotto (testi):** `max-w-6xl`, `max-w-4xl`, `max-w-3xl`, `max-w-2xl`
- Utilizzo prevalente di `container mx-auto` come wrapper

### Grid system

- **CSS Grid:** per layout multi-colonna (footer: `grid-cols-1 lg:grid-cols-4`)
- **Flexbox:** per allineamenti interni (navbar, hero content, actions)
- **ProductGrid:** griglia adattiva prodotti (1 → 2 → 3 colonne)

### Spaziatura verticale sezioni

Le sezioni usano un sistema di padding verticale generoso:

| Uso | Classi |
|---|---|
| Sezioni standard | `py-16 sm:py-20 lg:py-24` |
| Sezioni grandi | `py-20 sm:py-24 lg:py-32` |
| Hero pagine interne | `py-10 sm:py-12 lg:py-16` |
| Footer principale | `py-12 sm:py-16 lg:py-20` |

---

## 5. NAVBAR

**File:** `src/components/layout/Navbar.tsx`

```
┌──────────────────────────────────────────────────────────┐
│ OLIO GALIA    HOME  CHI SIAMO  PRODOTTI  CONTATTI  🛒 [IT]│
└──────────────────────────────────────────────────────────┘
   (bg: #D6C7A1 — sabbia | sticky top-0 | z-30)
```

**Caratteristiche:**
- Sfondo: `bg-[#D6C7A1]` (sabbia, valore diretto)
- Logo: font `termina`, uppercase, `tracking-widest`, colore `text-olive`, `text-2xl → sm:text-3xl → md:text-4xl`
- Voci menu: uppercase, `text-olive`, hover → `text-salvia`, active → `text-salvia`
- Carrello: icona SVG con badge numerico circolare (`bg-olive text-beige`)
- Language switcher: visibile sia desktop che mobile
- **Mobile:** drawer laterale da destra (`w-80`, stessa bg navbar), animazione `translate-x-full → translate-x-0`
- Overlay mobile: `bg-black/50` sull'area fuori menu
- Hamburger: tre linee animate in X al click (rotate-45)

---

## 6. FOOTER

**File:** `src/components/layout/Footer.tsx`

```
┌──────────────────────────────────────────────────────────┐
│  Brand + badges │  Prodotti  │  Info  │  Contatti+Social  │
│─────────────────────────────────────────────────────────│
│             NEWSLETTER — bottone CTA                      │
│─────────────────────────────────────────────────────────│
│  © Copyright  |  Privacy  |  Cookie  |  Termini          │
└──────────────────────────────────────────────────────────┘
   (bg: olive #556B2F | text: beige | 4 colonne lg)
```

**Caratteristiche:**
- Sfondo: `bg-olive` (contrasto massimo con il resto del sito)
- Testo principale: `text-beige/80`, hover → `text-beige` con underline
- Badge qualità nel brand: `bg-beige/20 text-beige rounded-full text-xs`
- Social: bottoni circolari (`w-10 h-10 rounded-full bg-beige/20`)
  - WhatsApp: bg verde `green-500/20`
  - Altri (Instagram, Facebook, TikTok, Pinterest): bg `beige/20`
- Newsletter CTA: `bg-beige text-olive` (inversione colori), no border-radius
- Separatori: `border-t border-beige/20`
- Bottom bar: testo `text-beige/60`

---

## 7. COMPONENTI UI — DESIGN PATTERNS

### 7.1 Bottoni

Il design usa un sistema di bottoni **flat senza border-radius**:

**Bottone Primario (CTA principale)**
```
bg-olive · text-beige · border border-olive/20
px-6 py-3 md:px-8 md:py-4 · uppercase · tracking-wider · font-medium
Hover: shadow-xl · scale-105
Transizione: duration-300
```

**Bottone Secondario**
```
bg-white · text-olive · border border-olive/30
Hover: bg-olive · text-beige
```

**Bottone Hero (su video)**
```
bg-sabbia-chiaro/90 · text-olive · backdrop-blur-sm
Hover: bg-sabbia-chiaro · shadow-xl · scale-105
```

**Bottone "Aggiungi al Carrello"**
```
Normale: bg-olive · text-beige · border-olive/20
Aggiunto: bg-green-600 · text-white · border-green-700 · scale-105 · animate-pulse
```

**Bottone Newsletter (Footer)**
```
bg-beige · text-olive · px-8 py-3 · font-medium
border border-olive/20 · NO border-radius
```

### 7.2 Badges e Tag

```
Badge primario:    bg-olive · text-beige · px-3 py-1 · font-bold · tracking-wider
Badge secondario:  bg-salvia · text-beige · (stessi stili)
Category pill:     bg-olive/10 · text-olive · px-4 py-2 · rounded-full · text-sm
Footer badge:      bg-beige/20 · text-beige · px-3 py-1 · rounded-full · text-xs
```

### 7.3 Cards Prodotto

```
Container: bg-beige/30 · border border-olive/10 · NO border-radius
Image area: bg-white · border-b border-olive/10 · h-56 sm:h-64 md:h-72
Content: p-4 sm:p-6 · space-y-3 sm:space-y-4
Prezzo box: bg-white · border border-olive/10 · p-6
```

### 7.4 Stock Indicator (inline)

```
In stock:     bg-olive/5 · text-olive · border-l-2 border-olive · px-3 py-1.5
Out of stock: bg-red-50 · text-red-700 · border-l-2 border-red-700 · px-3 py-1.5
```

### 7.5 Input Quantità

```
Container: border border-olive/20 (inline flex)
Pulsanti +/-: px-3 py-2 · hover:bg-olive/10
Valore centrale: px-4 py-2 · bg-olive/5 · min-w-[50px] text-center
```

### 7.6 Subscription Banner (prodotto)

```
bg-white · border-l-4 border-olive · p-4 sm:p-6
Icon: w-10 h-10 bg-olive/10 · text-olive
CTA link: bg-olive · text-beige · uppercase · tracking-wider
```

### 7.7 Newsletter Popup

Componente modal con `animate-scale-in`, sfondo overlay scuro.

---

## 8. SEZIONI HOMEPAGE

### 8.1 Hero Section

- **Layout:** fullscreen (`min-h-screen`), contenuto centrato con flexbox
- **Background:** video MP4 loop autoplay muted + overlay gradiente olive
- **Overlay:** `bg-gradient-to-b from-olive/55 via-olive/35 to-olive/55` + vignette radiale
- **Titolo:** font termina, UPPERCASE, `text-sabbia-chiaro`, scala da `text-lg` a `lg:text-5xl`
- **CTA:** bottone `bg-sabbia-chiaro/90 backdrop-blur-sm text-olive`, square, uppercase
- **Stats bar:** 3 colonne, `border-t border-sabbia-chiaro/20`, cifre in font-bold
  - `100%` Naturale · `1940` Da quando · `3°` Generazione

### 8.2 Products Section (Homepage)

- **Layout:** bg-homepage-bg con `py-20 sm:py-24 lg:py-32`
- **Header:** titolo centrato a due righe + griglia prodotti (featured, max 3)
- **Banner:** fullscreen `min-h-screen` con foto uliveto + overlay olive graduato + vignette
- **Info section:** contenuto dettaglio prodotti
- **CTA section:** call-to-action finale

### 8.3 About Section (Homepage)

- **Layout:** bg-homepage-bg, container centrato
- **Badge header:** `bg-olive/10 text-olive rounded-full` con label sezione
- **Titolo:** stessa struttura a due righe con contrasto dimensionale
- **History:** componente `HistorySection` in variante compact
- **CTA:** bottone primario (`bg-olive text-beige`, square, uppercase)

### 8.4 FAQ Section

- **Layout:** bg-homepage-bg
- **Category pills:** `rounded-full` con filtro per categoria
- **FAQ items:** accordion con animazioni
- **Contact section:** bottoni Email + WhatsApp

---

## 9. PAGINE PUBBLICHE

### 9.1 Homepage (`/`)
Composizione a sezioni verticali: Hero video → Prodotti → Chi siamo → FAQ

### 9.2 Prodotti (`/products`)
- Hero minimale (`py-10 → py-16`) con titolo e subtitle
- Category filter pills (`rounded-full`) per filtrare
- Grid prodotti (cards flat, no border-radius)

### 9.3 Dettaglio Prodotto (`/products/[slug]`)
- Breadcrumb navigazione
- Gallery immagine + Info section (2 colonne su desktop)
- Variant selector
- Box prezzo (bg-white, border, p-6)
- Dettagli + related products
- Reviews summary card

### 9.4 Chi Siamo (`/about`)
- Header animato con titolo
- Timeline storica interattiva (dal 1940)
- Sezione valori (Qualità, Famiglia, Tradizione)
- CTA duale: Catalogo + Contattaci

### 9.5 Contatti (`/contact`)
- Background con decorazioni animate (pulse, bounce, ping)
- Hero con titolo e subtitle
- Contact methods cards: Email + WhatsApp (2 metodi)

### 9.6 Carrello (`/cart`)
- Wizard multi-step con checkout
- Floating action button
- Free shipping indicator

### 9.7 Policy (`/privacy-policy`, `/cookie-policy`, `/termini-servizio`)
- Layout testo semplice con `custom-html-content`
- Titoli: color olive, UPPERCASE
- Border blockquote: `border-left: 4px solid olive`

---

## 10. ANIMAZIONI & TRANSIZIONI

### Animazioni globali (`globals.css`)

| Nome | Comportamento | Durata | Uso |
|---|---|---|---|
| `slideInRight` | translateX(100% → 0) | 0.3s ease-out | Toast, modali laterali |
| `scaleIn` | scale(0.95 → 1) + opacity | 0.2s ease-out | Newsletter popup |
| `fadeIn` | opacity + translateY(-10px → 0) | 0.4s ease-out | Elementi generali |
| `slideUp` | translateY(100% → 0) + opacity | 0.3s ease-out | Sticky bottom bar |

### Animazioni Hero (`HeroSection.module.css`)

| Nome | Comportamento | Durata | Tipo |
|---|---|---|---|
| `slideInLeft` | translateX(-100px → 0) | 0.8s | Entry |
| `slideUp` | translateY(50px → 0) | 0.8s | Entry |
| `fadeInUp` | translateY(30px → 0) | 0.8s | Entry |
| `fadeInScale` | scale(0.8 → 1) | 1s | Entry |
| `float` | translateY(0 → -10px → 0) | 4s infinite | Decorativo |
| `floatComplex` | translateY + translateX + scale | 5s infinite | Decorativo |
| `bounceGentle` | translateY(0 → -8px → 0) | 2s infinite | Decorativo |
| `pulseSlow` | opacity + scale | 4s infinite | Decorativo |
| `spinVerySlow` | rotate(0 → 360deg) | 30s infinite | Decorativo |
| `shimmer` | opacity + translateX | 2s infinite | Decorativo |
| `sparkle` | opacity + translateY + scale | 2s infinite | Decorativo |
| `scrollIndicator` | opacity + translateY loop | 2s infinite | UI hint |

### Pattern di entrata (entry animations)

Gli elementi vengono nascosti con `opacity: 0` e animati al mount usando uno stato React `isVisible`:

```
Delay scaglionato: 0.1s → 0.4s → 0.8s (hero)
Easing standard: ease-out
Durata standard: 0.6s-0.8s
```

### Accessibilità

Tutte le animazioni rispettano `prefers-reduced-motion: reduce` — quando l'utente ha disabilitato le animazioni nel sistema operativo, le animazioni vengono azzerate (`animation-duration: 0.01ms`).

### Transizioni UI standard

- **Hover elements:** `transition-all duration-300`
- **Bottoni CTA:** `transition-all duration-300`, `hover:scale-105`
- **Links nav:** `transition-colors duration-200`
- **Cards:** `transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)` (about page)
- **Social icons footer:** `group-hover:scale-110 transition-transform duration-300`

---

## 11. RESPONSIVE DESIGN

L'approccio è **mobile-first** con Tailwind CSS. Breakpoints principali:

| Breakpoint | Pixel | Comportamento |
|---|---|---|
| `sm` | 640px | Layout 2 colonne, font size aumenta |
| `md` | 768px | Maggiore spaziatura, font scale |
| `lg` | 1024px | Navbar desktop visibile, grid 4 col footer |
| `xl` | 1280px | Gap navbar aumenta (`xl:gap-12`) |

**Mobile specifico:**
- Navbar collassa in hamburger + carrello
- Menu laterale drawer (width: `w-80`, max `85vw`)
- Hero font: scala ridotta (text-lg su mobile)
- Grid prodotti: 1 colonna → 2 → 3
- Footer: 1 colonna → 4 colonne su lg
- Padding orizzontale: `px-4` → `sm:px-6`

---

## 12. ICONE & ILLUSTRAZIONI

Il progetto usa **esclusivamente SVG inline** (nessuna libreria di icone esterna):

- Icona carrello: SVG custom (strokeWidth="2")
- Icone footer contatti: SVG fill currentColor (location, phone, email)
- Icone social: SVG brand icons (WhatsApp, Instagram, Facebook, TikTok, Pinterest)
- Icone valori about: SVG fill currentColor (star, heart, fire)
- Icone prodotto: SVG per cart, check, arrow
- Hamburger: elemento HTML puro (`<span>` animati con CSS)

Tutte le icone usano `currentColor` per ereditare il colore dal contesto.

---

## 13. IMMAGINI & MEDIA

- **Ottimizzazione:** Next.js `<Image>` component con `fill`, `sizes` ottimizzati
- **Hosting:** Cloudflare R2 (CDN esterno, configurato in next.config.ts)
- **Qualità:** `quality={90}` per banner ad alto impatto
- **Hero:** Video MP4 autoplay loop muted playsInline (uliveti_sicilia.mp4)
- **Banner sezioni:** Foto uliveto fullscreen (`min-h-screen`, object-cover)
- **Prodotti:** `object-contain` (per non distorcere le confezioni)
- **Sold out:** filtro `grayscale opacity-50` sull'immagine prodotto

---

## 14. PATTERN DI DESIGN RICORRENTI

### Pattern "Sezione con Header"
Ogni sezione principale segue questa struttura:
1. Badge tag (`rounded-full`, `bg-olive/10`, `text-olive`)
2. Titolo a due righe (grande + piccola)
3. Sottotitolo/intro (`text-nocciola`, `leading-relaxed`)
4. Contenuto principale
5. CTA button (square, uppercase, olive o inverted)

### Pattern "Bottone Inverso"
Sul footer scuro: `bg-beige text-olive` (inversione della combinazione standard)

### Pattern "Border Accent"
Elementi di stato usa border-left colorata invece di badges:
```
border-l-2 border-olive → disponibile
border-l-2 border-red-700 → esaurito
border-l-4 border-olive → subscription banner
```

### Pattern "Overlay Gradiente"
Ogni sezione con immagine/video background usa:
1. Immagine/video (full cover)
2. Overlay gradiente verticale (olive con opacità)
3. Vignette radiale (per focus centrale)

### Pattern "Hover Elevazione"
Cards interattive: `hover:scale-105 hover:shadow-xl` con `transition-all duration-500`

---

## 15. PUNTI DI FORZA DEL DESIGN

1. **Coerenza cromatica perfetta** — 6 colori gestiti come CSS custom properties, tutto il sito è tonalmente unificato
2. **Tipografia autorevole** — Termina uppercase su tutti i titoli crea un'identità visiva forte e riconoscibile
3. **Flat design premium** — Nessun border-radius sugli elementi CTA comunica solidità e modernità
4. **Video hero d'impatto** — La sezione hero a schermo intero con video degli uliveti crea immersione immediata
5. **Hierarchia tipografica chiara** — Il contrasto grande/piccolo nei titoli a due righe è sofisticato ed elegante
6. **Accessibilità animazioni** — `prefers-reduced-motion` implementato correttamente
7. **Responsive mobile-first** — Layout solido su tutti i dispositivi

## 16. AREE DI ATTENZIONE

1. **Inconsistenza valori colori** — La navbar usa `bg-[#D6C7A1]` (valore inline) invece di `bg-sabbia` (token definito)
2. **Multipli file CSS module** — Le stesse utility color sono ridefinite in `AboutPage.module.css`, `ContactPage.module.css` ecc. anziché essere centralizzate
3. **Font Cormorant Garamond** — Dichiarato ma poco utilizzato (solo nel `.fontSerif` di AboutPage)
4. **SweetSansPro** — Caricato nel layout ma non applicato a elementi visibili
5. **Il verde successo** (`green-600`) è l'unico colore esterno alla palette principale — volontariamente isolato per il feedback dell'azione carrello

---

*Documento generato da analisi automatica del codebase — Olio Galia, Febbraio 2026*
