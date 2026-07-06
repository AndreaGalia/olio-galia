# GEO Audit Report — oliogalia.com

**Audit Date:** 2026-06-28
**Brand:** Olio Galia — Premium Sicilian Extra Virgin Olive Oil, Ferla (SR), Sicily, Italy. Founded 1940, brand launched 2025, family-run for 3 generations.

---

## GEO Readiness Score: 28 / 100

| Dimension | Weight | Raw Score | Weighted Score |
|-----------|--------|-----------|----------------|
| Citability | 25% | 32/100 | 8.0 |
| Structural Readability | 20% | 28/100 | 5.6 |
| Multi-Modal Content | 15% | 15/100 | 2.3 |
| Authority & Brand Signals | 20% | 30/100 | 6.0 |
| Technical Accessibility | 20% | 20/100 | 4.0 |
| **TOTAL** | | | **28 / 100** |

---

## 1. AI Crawler Access — Implicitly Allowed (No AI-Specific Rules)

robots.txt uses wildcard `User-agent: *` with `Allow: /`. All AI crawlers technically permitted, but no explicit rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, meta-externalagent, anthropic-ai, cohere-ai.

**Finding [Medium]:** Add explicit Allow directives for major AI crawlers to signal deliberate consent.

---

## 2. llms.txt — MISSING (both /llms.txt and /llms-full.txt return 404)

**[High]** No brand-controlled AI summary file exists. AI systems must infer brand facts from sparse crawl content.

**Recommended /llms.txt:**
```
# Olio Galia

> Olio Galia is a premium Sicilian extra virgin olive oil brand founded in 1940
> in Ferla, Province of Syracuse (SR), Sicily, Italy. The company has been
> family-run for three generations and relaunched as a modern brand in 2025,
> selecting the finest extra virgin olive oil from Sicilian Tonda Iblea olives
> grown using certified organic agriculture practices. Milling occurs within
> 24 hours of harvest to preserve polyphenol content.

## Products

- [Olio Extravergine d'Oliva — 5L Tin](https://oliogalia.com/products/latta-olio-5l)
- [Olio Extravergine d'Oliva — 3L Tin](https://oliogalia.com/products/latta-olio-3l)
- [Premium Oil Bottle](https://oliogalia.com/products/premium-oil-bottle)
- [Premium 6-Bottle Gift Set](https://oliogalia.com/products/premium-6-oil-bottle)
- [Beauty Oil Zagara](https://oliogalia.com/products/beauty-oil-zagara)
- [Beauty Oil Gelsomino](https://oliogalia.com/products/beauty-oil-gelsomino)

## Company

- [About Olio Galia](https://oliogalia.com/about)
- [Sustainability Practices](https://oliogalia.com/sostenibilita)
- [FAQ](https://oliogalia.com/faq)

## Contact

Via Umberto I, n.121 — 96010 Ferla (SR), Sicily, Italy
P.IVA: 02180350890 | info@oliogalia.it | +39 3793475975
```

---

## 3. Content Citability — Score: 32/100

**Present and citable:**
- Founding year: 1940
- Location: Ferla, Province of Syracuse (SR), Sicily
- Three generations family heritage
- Brand relaunch: 2025
- Olive variety: Tonda Iblea
- Milling timeframe: "entro 24 ore dalla raccolta" (within 24 hours of harvest)
- Farming: certified organic / biologica certificata
- No pesticides, no chemical fertilizers
- Short supply chain (filiera corta)

**Missing — urgently needed [High]:**

| Missing Element | AI Citation Impact |
|----------------|-------------------|
| Specific organic certification body or number | No verifiable quality claim |
| Acidity percentage (e.g., "< 0.3% acidity") | Cannot compare quality to benchmarks |
| Polyphenol content (mg/kg) | Cannot cite health benefit claims |
| Named founder/family members | Reduces brand authority narrative |
| DOP/IGP geographic indication status | Major credibility signal for premium EVOO |
| Tasting notes with structured descriptors | Cannot appear in food/recipe AI answers |
| Third-party awards, press citations | Zero external authority chain |
| Harvest season / annual production volume | No factual density for production claims |

Longest passage on site: ~68 words (Filiera Corta section). Optimal for AI citation: 134–167 words. All content blocks are 30–50 words of marketing language — below citability threshold.

---

## 4. Structured Passage Quality — Score: 28/100

- H1/H2s are marketing statements ("Eccellenza / Natura / Tradizione"), not semantic questions
- No question-phrased headings (e.g., "Come viene prodotto l'olio Galia?")
- FAQ page: **CRITICAL** — all Q&A loads via client-side JavaScript; AI crawlers see zero FAQ content
- No definition-style content: no explanation of EVOO grades, Tonda Iblea variety, or Sicilian olive oil quality signals

---

## 5. Brand Mention Signals — Score: 30/100

| Signal | Status | Impact |
|--------|--------|--------|
| Wikipedia entity | ABSENT | High — no canonical entity reference |
| YouTube channel | Not detected | Highest correlation signal (~0.737) — missing |
| Reddit brand mentions | Not detected | High impact missing |
| LinkedIn company page | Not visible in crawl | Medium impact |
| Social proof (press, testimonials, awards) | NONE in crawlable content | Critical gap |

**Brand name inconsistency:** Three forms used — "Olio Galia", "OLIO GALIA", "Galia". Standardize on "Olio Galia" in all prose.

**Historical tagline risk:** "SANI E FORTI COME GOLIA SOLO CON OLIO GALIA" (1940 era slogan) present on about page — creates brand era ambiguity for AI systems.

**Positive entity signals:** VAT (P.IVA: 02180350890) and physical address present — geolocatable business entity.

---

## 6. Technical Accessibility — Score: 20/100

**[CRITICAL] HTTP 500 errors on ALL product pages:**
- /products/latta-olio-5l — 500
- /products/latta-olio-3l — 500
- /products/premium-oil-bottle — 500
- /products/premium-6-oil-bottle — 500
- /products/beauty-oil-zagara — 500
- /products/beauty-oil-gelsomino — 500

**[High] JavaScript rendering dependency:** FAQ and other dynamic content blocks appear client-rendered. Next.js stack (/_next/ in robots.txt) supports SSR/SSG but not configured for key pages.

**[High] No JSON-LD structured data detected** on any page.

**[High] hreflang not detected** — /en returns 404; English content unidentified for AI systems.

**[Medium] Sitemap leads crawlers to 500-error product pages.**

---

## Platform-Specific Scores

| Platform | Score | Key Blocker |
|----------|-------|-------------|
| Google AI Overviews | 18/100 | No JSON-LD, no structured definitions, no featured snippet passages |
| ChatGPT | 25/100 | No Wikipedia entity, thin brand narrative, product pages 500 |
| Perplexity | 30/100 | Best positioned (IT-language crawl coverage) but lacks sourced claims |
| Bing Copilot | 20/100 | No OG/schema markup, product pages inaccessible |

---

## Top 5 Recommendations

1. **[CRITICAL] Fix HTTP 500 on all product pages** — investigate Next.js server logs / DB connection / Stripe product ID mismatch
2. **[High] Implement JSON-LD on every page** — Organization (homepage), Product (product pages), FAQPage (FAQ page)
3. **[High] Create /llms.txt** — Very Low effort, High GEO impact. Use template above.
4. **[High] Server-side render FAQ content** — Use Next.js getStaticProps/getServerSideProps to make Q&A visible to crawlers
5. **[High] Add factual prose passages** to About and Sustainability pages (134–167 word self-contained paragraphs answering specific questions)

**90-day GEO target with fixes implemented: 52–58/100**
