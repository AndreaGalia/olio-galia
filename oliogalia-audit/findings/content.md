# Content Quality & E-E-A-T Audit — oliogalia.com
**Date:** 2026-06-28
**Analyst:** seo-content skill
**Pages covered:** Homepage, About (/about), Sostenibilità (/sostenibilita), Products (/products + product detail pages), FAQ (/faq), Contact (/contact)
**Source:** Live fetch + source code analysis (`src/data/locales/it.json`, component files, metadata configs)

---

## Overall Scores

| Dimension | Score | Notes |
|---|---|---|
| **Content Quality Score** | **46 / 100** | Dragged down by empty FAQ, 500 errors on all product pages, hero thin-content |
| **E-E-A-T (total)** | **52 / 100** | Strong family narrative; weak evidence, no editorial content |
| **AI Citation Readiness** | **28 / 100** | No quotable structured answers, no schema for FAQ, no blog corpus |

---

## E-E-A-T Breakdown

| Factor | Score | Key Signals Present | Key Signals Missing |
|---|---|---|---|
| **Experience** | 11 / 25 | Three-generation timeline (1940–2025), cultivar named (Tonda Iblea), cold-press within 24 h claim | No harvest diary, no original photography of olive groves or mill, historical family photos are TODOs in source (`/nonno-paolo-1940.jpg` uninserted), no first-hand data (yield/ha, acidity measurements), no video tour |
| **Expertise** | 12 / 25 | Three brothers with named credentials (agronomy degree, marketing+export master, CPA), DOP and BIO certifications mentioned, polyphenol retention claim, 0.3% max acidity stated in FAQ | Certifications have no links to certifying body, no certificate numbers, award "Premio Regionale Qualità Olio 2023" unverified, FAQ Q&A not rendered on live page |
| **Authoritativeness** | 13 / 25 | Organization + WebSite JSON-LD present, product schema wired, breadcrumb schema on product pages | `sameAs` array in Organization schema is empty (social links commented out), no press mentions, no third-party reviews displayed, product pages all return HTTP 500 so schema is unreachable by crawlers |
| **Trustworthiness** | 16 / 25 | VAT number (P.IVA 02180350890) visible, physical address in footer (Via Umberto I 121, Ferla SR), privacy policy + cookie policy + T&C present and dated (19 Dec 2025), Stripe badge, HTTPS, GDPR-compliant data table | FAQ contact-info block in i18n carries placeholder values (`info@example.it`, `+39 XXX XXX XXXX`) that may render live, product pages 500 breaks purchase trust, no opening hours, no stated response-time SLA |

---

## Page-by-Page Analysis

---

### 1. Homepage — https://oliogalia.com

**Meta title:** `Olio Galia - Olio Extra Vergine di Oliva`
**Meta description:** `Scopri l'eccellenza dell'olio extra vergine di oliva Olio Galia. Prodotto artigianale italiano di alta qualità.`
**Estimated word count:** ~960 words
**H1:** `Olio Galia` (brand name only — no keyword value)

#### Content Inventory
| Section | Content | Est. Words |
|---|---|---|
| Hero | "Eccellenza / Natura / Tradizione" + empty description fields | ~30 |
| Why Choose | 3 USP cards (quality, shipping, tradition) | ~150 |
| Products teaser | JS-loaded product grid | ~100 |
| CasaSection (tradition) | 5-line paragraph + CTA | ~80 |
| OlivaSection (quality) | 2-line subheading + 2-line body | ~40 |
| AboutSection | 3 paragraphs about 1940 heritage | ~200 |
| Footer | Brand tagline + nav links + newsletter | ~200 |

#### Issues

| ID | Severity | Finding |
|---|---|---|
| HP-01 | **CRITICAL** | Hero `description.main` and `description.secondary` are empty strings in `it.json` (and `en.json`). The above-the-fold section renders only three single-word headings ("Eccellenza / Natura / Tradizione") with zero supporting copy. This fails the "Why does it exist?" test and signals thin content to crawlers indexing the initial HTML. |
| HP-02 | **HIGH** | H1 is the brand name "Olio Galia" with no keyword. A search engine cannot determine primary topic. Ideal H1: "Olio Extravergine di Oliva Biologico Siciliano — Olio Galia". |
| HP-03 | **HIGH** | Homepage meta description is generic and does not include any differentiating claim (no origin DOP, no production method, no variety). |
| HP-04 | **MEDIUM** | No testimonials or review count surfaced on homepage. Trust signals are limited to payment badges. |
| HP-05 | **MEDIUM** | "Qualità Certificata" card says certifications guarantee excellence but no certification name is disclosed on this page. Vague claim. |
| HP-06 | **LOW** | "Spedizione Rapida" card has a template token `€{threshold}` as the free-shipping threshold — the real value may not be injecting correctly (check runtime config). |

#### Positive signals
- Physical address, phone, email, and VAT number in footer.
- Organization + WebSite JSON-LD injected from `generateOrganizationSchema()` and `generateWebsiteSchema()`.
- Three-generation heritage claim with specific year (1940) adds credibility anchor.
- Canonical tag set to `/`.

---

### 2. About / Chi Siamo — https://oliogalia.com/about

**Meta title:** `Chi Siamo - Olio Galia`
**Meta description:** `Scopri la storia di Olio Galia, i nostri valori e la passione per la produzione di olio extra vergine di oliva biologico di qualità superiore.`
**Estimated word count:** ~1,200 words
**H1:** `Una storia di famiglia`

#### Content Inventory
| Section | Content | Est. Words |
|---|---|---|
| Hero intro | Family passion statement + 1940 origin | ~80 |
| Timeline (3 events) | 1940 founding, 2020 brand idea, 2025 launch | ~180 |
| Brothers section | 3 profiles with credentials, quotes, achievements | ~450 |
| Values section | 3 value cards (Quality, Family, Tradition) | ~120 |
| Manifesto | 3 historical-style poster quotes | ~100 |
| CTA | Catalog + Contact links | ~30 |

#### Issues

| ID | Severity | Finding |
|---|---|---|
| AB-01 | **HIGH** | All family photos are content TODOs in the source: `"imageNote": "(Inserire immagine: /nonno-paolo-1940.jpg)"` and `"imageNote": "Inserire: {photo}"` for each brother. Without actual photographs, the "Experience" pillar of E-E-A-T is unsubstantiated — names and roles exist but faces do not, reducing trust. |
| AB-02 | **HIGH** | Brothers' quantified achievements ("Export in 12 Paesi", "Partnership con 50+ Ristoranti", "Premio Regionale Qualità Olio 2023") exist in the i18n file but have no external verification links. These specific numbers without sources may backfire if users try to verify. "Premio Regionale" without naming the prize body is unverifiable. |
| AB-03 | **HIGH** | "Certificazione Biologica EU" and "Certificazione ISO 22000" and "Certificazione HACCP" are listed as brother achievements — if these certifications are real, they should be displayed as document links or badge images with issuing body name. |
| AB-04 | **MEDIUM** | About page stats section (`aboutPage.stats`) has labels ("Ettari Coltivati", "Piante di Ulivo", "Litri/Anno", "Paesi Export") but no actual numbers in the source — this section likely renders with missing values. Blank stat numbers undermine credibility. |
| AB-05 | **MEDIUM** | Timeline gap: the business was "inattiva" (inactive) between 1940 and 2020 — 80 years of gap. The copy acknowledges this ("Dopo anni in cui l'azienda rimase inattiva") without explanation. A single sentence of context would improve authenticity. |
| AB-06 | **LOW** | Page has no `Person` JSON-LD schema for the three named founders. Google can parse names from text but explicit schema would strengthen entity recognition for AI citations. |
| AB-07 | **LOW** | Manifesto uses stylized poster quotes ("SANI E FORTI COME GOLIA") that are evocative but do not convey product information. They are pure brand aesthetics with no E-E-A-T contribution. |

#### Positive signals
- Named individuals with specific roles and specializations — uncommon for small food brands.
- Three distinct expertise domains covered (agronomic, commercial, administrative).
- Specific cultivar named (Tonda Iblea) shows genuine knowledge.
- Canonical URL set, Open Graph tags generated via `generatePageMetadata()`.

---

### 3. Sostenibilità — https://oliogalia.com/sostenibilita

**Meta title:** `Sostenibilità - Olio Galia`
**Meta description:** `Scopri il nostro impegno per una produzione olearia sostenibile: agricoltura biologica, raccolta a mano e filiera corta nel rispetto della terra siciliana.`
**Estimated word count:** ~650 words
**H2 headings:** Agricoltura Biologica, Raccolta Selettiva, Filiera Corta

#### Issues

| ID | Severity | Finding |
|---|---|---|
| SO-01 | **HIGH** | "Agricoltura biologica certificata" is stated but no certification body is named, no registration number provided, no link to the certifying body (ICEA, Bioagricert, CCPB, etc.). A claim without evidence is marketing copy, not an E-E-A-T signal. |
| SO-02 | **HIGH** | All three sections are first-person claims without third-party validation or verifiable data. No external source is cited. Under the "How" test: how do we know? There is no proof offered. |
| SO-03 | **MEDIUM** | Page is missing an H1. The implied page heading derives from the `<title>` tag ("Sostenibilità"). Heading hierarchy starts at H2. Fix: add an H1 wrapper above the three sections (e.g., "Il Nostro Impegno per la Sostenibilità"). |
| SO-04 | **MEDIUM** | No quantitative claims: no carbon footprint data, no water usage, no packaging recyclability percentage. The waste disposal page (`/smaltimento-rifiuti`) exists as a separate page but is not linked from the Sostenibilità page. |
| SO-05 | **MEDIUM** | The polyphenol claim ("conservando al massimo i polifenoli") in the Filiera Corta section is the most citable statement on this page but is not quantified. Adding a polyphenol mg/kg value (e.g., ">400 mg/kg") with a reference to an analysis report would make this both trustworthy and AI-citable. |
| SO-06 | **LOW** | Page not included in sitemap.xml. Googlebot must discover it via internal links only. |

#### Positive signals
- "Entro 24 ore dalla raccolta" is a specific, quotable claim.
- "Nessun pesticida, nessun fertilizzante chimico" is clear and direct.
- Meta description covers all three pillars and is well-written.

---

### 4. FAQ — https://oliogalia.com/faq

**Meta title:** Not found (should be `Domande Frequenti - Olio Galia` based on `generatePageMetadata` call in page.tsx)
**Meta description:** `Trova le risposte alle domande più comuni sui nostri oli extravergini, la produzione e i servizi offerti da Olio Galia.`
**Estimated visible word count:** ~200–250 words
**Live content:** Zero Q&A pairs rendered — only heading "Domande Frequenti" and a "Contattaci" CTA

#### Critical Finding: FAQ Content Exists But Is Not Rendered

The `it.json` translation file contains **8 fully written FAQ questions with detailed answers** covering production, products, conservation, shipping, origin, certifications, farm visits, and quality assurance. However, the live page renders none of this content. The `FaqListSection` component either:
- Is not fetching/passing the translation data correctly, OR
- Has a rendering bug in `FaqListSection.tsx`

This is the most damaging single content gap on the site.

| ID | Severity | Finding |
|---|---|---|
| FK-01 | **CRITICAL** | FAQ page renders no Q&A content despite 8 questions existing in `it.json`. The page shows ~200 words (heading + description + CTA only). This wastes a high-value informational asset, eliminates FAQPage schema opportunity, and fails any "thin content" threshold check. |
| FK-02 | **CRITICAL** | FAQ contact info block in `it.json` contains unreplaced placeholder values: `"emailAddress": "info@example.it"`, `"phoneNumber": "+39 XXX XXX XXXX"`, `"whatsappNumber": "+39 XXX XXX XXXX"`. If this block renders, it shows fake contact information to users. |
| FK-03 | **HIGH** | No `FAQPage` JSON-LD schema is implemented. Even when Q&A content is fixed and rendered, the structured data layer is missing entirely. This eliminates eligibility for FAQ rich results and reduces AI citation probability. |
| FK-04 | **HIGH** | Page not in sitemap.xml. Combined with thin rendered content, this page is de-facto invisible to search engines. |
| FK-05 | **MEDIUM** | The FAQ question "Che certificazioni ha il vostro olio?" claims DOP certification, but live product pages error (HTTP 500) so this claim cannot be corroborated on the site. |
| FK-06 | **MEDIUM** | The question about farm visits ("È possibile visitare l'azienda?") mentions meeting "noi tre fratelli" — personal, experience-rich content that, when rendered, would be a strong E-E-A-T signal. Fixing the render bug unlocks this immediately. |

#### What the FAQ *would* cover (i18n source)
1. Come viene prodotto il vostro olio extravergine? (production process)
2. Qual è la differenza tra i vostri oli? (product differentiation)
3. Come conservare al meglio l'olio extravergine? (conservation)
4. Fate spedizioni in tutta Italia? (shipping)
5. L'olio è davvero prodotto in Sicilia? (origin claim)
6. Che certificazioni ha il vostro olio? (certifications — DOP, BIO)
7. È possibile visitare l'azienda? (farm visits — experience signal)
8. Come posso essere sicuro della qualità del vostro olio? (quality guarantee + soddisfatti-o-rimborsati)

---

### 5. Contact — https://oliogalia.com/contact

**Meta title:** `Contatti - Olio Galia`
**Meta description:** Not set (no `generatePageMetadata` call found in `contact/layout.tsx`)
**Estimated word count:** ~400–450 words

#### Issues

| ID | Severity | Finding |
|---|---|---|
| CO-01 | **HIGH** | No meta description on the contact page (`contact/layout.tsx` has no metadata export). Google will auto-generate a snippet, likely showing form labels — low CTR. |
| CO-02 | **MEDIUM** | No opening hours stated. For a direct-to-consumer food business, customers expect to know when they can reach someone. |
| CO-03 | **MEDIUM** | No response time commitment (e.g., "Rispondiamo entro 24 ore"). Setting expectations increases trust and conversion. |
| CO-04 | **LOW** | The `ContactFormTitle` component title is hardcoded as "Contattaci" — a generic H1. A richer H1 such as "Parla con la Famiglia Galia" reinforces the personal brand. |

#### Positive signals
- Three contact channels: phone, WhatsApp, email — good for different user preferences.
- Contact form present with server-side submission (Stripe/API integration confirmed).
- Physical address and VAT number available.

---

### 6. Product Pages — https://oliogalia.com/products/[slug]

**Status: HTTP 500 on all six product URLs in sitemap**
- `/products/latta-olio-5l` → 500
- `/products/latta-olio-3l` → 500
- `/products/beauty-oil-zagara` → 500
- `/products/premium-oil-bottle` → 500
- `/products/beauty-oil-gelsomino` → 500
- `/products/premium-6-oil-bottle` → 500

| ID | Severity | Finding |
|---|---|---|
| PR-01 | **CRITICAL** | All product detail pages return HTTP 500. This means no product content is accessible to users or search engine crawlers. Revenue is blocked. JSON-LD product schema (which is correctly implemented in source code) never reaches the browser. |
| PR-02 | **CRITICAL** | Sitemap.xml lists all six product slugs with priority 0.8. Googlebot will attempt to crawl these URLs and receive 500 errors, potentially triggering soft-404 or quality issues in Search Console. |
| PR-03 | **HIGH** | Product description infrastructure is well-architected: `description`, `longDescription`, `details`, `features`, `bestFor`, `origin`, `harvest`, `processing`, `nutritionalInfo`, `awards`, `productStory` fields all exist in the `Product` type. The content model can support rich, expert product pages — but none of this content is accessible while 500 errors persist. |
| PR-04 | **MEDIUM** | The `customHTML` field exists as a legacy fallback for products "not yet migrated to productStory" — a dev comment suggests inconsistent content completeness across products. |

---

### 7. Products Listing — https://oliogalia.com/products

**Estimated word count:** ~150 words (JS-rendered, only category navigation visible)

| ID | Severity | Finding |
|---|---|---|
| PL-01 | **HIGH** | Products listing page renders almost no indexable text content — product names, descriptions, and prices are all JavaScript-rendered and not available in the initial HTML. Search engine crawlers and AI systems cannot read product information. |
| PL-02 | **MEDIUM** | No category-level description text. The "Olio Extravergine d'Oliva" and "Linea Benessere" category pages lack any editorial copy that explains what each category contains. |

---

## Cross-Cutting Issues

### Thin Content Summary

| Page | Visible Words | Threshold | Status |
|---|---|---|---|
| Homepage | ~960 | 500 | Pass (but hero is empty) |
| About | ~1,200 | 500 | Pass |
| Sostenibilità | ~650 | 500 | Pass |
| FAQ | ~220 | 500 | **FAIL — critical** |
| Contact | ~425 | 500 | **FAIL** |
| Products listing | ~150 | 500 | **FAIL** |
| Product detail pages | 0 (500 error) | 300+ | **FAIL — critical** |

### Google "Who / How / Why" Test

| Page | Who | How | Why | Pass? |
|---|---|---|---|---|
| Homepage | Brand name only — no named authors | Production mentioned vaguely | Clear commercial intent | Partial |
| About | Three named individuals with credentials | Timeline of business decisions | Yes — genuine heritage story | Partial (photos missing) |
| Sostenibilità | "Noi" — no byline | Methods described but unverified | Yes — environmental commitment | Partial |
| FAQ | No author | N/A — content not rendered | N/A | **Fail** |
| Contact | N/A | N/A | Yes | Pass |
| Products | N/A | Not accessible (500) | Yes | **Fail** |

### Structural / Schema Issues

| ID | Severity | Finding |
|---|---|---|
| SCH-01 | **HIGH** | Organization schema `sameAs` array is empty — all social links are commented out in `src/lib/seo/structured-data.tsx`. This prevents entity consolidation across platforms and reduces brand authority signals for AI search engines. |
| SCH-02 | **HIGH** | No `FAQPage` or `QAPage` JSON-LD anywhere on the site. The FAQ content in `it.json` is well-structured and would directly map to `FAQPage` schema. |
| SCH-03 | **MEDIUM** | No `Person` schema for the three named founders (Luca, Andrea, Lorenzo Galia). Named individuals in schema strengthen entity recognition. |
| SCH-04 | **MEDIUM** | Product schema uses `Math.random()` for the `id` attribute on the `<Script>` tag: `id={\`structured-data-${Math.random()}\`}`. This causes hydration inconsistencies and may result in duplicate or missing schema injections. Replace with a stable deterministic ID. |
| SCH-05 | **LOW** | `/sostenibilita` and `/faq` are absent from `sitemap.xml`. Add both. |

### AI Citation Readiness

| Signal | Present? | Notes |
|---|---|---|
| Clear quotable statements with statistics | Partial | "Entro 24 ore dalla raccolta", "acidità inferiore allo 0,3%" exist in FAQ source but are not rendered |
| FAQPage / QAPage schema | No | Missing entirely |
| Answer-first formatting | No | Content is narrative, not Q&A format |
| First-party data (yield, analysis reports) | No | No lab reports, no polyphenol figures, no harvest statistics |
| Heading hierarchy H1→H2→H3 | Partial | About and FAQ pages have correct hierarchy; Sostenibilità is missing H1 |
| Tables for comparative data | No | No comparison tables across products or between grades of olive oil |
| Author attribution with schema | No | No `Person` schema, no bylines on content pages |
| llms.txt file | Not checked | Should be verified and implemented |

**AI Citation score: 28/100** — The site's strongest citable asset (production process with 24h crushing, organic certification, Tonda Iblea cultivar) is either buried in non-rendered FAQ or stated without quantification. AI systems can only cite what is explicitly quotable and accessible.

---

## Missing Content Opportunities (Priority Ordered)

| Priority | Opportunity | Rationale |
|---|---|---|
| 1 | **Fix FAQ rendering + add FAQPage schema** | Immediate win — content already written in `it.json`. Fixes thin content, enables rich results, AI citation. |
| 2 | **Fix product page HTTP 500 errors** | Revenue-blocking. No content audit can compensate for inaccessible product pages. |
| 3 | **Production / harvest blog or news section** | Zero editorial content. A monthly harvest update or olive oil guide (storage, pairing, health) would build topical authority and provide AI-citable corpus. Target: 4 articles covering core search topics. |
| 4 | **Certification documentation page** | Create a dedicated `/certificazioni` page with images/PDFs of BIO certificate (issuing body, registration number, expiry), DOP documentation, HACCP certificate. Links to official registries (MIPAAF, certifying body). |
| 5 | **Insert family photographs** | Replace `TODO` image notes with real photography. Homepage hero photos of olive groves, brothers at work, and the mill are the single highest-impact E-E-A-T fix possible without writing a word. |
| 6 | **Quantified product pages** | When 500 errors are resolved: add polyphenol content (mg/kg), acidity (%), harvest date, and sensory profile (fruttato, amaro, piccante intensity 1–10) to each product. These are AI-citable facts. |
| 7 | **Add `Person` schema for the three brothers** | Low effort, immediate entity-recognition benefit for AI search. |
| 8 | **Fill homepage hero description** | The `description.main` and `description.secondary` fields in `it.json` are empty. Add 1–2 sentences that convey the primary proposition and include target keyword. |
| 9 | **Add meta description to Contact page** | `contact/layout.tsx` exports no metadata. One missing line of code. |
| 10 | **Add sostenibilita + faq to sitemap.xml** | Sitemap generated from `src/app/sitemap.ts` — update the URL list. |
| 11 | **Customer testimonials / reviews hub** | Product review infrastructure exists in code. Surface aggregate ratings on the homepage and category pages once product pages are live. |
| 12 | **Video content** | Hero "Guarda il Video" CTA exists in the translation file but likely links nowhere or to a missing asset. A 2–3 minute mill tour video is the single most powerful Experience signal possible. |
| 13 | **Olive oil buyer's guide content cluster** | Target queries: "come scegliere olio extravergine", "olio extravergine biologico differenze", "varietà olive siciliane", "tonda iblea caratteristiche". Hub-and-spoke with Sostenibilità as a spoke. |

---

## Recommended Action Plan

### Immediate (Week 1) — Fix Broken Infrastructure

1. **Diagnose and fix HTTP 500 on all product pages.** Check database connectivity, Stripe product fetch, and Next.js dynamic route hydration. This is revenue-blocking.
2. **Debug `FaqListSection` component** — identify why 8 FAQ items from `it.json` do not render on `/faq`. Likely a missing prop pass or conditional render bug.
3. **Replace placeholder contact values in `it.json`**: Change `"info@example.it"` → `info@oliogalia.it`, `+39 XXX XXX XXXX` → `+39 3793475975` in `faq.contact.info` and `footer.contact` sections.
4. **Fill hero description fields** in `it.json` (`hero.description.main` and `hero.description.secondary`).

### Short-term (Weeks 2–4) — E-E-A-T Foundation

5. **Add family photographs** (nonno Paolo 1940, three brothers, olive grove, mill).
6. **Add `FAQPage` JSON-LD schema** once FAQ renders. Map the 8 existing Q&A pairs.
7. **Add `Person` schema** for Luca, Andrea, Lorenzo Galia.
8. **Fill `sameAs` array** in Organization schema with actual Instagram/Facebook profiles.
9. **Add `Sostenibilità` and `FAQ` to sitemap.xml**.
10. **Add meta description** to `contact/layout.tsx`.
11. **Add H1 to Sostenibilità page** above the three section cards.
12. **Fix the `Math.random()` script ID** in `StructuredData` component — use a hash of the data instead.

### Medium-term (Month 2) — Content Depth

13. **Publish 4 editorial articles** covering olive oil topics where oliogalia.com can demonstrate expertise (Tonda Iblea cultivar guide, cold-press vs. filtered, polyphenol health benefits, Sicilian DOP olive oils comparison).
14. **Create `/certificazioni` page** with scan/PDF of BIO cert, DOP documentation, HACCP certificate.
15. **Enrich product pages** (once live) with polyphenol values, acidity %, harvest year, and sensory scores.
16. **Add contact page metadata** and customer response time promise ("Rispondiamo entro 24 ore").
17. **Verify and quantify stat placeholders** in About page (`aboutPage.stats`) — real hectares, plant count, annual liters, export countries.

---

## Appendix: Source Evidence

| Source file | Key finding |
|---|---|
| `src/data/locales/it.json` lines 12–15 | `hero.description.main: ""` and `hero.description.secondary: ""` — empty |
| `src/data/locales/it.json` lines 106, 135 | Photo TODOs for about page historical image and brother photos |
| `src/data/locales/it.json` lines 221–228 | FAQ contact info block with placeholder email and phone |
| `src/data/locales/it.json` lines 280–285 | Footer contact block with placeholder address and phone |
| `src/data/locales/it.json` lines 411–415 | About stats labels but no values: `"hectares": "Ettari Coltivati"` etc. |
| `src/lib/seo/structured-data.tsx` lines 22–27 | `sameAs: []` — empty social array |
| `src/lib/seo/structured-data.tsx` line 197 | `id={\`structured-data-${Math.random()}\`}` — non-deterministic ID |
| `src/app/(marketing)/contact/page.tsx` | No metadata export — contact page lacks meta description |
| `src/app/sitemap.ts` | `/faq` and `/sostenibilita` absent from sitemap |
| Live fetch: `/faq` | ~220 words rendered; 0 Q&A pairs visible |
| Live fetch: `/products/[slug]` | HTTP 500 on all 6 product URLs |
