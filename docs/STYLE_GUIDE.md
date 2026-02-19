# Style Guide - Olio Galia

## Filosofia di Design

Il design del sito Olio Galia segue una filosofia **minimalista** e **moderna**, con un focus sulla chiarezza e sulla leggibilità. L'obiettivo è creare un'esperienza utente pulita e professionale che metta in risalto i prodotti siciliani di qualità.

### Principi Fondamentali

1. **Minimalismo**: Rimozione di tutti gli elementi decorativi non essenziali
2. **Semplicità**: Interfaccia chiara e diretta senza fronzoli
3. **Coerenza**: Stile uniforme in tutte le sezioni del sito
4. **Funzionalità**: Ogni elemento ha uno scopo specifico

---

## Palette Colori

### Colori Primari

- **Olive** (`#556B2F` / `olive`) - Colore principale per testi importanti, titoli e bottoni
- **Beige** (`beige`) - Colore di sfondo e testo su elementi scuri
- **Nocciola** (`nocciola`) - Testo secondario e descrizioni

### Colori Secondari

- **Salvia** (`salvia`) - Accenti e variazioni
- **Sabbia Chiaro** (`sabbia-chiaro`) - Sfondi alternativi
- **Verde** (`green-600`) - Stati attivi (es. "aggiunto al carrello")

### Utilizzo dei Colori

- **Sfondi delle Card**: `bg-beige/30` con `border-olive/10`
- **Testi Principali**: `text-olive`
- **Testi Secondari**: `text-nocciola`
- **Bottoni Primari**: `bg-olive text-beige`
- **Bottoni Secondari**: `bg-white text-olive border-olive`

---

## Tipografia

### Gerarchia dei Titoli

Tutti i titoli principali delle sezioni seguono questo pattern responsive:

```tsx
className="font-serif text-olive mb-6 leading-tight text-lg sm:text-3xl md:text-4xl lg:text-5xl"
```

#### Breakpoints
- Mobile: `text-lg`
- Small: `sm:text-3xl`
- Medium: `md:text-4xl`
- Large: `lg:text-5xl`

### Titoli Multilinea

Quando il titolo è diviso su più righe (es. "Prodotti Siciliani / di Qualità"):

```tsx
<h2 className="font-serif text-olive mb-8 leading-tight">
  <span className="block mb-1 md:mb-2 text-lg sm:text-3xl md:text-4xl lg:text-5xl">
    {title.line1}
  </span>
  <span className="block text-base sm:text-xl md:text-2xl lg:text-3xl">
    {title.line2}
  </span>
</h2>
```

### Font Families

- **Serif**: Utilizzato per tutti i titoli principali (`font-serif`)
- **Sans-serif**: Utilizzato per il corpo del testo (default)

---

## Bottoni

### Stile Base

**REGOLA FONDAMENTALE**: Tutti i bottoni devono essere **squadrati** (nessun `rounded-*`).

#### Bottone Primario

```tsx
className="bg-olive text-beige px-6 py-3 md:px-8 md:py-4 font-medium transition-all duration-300 border border-olive/20 uppercase tracking-wider"
```

#### Bottone Secondario

```tsx
className="bg-white text-olive border border-olive px-6 py-3 md:px-8 md:py-4 font-medium transition-all duration-300"
```

#### Bottone Stato Attivo

```tsx
className="bg-green-600 text-white px-6 py-3 md:px-8 md:py-4 font-medium transition-all duration-300"
```

### Caratteristiche dei Bottoni

- ❌ **NO gradients** (`bg-gradient-*`)
- ❌ **NO rounded corners** (`rounded-*`)
- ❌ **NO hover scale effects** (`hover:scale-*`)
- ✅ **SI squared edges**
- ✅ **SI solid colors**
- ✅ **SI subtle transitions** (solo per colori, non trasformazioni)

---

## Card e Contenitori

### Card Standard

```tsx
<div className="relative bg-beige/30 border border-olive/10 transition-all duration-300">
  {/* contenuto */}
</div>
```

### Caratteristiche delle Card

- **Background**: `bg-beige/30` (beige al 30% di opacità)
- **Border**: `border-olive/10` (olive al 10% di opacità)
- **Padding**: `p-4 sm:p-6` o `p-6 sm:p-8` a seconda del contesto
- ❌ **NO hover effects** sulla card stessa
- ❌ **NO shadows** eccessive
- ❌ **NO rounded corners**

### Product Card

Struttura minimalista che mostra solo le informazioni essenziali:

```tsx
<div className="relative bg-beige/30 border border-olive/10 transition-all duration-300">
  <ProductImage />
  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
    <ProductInfo />
    <ProductPrice />
    <StockInfo />
    <ProductActions />
  </div>
</div>
```

**Cosa NON mostrare**:
- ❌ Descrizione del prodotto
- ❌ Dettagli estesi
- ❌ Quantità esatta in magazzino (solo "Disponibile" / "Non disponibile")

---

## Branding

### OLIO GALIA

Il nome del brand deve sempre apparire come:

```tsx
<span className="font-bold">OLIO GALIA</span>
```

**Regole**:
- ✅ Sempre in **MAIUSCOLO**
- ✅ Sempre in **grassetto**
- ✅ Utilizzare quando si parla dell'azienda (non "famiglia Galia")

### Implementazione nel Codice

```tsx
{description.split('OLIO GALIA').map((part, index, array) => (
  index === array.length - 1 ? part : (
    <span key={index}>
      {part}
      <span className="font-bold">OLIO GALIA</span>
    </span>
  )
))}
```

---

## Sezioni Specifiche

### FAQ Section

**Elementi Rimossi**:
- ❌ Background decorations
- ❌ Category pills
- ❌ Badge "Hai Domande?"

**Struttura Semplificata**:
- Titolo unificato su una riga
- Lista di domande e risposte
- Sezione contatti minimale

### Contact Section

```tsx
<div className="bg-beige/30 border border-olive/10 p-6 sm:p-8 text-center">
  {/* Icon container - squared */}
  <div className="w-16 h-16 bg-olive/10 flex items-center justify-center mx-auto mb-4">
    {/* icon */}
  </div>

  {/* Title and description */}

  {/* Contact buttons - squared, no gradients */}
  <ContactButtons />
</div>
```

### Products Section

**Header**:
- Titolo: "Prodotti Siciliani / di Qualità"
- Descrizione focalizzata sui prodotti siciliani in generale

**Info Cards**:
- Stile minimale con `bg-beige/30` e `border-olive/10`
- Icone colorate in `olive`
- Nessun gradient o effetto hover

---

## Responsive Design

### Breakpoints Tailwind

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Pattern di Spaziatura

- **Mobile**: Spaziatura ridotta (`py-16`, `px-4`, `gap-3`)
- **Tablet**: Spaziatura media (`sm:py-20`, `sm:px-6`, `sm:gap-4`)
- **Desktop**: Spaziatura aumentata (`lg:py-24`, `lg:px-8`, `lg:gap-6`)

### Pattern di Font Size

Seguire sempre il pattern:
```
text-base sm:text-lg md:text-xl lg:text-2xl
```

o per i titoli:
```
text-lg sm:text-3xl md:text-4xl lg:text-5xl
```

---

## Cosa Evitare

### ❌ Non Utilizzare

1. **Gradients**: Nessun `bg-gradient-to-*`
2. **Rounded Corners**: Nessun `rounded-*` (eccetto icone/immagini dove necessario)
3. **Hover Scale**: Nessun `hover:scale-*`
4. **Shadow Eccessive**: Limitare l'uso di `shadow-*`
5. **Decorazioni Non Funzionali**: Badge, pills, decorative backgrounds
6. **Effetti Complessi**: Animazioni elaborate o transizioni multiple

### ✅ Utilizzare Sempre

1. **Colori Solidi**: `bg-olive`, `bg-beige`, etc.
2. **Bordi Sottili**: `border border-olive/10`
3. **Sfondi Trasparenti**: `bg-beige/30`
4. **Transizioni Semplici**: `transition-all duration-300`
5. **Spaziatura Consistente**: `gap-3 sm:gap-4`, `p-4 sm:p-6`

---

## Checklist di Implementazione

Quando crei o modifichi un componente, verifica:

- [ ] I bottoni sono squadrati (no `rounded-*`)
- [ ] Non ci sono gradienti (`bg-gradient-*`)
- [ ] I colori seguono la palette definita
- [ ] I titoli usano il pattern di sizing standard
- [ ] Le card usano `bg-beige/30` e `border-olive/10`
- [ ] "OLIO GALIA" è in maiuscolo e grassetto
- [ ] Le transizioni sono semplici (solo colori)
- [ ] La spaziatura è responsive e consistente
- [ ] Non ci sono effetti hover non necessari

---

## Esempi di Codice

### Bottone Standard

```tsx
<button className="bg-olive text-beige px-8 py-4 font-medium transition-all duration-300 border border-olive/20">
  Bottone Primario
</button>
```

### Card Informativa

```tsx
<div className="bg-beige/30 border border-olive/10 p-6 sm:p-8">
  <div className="w-12 h-12 bg-olive/10 flex items-center justify-center mb-4">
    {/* Icon */}
  </div>
  <h3 className="text-lg font-medium text-olive mb-2">Titolo</h3>
  <p className="text-nocciola">Descrizione del contenuto</p>
</div>
```

### Titolo Sezione

```tsx
<h2 className="font-serif text-olive mb-8 leading-tight">
  <span className="block mb-1 md:mb-2 text-lg sm:text-3xl md:text-4xl lg:text-5xl">
    Prima Riga
  </span>
  <span className="block text-base sm:text-xl md:text-2xl lg:text-3xl">
    Seconda Riga
  </span>
</h2>
```

---

## Manutenzione

Questo style guide deve essere aggiornato quando:
- Si introduce un nuovo pattern di design
- Si modificano colori o dimensioni standard
- Si aggiungono nuove sezioni con stili specifici
- Si identificano best practices aggiuntive

**Ultimo aggiornamento**: Dicembre 2024
