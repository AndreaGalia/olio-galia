# Analisi Completa del Codice - Olio Galia E-commerce

## 📋 Panoramica del Progetto

**Nome**: Olio Galia
**Versione**: 0.1.0
**Framework**: Next.js 15.4.5 con React 19.1.0
**Linguaggio**: TypeScript
**Database**: MongoDB
**Pagamenti**: Stripe
**Autenticazione**: JWT con bcryptjs
**Styling**: Tailwind CSS 4

## 🏗️ Architettura del Progetto

### Struttura delle Directory
```
src/
├── app/                    # App Router (Next.js 15)
│   ├── (marketing)/        # Gruppo di route marketing
│   ├── (shop)/            # Gruppo di route e-commerce
│   ├── admin/             # Pannello amministrativo
│   └── api/               # API Routes
├── components/            # Componenti React riutilizzabili
├── hooks/                # Custom React Hooks
├── lib/                  # Librerie e utilities
└── types/                # Definizioni TypeScript
```

## 🎨 Design System

### Palette Colori
- **Olive**: `#556B2F` - Verde oliva principale
- **Salvia**: `#789262` - Verde salvia per accenti
- **Sabbia**: `#D6C7A1` - Neutro sabbia
- **Beige**: `#ECE8DF` - Beige per sfondi
- **Nocciola**: `#B2A98C` - Nocciola per testi secondari

### Tipografia
- **Titoli**: Sweet Sans (custom font)
- **Corpo**: Roboto (Google Font)
- **Serif**: Cormorant Garamond (per elementi decorativi)

## 🌐 Pagine Pubbliche

### Marketing Pages
| Route | File | Descrizione |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Homepage principale |
| `/about` | `src/app/(marketing)/about/page.tsx` | Pagina chi siamo |
| `/contact` | `src/app/(marketing)/contact/page.tsx` | Contatti e form |
| `/smaltimento-rifiuti` | `src/app/(marketing)/smaltimento-rifiuti/page.tsx` | Guida riciclaggio packaging con tabella materiali (IT/EN) |

### E-commerce Pages
| Route | File | Descrizione |
|-------|------|-------------|
| `/products` | `src/app/(shop)/products/page.tsx` | Catalogo prodotti |
| `/products/[slug]` | `src/app/(shop)/products/[slug]/page.tsx` | Dettaglio prodotto |
| `/cart` | `src/app/(shop)/cart/page.tsx` | Carrello acquisti |
| `/checkout/success` | `src/app/(shop)/checkout/success/page.tsx` | Conferma ordine |
| `/conferma-ordine` | `src/app/(shop)/conferma-ordine/page.tsx` | Conferma ordine alternativa |
| `/feedback/[orderId]` | `src/app/(shop)/feedback/[orderId]/page.tsx` | Form feedback con token JWT |

## 🔧 Pannello Amministrativo

### Autenticazione
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/login` | `src/app/admin/login/page.tsx` | Login amministratore |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | Dashboard principale |

### Gestione Prodotti
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/products` | `src/app/admin/products/page.tsx` | Lista prodotti con gestione stock |
| `/admin/products/create` | `src/app/admin/products/create/page.tsx` | Creazione nuovo prodotto |
| `/admin/products/[id]/edit` | `src/app/admin/products/[id]/edit/page.tsx` | Modifica prodotto esistente |

### Gestione Categorie
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/categories` | `src/app/admin/categories/page.tsx` | Lista categorie |
| `/admin/categories/create` | `src/app/admin/categories/create/page.tsx` | Creazione categoria |
| `/admin/categories/[id]/edit` | `src/app/admin/categories/[id]/edit/page.tsx` | Modifica categoria |

### Gestione Ordini
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/orders` | `src/app/admin/orders/page.tsx` | Lista ordini con colonna e filtro recensioni |
| `/admin/orders/[id]` | `src/app/admin/orders/[id]/page.tsx` | Dettaglio ordine con sezione recensioni cliente |

### Gestione Preventivi
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/preventivi` | `src/app/admin/preventivi/page.tsx` | Lista preventivi con colonna e filtro recensioni |
| `/admin/preventivi/create` | `src/app/admin/preventivi/create/page.tsx` | Creazione preventivo |

### Form Management
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/forms/[id]` | `src/app/admin/forms/[id]/page.tsx` | Gestione form contatti |

### Gestione Clienti
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/customers` | `src/app/admin/customers/page.tsx` | Lista clienti con ordini |
| `/admin/customers/create` | `src/app/admin/customers/create/page.tsx` | Creazione manuale cliente |
| `/admin/customers/[id]` | `src/app/admin/customers/[id]/page.tsx` | Dettaglio cliente e storico ordini |

### Gestione Venditori
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/sellers` | `src/app/admin/sellers/page.tsx` | Lista venditori con statistiche e ricerca |
| `/admin/sellers/create` | `src/app/admin/sellers/create/page.tsx` | Creazione venditore |
| `/admin/sellers/[id]` | `src/app/admin/sellers/[id]/page.tsx` | Dettaglio venditori: stats, preventivi, pagamenti |
| `/admin/sellers/[id]/edit` | `src/app/admin/sellers/[id]/edit/page.tsx` | Modifica venditore |

### Gestione Feedback
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/feedbacks` | `src/app/admin/feedbacks/page.tsx` | Lista e statistiche feedback clienti |

### Gestione Scenari Fatturato
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/scenarios` | `src/app/admin/scenarios/page.tsx` | Lista scenari con metriche (profitto, margine, ROI) |
| `/admin/scenarios/new` | `src/app/admin/scenarios/new/page.tsx` | Wizard 6 step per nuovo scenario |
| `/admin/scenarios/[id]/edit` | `src/app/admin/scenarios/[id]/edit/page.tsx` | Modifica scenario esistente |

### Impostazioni
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Configurazioni sistema |

## 🔌 API Routes

### API Pubbliche

#### Prodotti
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/products` | `src/app/api/products/route.ts` | GET | Lista prodotti pubblici |
| `/api/products/[slug]` | `src/app/api/products/[slug]/route.ts` | GET | Dettaglio prodotto |
| `/api/products/search` | `src/app/api/products/search/route.ts` | GET | Ricerca prodotti |

#### Categorie
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/categories` | `src/app/api/categories/route.ts` | GET | Lista categorie pubbliche |
| `/api/categories/[id]` | `src/app/api/categories/[id]/route.ts` | GET, PUT, DELETE | Operazioni categoria singola |

#### E-commerce
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/create-checkout-session` | `src/app/api/create-checkout-session/route.ts` | POST | Crea sessione Stripe Checkout |
| `/api/save-order` | `src/app/api/save-order/route.ts` | POST | Salva ordine completato |
| `/api/save-order-pending` | `src/app/api/save-order-pending/route.ts` | POST | Salva ordine pendente |
| `/api/order-details` | `src/app/api/order-details/route.ts` | GET | Dettagli ordine |
| `/api/update-stock` | `src/app/api/update-stock/route.ts` | POST | Aggiorna stock prodotti |

#### Feedback Clienti
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/feedback/verify` | `src/app/api/feedback/verify/route.ts` | POST | Verifica token JWT e info ordine |
| `/api/feedback/[orderId]` | `src/app/api/feedback/[orderId]/route.ts` | GET | Verifica esistenza feedback |
| `/api/feedback/batch` | `src/app/api/feedback/batch/route.ts` | POST | Salva feedback multipli |

#### Utility
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/settings` | `src/app/api/settings/route.ts` | GET | Configurazioni pubbliche |
| `/api/shop-config` | `src/app/api/shop-config/route.ts` | GET | Configurazione shop |
| `/api/send-order-email` | `src/app/api/send-order-email/route.ts` | POST | Invio email ordine |
| `/api/download-invoice` | `src/app/api/download-invoice/route.ts` | GET | Download fattura |
| `/api/download-receipt` | `src/app/api/download-receipt/route.ts` | GET | Download ricevuta |

### API Amministrative (Protette)

#### Autenticazione Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/login` | `src/app/api/admin/login/route.ts` | POST | Login amministratore |
| `/api/admin/logout` | `src/app/api/admin/logout/route.ts` | POST | Logout amministratore |
| `/api/admin/me` | `src/app/api/admin/me/route.ts` | GET | Dati utente corrente |

#### Gestione Prodotti Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/products` | `src/app/api/admin/products/route.ts` | GET, POST | Lista/creazione prodotti |
| `/api/admin/products/[id]` | `src/app/api/admin/products/[id]/route.ts` | GET, PUT, DELETE | CRUD prodotto singolo |
| `/api/admin/products/update-stock` | `src/app/api/admin/products/update-stock/route.ts` | POST | Aggiorna stock via Stripe |
| `/api/admin/products/toggle-active` | `src/app/api/admin/products/toggle-active/route.ts` | POST | Attiva/disattiva prodotto |

#### Gestione Categorie Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/categories` | `src/app/api/admin/categories/route.ts` | GET, POST | Lista/creazione categorie |

#### Gestione Ordini Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/orders` | `src/app/api/admin/orders/route.ts` | GET | Lista ordini admin (param: feedbackFilter) |
| `/api/admin/orders/[id]` | `src/app/api/admin/orders/[id]/route.ts` | GET, PUT | Dettaglio/modifica ordine |
| `/api/admin/orders/[id]/feedbacks` | `src/app/api/admin/orders/[id]/feedbacks/route.ts` | GET | Recensioni ordine specifico |
| `/api/admin/orders/[id]/request-review` | `src/app/api/admin/orders/[id]/request-review/route.ts` | POST | Richiesta recensione manuale (24h limit) |

#### Preventivi Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/preventivi` | `src/app/api/admin/preventivi/route.ts` | GET | Lista preventivi (param: feedbackFilter) |
| `/api/admin/preventivi/create` | `src/app/api/admin/preventivi/create/route.ts` | POST | Crea preventivo |

#### Form Management Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/forms` | `src/app/api/admin/forms/route.ts` | GET | Lista form contatti |
| `/api/admin/forms/[id]` | `src/app/api/admin/forms/[id]/route.ts` | GET, PUT, DELETE | Gestione form singolo |
| `/api/admin/forms/[id]/send-quote` | `src/app/api/admin/forms/[id]/send-quote/route.ts` | POST | Invio preventivo |
| `/api/admin/forms/[id]/send-delivery-confirmation` | `src/app/api/admin/forms/[id]/send-delivery-confirmation/route.ts` | POST | Conferma consegna |
| `/api/admin/forms/[id]/request-review` | `src/app/api/admin/forms/[id]/request-review/route.ts` | POST | Richiesta recensione manuale (24h limit) |

#### Gestione Clienti Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/customers` | `src/app/api/admin/customers/route.ts` | GET, POST | Lista/creazione clienti |
| `/api/admin/customers/[id]` | `src/app/api/admin/customers/[id]/route.ts` | GET, PUT, DELETE | CRUD cliente singolo |

#### Gestione Venditori Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/sellers` | `src/app/api/admin/sellers/route.ts` | GET, POST | Lista con stats/creazione venditori |
| `/api/admin/sellers/[id]` | `src/app/api/admin/sellers/[id]/route.ts` | GET, PUT, DELETE | CRUD venditore con statistiche real-time |
| `/api/admin/sellers/[id]/payments` | `src/app/api/admin/sellers/[id]/payments/route.ts` | POST | Aggiunta pagamento |
| `/api/admin/sellers/[id]/payments/[paymentId]` | `src/app/api/admin/sellers/[id]/payments/[paymentId]/route.ts` | DELETE | Rimozione pagamento |
| `/api/admin/sellers/dropdown` | `src/app/api/admin/sellers/dropdown/route.ts` | GET | Lista semplificata per dropdown |

#### Feedback Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/feedbacks` | `src/app/api/admin/feedbacks/route.ts` | GET | Lista feedback con filtri |
| `/api/admin/feedbacks/stats` | `src/app/api/admin/feedbacks/stats/route.ts` | GET | Statistiche aggregate feedback |
| `/api/admin/feedbacks/products` | `src/app/api/admin/feedbacks/products/route.ts` | GET | Prodotti unici con feedback |

#### Sistema Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/stats` | `src/app/api/admin/stats/route.ts` | GET | Statistiche dashboard |
| `/api/admin/settings` | `src/app/api/admin/settings/route.ts` | GET, PUT | Configurazioni sistema |

#### Obiettivi di Fatturato
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/goals` | `src/app/api/admin/goals/route.ts` | GET, POST | Lista obiettivi / Crea nuovo obiettivo |
| `/api/admin/goals/[id]` | `src/app/api/admin/goals/[id]/route.ts` | PUT, DELETE | Aggiorna/Elimina obiettivo |
| `/api/admin/goals/active` | `src/app/api/admin/goals/active/route.ts` | GET | Obiettivo attivo con progresso |

#### Scenari di Fatturato
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/scenarios` | `src/app/api/admin/scenarios/route.ts` | GET, POST | Lista/creazione scenari previsione fatturato |
| `/api/admin/scenarios/[id]` | `src/app/api/admin/scenarios/[id]/route.ts` | GET, PUT, DELETE | CRUD scenario con calcoli real-time |

## 🗄️ Modelli Dati

### ProductDocument (MongoDB)
```typescript
interface ProductDocument {
  id: string;                    // ID Stripe come chiave primaria
  category: string;              // ID categoria
  price: string;                 // Prezzo attuale
  originalPrice?: string;        // Prezzo originale (sconto)
  stripeProductId: string;       // ID prodotto Stripe
  stripePriceId: string;         // ID prezzo Stripe
  size: string;                  // Dimensione prodotto
  inStock: boolean;              // Disponibilità
  stockQuantity: number;         // Quantità stock
  color: string;                 // Colore prodotto
  images: string[];              // Array URL immagini
  nutritionalInfo?: Record<string, string>; // Info nutrizionali
  slug: {
    it: string;                  // Slug italiano
    en: string;                  // Slug inglese
  };
  translations: {
    it: ProductTranslations;     // Traduzioni italiane
    en: ProductTranslations;     // Traduzioni inglesi
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  };
}
```

### CategoryDocument (MongoDB)
```typescript
interface CategoryDocument {
  id: string;                    // ID categoria
  translations: {
    it: CategoryTranslations;    // Nome/descrizione IT
    en: CategoryTranslations;    // Nome/descrizione EN
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  };
}
```

### CustomerDocument (MongoDB)
```typescript
interface CustomerDocument {
  _id?: ObjectId;                // ID MongoDB
  email: string;                 // Email cliente (unique, lowercase)
  firstName: string;             // Nome
  lastName: string;              // Cognome
  phone?: string;                // Telefono opzionale
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    province?: string;
  };
  orders: string[];              // Array di orderIds (ordini + preventivi)
  totalOrders: number;           // Numero totale ordini
  totalSpent: number;            // Totale speso in centesimi
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    source: 'manual' | 'order' | 'quote'; // Fonte creazione
  };
}
```

### ScenarioDocument (MongoDB)
```typescript
interface ScenarioDocument {
  _id?: ObjectId;                     // ID MongoDB
  name: string;                       // Nome scenario
  description?: string;               // Descrizione opzionale
  variousCosts: CostItem[];          // Costi vari (hosting, dominio, ads, packaging)
  productCosts: ProductCost[];       // Costi prodotti (nome, quantità, costo unitario)
  salesEstimates: SalesEstimate[];   // Stime vendita per prodotto
  productPricing: ProductPricing[];  // Prezzi vendita per prodotto
  calculations: {                     // Calcoli automatici real-time
    totalVariousCosts: number;        // Totale costi vari (centesimi)
    totalProductCosts: number;        // Totale costi prodotti (centesimi)
    totalCosts: number;               // Somma tutti i costi (centesimi)
    expectedRevenue: number;          // Fatturato previsto (centesimi)
    expectedProfit: number;           // Profitto atteso (centesimi)
    profitMargin: number;             // Margine % (0-100)
    roi: number;                      // ROI % (ritorno investimento)
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;                // Per archiviare scenari
  };
}
```

### SellerDocument (MongoDB)
```typescript
interface SellerDocument {
  _id?: ObjectId;                     // ID MongoDB
  name: string;                       // Nome venditore
  phone: string;                      // Telefono
  email: string;                      // Email (unique, lowercase)
  commissionPercentage: number;       // % commissione fissa (0-100)
  quotes: string[];                   // Array _id preventivi confermati
  payments: Payment[];                // Storico pagamenti
  metadata: {
    isActive: boolean;                // Soft delete
    createdAt: Date;
    updatedAt: Date;
  };
}

interface Payment {
  _id?: ObjectId;
  amount: number;                     // Importo in centesimi
  date: Date;                         // Data pagamento
  notes?: string;                     // Note opzionali
  createdAt: Date;
}
```

## 🔄 Integrazione Stripe-MongoDB

### Sincronizzazione Dati
1. **Creazione Prodotto**:
   - Crea prodotto su Stripe
   - Crea prezzo su Stripe
   - Salva su MongoDB con ID Stripe come chiave primaria
   - Gestione stock tramite Stripe metadata

2. **Gestione Stock**:
   - Stock salvato in `metadata.available_quantity` su Stripe
   - Sincronizzazione real-time tra Stripe e MongoDB
   - UI per modifica stock inline

3. **Gestione Prezzi**:
   - Prezzi gestiti tramite Stripe Prices API
   - Supporto per prezzi scontati (originalPrice)
   - Aggiornamento prezzi con gestione default price

## 🔐 Sistema di Autenticazione

### Amministratori
- **Autenticazione**: JWT tokens con bcryptjs
- **Protezione Routes**: Middleware per route admin
- **Session Management**: Cookie httpOnly per sicurezza

### Flow di Autenticazione
1. Login via `/api/admin/login`
2. Verifica credenziali MongoDB
3. Generazione JWT token
4. Cookie httpOnly per persistenza sessione
5. Middleware protezione route admin

## 📱 Features Principali

### E-commerce Frontend
- ✅ Catalogo prodotti responsive
- ✅ Dettaglio prodotto con galleria immagini
- ✅ Sistema carrello localStorage
- ✅ Checkout Stripe integrato
- ✅ Gestione ordini completa
- ✅ Multilingual (IT/EN)

### Pannello Amministrativo
- ✅ Dashboard con statistiche
- ✅ Gestione prodotti CRUD completa
- ✅ Gestione categorie dinamiche
- ✅ Gestione stock in tempo reale
- ✅ Gestione ordini e preventivi
- ✅ Sistema form contatti
- ✅ Gestione clienti completa
- ✅ Gestione venditori con commissioni e pagamenti
- ✅ Sistema feedback clienti con statistiche
- ✅ Richiesta recensione manuale con protezione 24h
- ✅ Scenari fatturato con wizard 6 step e calcoli real-time
- ✅ Configurazioni sistema

### Integrazione Stripe
- ✅ Pagamenti sicuri
- ✅ Gestione prodotti/prezzi
- ✅ Webhook gestione ordini
- ✅ Fatturazione automatica
- ✅ Gestione stock metadata

### Tecnologie Avanzate
- ✅ Next.js 15 App Router
- ✅ React 19 con Server Components
- ✅ TypeScript strict mode
- ✅ Tailwind CSS 4
- ✅ MongoDB nativo driver
- ✅ Responsive design completo

## 🚀 Performance e Ottimizzazioni

### Next.js Optimizations
- **Static Generation**: Pagine marketing pre-renderizzate
- **Dynamic Routes**: Prodotti con ISR (Incremental Static Regeneration)
- **Image Optimization**: Next.js Image component
- **Bundle Optimization**: Tree shaking automatico

### Database Optimizations
- **Indexes**: Indici su campi di ricerca frequente
- **Aggregation**: Pipeline MongoDB per statistiche
- **Connection Pooling**: Riutilizzo connessioni DB

## 👥 Sistema Gestione Venditori

### Panoramica
Sistema completo per gestire venditori con tracking commissioni, preventivi associati e pagamenti.

### Features
- ✅ **CRUD Completo**: Creazione, modifica, eliminazione soft (archive) venditori
- ✅ **Commissioni Fisse**: % commissione per venditore su preventivi confermati
- ✅ **Tracking Preventivi**: Associazione automatica preventivi a venditori
- ✅ **Gestione Pagamenti**: Storico pagamenti con data, importo, note
- ✅ **Statistiche Real-time**: Fatturato, commissioni, pagato, da pagare
- ✅ **Ricerca e Ordinamento**: Lista venditori con filtri per fatturato
- ✅ **Componenti Riutilizzabili**: SellerStatsCard, QuotesTable, PaymentsList, PaymentModal
- ✅ **Integrazione Preventivi**: Dropdown venditori in form creazione preventivo

### Service Layer
- **File**: `src/services/sellerService.ts`
- **Metodi**: getAllSellers, getSellerById, createSeller, updateSeller, deleteSeller (soft), addPayment, removePayment, addQuoteToSeller, getSellersForDropdown
- **Calcoli**: Statistiche real-time (totalSales, totalCommission, totalPaid, totalUnpaid) solo su preventivi confermati

### Componenti
| Component | Descrizione | File |
|-----------|-------------|------|
| `SellerStatsCard` | Card statistica con colori personalizzabili | `src/components/admin/sellers/SellerStatsCard.tsx` |
| `QuotesTable` | Tabella preventivi con badge status e link dettaglio | `src/components/admin/sellers/QuotesTable.tsx` |
| `PaymentsList` | Lista pagamenti con delete e formatting | `src/components/admin/sellers/PaymentsList.tsx` |
| `PaymentModal` | Modal aggiunta pagamento con validazione | `src/components/admin/sellers/PaymentModal.tsx` |

### Business Rules
- Solo preventivi con status 'confermato' contano per fatturato e commissioni
- Commissione calcolata su finalPricing.finalTotal (o finalTotal fallback)
- Soft delete: venditori con preventivi associati non eliminabili fisicamente
- Email univoca (lowercase), telefono e nome obbligatori

## 📝 Sistema Feedback Clienti

### Panoramica
Sistema completo per la raccolta e gestione dei feedback dei clienti sui prodotti acquistati, integrato con ordini e preventivi.

### Architettura Feedback

#### Token JWT Sicuri
- **Validità**: 30 giorni dalla generazione
- **Libreria**: Jose (SignJWT/jwtVerify)
- **Secret**: JWT_SECRET environment variable
- **Payload**: `{ orderId, orderType, subject: 'feedback' }`
- **File**: `src/lib/feedback/token.ts`

#### Flow Completo
1. **Generazione Link**:
   - Admin conferma consegna ordine (shippingStatus = 'delivered')
   - Admin conferma preventivo (status = 'confermato')
   - Sistema genera token JWT firmato
   - Link feedback inviato via email: `{baseUrl}/feedback/{token}`

2. **Verifica e Accesso**:
   - Cliente clicca link feedback
   - POST `/api/feedback/verify` verifica token JWT
   - Controlla stato ordine/preventivo
   - Recupera info ordine e prodotti

3. **Form Multi-Prodotto**:
   - Cliente vede lista prodotti acquistati
   - Per ogni prodotto: rating (1-5 stelle) + commento (max 500 char)
   - Validazione client-side e server-side
   - Submit batch via POST `/api/feedback/batch`

4. **Salvataggio**:
   - Controllo duplicati per orderId
   - Validazione completa di tutti i feedback
   - insertMany per performance
   - Risposta success con conteggio feedback salvati

#### API Routes - Pubbliche

| Endpoint | Metodi | Descrizione | File |
|----------|--------|-------------|------|
| `/api/feedback/verify` | POST | Verifica token JWT e restituisce info ordine | `src/app/api/feedback/verify/route.ts` |
| `/api/feedback/[orderId]` | GET | Verifica esistenza feedback per ordine | `src/app/api/feedback/[orderId]/route.ts` |
| `/api/feedback/batch` | POST | Salva feedback multipli per un ordine | `src/app/api/feedback/batch/route.ts` |
| `/api/products/[slug]/feedbacks` | GET | Recupera recensioni pubbliche per prodotto con filtri e stats | `src/app/api/products/[slug]/feedbacks/route.ts` |

#### API Routes - Admin (Protette)

| Endpoint | Metodi | Descrizione | File |
|----------|--------|-------------|------|
| `/api/admin/feedbacks` | GET | Lista feedback con paginazione e filtri | `src/app/api/admin/feedbacks/route.ts` |
| `/api/admin/feedbacks/stats` | GET | Statistiche aggregate (totale, media, distribuzione, trend) | `src/app/api/admin/feedbacks/stats/route.ts` |
| `/api/admin/feedbacks/products` | GET | Lista prodotti unici dai feedback | `src/app/api/admin/feedbacks/products/route.ts` |

#### Pagine Frontend

| Route | Tipo | Descrizione | File |
|-------|------|-------------|------|
| `/feedback/[orderId]` | Pubblica | Form feedback multi-prodotto con token JWT | `src/app/(shop)/feedback/[orderId]/page.tsx` |
| `/admin/feedbacks` | Protetta | Pannello admin gestione feedback | `src/app/admin/feedbacks/page.tsx` |

#### Componenti

| Component | Descrizione | Features | File |
|-----------|-------------|----------|------|
| `StarRating` | Rating a 5 stelle interattivo | Touch-optimized (48x48px), WCAG compliant, hover states | `src/components/feedback/StarRating.tsx` |
| `StarDisplay` | Stelle read-only per visualizzazione | 3 dimensioni (sm/md/lg), accessibile, mobile-optimized | `src/components/reviews/StarDisplay.tsx` |
| `ProductReviews` | Sezione recensioni pubbliche prodotto | Statistiche, filtri stelle, paginazione (5/pag), auto-scroll, multilingua | `src/components/reviews/ProductReviews.tsx` |
| `OrderFeedbacks` | Recensioni cliente in admin panel | Visualizza recensioni ordine/preventivo, media stelle, badge anonimato | `src/components/admin/OrderFeedbacks.tsx` |

#### Schema Database - Collection `feedbacks`

```typescript
interface FeedbackDocument {
  _id: ObjectId;                  // ID MongoDB
  orderId: string;                // ID ordine/preventivo (MongoDB _id)
  productId?: string;             // ID prodotto Stripe (opzionale)
  productName: string;            // Nome prodotto
  rating: number;                 // Valutazione 1-5 stelle
  comment: string;                // Commento cliente (max 500 char)
  customerEmail: string;          // Email cliente (sempre salvata per anti-abuso)
  customerName: string;           // Nome cliente (sempre salvato per tracciabilità)
  isAnonymous: boolean;           // Se true, nome nascosto nell'admin panel
  orderType: 'order' | 'quote';   // Tipo: ordine o preventivo
  createdAt: Date;                // Data creazione feedback
}
```

#### Indici MongoDB Raccomandati

```javascript
// Indice composito per filtri e ordinamento
db.feedbacks.createIndex({
  "orderType": 1,
  "productName": 1,
  "rating": -1,
  "createdAt": -1
});

// Indice per controllo duplicati
db.feedbacks.createIndex({ "orderId": 1 });

// Indice per filtro prodotti
db.feedbacks.createIndex({ "productName": 1 });

// Indice per recensioni pubbliche per productId
db.feedbacks.createIndex({ "productId": 1, "createdAt": -1 });

// Indice per statistiche
db.feedbacks.createIndex({ "rating": 1 });
db.feedbacks.createIndex({ "createdAt": -1 });

// Indice per ricerca clienti
db.feedbacks.createIndex({ "customerEmail": 1 });
```

### Richiesta Recensione Manuale

Sistema per richiedere recensioni ai clienti da pannello admin con protezione anti-spam.

#### Funzionamento
- **Trigger**: Bottone in dettaglio ordine (delivered) o preventivo (confermato)
- **Condizione**: Nessun feedback esistente per ordine/preventivo
- **Protezione 24h**: Max 1 richiesta al giorno per ordine
- **Invio**: Email + WhatsApp con link JWT sicuro (30gg validità)
- **Contatori**: `reviewRequestCount`, `lastReviewRequestDate` in collections orders/forms
- **Template**: Email e WhatsApp amichevoli (`src/lib/email/review-request-template.ts`)

#### UI Admin
- Bottone gradient purple-pink visibile solo se condizioni soddisfatte
- Contatore richieste inviate + timestamp ultimo invio
- Timer ore rimanenti prima prossimo invio
- Messaggi successo/errore real-time

### Features Feedback

#### Pagina Pubblica Feedback
- ✅ Verifica token JWT con scadenza 30 giorni
- ✅ Form multi-prodotto (batch submission)
- ✅ **Opzione Anonimato**: Checkbox per inviare recensione anonima
- ✅ Rating stelle con hover e touch feedback
- ✅ Validazione real-time commenti (max 500 char)
- ✅ Mobile-first UX responsive
- ✅ Touch targets WCAG 2.1 AA compliant (min 48x48px)
- ✅ Prevenzione feedback duplicati
- ✅ Stati: loading, error, success, già inviato
- ✅ Raggruppamento prodotti per nome con quantità

#### Pannello Admin Feedback
- ✅ **Dashboard Card**: Accesso rapido da dashboard admin
- ✅ **Statistiche Real-time**:
  - Totale feedback ricevuti
  - Media valutazione (arrotondata a 1 decimale)
  - Distribuzione rating (1-5 stelle)
  - Feedback per tipo (ordini vs preventivi)
  - Trend mensile ultimi 6 mesi
- ✅ **Filtri Avanzati**:
  - Tipo ordine (tutti/ordini/preventivi)
  - Prodotto specifico (dropdown dinamico)
  - Rating minimo (1-5 stelle)
  - Ordinamento (data/rating, asc/desc)
- ✅ **Paginazione**: 20 feedback per pagina
- ✅ **Gestione Privacy**:
  - Badge "Anonimo" per feedback anonimi
  - Nome mostrato come "Cliente Anonimo"
  - Email offuscata (es. "c***@email.com")
  - Dati reali salvati per tracciabilità
- ✅ **Info Dettagliate**:
  - Stelle visualizzate
  - Nome e email cliente (con privacy)
  - Prodotto specifico
  - Numero ordine e data
  - Commento completo

#### Recensioni Pubbliche Prodotti
- ✅ **Visualizzazione Pagina Prodotto**: Sezione recensioni sotto CustomHTMLRenderer
- ✅ **Statistiche Live**: Media rating, totale recensioni, distribuzione stelle (1-5)
- ✅ **Filtri Interattivi**: Filtro per stelle specifiche o tutte
- ✅ **Paginazione Smart**: 5 recensioni/pagina con auto-scroll smooth su mobile
- ✅ **Privacy-First**: Nome nascosto per recensioni anonime, badge "Anonimo"
- ✅ **Multilingua**: Supporto IT/EN con traduzioni complete e date localizzate
- ✅ **Mobile-Optimized**: Design responsive, touch-friendly, stile global.css
- ✅ **Badge Verificato**: Mostra "Acquisto Verificato" per ogni recensione

#### Integrazione con Sistema E-commerce
- ✅ **Ordini**: Link feedback dopo consegna (`shippingStatus = 'delivered'`)
- ✅ **Preventivi**: Link feedback dopo conferma (`status = 'confermato'`)
- ✅ **Email Automatiche**: Invio link feedback via Resend (auto + richieste manuali)
- ✅ **WhatsApp**: Messaggi amichevoli con link feedback (auto + richieste manuali)
- ✅ **Richieste Manuali**: Bottone admin con protezione 24h e contatori
- ✅ **Telegram Notifiche**: Alert admin su nuovi feedback (opzionale)
- ✅ **ProductId Tracking**: Collegamento feedback-prodotto per analytics

#### Validazioni e Sicurezza
- ✅ Token JWT con firma HMAC SHA-256
- ✅ Verifica expiry e subject claim
- ✅ Controllo stato ordine prima di mostrare form
- ✅ Validazione server-side completa:
  - Rating: intero 1-5
  - Commento: non vuoto, max 500 caratteri
  - Email: formato valido, lowercase
  - OrderType: solo 'order' o 'quote'
- ✅ Prevenzione duplicati via orderId
- ✅ Sanitizzazione input (trim, lowercase email)
- ✅ **Privacy GDPR Compliant**:
  - Dati reali sempre salvati per anti-abuso
  - isAnonymous flag per visualizzazione pubblica
  - Tracciabilità ordini mantenuta

#### Performance Optimizations
- ✅ React.useCallback per event handlers
- ✅ Paginazione API (limit/skip)
- ✅ Aggregation pipelines MongoDB per stats
- ✅ Projection per fetch solo campi necessari
- ✅ Parallel fetching (stats + products + feedbacks)
- ✅ InsertMany per batch operations
- ✅ Indici MongoDB per query veloci

#### Mobile UX Improvements
- ✅ Stelle grandi: text-5xl/6xl su mobile
- ✅ Touch targets: min 48x48px (WCAG AA)
- ✅ CSS touch-manipulation per performance
- ✅ Active states: scale-95 feedback tattile
- ✅ Padding responsive: py-6/py-12 sm breakpoint
- ✅ Textarea: 5 righe su mobile
- ✅ Submit button: min 56px height
- ✅ Testo responsive: text-2xl/text-3xl

#### Metriche e Analytics
- **Totale Feedback**: Conteggio feedback ricevuti
- **Media Rating**: Valutazione media ponderata
- **Distribuzione Stelle**: Istogramma 1-5 stelle
- **Per Tipo**: Ordini vs Preventivi
- **Trend Mensile**: Conteggio e media ultimi 6 mesi
- **Per Prodotto**: Filtro prodotto specifico
- **Ultimi 5**: Preview feedback recenti

### Types e Interfacce

**File**: `src/types/feedback.ts`

```typescript
// Documento MongoDB
interface FeedbackDocument

// Creazione feedback singolo
interface CreateFeedbackData

// Feedback prodotto (batch)
interface ProductFeedbackData

// Batch multipli prodotti
interface BatchFeedbackData

// Risposta API
interface FeedbackResponse

// Verifica esistenza
interface FeedbackExistsResponse

// Info ordine per form
interface OrderFeedbackInfo
```

### Documentazione Tecnica
- **FEEDBACK_OPTIMIZATION.md**: Indici MongoDB e performance gains
- **FEEDBACK_IMPROVEMENTS_SUMMARY.md**: Changelog features implementate

## 🔧 Configurazione e Deploy

### Environment Variables Richieste
```env
# Database
MONGODB_URI=mongodb://...

# Stripe
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-secret-key

# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=Olio Galia <noreply@tuosito.com>

# WhatsApp (Meta Business API)
WHATSAPP_ENABLED=true
META_WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
META_WHATSAPP_ACCESS_TOKEN=your-access-token

# Telegram (Notifiche ordini)
TELEGRAM_BOT_TOKEN=your-bot-token
# Un solo utente:
TELEGRAM_CHAT_ID=your-chat-id
# Oppure multipli utenti (separati da virgola):
TELEGRAM_CHAT_ID=chat-id-1,chat-id-2,chat-id-3

# Base URL (per link nelle notifiche)
NEXT_PUBLIC_SITE_URL=https://tuosito.com
# oppure
NEXT_PUBLIC_BASE_URL=https://tuosito.com
```

### Build e Deploy
```bash
npm run build    # Build produzione
npm run start    # Server produzione
npm run dev      # Sviluppo
npm run lint     # Linting TypeScript/ESLint
```

## 📈 Metriche e Monitoraggio

### Dashboard Admin
- 📊 Ordini totali e giornalieri
- 💰 Fatturato totale e giornaliero
- 📦 Stock prodotti in tempo reale
- 🎯 Statistiche vendite per categoria

### Logging e Debug
- 🔍 Console logging per operazioni critiche
- ⚠️ Error handling centralizzato
- 🛡️ Validazione dati rigorosa

## 🛡️ Sicurezza

### Implementazioni di Sicurezza
- 🔐 Autenticazione JWT sicura
- 🍪 Cookie httpOnly per sessioni
- 🛡️ Validazione input rigorosa
- 🔒 Hash password con bcryptjs
- 🌐 CORS e headers sicurezza
- 🔑 API key protection

### Best Practices
- ✅ Sanitizzazione input utente
- ✅ Validazione parametri API
- ✅ Rate limiting (implementabile)
- ✅ HTTPS enforcement (prod)

---
