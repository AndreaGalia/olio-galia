# Schema Markup Audit — Olio Galia
**Date:** 2026-06-28  
**Site:** https://oliogalia.com  
**Framework:** Next.js 15.5 / React 19 (App Router)

---

## Executive Summary

Olio Galia has a structured data foundation in place but it is incomplete and contains two critical bugs that undermine its effectiveness. Only two pages emit JSON-LD (homepage and product detail), six public pages have no schema at all, and a client-component rendering bug means the most commercially valuable markup — `Product` and `Offer` — is injected via JavaScript rather than server-rendered HTML.

| Severity | Count | Items |
|----------|-------|-------|
| Critical | 2 | JS-injected Product schema; `Math.random()` hydration bug |
| High | 4 | Empty `sameAs`; incomplete `address`; no `LocalBusiness`; `aggregateRating` never populated |
| Medium | 5 | Missing `priceValidUntil`; SKU is internal ID; generic `additionalProperty`; no reviews in Product schema; `WebSite` search URL unverified |
| Low / Opportunity | 6 | No `ItemList`; no `AboutPage`; no `ContactPage`; no `FAQPage`; no schema on Sostenibilità or Smaltimento Rifiuti pages |

---

## Page Inventory

| URL | Schema Present | Types |
|-----|---------------|-------|
| `/` | Yes | Organization, WebSite |
| `/products` | No | — |
| `/products/[slug]` | Yes (JS-only) | Product, BreadcrumbList |
| `/about` | No | — |
| `/contact` | No | — |
| `/faq` | No | — |
| `/sostenibilita` | No | — |
| `/smaltimento-rifiuti` | No | — |
| `/privacy-policy` | noindex — skip | — |
| `/termini-servizio` | noindex — skip | — |
| `/cookie-policy` | noindex — skip | — |

---

## Validation Results

### Existing Schema

| Schema | Location | Status | Issues |
|--------|----------|--------|--------|
| Organization | `src/lib/seo/structured-data.tsx` | ⚠️ | `sameAs` is empty array; `address` has only `addressCountry` |
| WebSite | `src/lib/seo/structured-data.tsx` | ⚠️ | `SearchAction` target URL must be verified functional |
| Product | `src/lib/seo/structured-data.tsx` | ❌ | JS-injected from client component; `sku` is internal DB id; `aggregateRating` never passed from call site; `additionalProperty` uses generic `name: "Feature"` |
| BreadcrumbList | `src/lib/seo/structured-data.tsx` | ✅ | Valid structure |
| Review | `src/lib/seo/structured-data.tsx` | ⚠️ | Defined but never called/rendered on any page |
| StructuredData component | `src/lib/seo/structured-data.tsx` | ❌ | `id={structured-data-${Math.random()}}` causes React hydration mismatch on every render |

---

## Critical Issues

### CRITICAL-1 — Product Schema Injected via JavaScript, Not SSR HTML

**File:** `src/app/(shop)/products/[slug]/page.tsx`, line 1  
**Impact:** Google may not process `Product` and `Offer` markup in a timely manner; rich result eligibility at risk.

The product detail page opens with `"use client"`, making it a Client Component. `StructuredData` (which calls `next/script`'s `<Script>`) is rendered inside this client component, so the JSON-LD is not present in the initial server-rendered HTML — it is injected by JavaScript after the page becomes interactive. Per Google's December 2025 JS SEO guidance, structured data for `Product` and `Offer` must be in the initial HTML response to guarantee timely indexing and rich result eligibility.

**Fix:** Convert the product page to a Server Component by extracting the client-side interactivity (image gallery state, variant selection) into a dedicated `ProductInteractiveShell` client component. The `StructuredData` calls then move to the server-rendered wrapper.

Alternatively: move the `StructuredData` rendering into the existing `src/app/(shop)/products/[slug]/layout.tsx`, which is already a Server Component that fetches the product directly from MongoDB for metadata generation. This is the lower-effort fix.

```tsx
// src/app/(shop)/products/[slug]/layout.tsx  — add schema here (server component)
import { StructuredData, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';

// Inside the existing getProduct() call chain:
export default async function ProductLayout({ children, params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  return (
    <>
      {product && (
        <>
          <StructuredData data={generateProductSchema(product, 'it')} />
          <StructuredData data={generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Prodotti', url: '/products' },
            { name: product.translations.it.name, url: `/products/${product.slug.it}` }
          ], 'it')} />
        </>
      )}
      {children}
    </>
  );
}
```

Then remove the `StructuredData` calls from `page.tsx`.

---

### CRITICAL-2 — `Math.random()` in Script `id` Prop Causes Hydration Mismatch

**File:** `src/lib/seo/structured-data.tsx`, line 197

```tsx
// Current (broken):
<Script
  id={`structured-data-${Math.random()}`}
  ...
```

`Math.random()` produces a different value on the server than on the client, causing a React hydration mismatch warning on every page render. This can lead to the script being re-injected or dropped silently.

**Fix:** Use a deterministic ID based on the schema `@type`:

```tsx
export function StructuredData({ data }: { data: Record<string, unknown> }) {
  const type = Array.isArray(data['@type'])
    ? (data['@type'] as string[]).join('-')
    : (data['@type'] as string) ?? 'unknown';

  return (
    <Script
      id={`schema-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

If the same `@type` can appear multiple times on a page, accept an optional `id` prop as an override:

```tsx
export function StructuredData({
  data,
  id,
}: {
  data: Record<string, unknown>;
  id?: string;
}) {
  const type = Array.isArray(data['@type'])
    ? (data['@type'] as string[]).join('-')
    : (data['@type'] as string) ?? 'unknown';

  return (
    <Script
      id={id ?? `schema-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

---

## High Priority Issues

### HIGH-1 — Organization `sameAs` is Empty; Social Profiles Commented Out

**File:** `src/lib/seo/structured-data.tsx`, lines 22-26

The `sameAs` array is empty. Social profile URLs are commented out. `sameAs` is one of the most important Organization properties for entity recognition in Google's Knowledge Graph and AI Overviews.

**Fix:** Populate with live social URLs when available. See recommended Organization schema in [Recommendations](#recommendations) section below.

---

### HIGH-2 — Organization `address` Is Incomplete

**File:** `src/lib/seo/structured-data.tsx`, lines 18-21

Only `addressCountry: 'IT'` is present. For a food producer, a complete `PostalAddress` is important for local SEO, `LocalBusiness` rich results, and GBP association.

**Fix:** Add `streetAddress`, `addressLocality`, `addressRegion`, `postalCode`. See recommended LocalBusiness schema below.

---

### HIGH-3 — No `LocalBusiness` Schema Anywhere

For an artisanal olive oil producer, `LocalBusiness` (or its food-sector subtype `FoodEstablishment`) should appear on the Contact page and optionally sitewide. This is required for Google Maps-linked rich results and local pack eligibility.

**Fix:** Add `LocalBusiness` schema to `/contact`. See generated code below.

---

### HIGH-4 — `aggregateRating` Is Never Populated in Practice

**File:** `src/app/(shop)/products/[slug]/page.tsx`, line 56

The `generateProductSchema` function accepts `averageRating` and `reviewCount` parameters, but the call site passes neither:

```tsx
// Current (line 56 of product page):
const productSchema = generateProductSchema(product, 'it');
// averageRating and reviewCount are undefined — no aggregateRating is emitted
```

The product page does fetch reviews via `ProductReviews` and `ProductReviewsSummaryCard`, but the stats are not lifted up to be passed into the schema generator.

**Fix (with CRITICAL-1 fix applied):** In `layout.tsx`, fetch review stats from the API alongside the product, then pass them to `generateProductSchema`:

```tsx
// In layout.tsx getProduct helper, also fetch stats:
const statsRes = await fetch(`${BASE_URL}/api/feedbacks?productSlug=${slug}&limit=1`);
const statsData = await statsRes.json();
const stats = statsData?.stats;

// Then pass to schema:
generateProductSchema(
  product,
  'it',
  stats?.averageRating,
  stats?.total
)
```

Alternatively, if the API call adds latency, store `averageRating` and `reviewCount` as denormalized fields on the `ProductDocument` in MongoDB and update them asynchronously when new reviews are approved.

---

## Medium Priority Issues

### MEDIUM-1 — `Offer` Missing `priceValidUntil`

Google's Product rich result documentation recommends `priceValidUntil`. Without it, prices may be shown as "outdated" in some search contexts.

**Fix:** Add a rolling `priceValidUntil` date (e.g., 1 year from generation) in `generateProductSchema`. See full corrected Product schema below.

---

### MEDIUM-2 — Product `sku` Uses Internal MongoDB `id`

**File:** `src/lib/seo/structured-data.tsx`, line 108-110

The internal database `id` is not a meaningful product identifier. Prefer a slugified product code or a dedicated SKU field.

**Fix:** Use `product.slug.it` (from `ProductDocument`) as the `sku` or `identifier`, or add a proper `sku` field to the product data model.

---

### MEDIUM-3 — `additionalProperty` Uses Generic `name: 'Feature'` for All Entries

**File:** `src/lib/seo/structured-data.tsx`, lines 130-134

```tsx
schema.additionalProperty = translations.features.map(feature => ({
  '@type': 'PropertyValue',
  name: 'Feature',      // same name for every property
  value: feature
}));
```

Every property is named `"Feature"`. Schema.org `PropertyValue` expects a meaningful `name` per property (e.g., `"Varietà di oliva"`, `"Metodo di raccolta"`, `"Certificazione"`).

**Fix:** If features are free-form strings, omit `additionalProperty` and instead use `description` more fully. If they are structured, define typed properties. At minimum, use the feature text as both name and value, or drop the block entirely — meaningless properties add noise.

---

### MEDIUM-4 — Individual `Review` Schema Is Defined But Never Rendered

`generateReviewSchema` exists in `structured-data.tsx` but is called nowhere. Each approved review in the database is a candidate for `Review` markup nested inside the `Product` schema, which strengthens rich result eligibility.

**Fix:** When reviews are fetched in the product layout (see HIGH-4 fix), include the most recent 3-5 approved reviews as `review` array entries in the Product schema.

---

### MEDIUM-5 — `WebSite` SearchAction URL Must Be Verified

**File:** `src/lib/seo/structured-data.tsx`, lines 48-53

The `SearchAction` target is `/products?search={search_term_string}`. Verify that this query parameter actually filters products on the catalog page. The current `ProductsPage` uses `searchParams.get('category')` but there is no `search` param handler visible in the source. If the URL does not return results, Google may demote or ignore the Sitelinks Searchbox.

---

## Recommendations and Generated JSON-LD

### 1. Fix Organization Schema (Homepage)

Replace the current `generateOrganizationSchema()` output with:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Olio Galia",
  "url": "https://oliogalia.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://oliogalia.com/images/logo.png",
    "width": 512,
    "height": 512
  },
  "description": "Produttore artigianale di olio extra vergine di oliva biologico di alta qualità da Cassaro, Sicilia.",
  "foundingLocation": {
    "@type": "Place",
    "name": "Cassaro, Sicilia, Italia"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cassaro",
    "addressRegion": "SR",
    "addressCountry": "IT"
  },
  "sameAs": [
    "https://www.instagram.com/oliogalia",
    "https://www.facebook.com/oliogalia"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "FILL_IN_CONTACT_EMAIL",
    "availableLanguage": ["Italian", "English"]
  }
}
```

Update `generateOrganizationSchema()` in `src/lib/seo/structured-data.tsx` to return this shape. Pull `sameAs` URLs and `email` from `process.env` to keep them configurable.

---

### 2. Fix Product Schema

Replace the Offer block and add missing fields. Full corrected generator output:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "PRODUCT_NAME",
  "description": "PRODUCT_DESCRIPTION",
  "image": [
    "https://oliogalia.com/images/product-image-1.jpg"
  ],
  "sku": "PRODUCT_SLUG_IT",
  "brand": {
    "@type": "Brand",
    "name": "Olio Galia"
  },
  "manufacturer": {
    "@type": "Organization",
    "name": "Olio Galia",
    "url": "https://oliogalia.com"
  },
  "category": "Olio Extra Vergine di Oliva",
  "countryOfOrigin": {
    "@type": "Country",
    "name": "Italy"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://oliogalia.com/products/PRODUCT_SLUG",
    "priceCurrency": "EUR",
    "price": "XX.XX",
    "priceValidUntil": "2027-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "IT"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "businessDays": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        },
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 2,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 2,
          "maxValue": 5,
          "unitCode": "DAY"
        }
      }
    },
    "seller": {
      "@type": "Organization",
      "name": "Olio Galia",
      "url": "https://oliogalia.com"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": 42,
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "REVIEWER_NAME"
      },
      "reviewBody": "REVIEW_TEXT",
      "datePublished": "2026-01-15"
    }
  ]
}
```

Key changes vs current implementation:
- `sku` uses `product.slug.it` not internal DB `id`
- `manufacturer` added alongside `brand`
- `countryOfOrigin` added — important signal for food products
- `priceValidUntil` set to a rolling future date
- `itemCondition` added (required by some rich result validators)
- `shippingDetails` block added (strongly recommended by Google for Shopping)
- `aggregateRating` wired to real data
- `review` array with top reviews

---

### 3. Add `LocalBusiness` Schema to Contact Page

Add to `src/app/(marketing)/contact/page.tsx` (or its layout):

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Olio Galia",
  "description": "Produttore artigianale di olio extra vergine di oliva biologico da Cassaro, Sicilia.",
  "url": "https://oliogalia.com",
  "telephone": "FILL_IN_PHONE",
  "email": "FILL_IN_EMAIL",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cassaro",
    "addressRegion": "SR",
    "postalCode": "96010",
    "addressCountry": "IT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "37.1155",
    "longitude": "15.0613"
  },
  "image": "https://oliogalia.com/images/og-image.jpg",
  "logo": "https://oliogalia.com/images/logo.png",
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "paymentAccepted": "Carta di credito, Carta di debito, PayPal",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/oliogalia",
    "https://www.facebook.com/oliogalia"
  ],
  "servesCuisine": "Italian",
  "hasMap": "https://maps.google.com/?q=Cassaro,SR,Italy"
}
```

Implement by adding a new `generateLocalBusinessSchema()` function to `structured-data.tsx` and calling it in the contact page/layout.

---

### 4. Add `AboutPage` WebPage Schema to `/about`

```json
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "Chi Siamo — Olio Galia",
  "description": "La storia di Olio Galia: una famiglia siciliana con generazioni di esperienza nella produzione di olio extra vergine di oliva biologico da Cassaro.",
  "url": "https://oliogalia.com/about",
  "inLanguage": "it",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Olio Galia",
    "url": "https://oliogalia.com"
  },
  "about": {
    "@type": "Organization",
    "name": "Olio Galia",
    "url": "https://oliogalia.com",
    "foundingDate": "FILL_IN_FOUNDING_YEAR",
    "foundingLocation": {
      "@type": "Place",
      "name": "Cassaro, Sicilia"
    }
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://oliogalia.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Chi Siamo",
        "item": "https://oliogalia.com/about"
      }
    ]
  }
}
```

Add to `src/app/(marketing)/about/layout.tsx`.

---

### 5. Add `ContactPage` WebPage Schema to `/contact`

```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contatti — Olio Galia",
  "description": "Contatta Olio Galia per informazioni, preventivi e ordini.",
  "url": "https://oliogalia.com/contact",
  "inLanguage": "it",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Olio Galia",
    "url": "https://oliogalia.com"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://oliogalia.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Contatti",
        "item": "https://oliogalia.com/contact"
      }
    ]
  }
}
```

Add to `src/app/(marketing)/contact/layout.tsx` alongside the `LocalBusiness` schema.

---

### 6. Add `FAQPage` Schema to `/faq`

> **Note:** Google retired FAQ rich results for all sites on May 7, 2026. No SERP feature is triggered. However, `FAQPage` markup continues to aid entity resolution in Google AI Mode and AI Overviews. Severity: Info.

The FAQ data is fetched client-side at runtime via `/api/faqs`. Since the FAQ page is a Server Component (`page.tsx` has no `"use client"`), the schema should be generated server-side by fetching directly from the API or MongoDB.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Domande Frequenti — Olio Galia",
  "url": "https://oliogalia.com/faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "DOMANDA_1",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "RISPOSTA_1"
      }
    },
    {
      "@type": "Question",
      "name": "DOMANDA_2",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "RISPOSTA_2"
      }
    }
  ]
}
```

Implement by fetching FAQs from the database in a new `generateFAQSchema()` function (similar to how `layout.tsx` fetches product data for metadata) and rendering via `<StructuredData>` in the FAQ page or its layout.

---

### 7. Add `ItemList` Schema to `/products` Catalog Page

The catalog page is currently `"use client"`. The pattern for fixing is the same as CRITICAL-1: move `StructuredData` into the `src/app/(shop)/products/layout.tsx` (which is already a server component). Fetch minimal product data server-side for the schema only.

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "I Nostri Prodotti — Olio Galia",
  "description": "Selezione di oli extra vergini di oliva biologici artigianali.",
  "url": "https://oliogalia.com/products",
  "numberOfItems": 12,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://oliogalia.com/products/PRODUCT_SLUG_1",
      "name": "PRODUCT_NAME_1"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "url": "https://oliogalia.com/products/PRODUCT_SLUG_2",
      "name": "PRODUCT_NAME_2"
    }
  ]
}
```

---

### 8. Add `WebPage` Schema to Content Pages

For `/sostenibilita` and `/smaltimento-rifiuti`, add a basic `WebPage` schema. Both are client components; add schema in their respective `layout.tsx` files (which are server components).

**Sostenibilità:**

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Sostenibilità — Olio Galia",
  "description": "Il nostro impegno per una produzione olearia sostenibile: agricoltura biologica, raccolta a mano e filiera corta nel rispetto della terra siciliana.",
  "url": "https://oliogalia.com/sostenibilita",
  "inLanguage": "it",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Olio Galia",
    "url": "https://oliogalia.com"
  },
  "about": {
    "@type": "Thing",
    "name": "Sostenibilità nella produzione di olio extravergine biologico"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://oliogalia.com" },
      { "@type": "ListItem", "position": 2, "name": "Sostenibilità", "item": "https://oliogalia.com/sostenibilita" }
    ]
  }
}
```

**Smaltimento Rifiuti:**

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Smaltimento Rifiuti e Riciclaggio — Olio Galia",
  "description": "Guida completa al corretto smaltimento e riciclaggio del packaging dei nostri prodotti.",
  "url": "https://oliogalia.com/smaltimento-rifiuti",
  "inLanguage": "it",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Olio Galia",
    "url": "https://oliogalia.com"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://oliogalia.com" },
      { "@type": "ListItem", "position": 2, "name": "Smaltimento Rifiuti", "item": "https://oliogalia.com/smaltimento-rifiuti" }
    ]
  }
}
```

---

## Additional Finding — Sitemap Missing Pages

`src/app/sitemap.ts` omits `/faq` and `/sostenibilita` from `staticPages`. Both pages are indexable (no `robots: noindex` set), linked from the navigation, and have marketing value. Add them to the sitemap with appropriate `priority` values (`0.7` and `0.6` respectively).

---

## Implementation Priority Order

1. **CRITICAL-2** — Fix `Math.random()` hydration bug in `StructuredData` component (5 min change)
2. **CRITICAL-1** — Move Product + Breadcrumb schema out of client component into `layout.tsx` (1-2 hr)
3. **HIGH-1/2** — Populate `sameAs` and complete `address` in Organization schema (15 min)
4. **HIGH-3** — Add `LocalBusiness` + `ContactPage` schema to contact page (30 min)
5. **HIGH-4** — Wire `aggregateRating` and reviews to real data in Product schema (2-3 hr with API work)
6. **MEDIUM-1/2** — Add `priceValidUntil` + fix `sku` in Product schema (15 min)
7. **LOW** — Add `AboutPage`, `FAQPage`, `ItemList`, and `WebPage` schemas to remaining pages (2 hr)
8. **SITEMAP** — Add `/faq` and `/sostenibilita` to `sitemap.ts` (10 min)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/seo/structured-data.tsx` | Fix `Math.random()` ID; update Organization schema; add `priceValidUntil` and `sku` fix; add `generateLocalBusinessSchema()`, `generateFAQSchema()`, `generateWebPageSchema()`, `generateAboutPageSchema()`, `generateContactPageSchema()`, `generateItemListSchema()` |
| `src/app/(shop)/products/[slug]/layout.tsx` | Add `StructuredData` calls for Product + Breadcrumb with real rating data; remove from `page.tsx` |
| `src/app/(shop)/products/[slug]/page.tsx` | Remove `StructuredData` imports and calls (moved to layout) |
| `src/app/(marketing)/contact/layout.tsx` | Add `LocalBusiness` + `ContactPage` schema |
| `src/app/(marketing)/about/layout.tsx` | Add `AboutPage` schema |
| `src/app/(marketing)/faq/page.tsx` | Add `FAQPage` schema (fetch FAQs server-side) |
| `src/app/(marketing)/sostenibilita/layout.tsx` | Add `WebPage` schema |
| `src/app/(marketing)/smaltimento-rifiuti/layout.tsx` | Add `WebPage` schema |
| `src/app/(shop)/products/layout.tsx` | Add `ItemList` schema |
| `src/app/sitemap.ts` | Add `/faq` and `/sostenibilita` to `staticPages` |
