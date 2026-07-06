# Performance & Core Web Vitals Audit — oliogalia.com

**Audit date:** 2026-06-28  
**Method:** Live HTML source analysis (curl + source inspection) — PageSpeed Insights API quota exhausted  
**Actual serving URL:** `https://www.oliogalia.com/` (Vercel edge, fra1 region, HTTP/2)  
**HTML payload:** 127,741 bytes (uncompressed)  
**Stack:** Next.js 15 App Router, Tailwind CSS v4, Vercel hosting, Cloudflare R2 media CDN

---

## CWV Risk Summary

| Metric | Risk Level | Primary Driver |
|--------|-----------|----------------|
| LCP    | CRITICAL  | 29 MB 4K hero video, no poster, text starts invisible |
| INP    | MEDIUM    | Multiple client-side contexts + product API call on mount |
| CLS    | MEDIUM    | Client-fetched product section replaces spinner; TypeKit font-display:auto |

---

## CRITICAL — LCP

### PERF-01 · 29 MB 4K hero video with no poster image
**Severity: CRITICAL**  
**File:** `src/components/homepage/sections/hero/VideoBackground.tsx` (line 13–21)  
**Source:** `https://pub-9a7992c9b54b4970ba58b0c563f17084.r2.dev/video_hero_Section/Hero%20Video%204K.mp4`  
**Measured size:** 29,132,134 bytes (27.8 MB)

The entire above-the-fold viewport is a `<video autoPlay loop muted playsInline>` element with a single 4K MP4 source and **no `poster` attribute**. This produces two compounding LCP failures:

1. Chrome's LCP algorithm can use a video poster as a candidate element. With no poster set, the browser must stream and decode the first video frame before any above-fold visual is available. On a 4G connection (~10 Mbps) the browser needs to buffer ~1–2 MB before painting the first frame. On mobile 3G the first paint of the hero may not occur within the LCP measurement window (2.5 s good / 4.0 s needs improvement).

2. The video is served at 4K resolution to all devices including mobile. No adaptive bitrate, no `<source media>` breakpoints, no smaller-resolution alternative.

**No preload or preconnect hint exists for this resource.** The R2 CDN domain `pub-9a7992c9b54b4970ba58b0c563f17084.r2.dev` requires an extra DNS + TLS handshake before the first byte of video data can arrive.

**Recommended fix:**
```html
<!-- 1. Add a poster image (WebP, ~50–80 KB) exported from the first video frame -->
<video autoPlay loop muted playsInline
  poster="https://pub-…/static_image/hero-poster.webp"
  className="absolute inset-0 w-full h-full object-cover">
  <!-- 2. Serve multiple resolutions -->
  <source src="https://pub-…/video_hero/hero-mobile-720p.mp4"
          type="video/mp4" media="(max-width: 768px)" />
  <source src="https://pub-…/video_hero/hero-1080p.mp4"
          type="video/mp4" />
</video>
```

```html
<!-- 3. In <head>: preconnect + preload the poster -->
<link rel="preconnect" href="https://pub-9a7992c9b54b4970ba58b0c563f17084.r2.dev" crossorigin />
<link rel="preload" as="image" href="https://pub-…/static_image/hero-poster.webp"
      imagesizes="100vw" fetchpriority="high" />
```

A 720p WebP poster at ~60 KB will be LCP-eligible and renders in under 300 ms on average connections, moving LCP from "Poor" to "Good" without any JavaScript dependency.

---

### PERF-02 · Hero content hidden until JavaScript hydration
**Severity: CRITICAL**  
**File:** `src/components/homepage/sections/HeroSection.tsx` (line 9–13), `src/components/homepage/sections/hero/HeroContent.tsx` (line 19, 31, 47)

`HeroSection` is a `'use client'` component that uses `useState(false)` for `isVisible` and `useEffect(() => setIsVisible(true), [])`. Next.js server-renders the initial state (false), so the shipped HTML contains `opacity-0 translate-y-8` on all three hero text blocks. The text only becomes visible after the React bundle downloads, parses, and the hydration effect runs.

On a slow network:
- HTML arrives (hero text is invisible)
- JS bundles download (11 async chunks)
- React hydrates
- `useEffect` fires → `isVisible = true` → CSS transition starts
- Hero text finally visible

This makes the hero H1 text ineligible as an LCP candidate until well after the browser's LCP measurement window may have passed. Combined with the video having no poster (PERF-01), the page effectively has **no LCP candidate** during the critical first seconds of load.

**Recommended fix:**  
Remove the `isVisible` state gate from the text elements. Use CSS animations with `animation-play-state` or initial-render-visible classes instead. The animation effect can be achieved without hiding content on first paint:

```tsx
// Instead of opacity-0 on SSR, use CSS @keyframes that start from transparent
// and apply the animation class unconditionally
<div className="w-full pb-6 font-serif text-beige space-y-2 animate-fade-up-1">
  ...
</div>
```

Alternatively, set `isVisible` initial state to `true` and use `suppressHydrationWarning` if animation on first load is not required.

---

## HIGH — Render-Blocking Resources

### PERF-03 · Adobe TypeKit CSS is render-blocking with font-display:auto
**Severity: HIGH**  
**File:** `src/app/layout.tsx` (line 65)

```html
<link rel="stylesheet" href="https://use.typekit.net/mew4ocs.css" />
```

This is a **render-blocking** stylesheet loaded from a third-party origin (`use.typekit.net`) with **no preconnect hint**. The browser must:
1. Discover the `<link>` element during HTML parsing
2. Resolve DNS for `use.typekit.net` (cold lookup)
3. Establish TLS connection
4. Download the CSS (~500 B)
5. Parse the CSS (which imports `https://p.typekit.net/p.css` — a second origin!)
6. Download font files from `use.typekit.net` (woff2 + woff + opentype offered)

The TypeKit CSS sets `font-display:auto` for the "termina" font family, which instructs the browser to use its default behavior — typically a brief FOIT (invisible text) then FOUT (fallback swap). No system-font fallback is declared with calibrated metrics for termina, so when it swaps in, it will shift layout.

The TypeKit `mew4ocs.css` response has `cache-control: private, max-age=600` — only 10 minutes cache. It will be re-fetched on repeat visits.

**Recommended fix:**
```html
<!-- In layout.tsx <head> — add preconnect for both TypeKit origins -->
<link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
<link rel="preconnect" href="https://p.typekit.net" crossOrigin="" />
<!-- Keep the stylesheet but move it after the preconnects -->
<link rel="stylesheet" href="https://use.typekit.net/mew4ocs.css" />
```

Longer term: self-host the "termina" font files through `next/font/local` (same as sweetSans) to eliminate the external origin entirely, add `font-display: swap`, and define a calibrated fallback metric block. This would remove ~2 external connections and eliminate the render-blocking behavior.

---

### PERF-04 · No preconnect for Cloudflare R2 media CDN
**Severity: HIGH**

All images, the hero video, and the loading-spinner icon are served from:
```
https://pub-9a7992c9b54b4970ba58b0c563f17084.r2.dev
```

There is **no `<link rel="preconnect">` or `<link rel="dns-prefetch">` for this domain**. The browser cannot start DNS resolution or TLS handshake for this origin until it discovers the first resource reference in the HTML (the logo `<img src>` or the two `<link rel="preload" as="image">` tags). This adds a connection overhead of ~100–300 ms (depending on CDN PoP distance) to every resource served from R2.

**Recommended fix (one line in layout.tsx):**
```html
<link rel="preconnect" href="https://pub-9a7992c9b54b4970ba58b0c563f17084.r2.dev" crossOrigin="" />
```

---

### PERF-05 · Loading-spinner icon preloaded at high priority
**Severity: HIGH**  
**File:** `src/app/layout.tsx` (implicit, via Next.js metadata) / compiled `<head>`

The compiled `<head>` contains:
```html
<link rel="preload" as="image"
  href="https://pub-…/static_image/Galia%20stacked%20icon%20(black).png" />
```

This 70,807-byte PNG is the `animate-pulse` loading spinner shown while products are fetched. Preloading it at high priority during initial page load competes with genuinely critical resources (the hero poster, above-fold CSS) for early network bandwidth. A loading spinner by definition only needs to paint after the product API call is in flight, which happens well after first render.

**Recommended fix:** Remove this preload hint. If Next.js is generating it automatically from an `<Image priority>` prop on the spinner, change the spinner to use a plain `<img>` without `priority`.

---

## MEDIUM — INP

### PERF-06 · Products section is fully client-side with API fetch on mount
**Severity: MEDIUM**  
**File:** `src/components/homepage/sections/ProductSection.tsx` (line 12)

`ProductsSection` is a `'use client'` component that calls `useProducts()`, which triggers a client-side `fetch` to the product API on every page load. During this fetch, the section renders `<LoadingSpinner>` (the pulsing icon). When the API responds, the spinner is replaced by product cards.

This has three performance consequences:
1. **CLS:** The spinner has `min-h-screen` height. Product cards likely have a different height. The replacement creates a layout shift visible to users and measurable by CLS.
2. **LCP delay:** If the first viewport-visible product card image is the LCP element (browser might choose it over the invisible hero text), it cannot paint until the API call completes.
3. **INP load:** The initial mount triggers the API fetch and state updates on interaction with the cart button, stacking JavaScript work.

**Recommended fix:** Use a Next.js Server Component with `async/await` to fetch and render products server-side. This eliminates the loading spinner, reduces JavaScript bundle size, and makes product card images eligible as SSR-rendered LCP candidates. Alternatively, prefetch products in `generateStaticParams` or use ISR with `revalidate`.

---

### PERF-07 · Multiple analytics scripts without deduplication
**Severity: MEDIUM**  
**File:** `src/app/layout.tsx` (lines 10–13, 78–86)

Three analytics instruments are active simultaneously:
1. **Vercel Analytics** (`@vercel/analytics/next`) — injected as `<Analytics />` component
2. **Google Analytics 4** (`@next/third-parties/google`) — `<GoogleAnalytics gaId="G-RDNKEGKRWL" />`
3. **Meta Pixel** (`src/components/analytics/MetaPixel.tsx`) — `strategy="afterInteractive"` (correct timing)

GA4 is preloaded as a script in `<head>`:
```html
<link rel="preload" href="https://www.googletagmanager.com/gtag/js?id=G-RDNKEGKRWL" as="script"/>
```
but there is **no `<link rel="preconnect" href="https://www.googletagmanager.com">`**, so the preload cannot begin until after DNS resolution completes.

Meta Pixel's `strategy="afterInteractive"` is correct and does not block rendering.

Vercel Analytics and GA4 can overlap in event tracking. Depending on the goals, one may be redundant. Each adds event listeners that contribute to main-thread work and INP overhead.

**Recommended fix:**
```html
<!-- Add preconnect before the GTM preload -->
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="dns-prefetch" href="https://www.google-analytics.com" />
```

Evaluate whether both Vercel Analytics and GA4 are needed. Removing one reduces main-thread event listener count.

---

## MEDIUM — CLS

### PERF-08 · TypeKit font-display:auto causes FOIT and layout shift
**Severity: MEDIUM**

The TypeKit "termina" font (used on nav links, buttons: `.termina-11`, `.navbar-desktop-link`, `.btn-outline`) has `font-display:auto` with no declared system-font fallback. `auto` typically means the browser shows invisible text (FOIT) for up to 3 seconds while the font downloads. When it swaps in, glyphs are a different width than the fallback, causing layout shift.

The Next.js-self-hosted fonts (Roboto, Libre Baskerville, sweetSans) all correctly use `font-display:swap` with auto-generated size-adjust metrics:
- `Roboto Fallback` → `local("Arial")` with `size-adjust:99.78%` — near-zero CLS
- `Libre Baskerville Fallback` → `local("Times New Roman")` with `size-adjust:127.26%`
- `sweetSans Fallback` → `local("Arial")` with `size-adjust:109.09%`

TypeKit has none of these protections.

**Recommended fix:** Self-host termina via `next/font/local` to gain control over `font-display` and add calibrated fallback metrics using the `fonttools` or `glyphhanger` approach that Next.js uses internally.

---

### PERF-09 · Product section height change on data load
**Severity: MEDIUM**  
**Related to:** PERF-06

When `ProductsSection` transitions from the loading spinner (`min-h-screen`) to the actual product slider, the section height changes. While `min-h-screen` prevents the section from collapsing to zero, the loaded slider height is likely different from viewport height, and content below shifts. This will register as a CLS event on every page load.

**Recommended fix:** Server-render the product grid (see PERF-06). If client-side fetch must be kept, reserve an explicit fixed height for the section while loading that matches the loaded state height.

---

## LOW — Additional Issues

### PERF-10 · Canonical URL mismatch
**Severity: LOW (but affects CWV field data accuracy)**

The page canonical tag points to:
```html
<link rel="canonical" href="https://oliogalia.com" />
```

But the actual canonical URL (after the 307 redirect from non-www) is `https://www.oliogalia.com/`. Google Search Console and CrUX aggregate field data under the canonical URL. This mismatch may cause CrUX data to be split across two origins, reducing the sample size and making field data unreliable.

**Fix:** Change `metadataBase` in `layout.tsx` (line 45) from `oliogalia.it` fallback to `https://www.oliogalia.com`, and ensure the generated canonical matches the served URL including `www`.

---

### PERF-11 · Next.js image `src` fallback requests 3840px images
**Severity: LOW**

All `<Image fill>` components have `sizes="100vw"` and a default `src` attribute pointing to the `w=3840` variant:
```html
src="/_next/image?url=…IMG_2484-2.jpg&w=3840&q=90"
```

Modern browsers use the `srcSet` correctly. However, non-supporting contexts (social media crawlers, some email clients, Googlebot image crawling) will request the 3840px variant. The `/_next/image` endpoint served a 276 KB WebP for the 1080px version — the 3840px version will be proportionally larger.

Additionally, `q=90` on above-fold images vs `q=75` on below-fold images is reasonable, but quality 90 at full-width is higher than necessary. `q=80` would likely be indistinguishable visually.

---

### PERF-12 · No video alternatives or format optimization
**Severity: LOW**

The hero video is served only as MP4. Modern browsers support WebM/VP9 and AV1, which achieve 30–50% smaller file sizes at equivalent quality. No `<source>` element for WebM is present.

```html
<!-- Preferred order: AV1, VP9/WebM, H.264/MP4 -->
<source src="hero-1080p.av1.webm" type="video/webm; codecs=av01" />
<source src="hero-1080p.vp9.webm" type="video/webm" />
<source src="hero-1080p.mp4" type="video/mp4" />
```

A 1080p WebM VP9 encode of the same content would likely be under 5 MB vs 29 MB for the 4K H.264, dramatically improving load time on all connections.

---

### PERF-13 · Newsletter popup CLS risk
**Severity: LOW**  
**File:** `src/components/layout/NewsletterPopup.tsx`

A newsletter popup exists in the layout. If it uses `position:fixed` or `position:absolute` it will not affect CLS. If it uses `position:relative`/`static` or inserts itself into the document flow after initial render, it will shift content and register as CLS. This should be verified.

---

## What Is Working Well

- **HTTP/2** is active on Vercel (confirmed in response headers)
- **All Next.js JS chunks load with `async`** — no render-blocking scripts from the application bundle
- **4 critical fonts are preloaded** in `<head>` with correct `crossorigin` and `type` attributes: Roboto (latin), Libre Baskerville, sweetSans regular, sweetSans medium
- **Next.js image optimization** is working: `/_next/image` serves WebP (`content-type: image/webp`) with srcSet breakpoints at 640/750/828/1080/1200/1920/2048/3840w
- **Below-fold images correctly use `loading="lazy" decoding="async"`**
- **Self-hosted fonts use `font-display:swap` with calibrated fallback metrics** (Roboto, Libre Baskerville, sweetSans) — low CLS risk for these
- **Vercel CDN cache is warm** (`x-vercel-cache: HIT`) — TTFB is fast
- **Meta Pixel uses `strategy="afterInteractive"`** — does not block rendering
- **Tailwind CSS v4** generates utility-first CSS with no specificity issues
- **HSTS is set** (`strict-transport-security: max-age=63072000`)

---

## Priority Fix Order

| Priority | Issue | Estimated LCP Gain |
|----------|-------|-------------------|
| 1 | PERF-01: Add video poster image (60–80 KB WebP) | ~3–8 s LCP reduction |
| 2 | PERF-02: Make hero text visible on SSR | ~1–3 s LCP reduction |
| 3 | PERF-03: Preconnect for TypeKit + consider self-hosting | ~200–500 ms FCP |
| 4 | PERF-04: Preconnect for R2 CDN | ~100–300 ms all images |
| 5 | PERF-06: Server-render products (removes spinner, fixes CLS) | CLS fix + TTI |
| 6 | PERF-05: Remove spinner from preload | Frees bandwidth |
| 7 | PERF-07: Add preconnect for GTM | ~100–200 ms GA load |
| 8 | PERF-12: Encode 1080p WebM + serve adaptive video | ~80% video size reduction |
