# PAGINE PUBBLICHE — Olio Galia

> Elenco completo di tutte le pagine accessibili pubblicamente nel progetto Next.js.
> Le pagine admin (`/admin/*`) e le route API (`/api/*`) sono escluse in quanto non pubbliche.

---

## GRUPPO 1 — MARKETING (Route Group `(marketing)`)

### 1. Homepage
- **URL:** `/`
- **File:** `src/app/page.tsx`
- **Scopo:** Pagina principale del sito
- **Sezioni:**
  - `HeroSection` — Video fullscreen degli uliveti con titolo e CTA
  - `ProductsSection` — Griglia prodotti in evidenza (max 3) + banner uliveto + info + CTA
  - `AboutSection` — Anteprima storia aziendale con History e Values
  - `FAQSection` — Domande frequenti con filtro per categoria
- **Componenti globali:** Navbar + Footer + NewsletterPopup

---

### 2. Chi Siamo
- **URL:** `/about`
- **File:** `src/app/(marketing)/about/page.tsx`
- **Layout:** `src/app/(marketing)/about/layout.tsx`
- **Scopo:** Storia, valori e identità aziendale
- **Sezioni:**
  - Hero con titolo animato e intro
  - `TimelineSection` — Cronologia storica interattiva (dal 1940)
  - `ValuesSection` — Qualità, Famiglia, Tradizione (cards con icone)
  - CTA duale: "Scopri il Catalogo" + "Contattaci"

---

### 3. Contatti
- **URL:** `/contact`
- **File:** `src/app/(marketing)/contact/page.tsx`
- **Layout:** `src/app/(marketing)/contact/layout.tsx`
- **Scopo:** Pagina contatti con metodi di contatto
- **Sezioni:**
  - Hero con background decorazioni animate
  - `ContactMethods` — Metodi disponibili: Email + WhatsApp

---

### 4. Privacy Policy
- **URL:** `/privacy-policy`
- **File:** `src/app/(marketing)/privacy-policy/page.tsx`
- **Scopo:** Informativa sulla privacy (GDPR)
- **Layout:** Testo HTML con classe `custom-html-content`

---

### 5. Cookie Policy
- **URL:** `/cookie-policy`
- **File:** `src/app/(marketing)/cookie-policy/page.tsx`
- **Scopo:** Informativa sui cookie
- **Layout:** Testo HTML con classe `custom-html-content`

---

### 6. Termini di Servizio
- **URL:** `/termini-servizio`
- **File:** `src/app/(marketing)/termini-servizio/page.tsx`
- **Scopo:** Termini e condizioni d'uso del servizio
- **Layout:** Testo HTML con classe `custom-html-content`

---

### 7. Smaltimento Rifiuti
- **URL:** `/smaltimento-rifiuti`
- **File:** `src/app/(marketing)/smaltimento-rifiuti/page.tsx`
- **Layout:** `src/app/(marketing)/smaltimento-rifiuti/layout.tsx`
- **Scopo:** Informazioni legali sullo smaltimento rifiuti/imballaggi

---

## GRUPPO 2 — SHOP (Route Group `(shop)`)

### 8. Catalogo Prodotti
- **URL:** `/products`
- **File:** `src/app/(shop)/products/page.tsx`
- **Layout:** `src/app/(shop)/products/layout.tsx`
- **Scopo:** Listato completo dei prodotti con filtro per categoria
- **Sezioni:**
  - `ProductsHero` — Titolo e sottotitolo pagina
  - `CategoryFilter` — Pill filtro per categoria (incluso "Tutti")
  - `ProductsGrid` — Griglia di `ProductCard` (tutti i prodotti, filtrabili)

---

### 9. Dettaglio Prodotto
- **URL:** `/products/[slug]`
- **File:** `src/app/(shop)/products/[slug]/page.tsx`
- **Layout:** `src/app/(shop)/products/[slug]/layout.tsx`
- **Scopo:** Scheda prodotto singolo con acquisto
- **Sezioni:**
  - `BreadcrumbNavigation` — Percorso di navigazione
  - `ProductImageGallery` — Gallery immagini prodotto
  - `ProductInfoSection` — Nome, descrizione, varianti, quantità, prezzo, add-to-cart
  - `VariantSelector` — Selezione variante (es. 500ml / 1L / 5L)
  - `ProductDetailsCards` — Schede dettaglio (ingredienti, info nutrizionali ecc.)
  - Subscription CTA banner (se prodotto abbonabile)
  - `BulkProposalSection` — Proposta acquisto all'ingrosso
  - `RelatedProductsSection` — Prodotti correlati
  - `ProductReviewsSummaryCard` — Riepilogo recensioni

---

### 10. Abbonamento Prodotto
- **URL:** `/products/[slug]/subscribe`
- **File:** `src/app/(shop)/products/[slug]/subscribe/page.tsx`
- **Layout:** `src/app/(shop)/products/[slug]/subscribe/layout.tsx`
- **Scopo:** Pagina per attivare l'abbonamento ricorrente a un prodotto
- **Nota:** Visibile solo per prodotti con `isSubscribable: true`

---

### 11. Carrello
- **URL:** `/cart`
- **File:** `src/app/(shop)/cart/page.tsx`
- **Scopo:** Visualizzazione e gestione del carrello
- **Sezioni:**
  - `CartBreadcrumb` — Navigazione
  - Lista `CartItem` (prodotti nel carrello)
  - `CartEmptyState` — Stato vuoto con CTA verso prodotti
  - `FreeShippingIndicator` — Barra avanzamento spedizione gratuita
  - `CheckoutWizard` — Wizard multi-step per checkout
    - Selezione zona di consegna (`DeliveryZoneSelector`)
    - Riepilogo zona (`DeliveryZoneSummary`)
    - `CheckoutButton` + `CheckoutTorinoButton`
  - `FloatingActionButton` — Azione rapida mobile
  - `CheckoutErrorModal` — Gestione errori

---

### 12. Ordine Completato (Stripe)
- **URL:** `/checkout/success`
- **File:** `src/app/(shop)/checkout/success/page.tsx`
- **Scopo:** Pagina di conferma dopo pagamento riuscito via Stripe
- **Sezioni:** Messaggio di successo, riepilogo ordine, dettagli spedizione

---

### 13. Abbonamento Attivato
- **URL:** `/checkout/subscription-success`
- **File:** `src/app/(shop)/checkout/subscription-success/page.tsx`
- **Scopo:** Conferma dell'attivazione di un abbonamento ricorrente Stripe

---

### 14. Conferma Ordine (locale)
- **URL:** `/conferma-ordine`
- **File:** `src/app/(shop)/conferma-ordine/page.tsx`
- **Scopo:** Pagina di conferma ordine alternativa (flusso locale senza Stripe redirect)

---

### 15. Feedback Ordine
- **URL:** `/feedback/[orderId]`
- **File:** `src/app/(shop)/feedback/[orderId]/page.tsx`
- **Scopo:** Modulo per lasciare una recensione dopo aver ricevuto l'ordine
- **Nota:** URL inviato via email al cliente dopo la consegna

---

### 16. Gestione Abbonamento
- **URL:** `/manage-subscription`
- **File:** `src/app/(shop)/manage-subscription/page.tsx`
- **Scopo:** Accesso al portale Stripe per gestire il proprio abbonamento
- **Sezioni:**
  - Breadcrumb
  - Form inserimento email
  - Invio magic link via email per accedere al portale Stripe
  - Stato invio / errore

---

### 17. Accesso Portale Abbonamento (Magic Link)
- **URL:** `/manage-subscription/access`
- **File:** `src/app/(shop)/manage-subscription/access/page.tsx`
- **Scopo:** Landing page del magic link — verifica token e redirect al portale Stripe

---

## RIEPILOGO

| # | Pagina | URL | Gruppo | Priorità visiva |
|---|--------|-----|--------|----------------|
| 1 | Homepage | `/` | Marketing | ⭐⭐⭐⭐⭐ |
| 2 | Catalogo Prodotti | `/products` | Shop | ⭐⭐⭐⭐⭐ |
| 3 | Dettaglio Prodotto | `/products/[slug]` | Shop | ⭐⭐⭐⭐⭐ |
| 4 | Carrello | `/cart` | Shop | ⭐⭐⭐⭐ |
| 5 | Chi Siamo | `/about` | Marketing | ⭐⭐⭐⭐ |
| 6 | Contatti | `/contact` | Marketing | ⭐⭐⭐⭐ |
| 7 | Abbonamento Prodotto | `/products/[slug]/subscribe` | Shop | ⭐⭐⭐ |
| 8 | Gestione Abbonamento | `/manage-subscription` | Shop | ⭐⭐⭐ |
| 9 | Ordine Completato | `/checkout/success` | Shop | ⭐⭐⭐ |
| 10 | Abbonamento Attivato | `/checkout/subscription-success` | Shop | ⭐⭐⭐ |
| 11 | Conferma Ordine | `/conferma-ordine` | Shop | ⭐⭐⭐ |
| 12 | Feedback Ordine | `/feedback/[orderId]` | Shop | ⭐⭐ |
| 13 | Privacy Policy | `/privacy-policy` | Marketing | ⭐⭐ |
| 14 | Cookie Policy | `/cookie-policy` | Marketing | ⭐⭐ |
| 15 | Termini di Servizio | `/termini-servizio` | Marketing | ⭐⭐ |
| 16 | Smaltimento Rifiuti | `/smaltimento-rifiuti` | Marketing | ⭐ |
| 17 | Accesso Portale (Magic Link) | `/manage-subscription/access` | Shop | ⭐ |

**Totale: 17 pagine pubbliche**
- Marketing: 7 pagine
- Shop/E-commerce: 10 pagine
