# oliogalia.com — SEO Action Plan
**Generated:** 2026-06-28 | **Health Score:** 36/100

---

## PHASE 1: Emergency Fixes — This Week
*Site is not indexed by Google. Fix these before anything else.*

### P0-A: Fix Product Pages (breaks indexation + revenue)

- [ ] **Debug HTTP 500 on all product routes** — Check Vercel function logs for `/api/products/[slug]`. Likely a MongoDB Atlas connection string, timeout, or missing env var in production. Confirm `MONGODB_URI` is set in Vercel project settings.
- [ ] **Convert `src/app/(shop)/products/[slug]/page.tsx` from CSR to SSR** — Remove `"use client"` directive. Replace `useProductBySlug()` hook with async server-side `getProduct(slug)` (already available in `layout.tsx`). Move interactive child elements (variant picker, add-to-cart button) into a separate `ProductActions.tsx` Client Component.
- [ ] **Fix hero text `opacity-0` SSR bug** in `HeroSection` — Replace `useState(false)` + `useEffect` visibility pattern with CSS animation (`@keyframes fadeIn`, `animation-fill-mode: forwards`) so hero text is visible in SSR HTML.

### P0-B: Fix Developer Bugs (< 30 min total)

- [ ] `src/app/layout.tsx:47` — Change `'100% Olio Extravergine da Cassaro, Sicilia'` → `'Olio extravergine di oliva Tonda Iblea prodotto a Ferla (SR), Sicilia, dal 1940.'`
- [ ] `src/data/locales/it.json:282` — Change `"address": "Via Example 123, Città"` → `"address": "Via Umberto I, n.121 — 96010 Ferla (SR), Sicilia"`
- [ ] `src/app/layout.tsx:45` + `src/app/(shop)/products/[slug]/subscribe/layout.tsx:3` — Change `metadataBase` fallback from `'https://oliogalia.it'` → `'https://oliogalia.com'`
- [ ] `src/data/locales/it.json` (FAQ contact block) — Replace `info@example.it` and `+39 XXX XXX XXXX` placeholders with real contact info
- [ ] `src/data/locales/it.json` + `en.json` — Fill `hero.description.main` and `hero.description.secondary` with actual copy (currently empty strings `""`)
- [ ] `src/data/locales/it.json` (homepage H1) — Update H1 from generic brand name to keyword-rich: `"Olio Extravergine di Oliva Biologico Siciliano"`

### P0-C: Fix FAQ Rendering Bug

- [ ] Find the `FaqListSection` component (likely in `src/components/faq/` or similar) — debug why 8 Q&A pairs from `it.json` are not rendered. Check conditional logic, data-prop passing, or rendering guard.

### P0-D: Fix Missing Assets

- [ ] Add correct OG image to `/public/images/og-image.jpg` (1200×630px recommended) OR update path in `src/lib/seo/metadata.ts` to use actual R2 CDN URL
- [ ] Add logo to `/public/images/logo.png` OR update path in `src/lib/seo/structured-data.tsx` to use actual R2 CDN URL

### P0-E: Fix Domain Canonicalization

- [ ] Add to `vercel.json`:
  ```json
  {
    "redirects": [{
      "source": "/:path*",
      "has": [{"type": "host", "value": "www.oliogalia.com"}],
      "destination": "https://oliogalia.com/:path*",
      "permanent": true
    }]
  }
  ```

### P0-F: Submit to Google Search Console

- [ ] Verify ownership of oliogalia.com in Google Search Console
- [ ] Submit `https://oliogalia.com/sitemap.xml`
- [ ] Use URL Inspection to request indexation: homepage first, then /about, /sostenibilita, /faq, /products
- [ ] After product pages are fixed: request indexation for each product URL

---

## PHASE 2: High-Impact SEO — Weeks 2–3

### Structured Data

- [ ] **Move JSON-LD to SSR** — Replace `StructuredData` component's `next/script` approach with inline `<script type="application/ld+json" dangerouslySetInnerHTML>` in Server Components. Fix `Math.random()` IDs to use stable strings (e.g., `"sd-organization"`, `"sd-website"`).
- [ ] **Complete Organization schema** in `src/lib/seo/structured-data.tsx`:
  - `address`: Add streetAddress, addressLocality (Ferla), addressRegion (SR), postalCode (96010)
  - `telephone`: "+393793475975"
  - `email`: "info@oliogalia.it"
  - `vatID`: "02180350890"
  - `sameAs`: Add actual social media profile URLs (Instagram, Facebook, TikTok, Pinterest, WhatsApp Business)
- [ ] **Add LocalBusiness / FoodEstablishment schema** to homepage (complete template in `findings/local.md`)
- [ ] **Wire aggregateRating** — pass review data from MongoDB through `layout.tsx` to `generateProductSchema()` call
- [ ] **Add FAQPage schema** to `/faq` page (content already exists in `it.json` — just needs render fix + schema)

### Technical SEO

- [ ] **Add security headers** to `next.config.ts`:
  ```typescript
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ]
    }];
  }
  ```
- [ ] **Add video poster + R2 preconnect** in `layout.tsx`:
  ```tsx
  <link rel="preconnect" href="https://pub-9a7992c9b54b4970ba58b0c563f17084.r2.dev" />
  ```
  Export a WebP still from hero video first frame (~60 KB) and add `poster` attribute.
- [ ] **Add Typekit preconnect**:
  ```tsx
  <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
  ```
- [ ] **Add GA/GTM preconnect**:
  ```tsx
  <link rel="preconnect" href="https://www.googletagmanager.com" />
  <link rel="dns-prefetch" href="https://www.google-analytics.com" />
  ```
- [ ] **Fix sitemap** (`src/app/sitemap.ts`):
  - Add `/faq` and `/sostenibilita`
  - Remove product URLs (add back after 500 errors resolved)
  - Fix canonical domain to `oliogalia.com` (non-www)
  - Generate per-page `lastModified` from content dates, not `new Date()`
  - Remove `changeFrequency` and `priority` fields
- [ ] **Noindex transactional pages** — Create `layout.tsx` with `generateNoIndexMetadata()` for: `/checkout/success`, `/checkout/subscription-success`, `/conferma-ordine`, `/feedback/[orderId]`, `/manage-subscription`, `/manage-subscription/access`
- [ ] **Replace social footer `<button>` elements** with `<a href="https://instagram.com/oliogalia">` etc.
- [ ] **Remove `<meta name="keywords">`** from `generateBaseMetadata()` in `src/lib/seo/metadata.ts`
- [ ] **Remove `translate="no"`** from root `<html>` and root `<meta name="google" content="notranslate">` — export markets need translation as fallback

### Performance

- [ ] **Offer VP9 / WebM source** for hero video to reduce 29 MB → ~6 MB
- [ ] **Fix 70 KB spinner preload** — remove `fetchpriority="high"` from loading spinner image
- [ ] **Fix Typekit `font-display`** — add `&display=swap` param to Typekit URL or self-host via `next/font/local`

### Content Quick Fixes

- [ ] **Create `/llms.txt`** in `/public/` (template in `findings/geo.md`)
- [ ] **Homepage H1** — add keyword alongside brand name
- [ ] **About page** — convert from `"use client"` to Server Component; export `metadata` with Ferla/Tonda Iblea/Monti Iblei in title and description; insert the family photos (currently code TODOs)

### Business Profiles

- [ ] **Create Google Business Profile** at business.google.com — Category: "Olive oil manufacturer" — Address: Via Umberto I 121, 96010 Ferla (SR), Italy — Upload product photos — Add phone and website
- [ ] **Verify GBP** via postcard/phone

---

## PHASE 3: Content & International — Month 2

### International SEO

- [ ] **Implement Next.js App Router i18n routing** — Add `[locale]` segment to all marketing and product routes (`/it/products`, `/en/products` etc.). See Next.js docs: `app/[locale]/layout.tsx` pattern.
- [ ] **Add hreflang alternates** to `generateBaseMetadata()`:
  ```typescript
  alternates: {
    canonical: `https://oliogalia.com${path}`,
    languages: {
      'it': `https://oliogalia.com/it${path}`,
      'en': `https://oliogalia.com/en${path}`,
      'x-default': `https://oliogalia.com${path}`,
    }
  }
  ```
- [ ] **Submit EN sitemap** as separate sitemap or hreflang sitemap extension

### Product Pages

- [ ] Add polyphenol content (mg/kg), acidity % (max 0.3%), harvest year ("Campagna 2025") to each product description
- [ ] State certification: certifying body name + certificate number (or explain uncertified production standards)
- [ ] Add product images with descriptive filenames and alt text
- [ ] **Add Google Shopping required fields** to Product schema: `shippingDetails`, `hasMerchantReturnPolicy`, `priceValidUntil`, `itemCondition`

### Blog / Editorial Content

- [ ] **Post 1:** "I benefici dell'olio extravergine siciliano dei Monti Iblei" — 1,200 words, target polyphenol health queries
- [ ] **Post 2:** "Come si produce l'olio Galia: dalla raccolta all'imbottigliamento" — 1,000 words with production timeline, photos
- [ ] **Post 3:** "DOP Monti Iblei: tutto quello che devi sapere" — 1,000 words on geographic indication
- [ ] **EN page:** "Buy Sicilian Olive Oil Online" — gift-focused, provenance story, international shipping

### Citations & Authority

- [ ] Submit to Gambero Rosso Oli d'Italia
- [ ] Submit to FLOS OLEI (international olive oil directory)
- [ ] Apply for Slow Food Presidia listing (Tonda Iblea qualifies)
- [ ] Create OliveOilTimes producer profile
- [ ] Submit to TasteAtlas
- [ ] Add Amazon.it producer listing

---

## PHASE 4: Monitoring — Ongoing

- [ ] Weekly: Check GSC Coverage report for crawl errors
- [ ] Weekly: Monitor GSC Performance for first organic impressions (target: within 4 weeks of Phase 1 completion)
- [ ] Set up IndexNow key (Bing Webmaster Tools) + trigger on content updates
- [ ] Monthly: Run `/seo drift baseline` to track SEO changes
- [ ] Request Google reviews from existing customers via GBP link
- [ ] Target: rebuild `/seo audit` at 90 days to measure against 65/100 target

---

## Summary Scorecard

| Phase | Actions | Est. Dev Hours | Expected Score Impact |
|---|---|---|---|
| Phase 1 (Emergency) | 18 tasks | 12–16 hrs | 36 → 50 |
| Phase 2 (High-Impact) | 22 tasks | 20–28 hrs | 50 → 62 |
| Phase 3 (Content/i18n) | 14 tasks | 30–40 hrs | 62 → 70 |
| Phase 4 (Ongoing) | Continuous | — | 70 → 75+ |
