# Setup Stripe Shipping Rates - Olio Galia

Questa guida spiega come configurare le **17 Shipping Rates** su Stripe Dashboard per il sistema di spedizioni basato su peso.

---

## Panoramica

Il sistema richiede **17 Stripe Shipping Rates**:

- **2 per l'Italia** (standard + gratis)
- **15 per peso** (5 fasce × 3 zone: Europa, America, Mondo)

Ogni Shipping Rate è pre-configurata con un costo fisso e deve essere creata manualmente su Stripe Dashboard.

---

## Step 1: Accedi a Stripe Dashboard

1. Vai su [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Fai login con le tue credenziali
3. Seleziona il progetto corretto (es. "Olio Galia")

---

## Step 2: Vai a Shipping Rates

1. Nel menu laterale, vai su **Products**
2. Clicca sulla tab **Shipping rates**
3. Clicca il pulsante **+ Create shipping rate**

---

## Step 3: Crea le 17 Shipping Rates

Per ogni shipping rate, segui questi passi:

1. **Name**: Inserisci il nome (vedi tabella sotto)
2. **Price**: Inserisci il prezzo in EUR
3. **Type**: Seleziona **Fixed amount**
4. **Tax behavior**: Seleziona **Exclusive** (raccomandato)
5. Clicca **Create**
6. **Copia l'ID** (formato `shr_xxxxxxxxxxxxx`) - lo userai nel file `.env.local`

---

## Tabella Shipping Rates da Creare

### Italia (2 rates)

| Name | Price (EUR) | Env Variable | Note |
|------|-------------|--------------|------|
| `IT - Spedizione Standard` | 5.90 | `STRIPE_SHIPPING_RATE_ITALIA` | Costo fisso sotto 150€ |
| `IT - Spedizione Gratis` | 0.00 | `STRIPE_SHIPPING_RATE_ITALIA_FREE` | Gratis sopra 150€ |

---

### Europa (5 rates)

| Name | Price (EUR) | Env Variable | Fascia Peso |
|------|-------------|--------------|-------------|
| `EU - 0-1kg` | 8.90 | `STRIPE_SHIPPING_RATE_EUROPA_0_1KG` | 0-1000g |
| `EU - 1-3kg` | 12.90 | `STRIPE_SHIPPING_RATE_EUROPA_1_3KG` | 1001-3000g |
| `EU - 3-5kg` | 16.90 | `STRIPE_SHIPPING_RATE_EUROPA_3_5KG` | 3001-5000g |
| `EU - 5-10kg` | 24.90 | `STRIPE_SHIPPING_RATE_EUROPA_5_10KG` | 5001-10000g |
| `EU - Oltre 10kg` | 39.90 | `STRIPE_SHIPPING_RATE_EUROPA_10KG_PLUS` | >10000g |

---

### America (5 rates)

| Name | Price (EUR) | Env Variable | Fascia Peso |
|------|-------------|--------------|-------------|
| `AM - 0-1kg` | 25.00 | `STRIPE_SHIPPING_RATE_AMERICA_0_1KG` | 0-1000g |
| `AM - 1-3kg` | 35.00 | `STRIPE_SHIPPING_RATE_AMERICA_1_3KG` | 1001-3000g |
| `AM - 3-5kg` | 45.00 | `STRIPE_SHIPPING_RATE_AMERICA_3_5KG` | 3001-5000g |
| `AM - 5-10kg` | 65.00 | `STRIPE_SHIPPING_RATE_AMERICA_5_10KG` | 5001-10000g |
| `AM - Oltre 10kg` | 99.00 | `STRIPE_SHIPPING_RATE_AMERICA_10KG_PLUS` | >10000g |

---

### Mondo (5 rates)

| Name | Price (EUR) | Env Variable | Fascia Peso |
|------|-------------|--------------|-------------|
| `WW - 0-1kg` | 30.00 | `STRIPE_SHIPPING_RATE_MONDO_0_1KG` | 0-1000g |
| `WW - 1-3kg` | 45.00 | `STRIPE_SHIPPING_RATE_MONDO_1_3KG` | 1001-3000g |
| `WW - 3-5kg` | 60.00 | `STRIPE_SHIPPING_RATE_MONDO_3_5KG` | 3001-5000g |
| `WW - 5-10kg` | 85.00 | `STRIPE_SHIPPING_RATE_MONDO_5_10KG` | 5001-10000g |
| `WW - Oltre 10kg` | 129.00 | `STRIPE_SHIPPING_RATE_MONDO_10KG_PLUS` | >10000g |

---

## Step 4: Configura Environment Variables

Dopo aver creato tutte le 17 shipping rates, aggiungi gli ID al file `.env.local`:

```bash
# ===============================================
# SHIPPING RATES - SISTEMA BASATO SU PESO
# ===============================================

# ITALIA (basata su totale carrello €)
STRIPE_SHIPPING_RATE_ITALIA=shr_xxxxxxxxxxxxx          # IT - Spedizione Standard
STRIPE_SHIPPING_RATE_ITALIA_FREE=shr_xxxxxxxxxxxxx     # IT - Spedizione Gratis

# EUROPA (5 fasce peso)
STRIPE_SHIPPING_RATE_EUROPA_0_1KG=shr_xxxxxxxxxxxxx    # EU - 0-1kg
STRIPE_SHIPPING_RATE_EUROPA_1_3KG=shr_xxxxxxxxxxxxx    # EU - 1-3kg
STRIPE_SHIPPING_RATE_EUROPA_3_5KG=shr_xxxxxxxxxxxxx    # EU - 3-5kg
STRIPE_SHIPPING_RATE_EUROPA_5_10KG=shr_xxxxxxxxxxxxx   # EU - 5-10kg
STRIPE_SHIPPING_RATE_EUROPA_10KG_PLUS=shr_xxxxxxxxxxxxx # EU - Oltre 10kg

# AMERICA (5 fasce peso)
STRIPE_SHIPPING_RATE_AMERICA_0_1KG=shr_xxxxxxxxxxxxx
STRIPE_SHIPPING_RATE_AMERICA_1_3KG=shr_xxxxxxxxxxxxx
STRIPE_SHIPPING_RATE_AMERICA_3_5KG=shr_xxxxxxxxxxxxx
STRIPE_SHIPPING_RATE_AMERICA_5_10KG=shr_xxxxxxxxxxxxx
STRIPE_SHIPPING_RATE_AMERICA_10KG_PLUS=shr_xxxxxxxxxxxxx

# MONDO (5 fasce peso)
STRIPE_SHIPPING_RATE_MONDO_0_1KG=shr_xxxxxxxxxxxxx
STRIPE_SHIPPING_RATE_MONDO_1_3KG=shr_xxxxxxxxxxxxx
STRIPE_SHIPPING_RATE_MONDO_3_5KG=shr_xxxxxxxxxxxxx
STRIPE_SHIPPING_RATE_MONDO_5_10KG=shr_xxxxxxxxxxxxx
STRIPE_SHIPPING_RATE_MONDO_10KG_PLUS=shr_xxxxxxxxxxxxx
```

---

## Step 5: Aggiorna Environment Variables di Produzione

Se usi Vercel/Netlify/altro hosting, aggiungi le stesse variabili anche nell'ambiente di produzione:

1. Dashboard Hosting → Settings → Environment Variables
2. Aggiungi tutte le 17 variabili
3. Redeploy l'applicazione

---

## Step 6: Verifica Configurazione

Esegui il server di sviluppo:

```bash
npm run dev
```

Vai su `http://localhost:3000/cart` e verifica che:

1. **Selezione zona funziona** (4 opzioni: Italia, Europa, America, Mondo)
2. **Preview costo appare** dopo selezione zona
3. **Peso totale viene calcolato** (solo per Europa/America/Mondo)
4. **Costo corretto viene mostrato** in base a peso/totale

---

## Customizzazione Prezzi

### Modifica i Costi su Stripe

Per cambiare i costi di spedizione:

1. Vai su Stripe Dashboard → Products → Shipping rates
2. Trova la rate da modificare (es. "EU - 1-3kg")
3. Clicca **Edit**
4. Modifica il **Price**
5. Clicca **Save**

⚠️ **Importante**: Se modifichi il prezzo su Stripe, devi anche aggiornare il `displayPrice` (in centesimi) nel file `src/lib/shipping/weightConfig.ts` per mantenere la preview corretta nel carrello.

### Modifica le Fasce Peso

Per cambiare le fasce peso (es. da "0-1kg" a "0-2kg"):

1. Modifica l'array `WEIGHT_TIERS` in `src/lib/shipping/weightConfig.ts`
2. Aggiorna i label nelle traduzioni (`it.json` + `en.json`)
3. Crea nuove Shipping Rates su Stripe con i nuovi nomi
4. Aggiorna gli ID in `.env.local`

### Modifica Soglia Spedizione Gratis Italia

Per cambiare la soglia (es. da 150€ a 100€):

1. Modifica `ITALY_SHIPPING_CONFIG.freeThreshold` in `src/lib/shipping/weightConfig.ts`
2. Nessun cambio su Stripe necessario (usa le stesse 2 rates)

---

## Troubleshooting

### Errore: "Configurazione spedizione Italia incompleta"

**Causa**: Mancano le variabili d'ambiente per l'Italia.

**Soluzione**:
- Verifica che `STRIPE_SHIPPING_RATE_ITALIA` e `STRIPE_SHIPPING_RATE_ITALIA_FREE` siano configurate in `.env.local`
- Riavvia il server di sviluppo

---

### Errore: "Impossibile calcolare spedizione per zona X con peso Yg"

**Causa**: Mancano le variabili d'ambiente per una fascia peso specifica.

**Soluzione**:
- Controlla quale fascia peso corrisponde al peso Y (es. 2500g = fascia 1-3kg)
- Verifica che la variabile corrispondente sia configurata (es. `STRIPE_SHIPPING_RATE_EUROPA_1_3KG`)

---

### Costo non aggiornato nel carrello dopo modifica su Stripe

**Causa**: Il `displayPrice` in `weightConfig.ts` non è sincronizzato con Stripe.

**Soluzione**:
- Apri `src/lib/shipping/weightConfig.ts`
- Trova l'entry in `WEIGHT_BASED_SHIPPING` corrispondente
- Aggiorna il campo `displayPrice` (in centesimi, es. `1290` per 12.90€)
- Riavvia il server

---

## Note Aggiuntive

### Prezzi Proposti sono Esempi

Tutti i prezzi indicati in questa guida sono **ESEMPI**. Puoi customizzarli liberamente:

- Modifica i prezzi su Stripe Dashboard
- Aggiorna `displayPrice` in `weightConfig.ts` per mantenere la preview corretta

### Tax Behavior

Raccomandazione: usa **Exclusive** come Tax behavior per tutte le shipping rates. Questo significa che il prezzo mostrato NON include già le tasse, e Stripe le calcolerà automaticamente in base alla destinazione.

### Delivery Estimates

Stripe permette di aggiungere stime di consegna (es. "2-4 giorni"). Queste sono **opzionali** e non influenzano il calcolo del costo.

---

## Riferimenti

- **File configurazione**: `src/lib/shipping/weightConfig.ts`
- **Hook calcolo peso**: `src/hooks/useCartWeight.ts`
- **Hook calcolo costo**: `src/hooks/useShippingCost.ts`
- **API checkout**: `src/app/api/create-checkout-session/route.ts`
- **Traduzioni**: `src/data/locales/it.json` + `en.json`

---

## Changelog

- **20 Dicembre 2024**: Setup iniziale sistema spedizioni basato su peso
