# Local SEO Audit — oliogalia.com

**Audit Date:** 2026-06-28
**Brand:** Olio Galia — Extra Virgin Olive Oil, Ferla (SR), Sicily, Italy
**Business type:** E-commerce producer (not a storefront); ships nationally and internationally
**Source files inspected:** `src/lib/seo/structured-data.tsx`, `src/lib/seo/metadata.ts`, `src/app/layout.tsx`, `src/data/locales/it.json`, `src/data/productStories.ts`, `src/components/layout/Footer.tsx`, `src/components/contactPage/ContactInfoSection.tsx`, `src/app/(marketing)/about/page.tsx`, `src/app/(marketing)/faq/page.tsx`, `src/app/(marketing)/contact/page.tsx`

---

## Local SEO Health Score: 19 / 100

| Dimension | Raw Score | Notes |
|-----------|-----------|-------|
| NAP Consistency | 10/100 | Active contradiction between pages; footer may show placeholder |
| Local Schema Markup | 5/100 | No LocalBusiness/FoodEstablishment schema; Organization schema truncated |
| GBP Signals | 15/100 | No GBP-linkable signals detected in crawlable content |
| Local Keyword Coverage | 25/100 | Strong in product stories; absent from homepage H1/meta |
| Citation Readiness | 20/100 | No directory presence detected; structured NAP not crawlable |
| International Signals | 20/100 | EN locale exists but /en 404s; no hreflang tags |

---

## 1. NAP Consistency — CRITICAL CONFLICT FOUND

**[CRITICAL]** A direct contradiction exists between the root layout metadata and all other site content.

### Conflict table

| Source | Location value | File |
|--------|---------------|------|
| `layout.tsx` export const metadata | `"100% Olio Extravergine da Cassaro, Sicilia"` | `src/app/layout.tsx:47` |
| `/about` page content | Via Umberto I, n.121 **Ferla (SR)** | WebFetch extract |
| `productStories.ts` (all products) | `"Ferla (Siracusa) — Monti Iblei, Sicilia"` | `src/data/productStories.ts:63,161,391,489,590,703` |
| Privacy Policy | "con sede legale in Sicilia, Italia" (no city) | `src/data/locales/it.json:1114` |
| Footer fallback in it.json | `"Via Example 123, Città"` (**placeholder never replaced**) | `src/data/locales/it.json:282` |
| GEO audit llms.txt recommendation | Via Umberto I, n.121 — 96010 Ferla (SR) | `/oliogalia-audit/findings/geo.md` |

**Cassaro** (a different comune, ~10 km from Ferla) appears only in the root layout description. This contradicts the physical address on every other page. Google's NAP parser will detect this conflict and may suppress the business in local pack results.

**The footer contact address** is currently rendered from `process.env.NEXT_PUBLIC_CONTACT_ADDRESS || t.footer.contact.address`. The fallback value in `it.json` is literally `"Via Example 123, Città"` — a placeholder. If the environment variable is not set in production, every page footer shows a fictional address. This is the highest-severity NAP issue on the site.

**Fix (two changes):**
1. `src/app/layout.tsx` line 47 — change `description` to: `'Olio extravergine di oliva Tonda Iblea prodotto a Ferla (SR), Sicilia, dal 1940.'`
2. `src/data/locales/it.json` line 282 — change `"address": "Via Example 123, Città"` to `"address": "Via Umberto I, n.121 — Ferla (SR), Sicilia"` as a guaranteed fallback

---

## 2. LocalBusiness Schema — MISSING ENTIRELY

**[CRITICAL]** No `LocalBusiness` (or its food-sector subtypes) schema exists anywhere on the site. The current `Organization` schema in `src/lib/seo/structured-data.tsx` (lines 10–28) has:
- `addressCountry: 'IT'` only — no `streetAddress`, `addressLocality`, `postalCode`, `addressRegion`
- `telephone` absent
- `sameAs` array is **completely commented out** (lines 22–25)
- `openingHoursSpecification` absent
- `geo` (latitude/longitude) absent
- `priceRange` absent
- `hasMap` (Google Maps link) absent

### Recommended JSON-LD block

Add a `LocalBusiness` / `FoodEstablishment` schema alongside the existing `Organization` schema. Insert it in `generateOrganizationSchema()` or as a separate export called `generateLocalBusinessSchema()`:

```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "FoodEstablishment"],
  "name": "Olio Galia",
  "description": "Produttore di olio extravergine di oliva Tonda Iblea, Monti Iblei, Sicilia. Azienda familiare dal 1940, frangitura a freddo entro 24 ore dalla raccolta.",
  "url": "https://oliogalia.com",
  "logo": "https://oliogalia.com/images/logo.png",
  "image": "https://oliogalia.com/images/og-image.jpg",
  "telephone": "+393793475975",
  "email": "info@oliogalia.it",
  "taxID": "02180350890",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Via Umberto I, n.121",
    "addressLocality": "Ferla",
    "addressRegion": "SR",
    "postalCode": "96010",
    "addressCountry": "IT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "37.0757",
    "longitude": "14.9402"
  },
  "areaServed": [
    {"@type": "Country", "name": "Italy"},
    {"@type": "AdministrativeArea", "name": "Sicilia"}
  ],
  "servesCuisine": "Italian",
  "priceRange": "€€",
  "foundingDate": "1940",
  "sameAs": [
    "https://www.instagram.com/oliogalia",
    "https://www.facebook.com/oliogalia",
    "https://www.tiktok.com/@oliogalia",
    "https://www.pinterest.com/oliogalia"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Olio Extravergine d'Oliva Siciliano",
    "url": "https://oliogalia.com/products"
  }
}
```

**Note on coordinates:** 37.0757, 14.9402 are approximate for Ferla (SR). Verify against Google Maps before deploying.

**Note on sameAs:** Social links are wired in the footer but driven by `process.env.NEXT_PUBLIC_INSTAGRAM_URL` etc. (see `Footer.tsx` lines 95–148). The actual URLs must be resolved from environment config and hardcoded in schema or dynamically injected.

---

## 3. About Page — No Server-Side Metadata

**[High]** `src/app/(marketing)/about/page.tsx` is declared `"use client"` (line 3) and exports **no `metadata` object**. This means:
- The `/about` page inherits only the root layout's generic metadata (`title: 'Olio Galia'`, `description: '100% Olio Extravergine da Cassaro, Sicilia'` — the wrong location)
- Google cannot read a per-page title/description for `/about`
- The rich local content present in the `it.json` about sections (founder story, timeline, Ferla references) is rendered client-side and may not be indexed

**Local content present in source but not exposed in metadata:**
- "La scelta della varietà Tonda Iblea si rivela vincente" (`it.json:340`)
- "tre generazioni di passione siciliana" (`it.json:262`)
- "colline siciliane" (`it.json:88–89`)
- Brothers section mentions "Premio Regionale Qualità Olio 2023", "Corso Mastro Frantoiano" (`it.json:369`)
- "Export in 12 Paesi" — international signal (`it.json:379`)

**Fix:** Convert `AboutPage` to a server component (remove `"use client"`, move interactive hooks to child components), then add:

```ts
export const metadata: Metadata = generatePageMetadata(
  'La Nostra Storia',
  'Olio Galia nasce nel 1940 a Ferla (SR), nei Monti Iblei siciliani. Tre generazioni di produzione artigianale di olio extravergine Tonda Iblea, frangitura a freddo entro 24 ore dalla raccolta.',
  '/about',
  'it',
  ['storia olio galia', 'frantoio siciliano', 'olio extravergine Ferla', 'Tonda Iblea', 'Monti Iblei', 'famiglia Galia', 'olio siciliano Siracusa']
);
```

---

## 4. FAQ Page — Local Content Signals

**[Medium]** The FAQ page at `/faq` does export `metadata` (via `generatePageMetadata`) with keywords `['faq', 'domande frequenti', 'olio extravergine', 'olio galia', 'sicilia']`. However:

- Zero location-specific keywords: no Ferla, Siracusa, Monti Iblei, frantoio, DOP
- The `it.json` locale includes strong FAQ answers with local signals (certifications FAQ answer mentions DOP, origin FAQ confirms "uliveti nelle colline siciliane") but as noted in `geo.md`, FAQ content is **loaded client-side from MongoDB** and may not be indexed
- No `FAQPage` JSON-LD schema is implemented
- The FAQ answer confirming Sicilian origin ("Assolutamente sì. I nostri uliveti si trovano nelle colline siciliane dove il nostro nonno piantò i primi alberi nel 1940") is the best local trust signal on the site — it is invisible to crawlers

**Fix:** Add `FAQPage` schema and SSR the FAQ list. Also update FAQ metadata keywords:

```ts
export const metadata: Metadata = generatePageMetadata(
  'Domande Frequenti',
  'Risposte alle domande più comuni su Olio Galia: produzione a freddo a Ferla (SR), olive Tonda Iblea dei Monti Iblei, certificazioni DOP, spedizioni in Italia e Europa.',
  '/faq',
  'it',
  ['faq olio extravergine', 'produzione olio siciliano', 'olio Ferla Siracusa', 'Tonda Iblea DOP', 'frantoio siciliano Monti Iblei']
);
```

---

## 5. GBP Signals — Not Detectable from Site

**[High]** No Google Business Profile signals are present in the crawlable site content:

| Signal | Status |
|--------|--------|
| GBP link (`maps.google.com/...`) | Absent |
| `hasMap` property in schema | Absent |
| Google Maps embed on contact page | Not detected (contact page at `/contact` returns 404; correct path is `/contact`) |
| GBP category alignment (e.g., "Olive oil manufacturer") | Not set in schema |
| Review schema (`AggregateRating`) on homepage | Absent |
| Business hours | Absent from schema and contact page |
| `knowsAbout` fields linking to geographic region | Absent |

**Note on contact page URL:** `src/app/(marketing)/contact/page.tsx` is routed at `/contact` but this URL returned 404 during the GEO audit's WebFetch. Verify deployment routing and whether the correct URL is `/contact` or `/contatti`.

**GBP quick-wins:**
1. Create or claim GBP listing with exact NAP: "Olio Galia", Via Umberto I, n.121, 96010 Ferla (SR), +39 3793475975, info@oliogalia.it
2. Select primary category: **"Olive oil manufacturer"** (or "Produttore di olio d'oliva" in Italian GBP)
3. Add secondary categories: "Food producer", "Organic food store"
4. Embed Google Maps iframe on the contact page
5. Add `hasMap` to LocalBusiness schema pointing to the GBP URL once live
6. Add GBP profile URL to `sameAs` array in LocalBusiness schema

---

## 6. Local Keyword Opportunities

**[High]** The following target keywords have zero presence in homepage H1, H2s, or meta descriptions, despite being commercially relevant and geographically owned by this business:

### Priority keyword gaps

| Keyword (IT) | Keyword (EN) | Current status | Opportunity |
|-------------|-------------|---------------|-------------|
| olio extravergine Ferla | extra virgin olive oil Ferla | Present only in `productStories.ts` (not indexed if products 500) | H2 on homepage or About intro |
| frantoio siciliano | Sicilian olive oil mill | Mentioned only in `newsletter-template.ts` | FAQ answer, About H2 |
| olio siciliano Siracusa | Sicilian olive oil Syracuse | Zero occurrences in any front-end content | Location page or About meta |
| Tonda Iblea olio | Tonda Iblea olive oil | In product stories only | Product descriptions, FAQ |
| Monti Iblei olio | Monti Iblei olive oil | In product stories only | About/Sostenibilita body copy |
| olio extravergine biologico Sicilia | organic extra virgin olive oil Sicily | In `structured-data.tsx` description only | Homepage H2, meta description |
| olio DOP Sicilia | DOP Sicilian olive oil | In `it.json` FAQ answer only (client-rendered) | SSR'd FAQ, product descriptions |

### Keyword integration recommendations

**Homepage** (`src/app/page.tsx` / `generateBaseMetadata`):
- Current IT description: `'Scopri l\'eccellenza dell\'olio extra vergine di oliva Olio Galia. Prodotto artigianale italiano di alta qualità.'`
- Proposed: `'Olio extravergine di oliva Tonda Iblea prodotto a Ferla, Monti Iblei (SR), Sicilia. Frangitura a freddo entro 24 ore — tre generazioni dal 1940.'`

**Homepage H1 / hero section** (`it.json` hero): Currently `"Eccellenza / Natura / Tradizione"` — generic brand words, zero geographic or product type signal. Add a subtitle or badge: `"Olio extravergine siciliano — Ferla (SR), Monti Iblei"`.

**Footer brand description** (`it.json:262`): Currently "Dal 1940, tre generazioni di passione siciliana in ogni goccia." Already good — adding "a Ferla, provincia di Siracusa" would create a crawlable NAP-adjacent signal on every page.

---

## 7. Citation Opportunities — Italian Food Directories

**[Medium]** No Italian or international food directory citations were detected. For a premium Sicilian EVOO producer, the following directories are high-authority and relevant:

### Tier 1 — Highest priority (domain authority + topical relevance)

| Directory | URL | Notes |
|-----------|-----|-------|
| Gambero Rosso (Oli d'Italia) | gamberorosso.it | Annual EVOO guide; submission via press/producer portal |
| FLOS OLEI (Marco Oreggia) | flosoleiguide.com | World's most cited EVOO guide; submit samples annually |
| DOP Monti Iblei Consortium | if registered DOP | Consortium listing = strong geo authority link |
| Slow Food Presidia / Arca del Gusto | slowfood.com | Tonda Iblea from Monti Iblei qualifies for Presidio candidacy |
| Oliveoiltimes.com | oliveoiltimes.com | English-language citation; international audience |

### Tier 2 — Italian e-commerce & food directories

| Directory | URL | Notes |
|-----------|-----|-------|
| iFood (Mondadori) | ifood.it | Recipe/food media, accepts producer profiles |
| GialloZafferano producers | giallozafferano.it | Italy's largest recipe site; partner program |
| Made in Sicily (various) | madeinsicily.it / sicilianicreativiincucina.it | Regional directory |
| Gustolocale.it | gustolocale.it | Italian artisan food producers directory |
| Italianfoodnet.com | italianfoodnet.com | B2B export directory |

### Tier 3 — International markets (matching the "Export in 12 Paesi" claim)

| Directory | Market | Notes |
|-----------|--------|-------|
| TasteAtlas (Sicily / Tonda Iblea entry) | Global | Free submission; AI-cited for geographic food queries |
| Zomato / Yelp (as producer) | EN/Global | Less relevant but builds English NAP signals |
| The Olive Oil Times Awards | Global | Annual award; press pickup = backlink chain |
| Amazon.it / Eataly producer listing | IT + EU | Distribution channel AND citation |

**NAP format for all citations (use exactly):**
```
Olio Galia
Via Umberto I, n.121
96010 Ferla (SR) — Sicilia, Italia
P.IVA: 02180350890
Tel: +39 3793475975
Email: info@oliogalia.it
Web: https://oliogalia.com
```

---

## 8. Multi-Market International Signals

**[High]** The site claims "Export in 12 Paesi" (12 countries) in the About brothers section but has no international SEO infrastructure to match.

### Current state

| Signal | Status |
|--------|--------|
| `lang="it"` on `<html>` | Set (correct for Italian primary) |
| `hreflang` tags | **ABSENT** — no `<link rel="alternate" hreflang="...">` tags |
| `/en` URL | Returns 404 |
| `alternates.languages` in Next.js metadata | Not configured |
| English meta description | Defined in `generateBaseMetadata` but never deployed (no EN route) |
| `og:locale:alternate` | Not set |
| `translate="no"` on `<html>` | Set — prevents Google Translate auto-translation (may reduce EN visibility) |

### Key risk: `translate="no"` suppresses multilingual reach

`src/app/layout.tsx` line 61: `<html lang="it" translate="no">` and line 63: `<meta name="google" content="notranslate" />`. This deliberately blocks Google's automatic translation of the site. For a business targeting 12 export markets, this eliminates organic reach from non-Italian speakers unless a proper `/en` route is served.

### Recommendations

**Short-term (no new routes needed):**
1. Remove `translate="no"` from `<html>` and `<meta name="google" content="notranslate">` — allow Google to auto-translate while `/en` route is built
2. Add `og:locale:alternate` for `en_US` and `en_GB` to OpenGraph metadata (metadata.ts line 47)

**Medium-term (implement `/en` route):**
1. Create Next.js i18n routing (`/en/*` mirroring `/it/*`)
2. Add proper `hreflang` tags: `x-default` pointing to `/it`, `en` pointing to `/en`
3. The EN locale file (`src/data/locales/en.json`) exists and is complete — the infrastructure is there, routing just needs to be activated

**Target export markets to prioritize (based on Italian EVOO export data):**
- Germany (`de`) — largest EU market for Italian EVOO
- United States (`en-US`) — premium EVOO highest margin market
- United Kingdom (`en-GB`)
- Switzerland (`de-CH` / `fr-CH`)
- France (`fr`)

---

## 9. Summary: Severity-Ranked Action List

| # | Finding | Severity | File(s) to change | Effort |
|---|---------|----------|-------------------|--------|
| 1 | Root layout uses "Cassaro" — contradicts Ferla address everywhere else | CRITICAL | `src/app/layout.tsx:47` | 5 min |
| 2 | Footer address fallback is placeholder "Via Example 123, Città" | CRITICAL | `src/data/locales/it.json:282` | 5 min |
| 3 | No LocalBusiness / FoodEstablishment JSON-LD schema | CRITICAL | `src/lib/seo/structured-data.tsx` | 2 hrs |
| 4 | Organization schema address is `addressCountry: 'IT'` only — no city, street, postal code | CRITICAL | `src/lib/seo/structured-data.tsx:18-21` | 30 min |
| 5 | `sameAs` array in Organization schema is fully commented out | High | `src/lib/seo/structured-data.tsx:22-25` | 15 min |
| 6 | About page is `"use client"` with no exported metadata — inherits wrong root metadata | High | `src/app/(marketing)/about/page.tsx` | 1 hr |
| 7 | Homepage H1/meta description has zero local keywords (Ferla, Siracusa, Monti Iblei, Tonda Iblea) | High | `src/lib/seo/metadata.ts:28`, `src/data/locales/it.json:7-11` | 20 min |
| 8 | No GBP listing detectable / no Maps embed on contact page | High | External + `contact/page.tsx` | 1 day |
| 9 | `hreflang` tags absent despite multilingual content infrastructure existing | High | `src/lib/seo/metadata.ts` (alternates) | 2 hrs |
| 10 | `translate="no"` blocks international organic reach for export markets | High | `src/app/layout.tsx:61,63` | 5 min |
| 11 | FAQ metadata keywords have no location terms; FAQ content client-rendered | Medium | `src/app/(marketing)/faq/page.tsx` | 30 min |
| 12 | No citations in any Italian food directory or international EVOO guide | Medium | External outreach | Ongoing |
| 13 | Privacy policy says "sede legale in Sicilia, Italia" — no city | Low | `src/data/locales/it.json:1114` | 5 min |
| 14 | Footer brand description doesn't include city name — missed crawlable NAP signal | Low | `src/data/locales/it.json:262` | 5 min |

---

## 10. Quick-Win Priority Stack (first 30 days)

These five changes require minimal development time and fix the most damaging signals:

1. **Fix "Cassaro" → Ferla** in `layout.tsx` description — eliminates active Google NAP conflict
2. **Fix footer address placeholder** in `it.json` — ensures every page footer carries real address
3. **Expand Organization schema address fields** to include streetAddress / addressLocality / postalCode / telephone — makes the existing schema actually useful for local entity disambiguation
4. **Remove `translate="no"`** — restores Google auto-translation for 11 non-Italian export markets
5. **Add About page server metadata** with Ferla/Tonda Iblea/Monti Iblei keywords — highest-authority page for the brand story currently invisible to bots

**90-day local SEO target with all fixes implemented: 54–62 / 100**
