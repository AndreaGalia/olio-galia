# Olio Galia — Style Guide

Guida allo stile editoriale adottato nel progetto. Ispirazione principale: **Le Marke** (`le-marke.co`).
L'estetica è minimal, ariosa, con forti influenze editoriali. Ogni elemento deve respirare.

---

## Palette Colori

| Nome token | Valore | Uso |
|---|---|---|
| `olive` | `#577657` | Colore primario brand, CTA principali, accenti |
| `salvia` | `#577657` | Alias di olive (stessa palette) |
| `sabbia` | `#E0D3B7` | Sfondo bottone principale, sfondi secondari |
| `sabbia-chiaro` | `#E0D3B7` | Sfondo navbar, sfondo pagine interne |
| `beige` | `#F4F1EA` | Off-white, sfondi leggeri |
| `nocciola` | `#E0D3B7` | Alias di sabbia |

### Regole colore

- **Non usare mai colori esadecimali hardcoded** — usa sempre i token Tailwind (`bg-sabbia`, `text-olive`, ecc.)
- Lo sfondo delle pagine prodotto e della navbar è sempre `bg-sabbia-chiaro`
- Il testo principale è `text-black`, il testo secondario è `text-black/40` o `text-black/60`
- I bordi sono sempre `border-black/10` o `border-black/15` — mai `border-olive/20` nelle nuove UI
- Niente gradienti (`bg-gradient-to-r`)

---

## Tipografia

### Font families

| Ruolo | Font | Classe CSS |
|---|---|---|
| Titoli (h1–h6) | `termina`, sans-serif | Applicato globalmente in `globals.css` |
| Body | `Roboto`, sans-serif | Applicato globalmente su `body` |
| Serif (non in uso attivo) | `Cormorant Garamond` | Disponibile come `--font-family-serif` |

### Stile heading globale (da `globals.css`, non modificare)

```
font-family: termina
font-size: 17px
font-weight: 400
letter-spacing: 3.4px
text-transform: uppercase
line-height: 20px
```

### Override titolo prodotto

Quando un heading deve essere più grande (es. nome prodotto nella pagina di dettaglio), usare **inline style** per non toccare `globals.css`:

```tsx
<h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: '1.3', letterSpacing: '0.15em' }}>
  {product.name}
</h1>
```

### Label e micro-testo

Per etichette, label di sezione, uppercase decorativi:

```tsx
className="text-[11px] tracking-[0.2em] uppercase text-black/40"
```

Per link testuali secondari:

```tsx
className="text-xs tracking-wider text-black/40 underline underline-offset-2 hover:text-black transition-colors"
```

---

## Spaziatura e Layout

### Principio base

> Preferire **spazio vuoto generoso** a elementi ravvicinati. Ogni sezione deve respirare.

### Padding pagina prodotto

| Breakpoint | Padding orizzontale |
|---|---|
| Mobile | `px-6` |
| Tablet | `sm:px-12` |
| Desktop | `lg:px-16` |
| Wide | `xl:px-24` |

### Separatori tra sezioni

Usare sempre un bordo sottile, mai elementi decorativi pesanti:

```tsx
<div className="border-t border-black/10" />
```

Con padding sopra/sotto:

```tsx
className="border-t border-black/10 pt-5"
// oppure dentro un elemento
className="space-y-5"
```

### Gap tra elementi interni

- Tra elementi di una stessa sezione: `space-y-5` o `gap-4`
- Tra sezioni macro: `space-y-8` o `py-10 lg:py-20`

---

## Layout Pagina Prodotto

### Struttura hero (desktop)

```
┌─────────────────────┬──────────────────────┐
│                     │  breadcrumb          │
│   IMAGE SLIDER      │  categoria           │
│   sticky h-screen   │  nome prodotto       │
│   object-cover      │  recensioni          │
│                     │  prezzo              │
│   ← progress bar →  │  descrizione         │
│                     │  varianti            │
│                     │  quantità            │
│                     │  [AGGIUNGI AL CARR.] │
│                     │  accordions          │
└─────────────────────┴──────────────────────┘
```

- **Colonna sinistra**: `lg:sticky lg:top-0 lg:h-screen` — rimane fissa mentre la destra scrolla
- **Colonna destra**: scorre normalmente con la pagina
- **Mobile**: colonne impilate, immagine `h-[120vw]`, info sotto

### Altezze immagine

```tsx
className="h-[120vw] sm:h-[85vw] lg:sticky lg:top-0 lg:h-screen"
```

---

## Componente Image Slider

### Comportamento

- Una immagine alla volta, transizione `translateX` fluida (`duration-500 ease-in-out`)
- **Frecce**: appaiono solo al hover del container (`group-hover:opacity-100`), `strokeWidth="1"` — molto sottili
- **Progress bar**: `h-[2px]` in fondo, niente dot o thumbnail
- **Swipe touch**: delta minimo 40px

### Codice pattern

```tsx
// Frecce
className="absolute left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"

// Progress bar
<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/10">
  <div className="h-full bg-black/35 transition-all duration-500"
    style={{ width: `${((current + 1) / images.length) * 100}%` }} />
</div>
```

---

## Bottone Principale (Add to Cart)

### Stile

```tsx
className="w-full py-4 bg-sabbia text-black text-[11px] tracking-[0.25em] uppercase
           transition-all duration-300 cursor-pointer
           hover:bg-olive hover:text-beige"
```

### Regole

- **Full-width** sempre (`w-full`)
- Sfondo `bg-sabbia` (beige caldo) — mai `bg-olive` di default
- Hover: `bg-olive text-beige`
- Nessuna icona nel bottone, solo testo
- Stato "aggiunto": `bg-olive/80 text-beige` con testo "Aggiunto al carrello ✓"
- Stato disabilitato: `bg-sabbia/40 text-black/30`

---

## Quantity Selector

```tsx
<div className="flex items-center border border-black/15">
  <button className="w-9 h-9 flex items-center justify-center text-sm hover:bg-black/5 transition-colors cursor-pointer select-none">−</button>
  <span className="w-9 h-9 flex items-center justify-center text-sm border-x border-black/10">{quantity}</span>
  <button className="w-9 h-9 flex items-center justify-center text-sm hover:bg-black/5 transition-colors cursor-pointer select-none">+</button>
</div>
```

- Dimensione fissa `w-9 h-9` per ogni cella
- Bordo `border-black/15`, molto leggero
- Nessun colore di sfondo di default

---

## Accordions

Il componente `ProductAccordion` è usato per sezioni collassabili nella pagina prodotto.

### Struttura

```tsx
<ProductAccordion title="Caratteristiche">
  {/* contenuto */}
</ProductAccordion>
```

### Stile

- Separatore: `border-t border-black/10`
- Titolo: `text-xs tracking-widest uppercase` con `hover:text-olive`
- Toggle: `+` / `−` in `text-black/50`
- Transizione: `max-h` con `overflow-hidden` — niente JS per animazioni
- Contenuto: `text-sm text-black/70 leading-relaxed`

### Sezioni standard nella pagina prodotto

| Accordion | Dati del prodotto |
|---|---|
| Caratteristiche | `features[]`, `bestFor` |
| Origine | `origin`, `harvest`, `processing` |
| Valori Nutrizionali | `nutritionalInfo` |
| Premi | `awards[]` |

---

## Bulk Proposal (Acquisto in quantità)

### Trigger (inline)

```tsx
<div className="border-t border-black/10 pt-4 flex items-center justify-between gap-4">
  <div>
    <p className="text-[11px] tracking-[0.15em] uppercase text-black/60">{title}</p>
    <p className="text-xs text-black/40 mt-0.5">{description}</p>
  </div>
  <button className="text-[11px] tracking-[0.15em] uppercase text-black/50 underline underline-offset-2 hover:text-black transition-colors cursor-pointer">
    {button}
  </button>
</div>
```

### Modal

- Sfondo overlay: `bg-black/40`
- Pannello: `bg-sabbia-chiaro border border-black/10 p-8` — nessun `rounded`
- Input: `border border-black/15 focus:border-black/40 bg-transparent`
- Bottone annulla: outline minimal `border border-black/15`
- Bottone submit: `bg-olive text-beige` — nessun gradiente

---

## Regole Generali UI

### Da usare ✓

- `border-black/10` per separatori e bordi leggeri
- `text-black/40`, `text-black/50`, `text-black/60` per testo secondario
- `tracking-[0.2em]` o `tracking-widest` per uppercase piccoli
- `transition-colors duration-200` o `duration-300` per hover
- `cursor-pointer` su tutti gli elementi cliccabili
- `leading-relaxed` per testi descrittivi

### Da evitare ✗

- Colori hardcoded (`#577657`, `#E0D3B7`, ecc.) → usa i token
- `rounded-lg`, `rounded-xl`, `rounded-2xl` → angoli netti ovunque
- `shadow-lg`, `shadow-xl` → nessuna ombra
- `bg-gradient-to-r` → nessun gradiente
- `animate-pulse` sui bottoni principali
- Icone SVG nei bottoni CTA principali
- Modificare `globals.css` per override di singoli componenti → usa `style={{}}`

---

## Breadcrumb

```tsx
<nav className="flex items-center gap-2 text-xs tracking-wider">
  <Link className="text-black/40 hover:text-olive transition-colors uppercase">Home</Link>
  <span className="text-black/30">/</span>
  <Link className="text-black/40 hover:text-olive transition-colors uppercase">Prodotti</Link>
  <span className="text-black/30">/</span>
  <span className="text-black/70 uppercase">{productName}</span>
</nav>
```

---

## Traduzioni

Il sistema i18n usa `src/data/locales/it.json` e `en.json`.

- Hook: `const { t, translate } = useT()`
- Locale corrente: `const { locale } = useLocale()`
- Interpolazione: `translate('chiave.annidata', { param: 'valore' })`
- Per testi brevi condizionali al locale: `locale === 'it' ? '...' : '...'`
- **Non aggiungere testo hardcoded in italiano o inglese** — aggiungere sempre la chiave in entrambi i file JSON

---

## File Rilevanti

```
src/
├── app/
│   ├── globals.css                          # Palette, font globali — NON MODIFICARE
│   └── (shop)/products/[slug]/page.tsx      # Layout pagina prodotto
├── components/
│   ├── singleProductPage/
│   │   ├── ProductImageGallery.tsx          # Slider immagini
│   │   ├── ProductInfoSection.tsx           # Pannello info destra
│   │   ├── ProductAccordion.tsx             # Accordion riutilizzabile
│   │   ├── BreadcrumbNavigation.tsx         # Breadcrumb minimal
│   │   └── VariantSelector.tsx              # Selettore varianti
│   └── BulkProposalModal.tsx                # Sezione + modal acquisto bulk
└── data/locales/
    ├── it.json                              # Traduzioni italiano
    └── en.json                              # Traduzioni inglese
```
