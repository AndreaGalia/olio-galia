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

### E-commerce Pages
| Route | File | Descrizione |
|-------|------|-------------|
| `/products` | `src/app/(shop)/products/page.tsx` | Catalogo prodotti |
| `/products/[slug]` | `src/app/(shop)/products/[slug]/page.tsx` | Dettaglio prodotto |
| `/cart` | `src/app/(shop)/cart/page.tsx` | Carrello acquisti |
| `/checkout/success` | `src/app/(shop)/checkout/success/page.tsx` | Conferma ordine |
| `/conferma-ordine` | `src/app/(shop)/conferma-ordine/page.tsx` | Conferma ordine alternativa |

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
| `/admin/orders` | `src/app/admin/orders/page.tsx` | Lista ordini |
| `/admin/orders/[id]` | `src/app/admin/orders/[id]/page.tsx` | Dettaglio ordine |

### Gestione Preventivi
| Route | File | Descrizione |
|-------|------|-------------|
| `/admin/preventivi` | `src/app/admin/preventivi/page.tsx` | Lista preventivi |
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
| `/api/admin/orders` | `src/app/api/admin/orders/route.ts` | GET | Lista ordini admin |
| `/api/admin/orders/[id]` | `src/app/api/admin/orders/[id]/route.ts` | GET, PUT | Dettaglio/modifica ordine |

#### Preventivi Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/preventivi` | `src/app/api/admin/preventivi/route.ts` | GET | Lista preventivi |
| `/api/admin/preventivi/create` | `src/app/api/admin/preventivi/create/route.ts` | POST | Crea preventivo |

#### Form Management Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/forms` | `src/app/api/admin/forms/route.ts` | GET | Lista form contatti |
| `/api/admin/forms/[id]` | `src/app/api/admin/forms/[id]/route.ts` | GET, PUT, DELETE | Gestione form singolo |
| `/api/admin/forms/[id]/send-quote` | `src/app/api/admin/forms/[id]/send-quote/route.ts` | POST | Invio preventivo |
| `/api/admin/forms/[id]/send-delivery-confirmation` | `src/app/api/admin/forms/[id]/send-delivery-confirmation/route.ts` | POST | Conferma consegna |

#### Gestione Clienti Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/customers` | `src/app/api/admin/customers/route.ts` | GET, POST | Lista/creazione clienti |
| `/api/admin/customers/[id]` | `src/app/api/admin/customers/[id]/route.ts` | GET, PUT, DELETE | CRUD cliente singolo |

#### Sistema Admin
| Endpoint | File | Metodi | Descrizione |
|----------|------|--------|-------------|
| `/api/admin/stats` | `src/app/api/admin/stats/route.ts` | GET | Statistiche dashboard |
| `/api/admin/settings` | `src/app/api/admin/settings/route.ts` | GET, PUT | Configurazioni sistema |

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

**Nota**: Per il changelog completo delle modifiche recenti, vedere il file `CHANGELOG_MODIFICHE.md`.
