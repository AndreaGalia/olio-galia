# 📊 Guida Completa Metadata e SEO - Olio Galia

Questa guida spiega come funziona il sistema di metadata e SEO implementato nell'e-commerce Olio Galia.

## 📑 Indice

1. [Panoramica](#panoramica)
2. [Architettura SEO](#architettura-seo)
3. [Campi SEO per Prodotti](#campi-seo-per-prodotti)
4. [Come Usare i Campi SEO nell'Admin](#come-usare-i-campi-seo-nelladmin)
5. [Metadata per Pagine](#metadata-per-pagine)
6. [Structured Data (JSON-LD)](#structured-data-json-ld)
7. [Sitemap Dinamico](#sitemap-dinamico)
8. [Robots.txt](#robotstxt)
9. [Best Practices SEO](#best-practices-seo)
10. [Testing e Validazione](#testing-e-validazione)

---

## 📖 Panoramica

Il sistema SEO implementato fornisce:

- ✅ **Metadata dinamici** per ogni pagina
- ✅ **Campi SEO personalizzabili** per ogni prodotto
- ✅ **Structured Data (JSON-LD)** per Google Rich Results
- ✅ **Open Graph** per social media (Facebook, LinkedIn)
- ✅ **Twitter Cards** per condivisioni su Twitter/X
- ✅ **Sitemap.xml** generato automaticamente
- ✅ **Robots.txt** con regole ottimizzate
- ✅ **Blocco indicizzazione** pagine admin
- ✅ **Supporto multilingua** (IT/EN)

---

## 🏗️ Architettura SEO

### File Principali

```
src/
├── lib/
│   └── seo/
│       ├── metadata.ts          # Utility per generare metadata
│       └── structured-data.tsx  # Componenti per JSON-LD
├── app/
│   ├── layout.tsx              # Root layout con metadataBase
│   ├── page.tsx                # Homepage con metadata
│   ├── robots.ts               # Robots.txt dinamico
│   ├── sitemap.ts              # Sitemap.xml dinamico
│   ├── (shop)/
│   │   └── products/
│   │       ├── layout.tsx      # Metadata catalogo
│   │       └── [slug]/
│   │           ├── layout.tsx  # Metadata dinamici prodotto
│   │           └── page.tsx    # Pagina prodotto con JSON-LD
│   ├── (marketing)/
│   │   ├── about/layout.tsx
│   │   ├── contact/layout.tsx
│   │   └── smaltimento-rifiuti/layout.tsx
│   └── admin/
│       └── layout.tsx          # Blocca indicizzazione admin
└── types/
    └── products.ts             # Types con campi SEO
```

### Flusso dei Metadata

```
1. Utente accede a una pagina
   ↓
2. Next.js esegue generateMetadata() nel layout
   ↓
3. Utility metadata.ts genera i metadata ottimizzati
   ↓
4. Metadata vengono inseriti nel <head> della pagina
   ↓
5. Structured data JSON-LD vengono aggiunti al <body>
   ↓
6. Google e altri search engine indicizzano la pagina
```

---

## 🎯 Campi SEO per Prodotti

### Schema Database

Ogni prodotto ha campi SEO multilingua in `ProductTranslations`:

```typescript
interface ProductTranslations {
  // ... altri campi

  // 📊 Campi SEO
  metaTitle?: string;        // Titolo SEO personalizzato (max 60 caratteri)
  metaDescription?: string;  // Meta description (max 160 caratteri)
  focusKeyphrase?: string;   // Parola chiave principale
  seoKeywords: string[];     // Parole chiave secondarie
}
```

### Esempio Dati Prodotto

```json
{
  "translations": {
    "it": {
      "name": "Olio Extra Vergine Biologico Premium",
      "description": "Olio di altissima qualità...",
      "metaTitle": "Olio Extra Vergine Biologico DOP - Olio Galia",
      "metaDescription": "Scopri il nostro olio extra vergine biologico DOP, prodotto artigianalmente in Sicilia. Qualità certificata, sapore unico. Ordina online!",
      "focusKeyphrase": "olio extra vergine biologico dop",
      "seoKeywords": [
        "olio biologico siciliano",
        "olio dop",
        "olio artigianale",
        "olio extravergine premium"
      ]
    },
    "en": {
      "name": "Premium Organic Extra Virgin Olive Oil",
      "metaTitle": "Premium Organic Extra Virgin DOP Olive Oil - Olio Galia",
      "metaDescription": "Discover our DOP organic extra virgin olive oil, handcrafted in Sicily. Certified quality, unique flavor. Order online!",
      "focusKeyphrase": "organic extra virgin olive oil dop",
      "seoKeywords": [
        "sicilian organic oil",
        "dop olive oil",
        "artisan olive oil",
        "premium extra virgin"
      ]
    }
  }
}
```

---

## 🖥️ Come Usare i Campi SEO nell'Admin

### 1. Creazione Nuovo Prodotto

1. Vai su `/admin/products/create`
2. Compila tutti i campi standard (nome, descrizione, prezzo, ecc.)
3. Scorri fino alla sezione **"📈 Ottimizzazione SEO"**
4. Compila i campi SEO:

#### **Meta Title** (Titolo SEO)
- **Cosa è**: Il titolo che appare nei risultati di ricerca Google
- **Lunghezza consigliata**: Max 60 caratteri
- **Esempio**: `Olio Extra Vergine Biologico DOP - Olio Galia`
- ⚠️ **Warning**: Se superi 60 caratteri, vedrai un avviso arancione

#### **Meta Description**
- **Cosa è**: La descrizione che appare sotto il titolo in Google
- **Lunghezza consigliata**: Max 160 caratteri
- **Esempio**: `Scopri il nostro olio extra vergine biologico DOP, prodotto artigianalmente in Sicilia. Qualità certificata, sapore unico.`
- ⚠️ **Warning**: Se superi 160 caratteri, vedrai un avviso arancione

#### **Focus Keyphrase** (Parola Chiave Principale)
- **Cosa è**: La parola chiave principale per cui vuoi posizionarti
- **Esempio**: `olio extra vergine biologico dop`
- 💡 **Tip**: Usa 2-4 parole correlate

#### **SEO Keywords** (Parole Chiave Secondarie)
- **Cosa è**: Parole chiave aggiuntive correlate
- **Esempio**:
  - `olio biologico siciliano`
  - `olio dop certificato`
  - `olio artigianale premium`
- 💡 **Tip**: Aggiungi 3-5 keywords correlate

### 2. Modifica Prodotto Esistente

1. Vai su `/admin/products`
2. Clicca su "Modifica" su un prodotto
3. Scorri fino alla sezione **"📈 Ottimizzazione SEO"**
4. Aggiorna i campi SEO
5. Salva

### 3. Esempio Completo

**Per un prodotto "Olio Extra Vergine Biologico 500ml":**

```
🇮🇹 ITALIANO

Meta Title: "Olio Extra Vergine Biologico 500ml - Olio Galia"
(48 caratteri ✓)

Meta Description: "Olio extra vergine biologico siciliano DOP da 500ml.
Produzione artigianale, raccolto a mano, spremitura a freddo. Ordina online!"
(142 caratteri ✓)

Focus Keyphrase: "olio extra vergine biologico siciliano"

SEO Keywords:
- olio biologico 500ml
- olio dop sicilia
- olio artigianale premium
- olio extravergine italiano

🇬🇧 ENGLISH

Meta Title: "Organic Extra Virgin Olive Oil 500ml - Olio Galia"
(54 caratteri ✓)

Meta Description: "Sicilian DOP organic extra virgin olive oil 500ml.
Artisanal production, hand-picked, cold-pressed. Order online!"
(122 caratteri ✓)

Focus Keyphrase: "organic extra virgin olive oil sicilian"

SEO Keywords:
- organic olive oil 500ml
- dop sicilian oil
- artisan premium oil
- italian extra virgin
```

---

## 📄 Metadata per Pagine

### Homepage (`src/app/page.tsx`)

```typescript
import { generateBaseMetadata } from '@/lib/seo/metadata';
import { StructuredData, generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo/structured-data';

export const metadata = generateBaseMetadata('it');

export default function HomePage() {
  return (
    <>
      <StructuredData data={generateOrganizationSchema()} />
      <StructuredData data={generateWebsiteSchema('it')} />
      {/* ... resto del contenuto ... */}
    </>
  );
}
```

**Genera automaticamente:**
- Title: `Olio Galia - Olio Extra Vergine di Oliva Biologico`
- Description ottimizzata
- Keywords rilevanti
- Open Graph tags
- Twitter Cards
- Organization schema
- WebSite schema con SearchAction

### Pagina Prodotto (`src/app/(shop)/products/[slug]/layout.tsx`)

```typescript
import { generateProductMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  return generateProductMetadata(product, 'it');
}
```

**Genera dinamicamente per ogni prodotto:**
- Meta Title (personalizzato o fallback al nome)
- Meta Description (personalizzata o fallback)
- Keywords (da focus keyphrase + seo keywords)
- Open Graph con immagine prodotto
- Twitter Card con immagine
- Canonical URL
- Language alternates (IT/EN)

### Pagine Marketing

**About** (`src/app/(marketing)/about/layout.tsx`):
```typescript
export const metadata = generatePageMetadata(
  'Chi Siamo',
  'Scopri la storia di Olio Galia...',
  '/about',
  'it',
  ['chi siamo', 'storia olio galia', 'produttori olio italiano']
);
```

**Contact** (`src/app/(marketing)/contact/layout.tsx`):
```typescript
export const metadata = generatePageMetadata(
  'Contatti',
  'Contatta Olio Galia per informazioni...',
  '/contact',
  'it',
  ['contatti', 'richiedi preventivo', 'contact us']
);
```

### Blocco Admin

**Admin Layout** (`src/app/admin/layout.tsx`):
```typescript
import { generateNoIndexMetadata } from '@/lib/seo/metadata';

export const metadata = generateNoIndexMetadata('Admin Panel');
```

**Genera:**
```html
<meta name="robots" content="noindex, nofollow, nocache">
<meta name="googlebot" content="noindex, nofollow, noimageindex">
```

---

## 🔍 Structured Data (JSON-LD)

### Cosa sono gli Structured Data?

Gli structured data sono dati strutturati in formato JSON-LD che aiutano Google a capire meglio il contenuto della pagina e possono generare **Rich Results** (risultati arricchiti) in Google Search.

### Organization Schema

**Dove**: Homepage

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Olio Galia",
  "url": "https://oliogalia.it",
  "logo": "https://oliogalia.it/images/logo.png",
  "description": "Produttore di olio extra vergine di oliva biologico",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IT"
  }
}
```

**Rich Result**: Google mostra il logo dell'azienda nei risultati

### WebSite Schema

**Dove**: Homepage

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Olio Galia",
  "url": "https://oliogalia.it",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://oliogalia.it/products?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

**Rich Result**: Google può mostrare una barra di ricerca direttamente nei risultati

### Product Schema

**Dove**: Pagina dettaglio prodotto

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Olio Extra Vergine Biologico 500ml",
  "description": "Olio di altissima qualità...",
  "image": ["https://oliogalia.it/images/product1.jpg"],
  "brand": {
    "@type": "Brand",
    "name": "Olio Galia"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://oliogalia.it/it/products/olio-biologico-500ml",
    "priceCurrency": "EUR",
    "price": "19.99",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Olio Galia"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "42"
  }
}
```

**Rich Result**:
- Stelle di valutazione
- Prezzo
- Disponibilità
- Immagine prodotto

### Breadcrumb Schema

**Dove**: Pagina dettaglio prodotto

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://oliogalia.it"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Prodotti",
      "item": "https://oliogalia.it/products"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Olio Extra Vergine Biologico",
      "item": "https://oliogalia.it/products/olio-biologico-500ml"
    }
  ]
}
```

**Rich Result**: Breadcrumb visibili nei risultati Google

---

## 🗺️ Sitemap Dinamico

### Come Funziona

Il file `src/app/sitemap.ts` genera automaticamente un sitemap.xml che include:

1. **Pagine statiche**:
   - Homepage
   - Catalogo prodotti
   - About
   - Contact
   - Smaltimento rifiuti

2. **Pagine dinamiche**:
   - Tutti i prodotti attivi dal database
   - Con slug IT e EN come alternate languages

### Struttura Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Homepage -->
  <url>
    <loc>https://oliogalia.it</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="it" href="https://oliogalia.it/it" />
    <xhtml:link rel="alternate" hreflang="en" href="https://oliogalia.it/en" />
  </url>

  <!-- Prodotti (dinamici) -->
  <url>
    <loc>https://oliogalia.it/products/olio-biologico-500ml</loc>
    <lastmod>2025-01-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="it"
                href="https://oliogalia.it/it/products/olio-biologico-500ml" />
    <xhtml:link rel="alternate" hreflang="en"
                href="https://oliogalia.it/en/products/organic-olive-oil-500ml" />
  </url>

  <!-- ... altri prodotti ... -->
</urlset>
```

### Priorità e Frequenza Aggiornamento

| Tipo Pagina | Priority | Change Frequency | Note |
|-------------|----------|------------------|------|
| Homepage | 1.0 | daily | Massima priorità |
| Catalogo Prodotti | 0.9 | daily | Cambia spesso |
| Prodotti | 0.8 | weekly | Aggiornati settimanalmente |
| About | 0.8 | monthly | Cambia raramente |
| Contact | 0.7 | monthly | Cambia raramente |
| Smaltimento | 0.6 | monthly | Informazioni statiche |

### Accesso al Sitemap

```
https://tuosito.com/sitemap.xml
```

---

## 🤖 Robots.txt

### Struttura

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: https://oliogalia.it/sitemap.xml
```

### Regole Spiegate

1. **User-agent: *** (Tutti i bot)
   - ✅ **Allow: /** - Permetti tutte le pagine pubbliche
   - ❌ **Disallow: /admin/** - Blocca pannello admin
   - ❌ **Disallow: /api/** - Blocca API routes
   - ❌ **Disallow: /_next/** - Blocca file Next.js interni
   - ❌ **Disallow: /static/** - Blocca file statici

2. **GPTBot** (OpenAI web crawler)
   - ❌ **Disallow: /** - Blocca completamente (evita AI training)

3. **CCBot** (Common Crawl)
   - ❌ **Disallow: /** - Blocca completamente (evita AI training)

4. **Google-Extended** (Google AI training)
   - ❌ **Disallow: /** - Blocca completamente (evita AI training)

### Accesso Robots.txt

```
https://tuosito.com/robots.txt
```

---

## ✅ Best Practices SEO

### 1. Titoli (Meta Title)

**✅ Buone Pratiche:**
- Lunghezza: 50-60 caratteri
- Include parola chiave principale
- Include brand name
- Unico per ogni pagina
- Descrittivo e accattivante

**Esempio Buono:**
```
Olio Extra Vergine Biologico DOP 500ml - Olio Galia
```

**❌ Esempio Cattivo:**
```
Acquista Olio - Shop Online - Olio Extra Vergine Biologico Certificato DOP della Sicilia 500ml - Olio Galia Store
(troppo lungo, 112 caratteri)
```

### 2. Meta Description

**✅ Buone Pratiche:**
- Lunghezza: 150-160 caratteri
- Include parola chiave principale
- Call-to-action (CTA)
- Valore unico del prodotto
- Persuasiva

**Esempio Buono:**
```
Olio extra vergine biologico DOP siciliano da 500ml. Produzione artigianale, raccolto a mano, spremitura a freddo. Ordina online con spedizione gratuita!
(158 caratteri ✓)
```

**❌ Esempio Cattivo:**
```
Olio.
(troppo corto, 5 caratteri)
```

### 3. Focus Keyphrase

**✅ Buone Pratiche:**
- 2-4 parole
- Rilevante per il prodotto
- Volume di ricerca moderato
- Non troppo competitiva

**Esempi Buoni:**
- `olio extra vergine biologico`
- `olio dop siciliano`
- `olio artigianale premium`

**❌ Esempi Cattivi:**
- `olio` (troppo generica, troppo competitiva)
- `olio extra vergine biologico certificato dop siciliano artigianale premium` (troppo lunga)

### 4. SEO Keywords

**✅ Buone Pratiche:**
- 3-5 keywords correlate
- Long-tail keywords (più specifiche)
- Sinonimi e variazioni
- Intent dell'utente

**Esempio Buono:**
```
- olio biologico certificato
- olio siciliano spremuto a freddo
- extra virgin olive oil organic
- olio dop bio premium
```

**❌ Esempio Cattivo:**
```
- olio
- biologico
- sicilia
- premium
(troppo generiche, senza contesto)
```

### 5. Immagini

**✅ Buone Pratiche:**
- Nomi file descrittivi: `olio-biologico-500ml.jpg`
- Alt text descrittivo: `Bottiglia di olio extra vergine biologico DOP 500ml Olio Galia`
- Formato WebP o JPEG ottimizzato
- Dimensioni appropriate (800x600px per prodotti)

**❌ Esempio Cattivo:**
- Nome file: `IMG_1234.jpg`
- Alt text mancante

### 6. URL Structure

**✅ Buone Pratiche:**
- URL parlanti e descrittivi
- Trattini per separare parole
- Tutto minuscolo
- Breve e conciso

**Esempio Buono:**
```
/products/olio-biologico-500ml
```

**❌ Esempio Cattivo:**
```
/products/prod_12345_v2_new
```

---

## 🧪 Testing e Validazione

### 1. Google Search Console

**Setup:**
1. Vai su [Google Search Console](https://search.google.com/search-console)
2. Aggiungi la proprietà del sito
3. Verifica proprietà (via DNS o meta tag)
4. Invia sitemap: `https://tuosito.com/sitemap.xml`

**Test:**
- URL Inspection Tool
- Coverage Report
- Performance Report
- Core Web Vitals

### 2. Rich Results Test

**Tool:** [Rich Results Test](https://search.google.com/test/rich-results)

**Test:**
1. Inserisci URL prodotto
2. Verifica structured data rilevati:
   - Product
   - Breadcrumb
   - Organization
3. Controlla errori e warning

### 3. Meta Tags Checker

**Tool:** [Meta Tags](https://metatags.io/)

**Test:**
1. Inserisci URL
2. Controlla preview Google
3. Controlla preview Facebook
4. Controlla preview Twitter

### 4. Schema Markup Validator

**Tool:** [Schema.org Validator](https://validator.schema.org/)

**Test:**
1. Inserisci URL o codice JSON-LD
2. Verifica validità schema
3. Controlla errori sintattici

### 5. Lighthouse SEO

**Tool:** Chrome DevTools > Lighthouse

**Test:**
1. Apri pagina prodotto
2. Esegui audit Lighthouse
3. Controlla punteggio SEO (target: 90+)
4. Segui raccomandazioni

**Checklist Lighthouse:**
- ✅ Document has a `<title>` element
- ✅ Document has a meta description
- ✅ Page has successful HTTP status code
- ✅ Links are crawlable
- ✅ Page isn't blocked from indexing
- ✅ Document has a valid hreflang
- ✅ Document uses legible font sizes
- ✅ Tap targets are sized appropriately

### 6. Mobile-Friendly Test

**Tool:** [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

**Test:**
1. Inserisci URL
2. Verifica mobile-friendliness
3. Controlla viewport settings
4. Verifica touch targets

---

## 📊 Monitoraggio Performance SEO

### KPI da Monitorare

1. **Impressioni** (Google Search Console)
   - Quante volte il sito appare nei risultati di ricerca

2. **Click** (Google Search Console)
   - Quanti utenti cliccano dal risultato di ricerca

3. **CTR** (Click-Through Rate)
   - Percentuale click / impressioni
   - Target: 3-5%

4. **Posizione Media**
   - Posizione media nei risultati Google
   - Target: Top 10 (prima pagina)

5. **Pagine Indicizzate**
   - Quante pagine sono nell'indice Google
   - Verifica: `site:tuosito.com` su Google

6. **Core Web Vitals**
   - LCP (Largest Contentful Paint): < 2.5s
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1

### Report Mensili

**Da Controllare Ogni Mese:**
- Nuove pagine indicizzate
- Query di ricerca top 10
- Pagine con più impressioni
- Pagine con CTR più alto
- Errori di copertura
- Structured data errori
- Mobile usability issues

---

## 🚀 Deployment Checklist

Prima di andare in produzione:

### Pre-Deploy
- [ ] Verificato tutti i campi SEO compilati per prodotti principali
- [ ] Testato metadata su pagine principali
- [ ] Validato structured data con Rich Results Test
- [ ] Verificato robots.txt corretto
- [ ] Verificato sitemap.xml generato correttamente
- [ ] Aggiunto `NEXT_PUBLIC_SITE_URL` nel `.env.production`

### Post-Deploy
- [ ] Verificato sito accessibile e indicizzabile
- [ ] Aggiunto sito a Google Search Console
- [ ] Inviato sitemap a Google Search Console
- [ ] Aggiunto sito a Bing Webmaster Tools
- [ ] Verificato Open Graph preview (Facebook Debugger)
- [ ] Verificato Twitter Card preview (Twitter Card Validator)
- [ ] Monitoraggio attivo per prime 2 settimane

### Maintenance Mensile
- [ ] Review Google Search Console per errori
- [ ] Update prodotti con nuovi dati SEO
- [ ] Analisi performance keywords
- [ ] Ottimizzazione prodotti con basso CTR
- [ ] Aggiornamento contenuti stagionali

---

## 💡 Suggerimenti Avanzati

### 1. Content Marketing

- Crea blog con articoli su olio d'oliva
- Guide "Come scegliere l'olio giusto"
- Ricette con olio extra vergine
- Storia e tradizione produzione olio

### 2. Local SEO

- Aggiungi Google Business Profile
- Usa LocalBusiness schema
- Ottimizza per ricerche locali ("olio siciliano", "olio Cassaro")

### 3. Link Building

- Collabora con food blogger
- Ottieni recensioni su siti tematici
- Partnership con ristoranti
- Directory prodotti biologici

### 4. User Experience

- Migliora velocità sito (Core Web Vitals)
- Ottimizza immagini (WebP, lazy loading)
- Mobile-first design
- Navigazione intuitiva

---

## 📞 Supporto

Per domande o problemi:

1. **Documentazione Next.js**: [https://nextjs.org/docs/app/building-your-application/optimizing/metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
2. **Google Search Central**: [https://developers.google.com/search](https://developers.google.com/search)
3. **Schema.org**: [https://schema.org/](https://schema.org/)

---

**Ultima Modifica**: Gennaio 2025
**Versione**: 1.0.0
