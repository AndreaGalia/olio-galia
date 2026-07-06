# E-commerce SEO Audit — oliogalia.com
**Date:** 2026-06-28  
**Analyst:** Claude Sonnet 4.6 (automated audit)  
**Pages crawled:** /, /products, /products/latta-olio-5l, /products/latta-olio-3l, /products/beauty-oil-zagara, /products/premium-oil-bottle, /products/beauty-oil-gelsomino, /products/premium-6-oil-bottle, /cart, /manage-subscription, /about, /faq, /sostenibilita, /smaltimento-rifiuti, /sitemap.xml, /robots.txt  
**Source code reviewed:** src/app, src/lib/seo/*, src/types/products.ts, src/app/sitemap.ts, src/app/layout.tsx

---

## Overall Score: 28/100

| Category | Score | Weight |
|---|---|---|
| Schema completeness | 8/25 | 25% |
| Product page crawlability | 0/20 | 20% |
| Google Shopping readiness | 3/20 | 20% |
| Cart/checkout noindex | 8/15 | 15% |
| Pagination & category handling | 5/10 | 10% |
| Subscription SEO | 4/10 | 10% |

---

## Findings by Severity

---

### [CRITICAL] All individual product pages return HTTP 500

**Pages affected:** all 6 product URLs listed in sitemap.xml  
- https://oliogalia.com/products/latta-olio-5l — HTTP 500  
- https://oliogalia.com/products/latta-olio-3l — HTTP 500  
- https://oliogalia.com/products/beauty-oil-zagara — HTTP 500  
- https://oliogalia.com/products/premium-oil-bottle — HTTP 500  
- https://oliogalia.com/products/beauty-oil-gelsomino — HTTP 500  
- https://oliogalia.com/products/premium-6-oil-bottle — HTTP 500  

**Impact:** Google cannot crawl or index any product page. Every product page in the sitemap points to a broken URL. Zero organic product search visibility. No Product schema is delivered because no page renders.

**Root cause (code-level):** `src/app/(shop)/products/[slug]/page.tsx` is a `"use client"` component that fetches product data via `useProductBySlug` — a React hook calling `/api/products/{slug}`. If the API route or MongoDB connection fails in the production environment, the server returns 500 before any HTML is rendered. The layout.tsx (`src/app/(shop)/products/[slug]/layout.tsx`) correctly connects to MongoDB directly for metadata generation, but the page component relies on a client-side API fetch.

**Fix priority:** Resolve before any other SEO work. Diagnose the production API route at `/api/products/[slug]` (check environment variables, MongoDB Atlas connection string, Vercel function timeout). Consider converting the page component from client-side to server-side rendering (remove `"use client"`, fetch data in an async server component) to eliminate the API dependency for the initial render.

---

### [CRITICAL] Root layout metadataBase points to wrong domain (oliogalia.it)

**File:** `src/app/layout.tsx`, line 45  
```ts
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.it'),
```

**Impact:** If `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_BASE_URL` are not set in the Vercel deployment environment, all relative Open Graph image URLs, canonical tags, and alternate URLs in the root layout resolve against `oliogalia.it` instead of `oliogalia.com`. This produces incorrect absolute URLs in metadata delivered to Google, Facebook, and Twitter when crawling the live site.

**Same bug in:** `src/app/(shop)/products/[slug]/subscribe/layout.tsx`, line 3 — fallback also defaults to `oliogalia.it`.

**Fix:** Change the fallback in `layout.tsx` from `'https://oliogalia.it'` to `'https://oliogalia.com'`. Apply the same fix to `subscribe/layout.tsx`. Confirm that `NEXT_PUBLIC_SITE_URL=https://oliogalia.com` is set in the Vercel project settings.

---

### [CRITICAL] Transactional pages not noindexed

**Pages missing noindex directives:**

| URL | Risk | Has layout.tsx with noindex? |
|---|---|---|
| /checkout/success | Indexable thank-you page | No |
| /checkout/subscription-success | Indexable thank-you page | No |
| /conferma-ordine | Indexable order confirmation | No |
| /feedback/[orderId] | Dynamic per-order feedback URL | No |
| /manage-subscription | Customer account utility | No |
| /manage-subscription/access | Session-based access page | No |

**Impact:** Google may index low-quality, session-dependent pages. These pages contain no product or category content, dilute crawl budget, and can produce "This page cannot be found" results in Google's index if the URL only works with a valid session token.

**Contrast:** `/cart` correctly uses `generateNoIndexMetadata('Carrello')` (file: `src/app/(shop)/cart/layout.tsx`) — use the same pattern.

**Fix for each:** Create a `layout.tsx` file alongside each `page.tsx` and export:
```ts
import { generateNoIndexMetadata } from '@/lib/seo/metadata';
export const metadata = generateNoIndexMetadata('Conferma Ordine'); // adjust title per page
```

Also add to `robots.txt`:
```
Disallow: /checkout/
Disallow: /conferma-ordine
Disallow: /feedback/
Disallow: /manage-subscription
```

---

### [HIGH] Product schema missing critical Google Shopping fields

**File:** `src/lib/seo/structured-data.tsx`, `generateProductSchema()` function

The schema implementation covers required fields (name, description, image, brand, offers with price/currency/availability/seller, sku). However it is **missing** the following fields that Google Merchant Center and Google Shopping require or strongly recommend:

| Missing field | Required for | Impact |
|---|---|---|
| `gtin13` / `gtin8` / `mpn` | Google Shopping feed eligibility | Products rejected from Merchant Center if no GTIN present |
| `offers.shippingDetails` | Rich results "Free shipping" label | Competitor listings show shipping info; yours do not |
| `offers.hasMerchantReturnPolicy` | Rich results return badge | Lower click-through vs competitors |
| `offers.priceValidUntil` | Schema.org best practice | Warning in Rich Results Test |
| `offers.itemCondition` | Merchant Center | Defaults to unspecified |
| `aggregateRating` | Rich results star display | Currently only injected if caller passes rating/reviewCount — verify this is wired to actual review data |

**Current schema score: 50/100** (all required fields present, zero recommended fields)

**Fix:** Add to `generateProductSchema()`:
```ts
schema.offers.shippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: '0',        // update with actual shipping cost
    currency: 'EUR'
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' }
  },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IT' }
};

schema.offers.hasMerchantReturnPolicy = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'IT',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn'
};
```

Add `gtin13` or `mpn` to the ProductDocument type in `src/types/products.ts` and populate per product.

---

### [HIGH] Product page uses client-side rendering — schema delivered late or not at all

**File:** `src/app/(shop)/products/[slug]/page.tsx`, line 1: `"use client"`

The `StructuredData` component injects JSON-LD via `next/script` inside a client component. This means:
1. On first server render, no JSON-LD is present in the HTML.
2. Googlebot receives a bare shell, then must wait for JavaScript to hydrate and inject the schema.
3. Google's crawl of the initial HTML will find zero structured data.

**Additional issue:** `StructuredData` uses `Math.random()` for script IDs:
```tsx
<Script id={`structured-data-${Math.random()}`} ... />
```
This generates a different ID on every render, causing React hydration warnings and preventing Next.js from stably tracking the script.

**Fix:**
- Convert `ProductDetailPage` to a server component (remove `"use client"`) and inject JSON-LD directly in `<head>` using Next.js metadata or a `<script>` tag in the server-rendered output.
- Alternatively, inline JSON-LD as a `<script type="application/ld+json">` directly in the server component return, bypassing `next/script` entirely.
- Replace `Math.random()` with a stable deterministic ID (e.g., product slug):
  ```tsx
  <Script id={`product-schema-${slug}`} type="application/ld+json" ... />
  ```

---

### [HIGH] No Google Shopping / Merchant Center feed

**Status:** Not implemented. No evidence of a Google Merchant Center product feed (XML or API).

**Impact:** Products are invisible in Google Shopping tab, Google Images Shopping annotations, and AI Shopping (Google AI Mode). Competitors selling olive oil will have Shopping ads placement; Olio Galia will not appear.

**Fix sequence:**
1. Fix 500 errors on product pages (critical prerequisite).
2. Complete Product schema with GTIN/MPN and shippingDetails.
3. Create a Google Merchant Center account and submit `https://oliogalia.com/sitemap.xml` (or a dedicated product feed).
4. Enable "Surfaces across Google" for free Shopping listings.
5. Verify the Merchant Center by adding the Google site verification token to `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (the env var is already wired in `generateBaseMetadata()`).

---

### [HIGH] No hreflang implementation despite bilingual product slugs

**Evidence found:**
- `src/types/products.ts` — `slug: { it: string; en: string }` (bilingual slug stored per product)
- `src/app/layout.tsx` — `<html lang="it">` hardcoded in root layout
- No `alternates.languages` in any layout or metadata file
- No `rel="alternate" hreflang="..."` link tags anywhere in the codebase

**Impact:** Google sees IT and EN content at separate URLs (e.g., `/products/latta-olio-5l` vs `/products/tin-oil-5l`) but cannot determine they are language alternates of each other. This can cause:
- Both language versions to compete against each other in Italian SERPs.
- English version to be underserved in English-language markets.
- Duplicate content signals across language variants.

**Fix:** In `src/lib/seo/metadata.ts`, add to `generateProductMetadata()`:
```ts
alternates: {
  canonical: `${BASE_URL}/products/${slug.it}`,
  languages: {
    'it': `${BASE_URL}/products/${slug.it}`,
    'en': `${BASE_URL}/products/${slug.en}`,
    'x-default': `${BASE_URL}/products/${slug.it}`,
  }
}
```
Also fix `<html lang>` to use the active locale dynamically.

---

### [MEDIUM] Homepage H1 is a brand tagline, not a keyword

**Current H1:** "Eccellenza Natura Tradizione"  
**Title tag:** "Olio Galia - Olio Extra Vergine di Oliva"

The H1 and title tag are mismatched. The title uses the commercial keyword "Olio Extra Vergine di Oliva" (consistent with what searchers type) while the H1 uses a brand slogan with no search volume.

**Impact:** Google weights H1 as a strong on-page keyword signal. A tagline H1 means the strongest semantic signal on the most authoritative page (homepage) is misaligned with target keywords.

**Fix:** Change the hero H1 to include the primary keyword, e.g.:  
"Olio Extra Vergine di Oliva — Olio Galia" or  
"Olio Extravergine Biologico dalla Sicilia"  

Move the tagline to a visually prominent H2 or paragraph below.

---

### [MEDIUM] Category filter URLs lack canonical tags

**URLs observed:**
- `/products?category=olio-evo`
- `/products?category=beauty`

**Evidence:** The products layout (`src/app/(shop)/products/layout.tsx`) exports a single metadata object with canonical `/products`. This same canonical applies to all `?category=` query parameter variants, which means these filtered views correctly self-canonicalize — but only if Next.js respects the layout canonical at the URL level. If the client-side router changes the URL to `/products?category=olio-evo` without triggering a metadata update, the canonical tag in the rendered HTML will still say `/products`, which is the correct behavior. However, this should be validated in production.

**Additional gap:** There are no dedicated category pages (`/products/olio-evo`, `/products/beauty`) with their own titles, meta descriptions, or schemas. Category filter pages via query params are crawlable but have thin, auto-generated content.

**Fix:** Create distinct URL-based category pages (`/products/olio-evo`, `/products/beauty`) with unique H1 headings, meta descriptions, and `CollectionPage` JSON-LD schema. Redirect the `?category=` variants to the new clean URLs.

---

### [MEDIUM] Sitemap issues

**File:** `src/app/sitemap.ts`

| Issue | Detail |
|---|---|
| All `lastModified` dates are identical | The sitemap generator uses `currentDate` (build time) for static pages. Product pages use `product['metadata.updatedAt']` but this field reference is incorrect (should be `product.metadata?.updatedAt`) — the current code may silently fall back to `currentDate` for all products |
| Only Italian slugs | Sitemap includes only `slug.it` URLs. English product URLs are omitted. |
| Missing pages | `/faq`, `/sostenibilita`, `/privacy-policy`, `/cookie-policy`, `/termini-servizio` are not in the sitemap |
| No image sitemap | Product images are not declared in a `<image:image>` sitemap extension. Google Images and Shopping rely on image sitemap for discovery of product images. |
| Sitemap points to broken pages | All 6 product URLs return HTTP 500 — the sitemap is actively directing Googlebot to error pages |

**Fix:**
1. Add missing marketing/legal pages to the static pages array.
2. Add EN slug variant URLs under `alternates` or as separate entries.
3. Fix the `lastModified` field access pattern from `product['metadata.updatedAt']` to `product.metadata?.updatedAt`.
4. Create a separate image sitemap or extend the current sitemap with image entries for each product.
5. After fixing 500 errors, submit the sitemap via Google Search Console.

---

### [MEDIUM] FAQ page has no FAQPage schema

**File:** `src/app/(marketing)/faq/page.tsx`  
**Observed:** The page renders FAQ content via client-side JavaScript. No `FAQPage` JSON-LD schema is present.

**Impact:** Google cannot display rich FAQ results (expandable Q&A boxes in SERPs) for this domain. For a food e-commerce brand, FAQ rich results dramatically increase SERP real estate and click-through rates for long-tail queries like "olio galia abbonamento come funziona", "olio biologico siciliano spedizione".

**Fix:** Add a `FAQPage` schema to the FAQ page. Since content is loaded client-side, either:
1. Pass FAQ data as a server-rendered prop and inject schema in a server component wrapper, or
2. Export a static FAQ array from a data file and use it both for page rendering and for generating the JSON-LD in the page's `generateMetadata()` or a server-side `<script type="application/ld+json">`.

---

### [MEDIUM] About page missing Organization/LocalBusiness schema

**File:** `src/app/(marketing)/about/page.tsx`  
**NAP data found on page:**
- Name: Olio Galia  
- Address: Via Umberto I, n.121 — Ferla (SR), Sicily, Italy  
- Phone: +39 3793475975  
- Email: info@oliogalia.it  
- P.IVA: 02180350890  

The homepage emits an Organization schema via `generateOrganizationSchema()` (`src/lib/seo/structured-data.tsx`) but that schema lacks the complete address, phone, email, and social media links. The About page, where this information is visible in the page body, has no structured data.

**Fix:** Update `generateOrganizationSchema()` to include:
```ts
address: {
  '@type': 'PostalAddress',
  streetAddress: 'Via Umberto I, n.121',
  addressLocality: 'Ferla',
  addressRegion: 'SR',
  addressCountry: 'IT'
},
telephone: '+39 3793475975',
email: 'info@oliogalia.com',
vatID: '02180550890',
foundingDate: '1940',
sameAs: [
  // add Instagram, Facebook URLs when available
]
```
Add the schema to the About page as well as the homepage.

---

### [MEDIUM] Organization schema has empty sameAs array

**File:** `src/lib/seo/structured-data.tsx`, lines 23-27  
```ts
sameAs: [
  // Aggiungi qui i link ai social media quando disponibili
  // 'https://www.facebook.com/oliogalia',
  // 'https://www.instagram.com/oliogalia'
]
```

**Impact:** Google uses `sameAs` to build the Knowledge Panel for a brand. An empty array means no social profiles are linked to the entity, reducing brand authority signals and delaying Knowledge Panel appearance.

**Fix:** Add the active social media profile URLs. Even if profiles are new, adding them now establishes the connection. Also add the brand's Wikipedia page if one exists, and any third-party directories (Trustpilot, Google Business Profile URL).

---

### [MEDIUM] Subscribe pages are indexable with no dedicated SEO strategy

**Page:** `/products/[slug]/subscribe`  
**File:** `src/app/(shop)/products/[slug]/subscribe/layout.tsx`

Subscribe pages are indexable (no noindex) and have a title/description generated dynamically. However:
- The metadata description is generic: "Abbonati a [product] e ricevilo a casa tua con regolarità."
- No canonical declared
- No structured data
- No keyword targeting for subscription-intent queries

**Decision needed:** Either (a) make these pages SEO targets for subscription keywords ("abbonamento olio extravergine", "ricevi olio casa abbonamento") with proper content, headings, and schema, OR (b) add noindex since the page is primarily a checkout funnel step and not a content destination.

If choosing (a), add `focusKeyphrase` targeting, unique description with benefit copy, and `Subscription` or `Offer` schema.

---

### [LOW] Root layout defines a generic fallback metadata that overrides page-level metadata for pages without their own metadata export

**File:** `src/app/layout.tsx`, lines 44-57

The root layout exports a minimal metadata object:
```ts
export const metadata = {
  title: 'Olio Galia',
  description: '100% Olio Extravergine da Cassaro, Sicilia',
  ...
}
```

**Impact:** Any page component that does NOT export its own metadata object (client components like `/checkout/success`, `/conferma-ordine`, etc.) will inherit this fallback. The fallback title is 12 characters — far too short. The description is 42 characters and does not target any keyword.

**Fix:** Keep the root layout metadata minimal (only `metadataBase`, `icons`). Move the default title/description to `generateBaseMetadata()` which is already used correctly in `src/app/page.tsx`. Ensure every page or layout exports meaningful metadata.

---

### [LOW] Robots.txt does not disallow transactional/utility paths

**File:** `src/app/robots.ts` (or served at `/robots.txt`)

Current `Disallow` directives: `/admin/`, `/api/`, `/_next/`, `/static/`

**Missing disallows for:**
- `/checkout/` (all checkout steps and success pages)
- `/conferma-ordine`
- `/feedback/`
- `/manage-subscription`

Without these, Googlebot will follow internal links to transactional pages, waste crawl budget, and may index session-dependent pages.

**Fix:** Add to robots.txt:
```
Disallow: /checkout/
Disallow: /conferma-ordine
Disallow: /feedback/
Disallow: /manage-subscription
```

---

### [LOW] WebSite schema missing SearchAction target URL pattern

**File:** `src/lib/seo/structured-data.tsx`, `generateWebsiteSchema()`

The SearchAction is implemented but points to `/products?search={search_term_string}`. Confirm this search parameter actually works on the products page and returns filtered results. If search is client-side only and the URL does not update, Google's Sitelinks Searchbox will not function.

---

### [LOW] Product OG image dimensions below recommended minimum

**File:** `src/lib/seo/metadata.ts`, `generateProductMetadata()`, line 140
```ts
{ url: primaryImage, width: 800, height: 600, alt: translations.name }
```

Facebook and LinkedIn recommend minimum 1200×630px for link previews. At 800×600, product shares on social media will appear as small thumbnails rather than large cards, reducing click-through on shared product links.

**Fix:** Ensure all product images are at minimum 1200×630px (or ideally 1200×1200px square for Instagram compatibility) and update the OG dimensions accordingly.

---

### [LOW] StructuredData component uses Math.random() for script IDs

**File:** `src/lib/seo/structured-data.tsx`, line 195
```tsx
<Script id={`structured-data-${Math.random()}`} ... />
```

**Impact:** Non-deterministic IDs cause React hydration mismatches (server-rendered ID ≠ client-rendered ID), producing console errors and potentially duplicate schema injections on re-renders.

**Fix:** Use a stable, content-derived ID:
```tsx
<Script id={`ld-json-${btoa(JSON.stringify(data)).slice(0, 12)}`} ... />
```
Or pass an explicit `id` prop to `StructuredData`.

---

### [LOW] No UCP (Universal Commerce Protocol) profile

**Status:** No `/.well-known/ucp` file present.

Google's Universal Commerce Protocol (co-developed with Shopify, Etsy, Walmart, and payment networks) enables AI agents (Google AI Mode, Gemini) to discover, browse, and transact directly with merchants without one-off integrations. Merchants on Google Merchant Center with clean Product schema can declare a UCP profile to be eligible for direct AI-mediated purchases.

This is an early-adopter opportunity. Adoption is optional but provides a forward-looking competitive advantage as AI Shopping grows.

---

## Summary: Prioritized Action Plan

| Priority | Action | Effort | Expected Impact |
|---|---|---|---|
| 1 | Fix HTTP 500 on all product pages | High | Entire product catalogue becomes indexable |
| 2 | Fix metadataBase domain from `.it` to `.com` | Trivial | Correct canonical and OG URLs in production |
| 3 | Add noindex to checkout/success, conferma-ordine, feedback, manage-subscription | Low | Clean crawl budget, no thin pages indexed |
| 4 | Add shippingDetails + merchantReturnPolicy to Product schema | Medium | Google Shopping rich results eligibility |
| 5 | Add GTIN/MPN to product data model and schema | Medium | Google Merchant Center feed eligibility |
| 6 | Set up Google Merchant Center, submit sitemap/feed | Medium | Google Shopping visibility (free listings) |
| 7 | Implement hreflang for IT/EN product URLs | Medium | Correct language targeting, eliminate duplicate signals |
| 8 | Add FAQPage schema to FAQ page | Low | FAQ rich results in SERPs |
| 9 | Add complete Organization schema with NAP | Low | Brand entity signals, Knowledge Panel |
| 10 | Create dedicated category pages (clean URL slugs) | High | Category-level keyword rankings |
| 11 | Fix sitemap: missing pages, correct lastModified, image sitemap | Low | Better crawl and image indexation |
| 12 | Add robots.txt disallows for transactional paths | Trivial | Crawl budget efficiency |
| 13 | Fix StructuredData component ID stability | Trivial | Hydration correctness |
| 14 | Expand product images to 1200px+ for OG | Medium | Social sharing CTR |
| 15 | Implement SearchAction validation | Low | Sitelinks Searchbox in SERPs |

---

## Schema Completeness Matrix

| Schema type | Implemented | Correct | Missing fields |
|---|---|---|---|
| Organization | Yes (homepage) | Partial | address, phone, email, sameAs |
| WebSite + SearchAction | Yes (homepage) | Partial | Verify search URL works |
| Product | Yes (code) | Partial | GTIN, shippingDetails, returnPolicy, priceValidUntil, condition |
| BreadcrumbList | Yes (product page) | Yes | — |
| FAQPage | No | — | Entire schema missing |
| CollectionPage / ItemList | No | — | Category/listing pages |
| Review / AggregateRating | Conditional | Partial | Confirm wired to live review data |
| LocalBusiness | No | — | About page |
