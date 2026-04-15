# Typography Migration Guide

Regole per convertire la tipografia nei componenti al sistema adottato nel progetto.

---

## Classi disponibili in `globals.css`

### Termina (font titoli / label)

| Classe | Font-size | Uso tipico |
|---|---|---|
| `font-serif` | 17px (base) | Applica Termina con tutte le proprietà base |
| `font-serif termina-8` | 8px | Micro-testo, date, badge secondari, contatori |
| `font-serif termina-11` | 11px | Label uppercase, bottoni CTA, titoli accordion, breadcrumb |
| `font-serif termina-13` | 13.3px | Prezzo barrato, testi medi |
| `font-serif termina-22` | 22.8px | Prezzo principale |
| `breadcrumb` | 11.4px (rem) | Override size per breadcrumb (usare con `font-serif`) |

> `font-serif` va **sempre** abbinato a una classe `termina-X` tranne quando si vuole la size base di 17px.

### EB Garamond (font body)

| Classe | Font-size | Uso tipico |
|---|---|---|
| `garamond-13` | 13px, normal | Testo body, descrizioni, commenti, paragrafi |
| `body-garamond` | 11.4px, italic | Tagline, testi corsivo secondari |

---

## Regola colore

**Tutto il testo è `text-black`** — nessuna variante con opacità (`/40`, `/50`, `/60`, `/70`).

Eccezioni accettate:
- Stati disabilitati UI: `text-black/30` (es. bottone out-of-stock)
- Sfondi e bordi decorativi: `bg-black/10`, `border-black/10` — non sono testo, si lasciano

---

## Tabella di conversione

| Classe originale | → Classe target |
|---|---|
| `text-[11px] tracking-[0.2em] uppercase text-black/40` | `font-serif termina-11 tracking-[0.2em] uppercase text-black` |
| `text-[11px] tracking-[0.15em] uppercase text-black/50` | `font-serif termina-11 tracking-[0.15em] uppercase text-black` |
| `text-xs tracking-widest uppercase text-black/40` | `font-serif termina-11 tracking-widest uppercase text-black` |
| `text-xs tracking-wider text-black/40` | `font-serif termina-8 tracking-wider text-black` |
| `text-sm text-black/60 leading-relaxed` | `garamond-13` |
| `text-sm text-black/70 leading-relaxed` | `garamond-13` |
| `text-xs text-black/40` | `garamond-13` |
| `text-sm font-medium text-black` | `font-serif termina-11 tracking-[0.15em] uppercase text-black` |
| `text-2xl font-light text-black` | `font-serif termina-22 text-black` |
| `text-sm text-black/40 line-through` | `font-serif termina-13 text-black line-through` |

---

## Pattern ricorrenti

### Label di sezione
```tsx
// Prima
<p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-4">

// Dopo
<p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-4">
```

### Testo body / descrizione
```tsx
// Prima
<p className="text-sm text-black/60 leading-relaxed">

// Dopo
<p className="garamond-13">
```

### Bottone CTA
```tsx
// Prima
<button className="text-[11px] tracking-[3.4px] uppercase ...">

// Dopo
<button className="font-serif termina-11 tracking-[3.4px] uppercase ...">
```

### Bottone secondario / link testuale
```tsx
// Prima
<button className="text-xs tracking-wider text-black/40 underline underline-offset-2 hover:text-black">

// Dopo
<button className="font-serif termina-8 tracking-wider text-black underline underline-offset-2 hover:text-black">
```

### Titolo accordion
```tsx
// Prima
<span className="text-xs tracking-widest uppercase font-medium text-black group-hover:text-olive">

// Dopo
<span className="font-serif termina-11 tracking-widest uppercase text-black group-hover:text-olive">
```

### Numeri display grandi (rating, prezzi hero)
```tsx
// Usare inline style per clamp responsivo + fontFamily
<span
  className="text-black block"
  style={{ fontFamily: '"termina", sans-serif', fontSize: 'clamp(3.5rem, 10vw, 5rem)', lineHeight: 1, letterSpacing: '-0.02em' }}
>
```

---

## Checklist per ogni componente

- [ ] Tutti i `text-[11px]` → `font-serif termina-11`
- [ ] Tutti i `text-xs` → `font-serif termina-8` (label) o `garamond-13` (body)
- [ ] Tutti i `text-sm` → `garamond-13` (body) o `font-serif termina-13` (label medio)
- [ ] Tutti i `text-black/X` → `text-black` (tranne stati disabilitati)
- [ ] `font-medium`, `font-normal`, `font-light` → rimossi (gestiti dalle classi)
- [ ] `leading-relaxed` → rimosso se si usa `garamond-13` (già incluso nella classe)
