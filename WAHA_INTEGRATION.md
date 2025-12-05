# 📱 Integrazione WAHA WhatsApp - Olio Galia

Documentazione completa dell'integrazione WAHA (WhatsApp HTTP API) nel progetto Olio Galia per l'invio automatico di messaggi WhatsApp ai clienti.

## 📋 Indice

1. [Overview](#overview)
2. [Architettura](#architettura)
3. [File Creati/Modificati](#file-creatimodificati)
4. [Funzionalità Implementate](#funzionalità-implementate)
5. [Setup e Deployment](#setup-e-deployment)
6. [Configurazione Admin Panel](#configurazione-admin-panel)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

L'integrazione WAHA permette di inviare **notifiche WhatsApp automatiche** ai clienti in momenti chiave del processo d'acquisto:

- ✅ **Conferma ordine ricevuto** (dopo pagamento Stripe)
- 📦 **Aggiornamento spedizione** (quando ordine viene spedito)
- ✅ **Conferma consegna** (quando ordine arriva a destinazione)
- ⭐ **Richiesta recensione** (manuale da admin panel)

### Vantaggi

- **Tasso di apertura**: WhatsApp ha un tasso di apertura ~98% vs email ~20%
- **Engagement immediato**: I clienti ricevono notifiche push istantanee
- **Esperienza cliente**: Comunicazione diretta e familiare
- **Pilotabile**: Completamente configurabile on/off dall'admin panel

---

## 🏗️ Architettura

```
┌──────────────────────────────────────────────────┐
│           Next.js App (Vercel)                   │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  API Routes                                │ │
│  │  - /api/webhooks/stripe                   │ │
│  │  - /api/save-order                        │ │
│  │  - /api/admin/orders/[id]                 │ │
│  │  - /api/admin/forms/[id]/...              │ │
│  └────────────────────────────────────────────┘ │
│                 │                                │
│                 │ Chiama WahaService             │
│                 ▼                                │
│  ┌────────────────────────────────────────────┐ │
│  │  WahaService                               │ │
│  │  - sendTextMessage()                       │ │
│  │  - sendImageMessage()                      │ │
│  │  - getSessionStatus()                      │ │
│  └────────────────────────────────────────────┘ │
│                 │                                │
│                 │ HTTP Request                   │
│                 ▼                                │
└──────────────────────────────────────────────────┘
                  │
                  │ POST /api/sendText
                  ▼
┌──────────────────────────────────────────────────┐
│        WAHA Server (VPS/Railway)                 │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  WAHA Docker Container                     │ │
│  │  - WhatsApp Web Session                    │ │
│  │  - HTTP API (port 3000)                    │ │
│  │  - Persistent Storage                      │ │
│  └────────────────────────────────────────────┘ │
│                 │                                │
│                 │ WhatsApp Web Protocol          │
│                 ▼                                │
│        [ WhatsApp Servers ]                      │
│                 │                                │
│                 ▼                                │
│        📱 Cliente finale                         │
└──────────────────────────────────────────────────┘
```

---

## 📁 File Creati/Modificati

### File Nuovi Creati

#### 1. Service Layer

| File | Descrizione |
|------|-------------|
| `src/services/wahaService.ts` | Service principale per WAHA API con funzioni send, check status, settings |
| `src/lib/whatsapp/templates.ts` | Template messaggi WhatsApp (conferma ordine, spedizione, consegna, recensione) |

#### 2. Configurazione Server

| File | Descrizione |
|------|-------------|
| `waha-server/docker-compose.yml` | Docker Compose per deployment WAHA |
| `waha-server/setup-waha.sh` | Script automatico setup server Ubuntu/Debian |
| `waha-server/README.md` | Guida completa deployment e troubleshooting |

#### 3. Documentazione

| File | Descrizione |
|------|-------------|
| `WAHA_INTEGRATION.md` | Questo documento |

### File Modificati

#### API Routes

| File | Modifiche |
|------|-----------|
| `src/app/api/webhooks/stripe/route.ts` | Aggiunto invio WhatsApp dopo conferma ordine |
| `src/app/api/save-order/route.ts` | Aggiunto invio WhatsApp per fallback client-side |
| `src/app/api/admin/orders/[id]/route.ts` | Aggiunto WhatsApp per shipping update e delivery |
| `src/app/api/admin/forms/[id]/send-delivery-confirmation/route.ts` | Aggiunto WhatsApp per delivery preventivi |
| `src/app/api/admin/orders/[id]/request-review/route.ts` | Aggiunto WhatsApp per richiesta recensione ordini |
| `src/app/api/admin/forms/[id]/request-review/route.ts` | Aggiunto WhatsApp per richiesta recensione preventivi |

#### Configurazione

| File | Modifiche |
|------|-----------|
| `.env.example` | Aggiunta sezione WAHA WhatsApp API con variabili |

---

## ⚙️ Funzionalità Implementate

### 1. Conferma Ordine Ricevuto

**Trigger**: Pagamento completato su Stripe

**Endpoint**:
- `/api/webhooks/stripe` (prioritario, server-side garantito)
- `/api/save-order` (fallback client-side)

**Template Messaggio**:
```
🎉 Grazie per il tuo ordine, Andrea!

✅ Ordine confermato
🔢 Numero ordine: #AB123456
💰 Totale: €45,00

📦 Prodotti ordinati:
• Olio EVO 500ml x2

📧 Riceverai un'email con tutti i dettagli dell'ordine.
🚚 Ti aggiorneremo non appena il tuo ordine sarà spedito!

Grazie per aver scelto Olio Galia 🫒
```

**Configurazione**: Admin Panel → Settings → `orderConfirmation: true`

---

### 2. Aggiornamento Spedizione

**Trigger**: Admin cambia stato ordine a "shipped" (spedito)

**Endpoint**: `/api/admin/orders/[id]` (PUT)

**Template Messaggio**:
```
📦 Ciao Andrea!

Il tuo ordine #AB123456 è stato spedito! 🚚

📮 Corriere: GLS
🔍 Numero tracking: 1234567890

🌐 Traccia la spedizione:
https://tracking.gls.it/...

⏱️ Consegna prevista: 2-3 giorni lavorativi

Ti avviseremo quando il pacco sarà consegnato!

Olio Galia 🫒
```

**Configurazione**: Admin Panel → Settings → `shippingUpdate: true`

---

### 3. Conferma Consegna

**Trigger**: Admin cambia stato ordine a "delivered" (consegnato)

**Endpoint**:
- `/api/admin/orders/[id]` (PUT) - per ordini
- `/api/admin/forms/[id]/send-delivery-confirmation` (POST) - per preventivi

**Template Messaggio**:
```
✅ Consegna completata!

Ciao Andrea,

Il tuo ordine #AB123456 è stato consegnato! 📦

Speriamo che tu sia soddisfatto dei nostri prodotti. 🫒

💚 Ci piacerebbe sapere cosa ne pensi! Riceverai a breve un link per lasciare una recensione.

Grazie per aver scelto Olio Galia!
```

**Configurazione**: Admin Panel → Settings → `deliveryConfirmation: true`

---

### 4. Richiesta Recensione

**Trigger**: Admin clicca bottone "Richiedi Recensione" da dettaglio ordine/preventivo

**Endpoint**:
- `/api/admin/orders/[id]/request-review` (POST) - per ordini
- `/api/admin/forms/[id]/request-review` (POST) - per preventivi

**Template Messaggio**:
```
⭐ La tua opinione conta!

Ciao Andrea,

Grazie per aver scelto Olio Galia per il tuo ordine #AB123456.

Ci piacerebbe sapere cosa ne pensi dei nostri prodotti! 🫒

La tua recensione ci aiuta a migliorare e aiuta altri clienti a fare scelte consapevoli.

👉 Lascia una recensione qui:
https://oliogalia.com/feedback/eyJhbGc...

⏱️ Ci vogliono solo 2 minuti!

Grazie mille per il tuo tempo 💚

Olio Galia
```

**Configurazione**: Admin Panel → Settings → `reviewRequest: true`

**Protezione**: Max 1 richiesta ogni 24 ore per ordine

---

## 🚀 Setup e Deployment

### Opzione 1: Server VPS (Consigliato per Produzione)

#### 1. Setup Server WAHA

```bash
# SSH nel tuo server
ssh user@your-server-ip

# Scarica e esegui script automatico
curl -O https://raw.githubusercontent.com/your-repo/setup-waha.sh
chmod +x setup-waha.sh
./setup-waha.sh
```

Lo script installa tutto automaticamente:
- ✅ Docker e Docker Compose
- ✅ WAHA container
- ✅ Configurazione firewall
- ✅ Avvio automatico

#### 2. Connetti WhatsApp

```bash
# Accedi alla dashboard
http://your-server-ip:3000

# Crea sessione "olio-galia"
# Scansiona QR code con WhatsApp Business
```

#### 3. Configura Next.js

Aggiungi al file `.env.production`:

```env
WAHA_API_URL=http://your-server-ip:3000
WAHA_SESSION=olio-galia
```

### Opzione 2: Railway (Deployment Facile)

#### 1. Deploy su Railway

```bash
# Installa Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crea progetto
railway init

# Deploy WAHA
railway up
```

O dalla **UI web**: railway.app → New Project → Deploy Docker Image → `devlikeapro/waha`

#### 2. Ottieni URL

Railway fornisce URL automatico: `https://waha-production-xyz.up.railway.app`

#### 3. Configura Next.js

```env
WAHA_API_URL=https://waha-production-xyz.up.railway.app
WAHA_SESSION=olio-galia
```

---

## ⚙️ Configurazione Admin Panel

### 1. Inizializzazione Database Settings

La configurazione WhatsApp è salvata in MongoDB collection `settings` con chiave `whatsapp`.

**Struttura documento**:

```javascript
{
  key: "whatsapp",
  value: {
    enabled: true,
    apiUrl: "http://your-server:3000",
    session: "olio-galia",
    orderConfirmation: true,
    shippingUpdate: true,
    deliveryConfirmation: true,
    reviewRequest: true
  },
  updatedAt: ISODate("2025-01-15T10:30:00Z")
}
```

### 2. Inserimento Manuale (Primo Setup)

Se non hai ancora UI admin per gestire settings WhatsApp, puoi inserirlo manualmente in MongoDB:

```javascript
// MongoDB Shell o Compass
db.settings.insertOne({
  key: "whatsapp",
  value: {
    enabled: true,
    apiUrl: "http://your-server-ip:3000",
    session: "olio-galia",
    orderConfirmation: true,
    shippingUpdate: true,
    deliveryConfirmation: true,
    reviewRequest: true
  },
  updatedAt: new Date()
})
```

### 3. Gestione da Admin Panel (Future)

**TODO**: Creare pagina `/admin/settings` con form per configurare:

- ✅ Toggle abilita/disabilita WhatsApp
- ✅ Input URL API WAHA
- ✅ Input nome sessione
- ✅ Checkbox per ogni tipo di notifica
- ✅ Bottone "Test WhatsApp" per invio test
- ✅ Indicatore stato sessione (online/offline)

---

## 🧪 Testing

### Test Manuale API WAHA

```bash
# Test connessione WAHA
curl http://your-server:3000/api/health

# Test stato sessione
curl http://your-server:3000/api/sessions/olio-galia

# Test invio messaggio
curl -X POST http://your-server:3000/api/sendText \
  -H "Content-Type: application/json" \
  -d '{
    "session": "olio-galia",
    "chatId": "393331234567@c.us",
    "text": "Test message from Olio Galia"
  }'
```

### Test da Next.js

#### Test WahaService

Crea file `tests/waha-test.ts`:

```typescript
import { WahaService } from '@/services/wahaService';

async function testWhatsApp() {
  // Test invio messaggio
  const result = await WahaService.testMessage('+39 333 1234567');

  console.log('Test result:', result);

  // Test check stato sessione
  const status = await WahaService.getSessionStatus();
  console.log('Session status:', status);
}

testWhatsApp();
```

#### Test da Admin Panel

1. Vai su `/admin/orders`
2. Apri un ordine con stato "delivered"
3. Clicca "Richiedi Recensione"
4. Verifica che email + WhatsApp siano inviati
5. Controlla response JSON per `whatsappSent: true`

---

## 🐛 Troubleshooting

### WhatsApp non viene inviato

#### 1. Verifica Settings Database

```javascript
// MongoDB
db.settings.findOne({ key: "whatsapp" })

// Deve restituire:
{
  enabled: true,
  apiUrl: "http://...",
  session: "olio-galia",
  orderConfirmation: true, // per conferme ordini
  // ...
}
```

#### 2. Controlla Logs Next.js

```bash
# Cerca nei log:
grep -i "waha" logs/app.log
grep -i "whatsapp" logs/app.log

# Log attesi:
# ✅ "WhatsApp notification sent to: +39..."
# ⚠️ "WhatsApp notifications disabled"
# ❌ "Error sending WhatsApp message: ..."
```

#### 3. Verifica WAHA Server

```bash
# Stato container
docker ps | grep waha

# Logs WAHA
docker compose -f waha-server/docker-compose.yml logs -f

# Test API
curl http://your-server:3000/api/sessions/olio-galia
```

### Sessione WAHA disconnessa

**Sintomo**: `status: "FAILED"` o `status: "SCAN_QR_CODE"`

**Causa**: WhatsApp disconnesso (telefono spento, 14+ giorni inattivo)

**Soluzione**:

```bash
# 1. Genera nuovo QR code
curl http://your-server:3000/api/sessions/olio-galia/qrcode

# 2. Scansiona QR code con WhatsApp
# 3. Verifica stato
curl http://your-server:3000/api/sessions/olio-galia
# status: "WORKING" ✅
```

### Numero telefono mancante

**Sintomo**: `ℹ️ No customer phone available, skipping WhatsApp`

**Causa**: Ordine senza telefono cliente

**Soluzione**:
- Verifica che Stripe checkout raccolga il telefono
- Controlla campo `customer.phone` nell'ordine MongoDB
- Aggiungi validation al checkout per rendere telefono obbligatorio

### WhatsApp inviato ma non ricevuto

**Cause possibili**:

1. **Numero formattato male**:
   - ✅ Corretto: `+39 333 1234567` o `393331234567`
   - ❌ Errato: `333 1234567` (manca prefisso)

2. **Numero non su WhatsApp**:
   - Verifica che il numero abbia WhatsApp attivo

3. **Messaggio bloccato da WhatsApp**:
   - WhatsApp può bloccare messaggi spam
   - Limita invii a max 100-200 al giorno
   - Evita URL accorciati (bit.ly, etc.)

---

## 📊 Metriche e Monitoring

### Logs da monitorare

```bash
# Next.js logs
tail -f logs/app.log | grep -i waha

# WAHA logs
docker compose -f waha-server/docker-compose.yml logs -f
```

### Metriche chiave

- **Tasso invio**: % WhatsApp inviati vs ordini totali
- **Tasso errore**: % WhatsApp falliti
- **Stato sessione**: Uptime WAHA
- **Latenza API**: Tempo risposta WAHA

### Alert raccomandati

- ⚠️ Sessione WAHA disconnessa
- ⚠️ Tasso errore > 10%
- ⚠️ API WAHA non raggiungibile
- ⚠️ Volume disks WAHA pieni > 80%

---

## 🔐 Sicurezza

### Best Practices

1. **HTTPS obbligatorio in produzione**:
   - Usa Nginx reverse proxy con SSL (Let's Encrypt)
   - Non esporre porta 3000 direttamente

2. **API Key WAHA** (opzionale):
   ```yaml
   # docker-compose.yml
   environment:
     - WAHA_API_KEY=your-secret-key-here
   ```

3. **Firewall**:
   ```bash
   # Solo Vercel IP può accedere WAHA
   sudo ufw allow from VERCEL_IP to any port 3000
   ```

4. **Backup sessioni**:
   ```bash
   # Backup automatico giornaliero
   0 3 * * * docker run --rm -v waha-sessions:/data -v /backup:/backup ubuntu tar czf /backup/waha-$(date +\%Y\%m\%d).tar.gz /data
   ```

---

## 📚 Risorse

- **WAHA Docs**: https://waha.devlike.pro/
- **WAHA GitHub**: https://github.com/devlikeapro/waha
- **WhatsApp Business Policy**: https://www.whatsapp.com/legal/business-policy
- **Railway Docs**: https://docs.railway.app/

---

## ✅ Checklist Deployment

- [ ] Server WAHA deployato e funzionante
- [ ] WhatsApp Business collegato tramite QR code
- [ ] Sessione WAHA in stato `WORKING`
- [ ] Variabili environment configurate in Next.js
- [ ] Settings WhatsApp inseriti in MongoDB
- [ ] Test invio messaggio manuale funzionante
- [ ] Test end-to-end su ordine completo
- [ ] Monitoring e logs attivi
- [ ] Backup automatico configurato
- [ ] HTTPS abilitato (produzione)

---

**Congratulazioni! 🎉** L'integrazione WAHA è completa e operativa.

Per domande o supporto, consulta `/waha-server/README.md` o la documentazione ufficiale WAHA.
