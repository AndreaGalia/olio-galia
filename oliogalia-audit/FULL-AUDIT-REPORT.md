# oliogalia.com — Full SEO Audit Report
**Date:** 2026-06-28 | **Stack:** Next.js 15 App Router / Vercel / MongoDB / Cloudflare R2 / Stripe
**Business:** Olio Galia — Premium Sicilian Extra Virgin Olive Oil | Founded 1940 | Ferla (SR), Sicily, Italy

---

## SEO Health Score: 36 / 100 — Needs Critical Intervention

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 41/100 | 9.0 |
| Content Quality | 23% | 46/100 | 10.6 |
| On-Page SEO | 20% | 32/100 | 6.4 |
| Schema / Structured Data | 10% | 20/100 | 2.0 |
| Performance (CWV) | 10% | 35/100 | 3.5 |
| AI Search Readiness | 10% | 28/100 | 2.8 |
| Images | 5% | 30/100 | 1.5 |
| **TOTAL** | | | **35.8 → 36 / 100** |

---

## Executive Summary

Olio Galia is a well-positioned premium brand with a compelling heritage story — three generations, founded 1940 in Ferla (Sicily), certified organic Tonda Iblea olives — but the website currently delivers **zero organic traffic value** due to a cascade of compounding technical failures.

The single most urgent finding: **`site:oliogalia.com` returns zero results — Google has not indexed a single page.** The root cause is that all 6 product pages (which constitute 55% of the sitemap) return HTTP 500 Internal Server Error. Googlebot encounters server errors on the majority of crawled URLs and suppresses indexation of the entire domain.

Six independent specialist agents identified the same critical failure independently. Until product pages are restored to HTTP 200 with server-side-rendered content, no other SEO investment will produce results.

Beyond the indexation crisis, the audit reveals a pattern of **"almost there" bugs**: FAQ content exists in `it.json` but the component doesn't render it; family photos are code TODOs; the hero description fields are empty strings; the footer address is a placeholder never replaced; the wrong town name ("Cassaro" instead of "Ferla") appears in the root layout description.

The good news: this brand has exceptional raw material. The 1940 heritage, Tonda Iblea cultivar specificity, "within 24 hours of harvest" milling claim, and the unique wellness product line (zagara, gelsomino beauty oils) are differentiated positions that no competitor in Ferla holds in combination. Most of the highest-impact fixes are low-effort code corrections, not content rewrites.

---

## Top 5 Critical Issues

| # | Issue | Impact | Effort |
|---|---|---|---|
| 1 | All 6 product pages return HTTP 500 | Site not indexed by Google | Medium |
| 2 | Product page is `"use client"` — content invisible to crawlers | Zero product SEO | High |
| 3 | JSON-LD injected via `next/script` (afterInteractive) + Math.random() ID | No rich results | Medium |
| 4 | www/non-www 307 redirect contradicts canonical tags | Link equity loss | Low |
| 5 | OG image and logo return 404 | Zero social sharing preview | Low |

## Top 5 Quick Wins (< 30 min each)

| # | Fix | File | Time |
|---|---|---|---|
| 1 | Fix "Cassaro" → "Ferla" in root description | `src/app/layout.tsx:47` | 5 min |
| 2 | Replace footer address placeholder with real address | `src/data/locales/it.json:282` | 5 min |
| 3 | Add OG image and logo to `/public/images/` | (copy files) | 10 min |
| 4 | Fix `metadataBase` fallback `.it` → `.com` | `layout.tsx:45`, `subscribe/layout.tsx:3` | 5 min |
| 5 | Add security headers to `next.config.ts` | `next.config.ts` | 20 min |

---

## Category Findings

---

### 1. Technical SEO — 41/100

Full details: `findings/technical.md`

#### Critical

**[C-1] Product pages are fully Client-Side Rendered (CSR)**
`src/app/(shop)/products/[slug]/page.tsx` opens with `"use client"`. All product content is fetched via `useProductBySlug()` hook after JS hydration. Initial HTML = loading spinner only. Googlebot sees zero product content.

**Fix:** Convert to Server Component. `layout.tsx` already has `getProduct()` — use it in `page.tsx` and isolate interactive children (add-to-cart) as Client Components.

**[C-2] JSON-LD structured data never in server-rendered HTML**
`StructuredData` component uses `next/script` without strategy prop (defaults to `afterInteractive`). Injected client-side only. Also: `id={structured-data-${Math.random()}}` causes React hydration mismatch on every render.

**Fix:** Use inline `<script type="application/ld+json">` tags in Server Components. Use stable caller-provided IDs.

**[C-3] www/non-www split with 307 TEMPORARY redirects**
- `oliogalia.com/products` → 307 (temporary) → `www.oliogalia.com/products`
- Canonical on www page points back to non-www → redirect loop signal
- 307 does NOT pass PageRank/link equity

**Fix in `vercel.json`:**
```json
{ "redirects": [{ "source": "/:path*", "has": [{"type": "host", "value": "www.oliogalia.com"}], "destination": "https://oliogalia.com/:path*", "permanent": true }] }
```

**[C-4] OG image and Organization logo return 404**
- `/images/og-image.jpg` → 404
- `/images/logo.png` → 404
Every social share shows blank image. Organization schema invalid.

**Fix:** Add files to `/public/images/` OR update paths to R2 CDN URLs in `src/lib/seo/metadata.ts` and `structured-data.tsx`.

**[C-5] English content completely uncrawlable — zero hreflang**
Locale stored in `localStorage`, never in URL. `/en` → 404. No hreflang tags anywhere. `html lang="it" translate="no"` globally. Product layout hardcodes `generateProductMetadata(product, 'it')`.

**Fix (architectural):** Next.js App Router `[locale]` segment routing (`/en/products`, `/it/products`). Add hreflang alternates. Submit EN sitemap.

**[C-6] HTTP 500 on all 6 product pages**
Server-side data fetch failure in Next.js (MongoDB/Stripe call in `layout.tsx generateMetadata` throwing). Next.js injects `<meta name="robots" content="noindex"/>` on 500 pages — Google actively de-indexes them.

#### High

- **[H-1]** `metadataBase` fallback: `'https://oliogalia.it'` → should be `'https://oliogalia.com'` (`layout.tsx:45`, `subscribe/layout.tsx:3`)
- **[H-2]** Hero video: 4K MP4 from R2 CDN, no `poster` attribute, no `<link rel="preconnect">` for R2 — estimated LCP > 4s
- **[H-3]** Adobe Typekit CSS: render-blocking `<link>` with no preconnect
- **[H-4]** Missing security headers: X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy, HSTS lacks `includeSubDomains; preload`
- **[H-5]** Sitemap: /faq and /sostenibilita missing; product pages return 500 (55% of sitemap broken); lastmod is build-time timestamp for all URLs
- **[H-6]** Product metadata hardcoded `'it'` locale in `layout.tsx:45`

#### Medium

- No preconnect for Google Analytics / GTM
- Newsletter button non-functional (no handler/form)
- Social links are `<button>` elements — not crawlable; `sameAs` array empty/commented out
- `<meta name="keywords">` present — Google ignores since 2009
- No IndexNow for Bing/Yandex
- CLS risk from Typekit FOUT

---

### 2. Content Quality & E-E-A-T — 46/100

Full details: `findings/content.md`

| Factor | Score |
|---|---|
| Experience | 11/25 |
| Expertise | 12/25 |
| Authoritativeness | 13/25 |
| Trustworthiness | 16/25 |
| AI Citation Readiness | 28/100 |

#### Critical Bugs (developer fixes)

**[FK-01] FAQ Q&A content exists in `it.json` but `FaqListSection` component doesn't render it**
8 fully-written Q&A pairs (production method, DOP claim, farm visits, certifications) are in the data file but never displayed. The live page shows only a heading.

**[HP-01] Hero description fields are empty strings**
`hero.description.main` and `hero.description.secondary` = `""` in both `it.json` and `en.json`. Above-the-fold shows only three single-word headings with no supporting copy.

**[FK-02] Contact info placeholders never replaced**
FAQ contact block: `info@example.it` and `+39 XXX XXX XXXX` in `it.json` — may render as live contact information.

#### High Content Gaps

- **H1 on homepage** is brand name only ("Olio Galia") — no keyword
- **Family photos** are code TODOs (`/nonno-paolo-1940.jpg` uninserted)
- **Organic certification**: claimed but no certifying body, certificate number, or verification link
- **About page** is `"use client"` with no exported `metadata` — inherits wrong root description
- **No blog section** — zero informational content for top-of-funnel queries
- **No polyphenol data, acidity percentage, harvest year** on any page
- **Award** "Premio Regionale Qualità Olio 2023" mentioned but unverifiable from site

#### Content Strengths to Build On

- Three-generation timeline (1940 → 2020 → 2025) is the best citable narrative on the site
- Tonda Iblea cultivar specified — strong differentiator
- "Milling within 24 hours of harvest" — strong technical claim
- Certified organic farming (biologica certificata) — needs certification body named
- Wellness line (zagara, gelsomino) is uniquely differentiated vs. food-only competitors

---

### 3. Schema / Structured Data — 20/100

Full details: `findings/schema.md`

| Page | Schema Present |
|---|---|
| / (homepage) | Organization, WebSite (JS-injected) |
| /products/[slug] | Product, BreadcrumbList (JS-injected, 500 error) |
| /products, /about, /contact, /faq, /sostenibilita | **NONE** |

#### Critical Schema Issues

1. **Product schema injected via JavaScript** (`"use client"` page + `next/script afterInteractive`) — Googlebot first-wave crawl sees zero structured data
2. **`Math.random()` in schema ID** — guaranteed React hydration mismatch on every render

#### High Schema Gaps

- `Organization.sameAs` completely empty (social links commented out)
- `Organization.address` = `{ addressCountry: 'IT' }` only — no street, city, postal code, telephone
- **No LocalBusiness schema** anywhere on the site
- **`aggregateRating` never passed** to `generateProductSchema()` call site — no star ratings in SERPs despite reviews existing in database

#### Ready-to-Implement Schema

The `structured-data.tsx` file has well-built generators for Organization, Product, BreadcrumbList. The fixes are:
1. Move to SSR inline `<script>` tags
2. Populate address fields and sameAs with real data
3. Add LocalBusiness/FoodEstablishment schema to homepage
4. Wire aggregateRating data through to the Product schema call
5. Add FAQPage schema (content already exists in `it.json`)

---

### 4. Sitemap — Score: Critical Issues

Full details: `findings/sitemap.md`

| Check | Result |
|---|---|
| Sitemap present | ✅ |
| 6/11 URLs return HTTP 500 (55%) | ❌ CRITICAL |
| Next.js injects noindex on 500 pages | ❌ CRITICAL |
| www vs non-www canonical conflict | ❌ CRITICAL |
| /faq missing from sitemap | ❌ |
| /sostenibilita missing from sitemap | ❌ |
| Hreflang / EN URLs | ❌ None exist |
| lastmod accuracy | ❌ All identical build timestamps |
| changefreq + priority tags | ⚠️ Present (Google ignores both) |

**Corrected sitemap template** is in `findings/sitemap.md`. Remove product URLs until 500 errors are resolved; add /faq and /sostenibilita; standardize canonical domain.

---

### 5. Local SEO — 19/100

Full details: `findings/local.md`

#### Critical NAP Conflicts (developer bugs)

**Bug 1 — Wrong town in root metadata:**
`src/app/layout.tsx:47` → `description: '100% Olio Extravergine da Cassaro, Sicilia'`
**Cassaro is a different comune ~10 km from Ferla.** Every other source on the site (about page, all 6 product stories) correctly says Ferla (SR). Google's NAP parser sees a conflict → local pack suppression.

**Fix:** Change to: `'Olio extravergine di oliva Tonda Iblea prodotto a Ferla (SR), Sicilia, dal 1940.'`

**Bug 2 — Footer address is an unreplaced placeholder:**
`src/data/locales/it.json:282` → `"address": "Via Example 123, Città"`
If `NEXT_PUBLIC_CONTACT_ADDRESS` env var is not set, every page footer shows a fictional address.

**Fix:** Replace with: `"address": "Via Umberto I, n.121 — 96010 Ferla (SR), Sicilia"`

#### Additional Local SEO Gaps

- No LocalBusiness / FoodEstablishment schema (complete JSON-LD template in `findings/local.md`)
- No Google Business Profile detected or linked
- About page is `"use client"` with no metadata — inherits wrong root description
- `translate="no"` blocks all export markets (11+ countries the brand ships to)
- No hreflang despite `en.json` locale file existing

#### Citation Targets

- **Tier 1:** Gambero Rosso Oli d'Italia, FLOS OLEI, Slow Food Presidia (Tonda Iblea qualifies), OliveOilTimes
- **Tier 2:** iFood, GialloZafferano, Made in Sicily directories
- **Tier 3:** TasteAtlas, Amazon.it producer listing, Eataly

#### Competitive Risk

**Frantoio Galioto** — same town of Ferla, DOP Monti Iblei, 4 generations, fully indexed by Google — will capture all local pack searches for "olio Ferla" and "frantoio Iblei" until Olio Galia's site is indexed and a GBP is created.

---

### 6. GEO / AI Search Readiness — 28/100

Full details: `findings/geo.md`

| Platform | Score |
|---|---|
| Google AI Overviews | 18/100 |
| ChatGPT | 25/100 |
| Perplexity | 30/100 |
| Bing Copilot | 20/100 |

**`/llms.txt` — missing.** Both `/llms.txt` and `/llms-full.txt` return 404. A complete template is provided in `findings/geo.md`.

**AI crawler access:** All crawlers implicitly allowed via wildcard robots.txt. No explicit rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended. Passive approach — explicit Allow directives recommended.

**Content citability — 32/100:** The strongest citable fact is "milling within 24 hours of harvest." Missing: certification body names, acidity %, polyphenol mg/kg, DOP/IGP status, named founders, harvest year, awards with verifiable sources.

**FAQ page: critical GEO gap.** 8 Q&A pairs exist in data file but don't render. AI crawlers see zero FAQ content from a page that should be the brand's most citable asset.

**No Wikipedia entity, no YouTube channel, no Reddit mentions** — the three highest-correlation AI citation signals are absent.

---

### 7. E-commerce SEO — 28/100

Full details: `findings/ecommerce.md`

| Category | Score |
|---|---|
| Schema completeness | 8/25 |
| Product page crawlability | 0/20 |
| Google Shopping readiness | 3/20 |
| Cart/checkout noindex | 8/15 |
| Pagination & category handling | 5/10 |
| Subscription SEO | 4/10 |

**Google Shopping: INELIGIBLE.** Requirements: Product schema with price/availability, Merchant Center feed, 200 OK product pages. None of these exist.

**Transactional pages not noindexed (High):**
- `/checkout/success` — indexable
- `/checkout/subscription-success` — indexable
- `/conferma-ordine` — indexable
- `/feedback/[orderId]` — dynamic per-order, indexable
- `/manage-subscription` — customer account, indexable

`/cart` correctly uses `generateNoIndexMetadata()` — apply the same pattern to all above.

**Product schema missing Google Shopping required fields:** `shippingDetails`, `hasMerchantReturnPolicy`, `gtin13`/`mpn`, `priceValidUntil`, `itemCondition`.

**Subscribe product pages** (`/products/[slug]/subscribe`) are indexable with no keyword strategy.

---

### 8. Search Experience (SXO) — 22/100

Full details: `findings/sxo.md`

**Site not indexed = all SXO analysis is potential, not current.**

**Persona scores:**
- Italian Premium Consumer: 32/100
- International Gift Buyer (EN): 10/100 — completely unreachable
- Health-Conscious / Wellness Consumer: 16/100 — wellness pages broken

**SERP feature eligibility:**
- Featured snippets: BLOCKED (not indexed)
- Shopping carousel: INELIGIBLE (no schema, no 200 product pages)
- Local pack: NOT PRESENT (no GBP)
- PAA boxes: BLOCKED (FAQ page empty, not indexed)

**Missing content types for high-value queries:**
- Informational blog (benefits, production process, Tonda Iblea guide, DOP Monti Iblei)
- EN gift landing page
- Wellness/cosmetic editorial content
- Harvest year freshness content ("Raccolta 2025")

---

### 9. Performance / Core Web Vitals — 35/100

Full details: `findings/performance.md`

#### Critical (LCP)

**[PERF-01] 29 MB 4K MP4 hero video — no poster, no preload**
The hero section serves a 29 MB 4K MP4 from R2 CDN with zero poster attribute. Chrome's LCP algorithm uses video poster as a candidate — without it, the browser must buffer and decode the first video frame before any above-fold visual exists. Estimated mobile LCP: 10–30+ seconds. Fix: create a WebP still frame (~60–80 KB) as poster + `<link rel="preload" as="image">` for it; offer 1080p VP9 encoding to reduce video size ~80%.

**[PERF-02] Hero text invisible on SSR — `useState(false)` opacity-0 pattern**
`HeroSection` uses `useState(false)` + `useEffect(() => setIsVisible(true))`, so the SSR HTML ships with `opacity-0` on all hero text. Combined with the poster-less video, the page has **zero valid LCP candidate** for the first several seconds on slow connections.

**Fix:** Use CSS animations triggered by `animation-fill-mode: forwards` instead of JS state, so the text is visible in SSR HTML and animates in progressively.

#### High

- **[PERF-03]** Adobe Typekit CSS: `font-display:auto` (causes FOIT), render-blocking, no preconnect to `use.typekit.net` or `p.typekit.net`
- **[PERF-04]** No `<link rel="preconnect">` for Cloudflare R2 CDN (serves all images + the 29 MB video)
- **[PERF-05]** 70 KB loading-spinner PNG preloaded at `fetchpriority="high"` — displaces genuinely critical resources from the preload queue

#### Medium (INP / CLS)

- **[PERF-06]** Products section fully client-fetched on mount → spinner-to-cards causes CLS on every page view
- **[PERF-07]** Three analytics stacks active simultaneously (GA4, Meta Pixel, Vercel Analytics); GTM preloaded without preconnect
- **[PERF-08]** Typekit `font-display:auto` causes FOIT + layout shift (self-hosted fonts correctly use `swap` with calibrated fallback metrics — extend this pattern to Typekit)
- **[PERF-09]** Product section height change on data load causes measurable CLS

#### What Is Working Well

HTTP/2, all Next.js JS chunks load `async`, 4 critical fonts correctly preloaded with `crossorigin`, Next.js Image serving WebP via `/_next/image`, below-fold images use `loading="lazy"`, self-hosted fonts use `font-display:swap` with auto-calibrated fallback metrics, Vercel CDN cache warm.

---

### 10. Backlinks — Score: N/A (new domain)

Full details: `findings/backlinks.md`

**Domain is approximately 5 days old** (sitemap lastmod: 2026-06-23). Not yet indexed by Common Crawl. No Moz/DataForSEO credentials configured. Estimated referring domains: 0–5. No toxic link risk (no links exist yet).

**Top link building priorities:**
1. Olive oil competitions: Ercole Olivario, Sol d'Oro, EVOOLEUM, Mario Solinas Award (IOC)
2. Gambero Rosso Oli d'Italia guide (product submission)
3. Slow Food Presidia — Tonda Iblea cultivar qualifies for listing
4. Organic certifier producer directory (ICEA, Bioagricert, or CCPB — confirm which body holds the certification)
5. ICE Agenzia export directory (free, .gov.it backlink)
6. Olive Oil Times — highest-authority EN-language EVOO media
7. Beauty/cosmetic media for Linea Benessere — unique untapped vertical

**18-month target:** DA 25–35, 50–100 referring domains with competition wins + certifier links + press coverage.

---

## Prioritized Action Plan

---

### PHASE 1: Emergency Fixes — This Week (P0)

*Nothing else matters until these are done. Google is not indexing the site.*

| # | Action | File(s) | Est. Time |
|---|---|---|---|
| 1 | **Debug and fix HTTP 500 on all product pages** — check Vercel function logs, MongoDB connection, API route `/api/products/[slug]` | N/A | 2–4 hrs |
| 2 | **Convert product `page.tsx` from CSR to SSR** — remove `"use client"`, fetch via `getProduct()` already in `layout.tsx` | `src/app/(shop)/products/[slug]/page.tsx` | 4–6 hrs |
| 3 | **Fix www → non-www permanent redirect** in `vercel.json` | `vercel.json` | 30 min |
| 4 | **Add OG image and logo to `/public/images/`** (or update paths to R2 CDN URLs) | `src/lib/seo/metadata.ts`, `structured-data.tsx` | 30 min |
| 5 | **Fix `metadataBase` fallback** `.it` → `.com` in 2 files | `layout.tsx:45`, `subscribe/layout.tsx:3` | 10 min |
| 6 | **Fix wrong town name** "Cassaro" → "Ferla" in root description | `src/app/layout.tsx:47` | 5 min |
| 7 | **Replace footer address placeholder** with real address | `src/data/locales/it.json:282` | 5 min |
| 8 | **Fix contact info placeholders** `info@example.it` and `+39 XXX XXX XXXX` | `src/data/locales/it.json` (FAQ section) | 10 min |
| 9 | **Fix FAQ rendering bug** — `FaqListSection` not rendering Q&A from `it.json` | `src/components/.../FaqListSection` | 1–2 hrs |
| 10 | **Fill hero description fields** — `hero.description.main` and `.secondary` are empty strings | `src/data/locales/it.json`, `en.json` | 30 min |
| 11 | **Submit to Google Search Console** — verify domain, submit sitemap, request indexation | GSC dashboard | 30 min |

---

### PHASE 2: High-Impact SEO Fixes — Weeks 2–3 (P1)

| # | Action | File(s) | Est. Time |
|---|---|---|---|
| 12 | **Move JSON-LD to SSR `<script>` tags** — replace `next/script afterInteractive` approach; fix `Math.random()` ID | `src/lib/seo/structured-data.tsx` | 3–4 hrs |
| 13 | **Add security headers** to `next.config.ts` (X-Frame-Options, nosniff, Referrer-Policy, HSTS full) | `next.config.ts` | 1–2 hrs |
| 14 | **Add video `poster` + R2 preconnect** — add first-frame image as poster; add `<link rel="preconnect">` for R2 CDN | `layout.tsx`, hero component | 2 hrs |
| 15 | **Add Typekit preconnect** or self-host fonts | `layout.tsx` | 1 hr |
| 16 | **Populate Organization schema** — complete address (Ferla, Via Umberto I 121, SR, 96010), telephone, email, vatID, sameAs | `src/lib/seo/structured-data.tsx` | 1 hr |
| 17 | **Add LocalBusiness / FoodEstablishment schema** to homepage (complete template in `findings/local.md`) | `src/app/page.tsx` or `layout.tsx` | 1–2 hrs |
| 18 | **Wire aggregateRating** to Product schema call site | `src/app/(shop)/products/[slug]/layout.tsx` | 1 hr |
| 19 | **Noindex transactional pages** — checkout/success, conferma-ordine, feedback, manage-subscription | Per-page `layout.tsx` files | 1 hr |
| 20 | **Create `/llms.txt`** — use template from `findings/geo.md` | `/public/llms.txt` | 30 min |
| 21 | **Fix sitemap** — add /faq, /sostenibilita; remove 500-error product URLs; fix canonical domain; remove changefreq/priority; set accurate lastmod | `src/app/sitemap.ts` | 1–2 hrs |
| 22 | **Homepage H1** — add keyword to H1, from "Olio Galia" to "Olio Extravergine di Oliva Biologico Siciliano — Olio Galia" | `src/data/locales/it.json` | 15 min |
| 23 | **Remove `translate="no"`** from root HTML to enable browser translation for export markets | `src/app/layout.tsx` | 10 min |
| 24 | **Replace social `<button>` elements** with `<a href>` tags; populate sameAs array with actual social profile URLs | Footer component, `structured-data.tsx` | 1 hr |
| 25 | **Create Google Business Profile** for Ferla (SR) — category "Olive oil manufacturer" | Google Business | 1 hr |

---

### PHASE 3: Content & International Authority — Month 2 (P2)

| # | Action | Est. Time |
|---|---|---|
| 26 | **Implement Next.js i18n URL routing** — `/en/products`, `/it/products` with hreflang alternates and EN sitemap | 2–3 days |
| 27 | **Add FAQPage JSON-LD schema** to /faq (content already exists in `it.json`) | 1 hr |
| 28 | **About page** — convert from `"use client"` to Server Component with exported metadata; add Ferla/Tonda Iblea/Monti Iblei keywords to title and description; add family photos | 1 day |
| 29 | **Product pages** — add polyphenol data, acidity %, harvest year, certifications with body name | Per product |
| 30 | **Publish blog post 1:** "I benefici dell'olio extravergine siciliano dei Monti Iblei" (polyphenols, health claims) | 1 day |
| 31 | **Publish blog post 2:** "Come si produce l'olio Galia: dalla raccolta all'imbottigliamento" | 1 day |
| 32 | **Create English gift landing page** — "Buy Sicilian Olive Oil Online" targeting EN gift queries | 1 day |
| 33 | **Add Google Shopping required schema fields** — shippingDetails, hasMerchantReturnPolicy, priceValidUntil, itemCondition | 2 hrs |
| 34 | **Apply for Slow Food Presidia** listing (Tonda Iblea qualifies) | External |
| 35 | **Submit to Gambero Rosso Oli d'Italia** and FLOS OLEI | External |
| 36 | **Expand sustainability page** to 800+ words with certification body name, acidity spec, carbon data | Content |

---

### PHASE 4: Monitoring & Iteration — Ongoing (P3)

| # | Action |
|---|---|
| 37 | Set up Google Search Console; monitor Coverage report weekly until product pages confirmed indexed |
| 38 | Implement IndexNow for Bing/Yandex (ping on product/content updates) |
| 39 | Monitor Core Web Vitals in GSC after video + font fixes |
| 40 | Request reviews on Google Business Profile from existing customers |
| 41 | Build Wikipedia article for "Olio Galia" brand entity once 3 notable citations exist |

---

## 90-Day Score Projections

If Phase 1 + Phase 2 fixes are implemented:

| Category | Current | 90-Day Target |
|---|---|---|
| Technical SEO | 41 | 72 |
| Content Quality | 46 | 62 |
| On-Page SEO | 32 | 68 |
| Schema | 20 | 70 |
| Performance | 35 | 62 |
| AI Search Readiness | 28 | 52 |
| Images | 30 | 55 |
| **Overall Health Score** | **36** | **65** |

---

## Files in This Audit

```
oliogalia-audit/
├── FULL-AUDIT-REPORT.md          ← this file
├── ACTION-PLAN.md                ← prioritized checklist format
└── findings/
    ├── technical.md              ← 41/100 — Next.js CSR bugs, security headers, redirects
    ├── content.md                ← 46/100 — E-E-A-T, empty FAQ, thin content
    ├── schema.md                 ← 20/100 — JS-injected, Math.random bug, missing types
    ├── sitemap.md                ← 55% of URLs return 500, canonical conflict
    ├── geo.md                    ← 28/100 — no llms.txt, FAQ invisible to AI crawlers
    ├── sxo.md                    ← 22/100 — zero indexed pages, persona gaps
    ├── local.md                  ← 19/100 — wrong town in metadata, placeholder address
    ├── ecommerce.md              ← 28/100 — no shopping schema, checkout pages indexable
    ├── performance.md            ← 35/100 — LCP risk from 4K video, Typekit render-block
    └── backlinks.md              ← (in progress)
```
