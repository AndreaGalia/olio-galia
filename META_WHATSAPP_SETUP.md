# 🎁 Setup Meta Cloud API - WhatsApp Business (1000 msg GRATIS/mese!)

## 📋 Panoramica

Questa guida ti aiuterà a configurare **Meta Cloud API** per inviare messaggi WhatsApp GRATUITI dal tuo e-commerce Olio Galia.

**✅ Vantaggi:**
- 🎁 **1000 conversazioni GRATUITE al mese** (per sempre!)
- 💰 Conversazioni aggiuntive: ~€0.016-0.048
- 🚀 Nessun intermediario (diretto da Meta/Facebook)
- 📊 Dashboard Analytics incluso

**⏱️ Tempo setup:** 30-60 minuti (più approvazione 1-7 giorni)

---

## 🚀 Passo 1: Prerequisiti

Prima di iniziare, assicurati di avere:

- [ ] Account Facebook personale verificato
- [ ] Numero di telefono non già usato per WhatsApp Business
- [ ] Carta di credito (per verifica identità, non verrà addebitato nulla)
- [ ] Accesso email aziendale (opzionale ma consigliato)

---

## 📱 Passo 2: Creare Facebook Business Manager

### 2.1 Accedi a Meta for Developers

1. Vai su: https://developers.facebook.com
2. Clicca **"Get Started"** in alto a destra
3. Accedi con il tuo account Facebook personale
4. Accetta i termini di servizio

### 2.2 Crea un Business Account

Se non hai già un Business Manager:

1. Vai su: https://business.facebook.com
2. Clicca **"Create Account"**
3. Inserisci:
   - Nome business: **"Olio Galia"**
   - Il tuo nome completo
   - Email aziendale (o personale)
4. Conferma email
5. Aggiungi metodo di pagamento (per verifica, non verrà addebitato nulla)

**⚠️ IMPORTANTE**: Se già hai un Business Manager, usalo! Non crearne uno nuovo.

---

## 🔧 Passo 3: Creare App WhatsApp Business

### 3.1 Crea nuova App

1. Vai su: https://developers.facebook.com/apps
2. Clicca **"Create App"**
3. Seleziona tipo app: **"Business"**
4. Clicca **"Next"**

### 3.2 Configura App Details

5. Inserisci:
   - **Display name**: `Olio Galia WhatsApp`
   - **App contact email**: la tua email
   - **Business Account**: seleziona quello creato al Passo 2
6. Clicca **"Create App"**
7. Completa verifica sicurezza (se richiesto)

### 3.3 Aggiungi Prodotto WhatsApp

8. Nella dashboard dell'app, trova **"WhatsApp"**
9. Clicca **"Set up"**
10. Vedrai la schermata di configurazione WhatsApp

---

## 📞 Passo 4: Configurare Numero Telefono

### 4.1 Seleziona Business Account

1. Nella sezione "Step 1: Select a Business Account"
2. Se non ne hai uno, clicca **"Create a Business Account"**
3. Nome: **"Olio Galia WhatsApp Business"**
4. Categoria: **"Food & Beverage"** o **"E-commerce"**
5. Descrizione: **"Vendita olio extravergine di oliva"**

### 4.2 Aggiungi Numero di Telefono

**OPZIONE A: Usa numero test di Meta (per sviluppo)**

1. Meta fornisce un numero test gratuito per sviluppo
2. Nella sezione "Step 2: Add a Phone Number"
3. Clicca **"Use test number provided by Meta"**
4. Salva il numero (es: +1 555...)

**⚠️ LIMITE**: Puoi inviare messaggi solo a 5 numeri preregistrati

**OPZIONE B: Usa il tuo numero aziendale (per produzione)**

1. Clicca **"Add phone number"**
2. Seleziona paese: **Italia (+39)**
3. Inserisci numero: `333 123 4567` (il tuo numero aziendale)
4. Clicca **"Next"**
5. Scegli metodo verifica: **SMS** o **Voice call**
6. Inserisci codice di verifica ricevuto

**⚠️ IMPORTANTE**:
- Il numero NON deve essere già registrato su WhatsApp personale
- Se lo hai, devi disinstallare WhatsApp prima
- Oppure usa un numero nuovo

### 4.3 Copia Phone Number ID

Dopo aver aggiunto il numero:

7. Vedrai **"Phone Number ID"**: `123456789012345`
8. **COPIALO** - ti servirà per il file `.env.local`

```
META_WHATSAPP_PHONE_NUMBER_ID=123456789012345
```

---

## 🔑 Passo 5: Ottenere Access Token

### 5.1 Token Temporaneo (per test iniziali)

1. Nella dashboard WhatsApp, sezione "Step 3: Send messages"
2. Vedrai **"Temporary access token"**
3. Clicca **"Copy"**
4. Valido per **24 ore** (solo per test!)

### 5.2 Token Permanente (per produzione)

**IMPORTANTE**: Per produzione DEVI usare un token permanente!

#### Metodo 1: System User (Consigliato)

1. Vai su: https://business.facebook.com/settings/system-users
2. Clicca **"Add"**
3. Nome: `Olio Galia WhatsApp System User`
4. Ruolo: **Admin**
5. Clicca **"Create System User"**

6. Clicca sul nome del System User appena creato
7. Clicca **"Generate New Token"**
8. Seleziona l'app `Olio Galia WhatsApp` creata prima
9. Seleziona permessi:
   - ☑️ `whatsapp_business_messaging`
   - ☑️ `whatsapp_business_management`
10. Durata: **Never expire** (mai)
11. Clicca **"Generate Token"**
12. **COPIA IL TOKEN** - non lo vedrai mai più!

```
META_WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ SALVA IL TOKEN IN MODO SICURO!**

#### Metodo 2: User Access Token (Alternativo)

Se hai problemi con System User:

1. Vai su: https://developers.facebook.com/tools/explorer
2. Seleziona la tua app in alto
3. In "User or Page", seleziona la tua app
4. Clicca **"Generate Access Token"**
5. Accetta permessi
6. Copia il token

**⚠️ ATTENZIONE**: Questo token scade dopo 60 giorni! Meglio System User.

---

## ⚙️ Passo 6: Configurare .env.local

Ora che hai tutti i dati, crea/modifica il file `.env.local`:

```env
# Meta Cloud API - WhatsApp Business
WHATSAPP_ENABLED=true
META_WHATSAPP_PHONE_NUMBER_ID=123456789012345
META_WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
META_WHATSAPP_API_VERSION=v21.0
```

**Sostituisci**:
- `123456789012345` con il tuo Phone Number ID
- `EAAxxxxxxxxxxxxxxxxxxxxx` con il tuo Access Token

---

## 🧪 Passo 7: Test Setup

### 7.1 Aggiungi Numeri Test (solo con numero test Meta)

Se usi il numero test di Meta:

1. Dashboard WhatsApp > **"To"** section
2. Clicca **"Manage phone number list"**
3. Aggiungi i tuoi numeri di test:
   - Il tuo numero personale
   - Numeri colleghi/amici per test
4. Max 5 numeri

### 7.2 Verifica Configurazione

Crea un file di test: `src/app/api/test-whatsapp/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp/whatsapp';

export async function GET() {
  const status = WhatsAppService.getConfigStatus();

  if (!status.isConfigured) {
    return NextResponse.json({
      error: 'WhatsApp non configurato',
      status,
    }, { status: 500 });
  }

  return NextResponse.json({
    message: 'WhatsApp configurato correttamente! ✅',
    status,
  });
}

// Endpoint per test invio (rimuovi in produzione!)
export async function POST(request: Request) {
  const { phoneNumber } = await request.json();

  const result = await WhatsAppService.sendMessage(
    phoneNumber,
    '🧪 Test messaggio da Olio Galia!\n\nSe ricevi questo, la configurazione funziona! ✅'
  );

  return NextResponse.json(result);
}
```

### 7.3 Testa nel Browser

```bash
# Avvia il server
npm run dev

# Verifica configurazione
# Apri browser: http://localhost:3000/api/test-whatsapp

# Se vedi: "WhatsApp configurato correttamente! ✅" sei pronto!
```

### 7.4 Invia Messaggio Test

```bash
# Sostituisci con il tuo numero (formato E.164)
curl -X POST http://localhost:3000/api/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+393331234567"}'
```

Se ricevi il messaggio su WhatsApp: **🎉 FUNZIONA!**

---

## 🚀 Passo 8: Produzione (Numero Reale)

### 8.1 Verificare Numero Business

Se usi il tuo numero aziendale:

1. Dashboard WhatsApp > Phone Numbers
2. Vedrai il tuo numero con stato **"Connected"** o **"Pending"**
3. Se pending, segui le istruzioni per verifica

### 8.2 Configurare Display Name

1. Dashboard WhatsApp > **"Phone Numbers"**
2. Clicca sul tuo numero
3. **"Display name"**: `Olio Galia`
4. Clicca **"Edit"**
5. Inserisci nome e salva
6. **⚠️ Richiede approvazione Meta** (1-7 giorni)

### 8.3 Configurare Profilo Business

1. **About**: "Olio extravergine di oliva pugliese di alta qualità"
2. **Category**: Food & Beverage
3. **Website**: https://tuosito.com
4. **Email**: info@olio-galia.it
5. **Address**: (tuo indirizzo se hai negozio fisico)
6. **Profile picture**: Logo Olio Galia

### 8.4 Richiedere Approvazione Display Name

Meta deve approvare il nome visualizzato:

1. Clicca **"Submit for review"**
2. Tempo approvazione: 1-7 giorni
3. Riceverai email quando approvato

**Durante l'attesa puoi già inviare messaggi**, ma il nome visualizzato potrebbe essere il numero invece di "Olio Galia".

---

## 📊 Passo 9: Monitoring e Analytics

### 9.1 Dashboard Meta Business

Monitora l'uso su: https://business.facebook.com/wa/manage/home/

- **Messages sent**: Messaggi inviati
- **Conversations**: Conversazioni attive
- **Free tier usage**: Utilizzo piano gratuito (1000/mese)
- **Quality rating**: Qualità messaggi (mantieni ALTA!)

### 9.2 Metriche Importanti

| Metrica | Target | Descrizione |
|---------|--------|-------------|
| **Quality Rating** | HIGH | Se scende a MEDIUM/LOW, rischi ban |
| **Free conversations** | <1000/mese | Messaggi gratuiti rimanenti |
| **Response rate** | >80% | Se cliente risponde, rispondi! |
| **Delivery rate** | >95% | % messaggi consegnati |

### 9.3 Evitare Ban

**🚨 ATTENZIONI**:
- ❌ Non inviare spam
- ❌ Non inviare messaggi a utenti che non hanno dato consenso
- ❌ Non inviare messaggi promozionali non richiesti
- ✅ Invia SOLO notifiche transazionali (ordini, spedizioni)
- ✅ Rispondi velocemente se cliente risponde
- ✅ Offri opt-out facile

**Messaggi OK** (transazionali):
- ✅ Conferma ordine
- ✅ Ordine spedito
- ✅ Ordine consegnato
- ✅ Preventivo richiesto
- ✅ Benvenuto newsletter (SE utente ha accettato)

**Messaggi NON OK** (promozionali):
- ❌ "Offerta speciale solo oggi!"
- ❌ "Scopri i nuovi prodotti"
- ❌ Marketing non richiesto

---

## 💰 Costi e Billing

### Piano Gratuito

- **1000 conversazioni gratuite/mese**
- Una "conversazione" = finestra 24h dopo primo messaggio
- Se cliente risponde, è la stessa conversazione (non conta)

### Dopo le 1000 Conversazioni

Costi per conversazione business-initiated (Italia):

| Tipo | Costo |
|------|-------|
| **Utility** (ordini, spedizioni) | €0.0165 |
| **Authentication** (OTP, 2FA) | €0.0083 |
| **Marketing** (promozioni) | €0.0479 |

**Esempio calcolo**:
- 1000 ordini/mese = GRATIS (nel piano)
- 1500 ordini/mese = 500 × €0.0165 = **€8.25/mese**
- 2000 ordini/mese = 1000 × €0.0165 = **€16.50/mese**

**Molto più economico di SMS!** (€0.05-0.10 cad.)

### Configurare Budget Alert

1. Business Settings > Payments
2. **Payment methods** > Aggiungi carta
3. **Spending limits** > Set limit
4. Esempio: €50/mese
5. Alert al 80%: €40

---

## 🔒 Sicurezza e Best Practices

### Protezione Access Token

```bash
# ✅ SEMPRE in .env.local (NEVER commit!)
# ✅ Verifica .gitignore contenga .env*
# ❌ MAI esporre in client-side code
# ❌ MAI pushare su repository pubblici
```

### Rotate Token Periodicamente

Ogni 3-6 mesi, genera nuovo token:

1. Revoca vecchio token su Business Manager
2. Genera nuovo token (Passo 5.2)
3. Aggiorna `.env.local`
4. Deploy

### Rate Limiting

Implementa rate limiting per evitare abusi:

```typescript
// Max 10 messaggi per utente per ora
// Usa Redis o in-memory cache
```

### GDPR Compliance

**✅ OBBLIGATORIO**:
- Consenso esplicito per WhatsApp
- Privacy policy aggiornata
- Opt-out mechanism
- Data retention policy

---

## 🐛 Troubleshooting

### Errore: "Access token has expired"

**Soluzione**: Genera nuovo permanent token (Passo 5.2)

### Errore: "Phone number not verified"

**Soluzione**: Completa verifica numero (Passo 4.2)

### Errore: "Recipient phone number not in allowed list"

**Soluzione**: Se usi numero test, aggiungi destinatario alla lista (Passo 7.1)

### Messaggio non arriva

**Controlli**:
1. Numero destinatario ha WhatsApp installato?
2. Numero destinatario ha bloccato il tuo numero business?
3. Quality Rating è HIGH? (controlla dashboard)
4. Hai superato rate limit? (80 msg/sec)

### Errore: "Message failed to send"

**Possibili cause**:
- Numero non valido (formato E.164)
- Numero non ha WhatsApp
- Sei bannato (Quality Rating LOW)
- Problemi rete/Meta
- Template messaggio non approvato (se usi template)

**Verifica log**:
```bash
# Controlla console Next.js
# Cerca: [WhatsApp] Errore...
```

### Display Name non appare

**Soluzione**: Attendi approvazione Meta (1-7 giorni). Nel frattempo apparirà il numero.

---

## 📚 Risorse Utili

### Documentazione Ufficiale

- **Meta Cloud API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Getting Started**: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- **Send Messages**: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
- **Message Templates**: https://developers.facebook.com/docs/whatsapp/api/messages/message-templates

### Dashboard e Tools

- **Business Manager**: https://business.facebook.com
- **Developers Console**: https://developers.facebook.com
- **WhatsApp Manager**: https://business.facebook.com/wa/manage
- **API Explorer**: https://developers.facebook.com/tools/explorer

### Supporto

- **Meta Business Support**: https://www.facebook.com/business/help
- **WhatsApp Business API Docs**: https://developers.facebook.com/docs/whatsapp
- **Community Forum**: https://developers.facebook.com/community

---

## ✅ Checklist Finale

Prima di andare in produzione:

- [ ] ✅ Facebook Business Manager creato
- [ ] ✅ App WhatsApp Business creata
- [ ] ✅ Numero telefono verificato
- [ ] ✅ Phone Number ID copiato in .env.local
- [ ] ✅ System User Access Token generato (permanente)
- [ ] ✅ Access Token salvato in .env.local
- [ ] ✅ .env.local in .gitignore
- [ ] ✅ Test messaggio inviato con successo
- [ ] ✅ Display Name configurato (in attesa approvazione)
- [ ] ✅ Profilo Business compilato
- [ ] ✅ Budget alert configurato
- [ ] ✅ Privacy policy aggiornata
- [ ] ✅ Consenso opt-in implementato
- [ ] ✅ Monitoring dashboard configurato

---

## 🎉 Complimenti!

Se hai completato tutti i passi, la tua integrazione WhatsApp Business è **PRONTA**!

Ora puoi inviare notifiche automatiche ai tuoi clienti Olio Galia in modo professionale e **GRATUITO** (fino a 1000 msg/mese)!

**Prossimi passi**:
1. Monitora l'uso per i primi giorni
2. Raccogli feedback dai clienti
3. Ottimizza i template messaggi
4. Quando raggiungi 1000 msg/mese, considera i costi aggiuntivi

**Supporto**: Se hai problemi, rileggi il troubleshooting o contatta Meta Business Support.

---

**Buona fortuna con Olio Galia! 🫒**
