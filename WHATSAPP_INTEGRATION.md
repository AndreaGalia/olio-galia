# Integrazione WhatsApp - Olio Galia

## 📋 Panoramica

L'integrazione WhatsApp permette di inviare notifiche automatiche ai clienti tramite **Meta Cloud API (WhatsApp Business API)** in concomitanza con le email, nei seguenti casi:

🎁 **Include 1000 messaggi GRATUITI al mese!**

1. **Conferma Ordine** - Quando un cliente completa un acquisto (save-order)
2. **Ordine Spedito** - Quando l'admin segna l'ordine come spedito con tracking code (orders/[id])
3. **Ordine Consegnato** - Quando l'admin segna l'ordine come consegnato (orders/[id])
4. **Invio Preventivo** - Quando l'admin invia un preventivo personalizzato (send-quote)
5. **Conferma Consegna Preventivo** - Quando l'admin conferma consegna preventivo (send-delivery-confirmation)
6. **Benvenuto Newsletter** - Quando un utente si iscrive alla newsletter (newsletter)

## 🏗️ Architettura

### Struttura File Creati

```
src/
├── types/
│   └── whatsapp.ts                    # Interfacce TypeScript
├── lib/
│   └── whatsapp/
│       ├── whatsapp.ts                # Servizio principale
│       ├── phone-validator.ts         # Validazione numeri telefono
│       └── message-templates.ts       # Template messaggi
└── app/api/
    ├── save-order/route.ts           # ✓ Integrato - Conferma ordine
    ├── newsletter/route.ts           # ✓ Integrato - Benvenuto newsletter
    └── admin/
        ├── orders/[id]/route.ts      # ✓ Integrato - Spedizione + Consegna ordini
        └── forms/[id]/
            ├── send-quote/route.ts        # ✓ Integrato - Invio preventivo
            └── send-delivery-confirmation/route.ts  # ✓ Integrato - Consegna preventivo
```

### Componenti Principali

#### 1. **WhatsAppService** (`src/lib/whatsapp/whatsapp.ts`)
Servizio centralizzato per l'invio di messaggi WhatsApp tramite Meta Cloud API.

**Metodi pubblici:**
- `sendOrderConfirmation(data)` - Conferma ordine ✅
- `sendShippingNotification(data)` - Notifica spedizione ✅
- `sendDeliveryConfirmation(data)` - Conferma consegna ✅
- `sendQuote(data)` - Preventivo ✅
- `sendNewsletterWelcome(data)` - Benvenuto newsletter ✅
- `getConfigStatus()` - Verifica configurazione

#### 2. **Phone Validator** (`src/lib/whatsapp/phone-validator.ts`)
Validazione e formattazione numeri di telefono usando `libphonenumber-js`.

**Funzioni principali:**
- `validatePhoneNumber(phone, country)` - Valida e formatta
- `canReceiveWhatsApp(phone)` - Verifica se valido
- `formatForWhatsApp(phone)` - Formatta in E.164

#### 3. **Message Templates** (`src/lib/whatsapp/message-templates.ts`)
Template dei messaggi WhatsApp con formattazione markdown.

## 🚀 Setup e Configurazione

### Passo 1: Installare Dipendenze

```bash
npm install libphonenumber-js
```

**Nota**: Non serve più Twilio! Meta Cloud API usa semplici HTTP requests.

### Passo 2: Configurare Meta Cloud API (WhatsApp Business)

**📖 Guida completa**: Vedi **META_WHATSAPP_SETUP.md** per istruzioni dettagliate passo-passo.

**Quick setup**:

1. **Crea account Meta for Developers**: https://developers.facebook.com
2. **Crea Facebook Business Manager**: https://business.facebook.com
3. **Crea App WhatsApp Business**
4. **Aggiungi numero telefono** (o usa numero test)
5. **Genera Access Token permanente** (System User)
6. **Copia credenziali**:
   - Phone Number ID
   - Access Token

**⏱️ Tempo**: 30-60 minuti + approvazione (1-7 giorni)

### Passo 3: Configurare Environment Variables

Aggiungi al file `.env.local`:

```env
# Meta Cloud API - WhatsApp Business (1000 msg GRATIS/mese!)
WHATSAPP_ENABLED=true
META_WHATSAPP_PHONE_NUMBER_ID=123456789012345
META_WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
META_WHATSAPP_API_VERSION=v21.0
```

**Dove trovare i valori**:
- `META_WHATSAPP_PHONE_NUMBER_ID`: Dashboard WhatsApp > Phone Numbers
- `META_WHATSAPP_ACCESS_TOKEN`: Business Manager > System Users (genera token permanente)
- `META_WHATSAPP_API_VERSION`: Lascia v21.0 (o versione più recente)

### Passo 4: Verifica Configurazione

Crea un endpoint di test (opzionale):

```typescript
// src/app/api/test-whatsapp/route.ts
import { NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp/whatsapp';

export async function GET() {
  const status = WhatsAppService.getConfigStatus();
  return NextResponse.json(status);
}
```

## 📱 Funzionamento

### Flow di Invio

1. **Cliente completa ordine/preventivo**
2. **Sistema verifica presenza numero telefono**
3. **Validazione numero** (formato E.164)
4. **Invio parallelo**:
   - ✉️ Email (sempre)
   - 📱 WhatsApp (se numero valido)
5. **Logging risultati**
6. **Fallback graceful** - errori WhatsApp non bloccano il processo

### Esempio Log

```
[WhatsApp] Invio messaggio a +393331234567
[WhatsApp] Messaggio inviato con successo. SID: SM1234567890abcdef
```

### Gestione Errori

Il sistema è progettato con **fallback graceful**:
- Se WhatsApp fallisce, l'ordine viene comunque salvato
- Email continua a essere inviata
- Errori WhatsApp sono loggati ma non bloccanti

## 🔒 RISCHI DI SICUREZZA

### ⚠️ RISCHI CRITICI

#### 1. **Esposizione API Key**

**RISCHIO**: Se le credenziali Twilio vengono esposte, un attaccante può:
- Inviare messaggi illimitati a tuo nome
- Consumare il tuo credito Twilio
- Violare la privacy dei clienti
- Danneggiare la reputazione del brand

**MITIGAZIONI**:
```bash
# ✅ SEMPRE usare .env file (MAI commitare)
# ✅ Aggiungi .env.local al .gitignore
# ✅ Usa variabili d'ambiente server-side SOLO
# ❌ MAI esporre in client-side code
# ❌ MAI pushare su repository pubblici
```

**Controlla .gitignore**:
```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

#### 2. **Rate Limiting e Costi**

**RISCHIO**:
- Attacchi DOS possono consumare migliaia di messaggi
- Costi incontrollati (ogni messaggio WhatsApp costa ~€0.005-0.03)
- Budget Twilio esaurito rapidamente

**MITIGAZIONI**:
```typescript
// Implementa rate limiting per IP/utente
// Esempio: max 5 messaggi per numero/ora

// Imposta budget limits su Twilio Dashboard:
// https://console.twilio.com/billing/limits
```

**Configurazione Twilio Budget**:
1. Console > Account > Notifications
2. Imposta "Monthly spending limit"
3. Configura alert email per 80% threshold

#### 3. **Phone Number Validation Bypass**

**RISCHIO**:
- Numeri falsi/malformati possono causare crash
- Invio a numeri non autorizzati
- Spam accidentale

**MITIGAZIONI**:
```typescript
// ✅ GIÀ IMPLEMENTATO
// - Validazione con libphonenumber-js
// - Formato E.164 obbligatorio
// - Controlli tipo telefono (mobile/fisso)
```

#### 4. **Injection Attacks nei Messaggi**

**RISCHIO**:
- Messaggi con caratteri speciali potrebbero causare problemi
- Potenziale XSS se messaggi visualizzati in admin dashboard

**MITIGAZIONI**:
```typescript
// ✅ GIÀ IMPLEMENTATO
// - Template messaggi controllati
// - Nessun input utente diretto nei messaggi
// - Solo dati validati dal database

// ⚠️ DA IMPLEMENTARE (opzionale)
// - Sanitizzazione nomi clienti
// - Escape caratteri speciali
```

#### 5. **Privacy e GDPR**

**RISCHIO**:
- Violazione privacy se messaggi non autorizzati
- Non conformità GDPR
- Sanzioni fino a €20M o 4% fatturato

**MITIGAZIONI**:
```markdown
✅ REQUISITI LEGALI:
1. Consenso esplicito cliente per WhatsApp
2. Privacy policy aggiornata
3. Opt-out mechanism
4. Data retention policy
5. Logging accessi numero telefono
```

**Esempio Privacy Policy**:
```
Il tuo numero di telefono verrà utilizzato SOLO per:
- Notifiche ordini e spedizioni
- Comunicazioni relative ai tuoi acquisti
- Supporto clienti su tua richiesta

☑️ Accetto di ricevere notifiche WhatsApp (opzionale)
```

#### 6. **Logging Sensibile**

**RISCHIO**:
- Numeri di telefono nei log possono essere esposti
- Compliance GDPR violata

**MITIGAZIONI**:
```typescript
// ❌ EVITARE:
console.log(`Invio a: ${phoneNumber}`);

// ✅ PREFERIRE (offusca numero):
const masked = phoneNumber.slice(0, 3) + '****' + phoneNumber.slice(-3);
console.log(`Invio a: ${masked}`);

// ✅ Usa logging sicuro per produzione
// ✅ Configura log rotation
// ✅ Cripta log sensibili
```

#### 7. **Webhook Security** (Futuro)

Se implementi webhook Twilio per status updates:

**RISCHI**:
- Webhook spoofing
- DOS attacks su endpoint

**MITIGAZIONI**:
```typescript
// Valida webhook signature Twilio
import twilio from 'twilio';

const signature = request.headers['x-twilio-signature'];
const isValid = twilio.validateRequest(
  TWILIO_AUTH_TOKEN,
  signature,
  url,
  params
);
```

### 🛡️ CHECKLIST SICUREZZA

Prima di andare in produzione:

- [ ] ✅ Environment variables configurate correttamente
- [ ] ✅ .env.local in .gitignore
- [ ] ✅ Budget limits impostati su Twilio
- [ ] ✅ Privacy policy aggiornata con clausola WhatsApp
- [ ] ✅ Consenso esplicito per WhatsApp nel checkout
- [ ] ✅ Opt-out mechanism implementato
- [ ] ✅ Rate limiting configurato
- [ ] ✅ Logging sensibile offuscato
- [ ] ✅ Monitoring costi Twilio attivo
- [ ] ✅ Alert email per soglie budget
- [ ] 🔄 Test sandbox completati
- [ ] 🔄 Approved WhatsApp Business Account (produzione)
- [ ] 🔄 Template messaggi approvati da WhatsApp (se richiesto)

## 🧪 Testing

### Test in Sandbox

1. **Attiva Sandbox Twilio** seguendo Passo 2 sopra
2. **Aggiungi numeri test**:
   - Invia "join [code]" al numero sandbox da ogni telefono test
3. **Testa endpoint**:

```bash
# Test conferma ordine
curl -X POST http://localhost:3000/api/save-order \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test_session_id"}'
```

### Verifiche Pre-Produzione

```typescript
// Test validazione telefono
import { validatePhoneNumber } from '@/lib/whatsapp/phone-validator';

const result = validatePhoneNumber('+393331234567');
console.log(result);
// { isValid: true, formattedNumber: '+393331234567', ... }
```

## 📊 Monitoring

### Metriche da Monitorare

1. **Tasso successo invio**
   - Target: >95%
2. **Costi mensili**
   - Alert se >threshold
3. **Errori validazione**
   - Numeri rifiutati
4. **Tempo risposta API**
   - Twilio SLA: <1s

### Dashboard Twilio

Monitora su: https://console.twilio.com/monitor/logs/whatsapp

- Messaggi inviati
- Messaggi falliti
- Costi real-time
- Deliverability rate

## 🔄 Manutenzione

### Aggiornamenti Periodici

```bash
# Aggiorna dipendenze (ogni 3 mesi)
npm update twilio libphonenumber-js
```

### Backup Configurazione

```bash
# Backup .env (in luogo sicuro, criptato)
cp .env.local .env.backup.$(date +%Y%m%d)
gpg -c .env.backup.20240320
```

## 📞 Supporto

### Meta Cloud API Support
- **Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Console**: https://developers.facebook.com
- **Business Manager**: https://business.facebook.com
- **Support**: https://www.facebook.com/business/help
- **WhatsApp Manager**: https://business.facebook.com/wa/manage

### Debug Comune

**Problema**: "Servizio non configurato"
```bash
# Verifica .env.local
cat .env.local | grep META_WHATSAPP
# Deve mostrare Phone Number ID e Access Token
```

**Problema**: "Access token has expired"
```bash
# Soluzione: Genera nuovo permanent token
# Vedi META_WHATSAPP_SETUP.md - Passo 5.2
```

**Problema**: "Numero non valido"
```typescript
// Test validazione
import { validatePhoneNumber } from '@/lib/whatsapp/phone-validator';
validatePhoneNumber('+39333...'); // Verifica formato
```

**Problema**: Messaggi non arrivano
1. Verifica numero destinatario ha WhatsApp installato
2. Controlla Quality Rating su dashboard (deve essere HIGH)
3. Se usi numero test, aggiungi destinatario alla lista numeri consentiti
4. Controlla Meta Cloud API dashboard per errori
5. Verifica access token non scaduto

## 💰 Costi Stimati

### Meta Cloud API Pricing

**🎁 Piano Gratuito**:
- **1000 conversazioni GRATUITE al mese** (per sempre!)
- Una "conversazione" = finestra 24h dopo primo messaggio business-initiated

**Dopo le 1000 conversazioni**:
- **Utility** (ordini, spedizioni): €0.0165/conversazione
- **Authentication** (OTP, 2FA): €0.0083/conversazione
- **Marketing** (promozioni): €0.0479/conversazione

### Stima Costi Mensili

**Nota**: Per ogni ordine vengono inviati **3 messaggi**:
1. Conferma ordine
2. Ordine spedito
3. Ordine consegnato

**Esempio 100 ordini/mese**:
- 100 ordini × 3 msg = 300 messaggi = **GRATIS** 🎉
- **TOTALE: €0/mese** ✅

**Esempio 300 ordini/mese**:
- 300 ordini × 3 msg = 900 messaggi = **GRATIS** 🎉
- **TOTALE: €0/mese** ✅

**Esempio 350 ordini/mese**:
- 350 ordini × 3 msg = 1050 messaggi
- 1000 = GRATIS
- 50 × €0.0165 = **€0.83/mese** ✅

**Esempio 500 ordini/mese**:
- 500 ordini × 3 msg = 1500 messaggi
- 1000 = GRATIS
- 500 × €0.0165 = **€8.25/mese** ✅

**Esempio 1000 ordini/mese**:
- 1000 ordini × 3 msg = 3000 messaggi
- 1000 = GRATIS
- 2000 × €0.0165 = **€33/mese** ✅

**Molto più economico** di SMS (~€150-300/mese per 1000 ordini)!

## ✅ Conclusioni

L'integrazione WhatsApp con Meta Cloud API è:
- 🎁 **GRATUITA** fino a 1000 msg/mese (più che sufficiente per iniziare!)
- ✅ **Economica** anche dopo i 1000 msg (~€0.016/msg vs €0.05-0.10 SMS)
- ✅ **Ufficiale** - direttamente da Meta/Facebook
- ✅ **Sicura** se configurata correttamente
- ✅ **Non invasiva** - fallback graceful
- ⚠️ **Richiede attenzione** a sicurezza, privacy e Quality Rating

**Prossimi passi consigliati**:
1. Seguire guida setup completa (META_WHATSAPP_SETUP.md)
2. Testare con numero test Meta
3. Aggiornare privacy policy con consenso WhatsApp
4. Implementare opt-in checkbox nel checkout/newsletter
5. Richiedere approvazione Display Name
6. Configurare profilo business completo
7. Monitorare Quality Rating (mantieni HIGH!)
8. Impostare budget alert
9. Monitorare utilizzo primi mesi
10. Scalare gradualmente
