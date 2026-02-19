# Design Rules - Olio Galia (AI Instructions)

Questo documento contiene le regole di design da seguire per qualsiasi modifica al sito Olio Galia.

## REGOLE FONDAMENTALI

### 1. STILE GENERALE
- **Design minimalista**: nessun elemento decorativo non essenziale
- **Tutto squadrato**: NO rounded corners, NO gradienti, NO effetti hover complessi
- **Colori solidi**: utilizzare solo colori della palette senza gradienti

### 2. BOTTONI

```tsx
// ✅ CORRETTO - Bottone primario
className="bg-olive text-beige px-6 py-3 md:px-8 md:py-4 font-medium transition-all duration-300 border border-olive/20"

// ✅ CORRETTO - Bottone secondario
className="bg-white text-olive border border-olive px-6 py-3 md:px-8 md:py-4 font-medium transition-all duration-300"

// ❌ SBAGLIATO
className="bg-gradient-to-r from-olive to-salvia rounded-lg hover:scale-105"
```

**REGOLE BOTTONI**:
- ❌ NO `rounded-*` (nessun border radius)
- ❌ NO `bg-gradient-*` (nessun gradiente)
- ❌ NO `hover:scale-*` (nessun effetto zoom)
- ✅ SI colori solidi (`bg-olive`, `bg-white`, `bg-green-600`)
- ✅ SI `transition-all duration-300` (solo per colori)

### 3. TITOLI SEZIONI

**Pattern standard per tutti i titoli principali**:

```tsx
// Titolo su una riga
<h2 className="font-serif text-olive mb-6 leading-tight text-lg sm:text-3xl md:text-4xl lg:text-5xl">
  {title}
</h2>

// Titolo su due righe
<h2 className="font-serif text-olive mb-8 leading-tight">
  <span className="block mb-1 md:mb-2 text-lg sm:text-3xl md:text-4xl lg:text-5xl">
    {title.line1}
  </span>
  <span className="block text-base sm:text-xl md:text-2xl lg:text-3xl">
    {title.line2}
  </span>
</h2>
```

**REGOLE TITOLI**:
- Sempre `font-serif`
- Sempre `text-olive`
- Pattern responsive: `text-lg sm:text-3xl md:text-4xl lg:text-5xl`

### 4. CARD E CONTENITORI

```tsx
// ✅ CORRETTO
<div className="bg-beige/30 border border-olive/10 p-6 sm:p-8">
  {/* contenuto */}
</div>

// ❌ SBAGLIATO
<div className="bg-gradient-to-br from-beige to-sabbia rounded-xl shadow-2xl hover:shadow-3xl">
  {/* contenuto */}
</div>
```

**REGOLE CARD**:
- Background: `bg-beige/30`
- Border: `border border-olive/10`
- Padding: `p-6 sm:p-8` o `p-4 sm:p-6`
- ❌ NO `rounded-*`
- ❌ NO `shadow-*` eccessive
- ❌ NO hover effects sulla card

### 5. PALETTE COLORI

**Colori da utilizzare**:
- `olive` (#556B2F) - Testi importanti, titoli, bottoni primari
- `beige` - Sfondo, testo su elementi scuri
- `nocciola` - Testo secondario
- `salvia` - Accenti
- `sabbia-chiaro` - Sfondi alternativi
- `green-600` - Stati attivi

**Background comuni**:
- Card: `bg-beige/30`
- Bordi: `border-olive/10`
- Icon container: `bg-olive/10`

### 6. BRANDING "OLIO GALIA"

```tsx
// ✅ CORRETTO
{text.split('OLIO GALIA').map((part, index, array) => (
  index === array.length - 1 ? part : (
    <span key={index}>
      {part}
      <span className="font-bold">OLIO GALIA</span>
    </span>
  )
))}
```

**REGOLE**:
- Sempre in **MAIUSCOLO**: `OLIO GALIA`
- Sempre in **grassetto**: `font-bold`
- Mai "famiglia Galia" o "la Galia"

### 7. PRODUCT CARD

**Struttura minimalista**:

```tsx
<div className="relative bg-beige/30 border border-olive/10 transition-all duration-300">
  <ProductImage />
  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
    <ProductInfo />      {/* Nome + categoria */}
    <ProductPrice />     {/* Prezzo */}
    <StockInfo />        {/* Solo "Disponibile" o "Non disponibile" */}
    <ProductActions />   {/* Bottoni */}
  </div>
</div>
```

**Cosa NON mostrare**:
- ❌ Descrizione del prodotto
- ❌ Dettagli estesi
- ❌ Quantità esatta in magazzino (solo disponibilità)

### 8. RESPONSIVE SPACING

**Pattern da seguire**:
- Padding sezioni: `py-16 sm:py-20 lg:py-24`
- Container padding: `px-4 sm:px-6`
- Gap tra elementi: `gap-3 sm:gap-4` o `space-y-3 sm:space-y-4`

### 9. ELEMENTI DA RIMUOVERE

Quando si lavora su una sezione, rimuovere:
- ❌ Badge decorativi non essenziali
- ❌ Category pills
- ❌ Background decorations
- ❌ Icon containers con rounded-full (usare container quadrati)
- ❌ Divisori decorativi
- ❌ Effetti parallax o scroll complessi

### 10. TRANSIZIONI

```tsx
// ✅ PERMESSO - Transizione semplice
className="transition-all duration-300"

// ❌ VIETATO - Effetti complessi
className="hover:scale-105 hover:shadow-xl hover:rotate-1 transition-all"
```

**REGOLE**:
- Solo `transition-all duration-300`
- Solo per cambi di colore, non trasformazioni
- NO scale, rotate, translate su hover

---

## CHECKLIST RAPIDA

Prima di completare qualsiasi modifica, verificare:

- [ ] Tutti i bottoni sono **completamente squadrati** (0 border-radius)
- [ ] Nessun gradiente presente (`bg-gradient-*`)
- [ ] Titoli seguono il pattern: `text-lg sm:text-3xl md:text-4xl lg:text-5xl`
- [ ] Card usano `bg-beige/30 border border-olive/10`
- [ ] "OLIO GALIA" è maiuscolo e grassetto
- [ ] Nessun `hover:scale-*` o effetti zoom
- [ ] Nessun `rounded-*` su bottoni e container
- [ ] Colori della palette utilizzati correttamente
- [ ] Spaziatura responsive implementata
- [ ] Elementi decorativi non funzionali rimossi

---

## TEMPLATE COMPONENTI COMUNI

### Bottone con Icona

```tsx
<button className="bg-olive text-beige px-8 py-4 font-medium transition-all duration-300 border border-olive/20 flex items-center justify-center gap-2">
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    {/* icon path */}
  </svg>
  {text}
</button>
```

### Info Card

```tsx
<div className="bg-beige/30 border border-olive/10 p-6 sm:p-8">
  <div className="w-12 h-12 bg-olive/10 flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-olive" fill="currentColor" viewBox="0 0 20 20">
      {/* icon */}
    </svg>
  </div>
  <h3 className="text-lg font-medium text-olive mb-2">{title}</h3>
  <p className="text-nocciola">{description}</p>
</div>
```

### Contact Button Group

```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
  <button className="bg-olive text-beige px-6 sm:px-8 py-3 sm:py-4 font-medium transition-all duration-300 border border-olive/20 flex items-center justify-center gap-2">
    {/* Email */}
  </button>
  <button className="bg-white text-olive border border-olive px-6 sm:px-8 py-3 sm:py-4 font-medium transition-all duration-300 flex items-center justify-center gap-2">
    {/* Phone */}
  </button>
  <button className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 font-medium transition-all duration-300 border border-green-600 flex items-center justify-center gap-2">
    {/* WhatsApp */}
  </button>
</div>
```

---

## COMANDI RAPIDI PER L'AI

**Quando ricevi una richiesta di modifica**:

1. Leggi questo file prima di iniziare
2. Identifica quale sezione stai modificando
3. Applica le regole della checklist
4. Usa i template forniti
5. Verifica la conformità prima di completare

**Se l'utente chiede un elemento che viola le regole** (es. "aggiungi un bottone arrotondato"):
- Implementa la funzionalità richiesta
- Ma mantieni lo stile quadrato/minimale
- Spiega brevemente la scelta per coerenza

**Priorità**:
1. Funzionalità richiesta dall'utente
2. Conformità alle regole di design
3. Coerenza con il resto del sito
