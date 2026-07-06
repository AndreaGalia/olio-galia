# SXO Analysis Report — oliogalia.com — 2026-06-28

## Lead Finding: SITE NOT INDEXED BY GOOGLE
`site:oliogalia.com` returns zero results. Google has not indexed a single page. All 6 product pages return HTTP 500, signaling to Googlebot that the domain is unreliable and suppressing indexation entirely.

## SXO Gap Score: 22 / 100

| Dimension | Score | Max |
|---|---|---|
| Page Type alignment | 5 | 15 |
| Content Depth | 3 | 15 |
| UX Signals | 4 | 15 |
| Schema | 0 | 15 |
| Media | 5 | 15 |
| Authority | 2 | 15 |
| Freshness | 3 | 10 |

---

## Page-Type Validation vs SERP Consensus

| Page | Intent | Match | Notes |
|---|---|---|---|
| / (homepage) | Navigational | Aligned | Correct format; zero commercial signals above fold |
| /products | Transactional | CRITICAL mismatch | Correct page type; no product names, prices, or listings |
| /products/* | Transactional | CRITICAL | All 6 return HTTP 500 |
| /about | Informational | MEDIUM | Correct type; ~350 words vs competitor 800+ |
| /sostenibilita | Informational | HIGH gap | ~300 words; no certifications, no data |
| /faq | Informational | CRITICAL | Zero Q&A content exists on page |
| /smaltimento-rifiuti | None | Mismatch | Municipal waste query — no olive oil buyer searches this |

---

## Intent Mapping: Extra Virgin Olive Oil

| Intent | Current Coverage | Gap |
|---|---|---|
| Informational (EVO benefits, production) | ZERO pages | CRITICAL — no blog section exists |
| Commercial investigation (best Sicilian EVO) | ZERO pages | HIGH — no certifications, no comparisons |
| Transactional (buy online) | Broken — product pages 500 | CRITICAL |
| Navigational ("Olio Galia") | Not indexed | CRITICAL |
| Local ("olio Ferla", "frantoio Iblei") | No GBP, no LocalBusiness schema | HIGH |

---

## Persona Scores

### Persona A: Italian Premium Consumer
Score: 32/100
- Relevance: 14/25 (brand story present; no certifications, no polyphenol data, no harvest year)
- Trust: 6/25 (no reviews, no certifications, no press)
- Action: 2/25 (cannot purchase; pages broken)

### Persona B: International Gift Buyer (EN)
Score: 10/100
- Site not findable via EN queries; /en/* returns 404; no EN product content
- Cannot reach, cannot buy

### Persona C: Health-Conscious / Wellness Consumer
Score: 16/100
- Wellness line (zagara, gelsomino) is brand's most differentiated offer
- Both wellness product pages return HTTP 500
- No ingredients, no INCI, no benefit claims anywhere

---

## Competitive Threat

| Competitor | Location | Status |
|---|---|---|
| Frantoio Galioto | Ferla (SR) — SAME TOWN | Fully indexed, DOP Monti Iblei, 4 generations |
| Frantoi Cutrera | Sicily | Fully indexed, IGP/DOP, EN/IT, awards |
| Frantoio Scalia | Sicily | Fully indexed, Est. 1950 |
| Olio Diliberto | Sicily | Fully indexed, monocultivar |

**Critical risk:** A search for "olio Ferla" or "olio Iblei" surfaces Frantoio Galioto — same town, similar positioning, fully operational. Even branded search "Olio Galia" may return Galioto due to name similarity.

---

## SERP Feature Opportunities (blocked by indexation gap)

- **Featured snippets:** "come si conserva olio extravergine", "differenza olio extravergine e olio oliva"
- **Shopping carousel:** Requires Product schema + 200 OK product pages + Merchant Center
- **Local pack:** Requires Google Business Profile (not set up)
- **PAA boxes:** FAQ page has zero content to feed these

---

## Missing Pages for High-Value Queries

| Page | Intent | Priority |
|---|---|---|
| Blog: Benefici olio extravergine siciliano | Informational | HIGH |
| Blog: Come si produce l'olio Galia | Informational | HIGH |
| Blog: DOP Monti Iblei guida | Informational/commercial | HIGH |
| EN: Buy Sicilian Olive Oil Online | Transactional EN | HIGH |
| EN: Sicilian Olive Oil Gift Set | Gift/transactional EN | MEDIUM |
| Blog: Olio EVO per cura della pelle | Informational wellness | MEDIUM |
| Blog: Raccolta olive 2025 | Freshness/brand | MEDIUM |

---

## Priority Recommendations

**CRITICAL (week 1):**
1. Fix HTTP 500 on all product pages
2. Submit sitemap via Google Search Console after fix
3. Add meta descriptions to every page
4. Add content to FAQ page (min 8 Q&A pairs + FAQPage JSON-LD)

**HIGH (month 1):**
5. Implement Product schema on all product pages
6. Implement hreflang for IT/EN with proper /en/ URL paths
7. Add Organization + LocalBusiness schema to homepage
8. Create Google Business Profile (Ferla SR)
9. Display prices and certifications prominently on product pages

**MEDIUM (months 2-3):**
10. Create minimum 3 editorial blog posts for informational intent
11. Build EN gift landing page
12. Remove/redirect /smaltimento-rifiuti (no SEO value)
13. Expand sustainability page to 800+ words with certification data
14. Add BreadcrumbList schema + visible breadcrumb navigation
