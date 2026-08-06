# Technical SEO Audit — oliogalia.com — 2026-06-28

**Stack:** Next.js 15 App Router / Vercel / MongoDB / Cloudflare R2 / Stripe / GA4 (G-RDNKEGKRWL) / Meta Pixel

## Technical Score: 41 / 100

| Category | Score |
|---|---|
| Crawlability | 70/100 |
| Indexability | 45/100 |
| Site Structure | 50/100 |
| Security | 30/100 |
| Core Web Vitals (Lab) | 35/100 |
| Mobile Optimization | 72/100 |
| Redirects | 20/100 |
| International SEO | 5/100 |
| Page Speed Signals | 48/100 |

---

## CRITICAL Issues

### [C-1] Product pages are fully Client-Side Rendered (CSR)
**File:** `src/app/(shop)/products/[slug]/page.tsx` — opens with `"use client"`
All product content (name, description, price, images) fetched via `useProductBySlug()` hook after JS hydration. Initial HTML contains only a loading spinner — zero product text visible to crawlers.

**Fix:** Convert to Server Component. The layout.tsx already has `getProduct()` — use it:
```tsx
// Remove "use client" from page.tsx
export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return <NotFoundState />;
  return <ProductDetailClient product={product} slug={slug} />;
}
```
Keep Client Components only for interactive children (variant selection, add-to-cart).

### [C-2] Structured data (JSON-LD) never in server-rendered HTML
**File:** `src/lib/seo/structured-data.tsx` — uses `next/script` without strategy (defaults to `afterInteractive`)
JSON-LD is client-side injected. Googlebot first-wave crawl sees zero structured data. Additionally, `id={structured-data-${Math.random()}}` causes React hydration mismatch.

**Fix Part A:** Use inline `<script>` in Server Components:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```
**Fix Part B:** Use stable deterministic IDs (caller-provided, not Math.random()).

### [C-3] www/non-www split with 307 TEMPORARY redirects contradicting canonicals
- oliogalia.com/products → 307 → www.oliogalia.com/products (temporary redirect, no PageRank pass-through)
- Canonical on www page points BACK to non-www → redirect loop signal
- Homepage (/) serves from non-www; product routes redirect to www → inconsistent

**Fix:** Add permanent redirect in vercel.json:
```json
{
  "redirects": [{
    "source": "/:path*",
    "has": [{ "type": "host", "value": "www.oliogalia.com" }],
    "destination": "https://oliogalia.com/:path*",
    "permanent": true
  }]
}
```

### [C-4] OG image and Organization logo return 404
- `https://oliogalia.com/images/og-image.jpg` → 404
- `https://oliogalia.com/images/logo.png` → 404

Referenced in metadata.ts and structured-data.tsx respectively. Every social share shows blank image. Organization schema invalid.

**Fix:** Add files to `/public/images/` OR update paths in metadata.ts and structured-data.tsx to use actual R2 CDN URLs (`https://pub-9a7992c9b54b4970ba58b0c563f17084.r2.dev/static_image/...`).

### [C-5] English content completely uncrawlable — zero hreflang
**File:** `src/lib/context/LocaleContext.tsx` — locale stored in localStorage, never in URL
- `/en` returns 404
- No `<link rel="alternate" hreflang>` tags anywhere
- HTML root: `<html lang="it" translate="no">`
- Product layout.tsx hardcodes `generateProductMetadata(product, 'it')`

Google never discovers, crawls, or indexes English content. International e-commerce organic traffic is completely blocked.

**Fix (architectural):** Implement Next.js App Router `[locale]` segment routing (/en/products, /it/products). Add hreflang alternates to generateBaseMetadata. Submit EN sitemap set.

### [C-6] HTTP 500 on all product detail pages
All 6 product slugs in sitemap return 500. Next.js injects `<meta name="robots" content="noindex"/>` on 500 pages — Google actively de-indexes them. Root cause: server-side data fetch failure (likely MongoDB/Stripe call in layout.tsx generateMetadata throwing).

---

## HIGH Issues

### [H-1] metadataBase fallback uses wrong TLD (.it instead of .com)
**File:** `src/app/layout.tsx` line 45
```typescript
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.it')
```
**Fix:** Change fallback to `'https://oliogalia.com'`

### [H-2] Hero video — severe LCP risk
4K MP4 served from cross-origin R2 CDN. No `poster` attribute (blank frame on load). No `<link rel="preconnect">` for R2 origin.

**Fix:**
```html
<video poster="https://pub-...r2.dev/static_image/hero-poster.webp" autoPlay loop muted playsInline>
```
Add in layout.tsx: `<link rel="preconnect" href="https://pub-9a7992c9b54b4970ba58b0c563f17084.r2.dev" />`
Replace video with static image on mobile via CSS media query.

### [H-3] Adobe Typekit CSS — render-blocking without preconnect
`<link rel="stylesheet" href="https://use.typekit.net/mew4ocs.css" />` blocks all rendering. No preconnect hint.

**Fix:**
```tsx
<link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
<link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
```
Long-term: self-host via `next/font/local` (already done for SweetSansPro).

### [H-4] Missing critical security headers
| Header | Status |
|---|---|
| X-Frame-Options | MISSING |
| X-Content-Type-Options | MISSING |
| Content-Security-Policy | MISSING |
| Referrer-Policy | MISSING |
| Permissions-Policy | MISSING |
| HSTS | Present but missing `includeSubDomains; preload` |

**Fix** in next.config.ts:
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
    ],
  }];
}
```

### [H-5] Sitemap: missing pages, no EN URLs, wrong slugs
- /sostenibilita and /faq missing from sitemap
- Product URLs use only `product.slug.it` — EN slugs never included
- lastModified set to `new Date()` on every build (false freshness signal)

### [H-6] Product metadata hardcoded to Italian locale
**File:** `src/app/(shop)/products/[slug]/layout.tsx` line 45 — `generateProductMetadata(product, 'it')` hardcoded

---

## MEDIUM Issues

- [M-1] No preconnect for Google Analytics / GTM origins
- [M-2] /api/ blocked in robots.txt — verify intentional
- [M-3] Newsletter "Iscriviti" button non-functional (no handler, no form)
- [M-4] Social media links are `<button>` elements, not `<a>` tags — Google can't follow; sameAs array empty/commented out
- [M-5] `<meta name="keywords">` present — Google ignores since 2009, adds Bing spam signal risk
- [M-6] No IndexNow implementation for Bing/Yandex instant indexing
- [M-7] CLS risk from Typekit FOUT — fonts load async without font-display control

## LOW Issues

- [L-1] Hero video: no poster attribute — blank frame on load (also CWV impact)
- [L-2] No `fetchpriority="high"` on above-the-fold images
- [L-3] `translate="no"` site-wide — disables browser translation fallback for international users until proper i18n is implemented
- [L-4] Organization schema: empty sameAs[], address has only `addressCountry: 'IT'` (missing street, city, postal code)
- [L-5] No canonical for ?category= and ?search= query string URLs — duplicate content risk

---

## Prioritized Fix Roadmap

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| P0 | Convert product page.tsx from CSR to SSR (C-1) | High | Critical |
| P0 | Fix www → non-www 301 redirect in vercel.json (C-3) | Low | Critical |
| P0 | Add OG/logo images to /public/images/ (C-4) | Low | Critical |
| P0 | Fix 500 errors on product pages (C-6) | Medium | Critical |
| P1 | Move JSON-LD to SSR script tags, fix random ID (C-2) | Medium | High |
| P1 | Implement i18n URL routing + hreflang (C-5) | Very High | High |
| P1 | Fix metadataBase fallback .it → .com (H-1) | Trivial | High |
| P1 | Add security headers in next.config.ts (H-4) | Low | High |
| P2 | Add video poster + R2 preconnect (H-2) | Low | High |
| P2 | Add Typekit preconnect / self-host fonts (H-3) | Medium | High |
| P2 | Fix sitemap: add missing pages + EN slugs (H-5) | Low | Medium |
| P3 | Replace social buttons with anchor tags + populate sameAs (M-4) | Low | Medium |
| P3 | Implement IndexNow (M-6) | Medium | Medium |
| P4 | Remove meta keywords (M-5) | Trivial | Low |
| P4 | Add canonical for query string URLs (L-5) | Low | Low |
