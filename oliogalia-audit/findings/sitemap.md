# Sitemap Analysis Report — oliogalia.com — 2026-06-28

## Summary Scorecard

| Check | Result |
|---|---|
| Sitemap present | PASS |
| XML valid | PASS |
| Under 50,000 URL limit | PASS (11 URLs) |
| Referenced in robots.txt | PASS (wrong domain — fix needed) |
| Non-200 URLs in sitemap | FAIL — 6 URLs returning 500 (55% of sitemap) |
| Noindexed URLs in sitemap | FAIL — all 500 pages inject noindex |
| Redirected URLs in sitemap | WARNING — all non-www redirect to www |
| Canonical domain consistency | FAIL — canonical says non-www, server serves www |
| FAQ in sitemap | FAIL — missing |
| Sustainability page in sitemap | FAIL — /sostenibilita missing |
| Hreflang for bilingual site | FAIL — no hreflang; no EN URLs exist at URL level |
| Lastmod accuracy | FAIL — all identical build timestamps |
| Deprecated tags (changefreq, priority) | WARNING — present, ignored by Google |

---

## Critical Issues

### [CRITICAL] 6/11 Sitemap URLs Return HTTP 500

All 6 product pages in the sitemap return HTTP 500 Internal Server Error:
- /products/latta-olio-5l — 500
- /products/latta-olio-3l — 500
- /products/beauty-oil-zagara — 500
- /products/premium-oil-bottle — 500
- /products/beauty-oil-gelsomino — 500
- /products/premium-6-oil-bottle — 500

Next.js injects `<meta name="robots" content="noindex"/>` on every 500 error page. Google will de-index these URLs if it has visited them. Root cause: server-side data fetch failure (likely Stripe/DB/API call at render time).

**Fix (P0 — immediate):** Fix the Next.js data fetch error; remove product URLs from sitemap until resolved.

### [CRITICAL] www vs Non-www Canonical Conflict

- Server: issues 307 redirect from oliogalia.com → www.oliogalia.com
- Canonical tags: point to https://oliogalia.com/... (non-www)
- Sitemap: uses non-www URLs
- robots.txt Sitemap directive: non-www

Google treats these as separate properties. The conflicting signals cause unnecessary crawl overhead.

**Fix (P1):** Standardize on www.oliogalia.com. Update all canonical tags, sitemap URLs, and robots.txt Sitemap directive.

---

## High Issues

### [High] /faq Missing from Sitemap
The FAQ page (200, indexable) is linked in footer navigation but absent from sitemap.

### [High] /sostenibilita Missing from Sitemap
The sustainability page is linked in main navigation but absent. Instead, /smaltimento-rifiuti (packaging disposal guide) is in the sitemap.

### [High] No Hreflang — EN Content Not Indexed
The site is built with a client-side locale switcher (LocaleProvider React component). No /en/ URL prefix exists. No hreflang tags anywhere. From Google's perspective the site is 100% Italian. The "bilingual" implementation provides zero SEO benefit for EN-language traffic.

**Fix:** Implement Next.js App Router [locale] segment pattern (/en/products, /en/about, etc.). Add hreflang link tags. Submit EN sitemap set.

---

## Medium Issues

### [Medium] Identical lastmod Timestamps
All 11 URLs carry the same millisecond-precise build timestamp (2026-06-23T16:24:12.034Z). Google ignores inaccurate lastmod values.

**Fix:** Generate per-page lastmod from actual content revision date. Use YYYY-MM-DD format.

### [Medium] Deprecated Tags Present
changefreq and priority tags present on all URLs. Google and Bing ignore both.

**Fix:** Remove both tags from sitemap.

---

## Corrected Sitemap (deploy after P0/P1 fixes)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.oliogalia.com/</loc><lastmod>2026-06-23</lastmod></url>
  <url><loc>https://www.oliogalia.com/products</loc><lastmod>2026-06-23</lastmod></url>
  <!-- Product pages: add back once HTTP 500 errors are fixed
  <url><loc>https://www.oliogalia.com/products/latta-olio-5l</loc><lastmod>2026-06-23</lastmod></url>
  <url><loc>https://www.oliogalia.com/products/latta-olio-3l</loc><lastmod>2026-06-23</lastmod></url>
  <url><loc>https://www.oliogalia.com/products/premium-oil-bottle</loc><lastmod>2026-06-23</lastmod></url>
  <url><loc>https://www.oliogalia.com/products/premium-6-oil-bottle</loc><lastmod>2026-06-23</lastmod></url>
  <url><loc>https://www.oliogalia.com/products/beauty-oil-zagara</loc><lastmod>2026-06-23</lastmod></url>
  <url><loc>https://www.oliogalia.com/products/beauty-oil-gelsomino</loc><lastmod>2026-06-23</lastmod></url>
  -->
  <url><loc>https://www.oliogalia.com/about</loc><lastmod>2026-06-01</lastmod></url>
  <url><loc>https://www.oliogalia.com/sostenibilita</loc><lastmod>2026-06-01</lastmod></url>
  <url><loc>https://www.oliogalia.com/faq</loc><lastmod>2026-06-01</lastmod></url>
  <url><loc>https://www.oliogalia.com/contact</loc><lastmod>2026-06-01</lastmod></url>
  <url><loc>https://www.oliogalia.com/smaltimento-rifiuti</loc><lastmod>2026-06-01</lastmod></url>
</urlset>
```

Also update robots.txt Sitemap directive to: `Sitemap: https://www.oliogalia.com/sitemap.xml`
