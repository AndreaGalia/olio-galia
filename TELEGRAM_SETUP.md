# 🤖 Configurazione Notifiche Telegram

Questa guida ti aiuterà a configurare le notifiche Telegram per ricevere un messaggio ogni volta che:
- Viene completato un nuovo ordine sul tuo e-commerce
- Un preventivo viene segnato come "Pagato" nel pannello admin

## 📋 Prerequisiti

- Un account Telegram
- L'app Telegram installata sul tuo dispositivo

## 🔧 Passo 1: Creare un Bot Telegram

1. Apri Telegram e cerca **@BotFather**
2. Avvia una conversazione con `/start`
3. Invia il comando `/newbot`
4. Scegli un nome per il tuo bot (es. "Olio Galia Notifiche")
5. Scegli un username per il bot (deve finire con "bot", es. "olio_galia_notifiche_bot")
6. **Salva il token** che ricevi (formato: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 🆔 Passo 2: Ottenere il tuo Chat ID

### Opzione A: Usa un bot helper

1. Cerca **@userinfobot** su Telegram
2. Avvia una conversazione con `/start`
3. Il bot ti invierà il tuo **Chat ID** (un numero come `123456789`)

### Opzione B: Metodo manuale

1. Invia un messaggio al tuo bot (quello creato con BotFather)
2. Visita questo URL nel browser (sostituisci `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. Cerca il campo `"chat":{"id":123456789}` nella risposta JSON
4. Quel numero è il tuo **Chat ID**

## ⚙️ Passo 3: Configurare le Variabili d'Ambiente

Aggiungi queste variabili al tuo file `.env.local` (o `.env`):

### Configurazione Base (Un solo utente)

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Base URL del tuo sito (per il link diretto all'ordine)
NEXT_PUBLIC_SITE_URL=https://tuosito.com
```

### Configurazione Multi-Utente (Team) 👥

Se vuoi che **più persone ricevano le notifiche** (es. tu + dipendenti), puoi aggiungere **multipli CHAT_ID separati da virgola**:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789,987654321,555666777

# Base URL del tuo sito (per il link diretto all'ordine)
NEXT_PUBLIC_SITE_URL=https://tuosito.com
```

**In questo esempio:**
- L'utente con CHAT_ID `123456789` riceverà le notifiche (es. il proprietario)
- L'utente con CHAT_ID `987654321` riceverà le notifiche (es. responsabile vendite)
- L'utente con CHAT_ID `555666777` riceverà le notifiche (es. magazziniere)

**Note importanti:**
- Non aggiungere spazi tra i CHAT_ID (oppure verranno automaticamente rimossi)
- Ogni persona deve:
  1. Trovare il bot su Telegram
  2. Premere "Start" per abilitare la ricezione
  3. Ottenere il proprio CHAT_ID (usando `@userinfobot`)
- La variabile `NEXT_PUBLIC_SITE_URL` (o `NEXT_PUBLIC_BASE_URL`) è necessaria per generare il link cliccabile che porta direttamente all'ordine nel pannello admin

## 🧪 Passo 4: Testare la Configurazione (Opzionale)

Puoi creare un endpoint di test per verificare che tutto funzioni:

```typescript
// src/app/api/test-telegram/route.ts
import { NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/telegram';

export async function GET() {
  const isConnected = await TelegramService.testConnection();

  if (isConnected) {
    return NextResponse.json({ success: true, message: 'Telegram configurato correttamente!' });
  }

  return NextResponse.json(
    { success: false, message: 'Errore nella configurazione Telegram' },
    { status: 500 }
  );
}
```

Visita `http://localhost:3000/api/test-telegram` per testare.

## 📱 Formato dei Messaggi

### 🛒 Nuovo Ordine Completato

Quando ricevi un ordine dal negozio online, il messaggio avrà questo formato:

```
🛒 NUOVO ORDINE RICEVUTO! 🛒

📋 Ordine: #ABC12345
📅 Data: 30/10/2025, 14:30

👤 Cliente:
  • Nome: Mario Rossi
  • Email: mario.rossi@email.com
  • Telefono: +39 123 456 7890

📦 Prodotti:
  1. Olio Extra Vergine 500ml x2 - €24.00
  2. Olio Biologico 1L x1 - €18.00

📍 Indirizzo di spedizione:
Via Roma 123, Milano, 20100, Italia

💰 Totale:
  • Subtotale: €42.00
  • Spedizione: €5.00
  • TOTALE: €47.00

🔗 Visualizza ordine nel pannello admin
```

### 💰 Preventivo Pagato

Quando segni un preventivo come "Pagato" nel pannello admin, riceverai questo messaggio:

```
💰 PREVENTIVO PAGATO! 💰

📋 Preventivo: #XYZ98765
📅 Data pagamento: 30/10/2025, 15:45

👤 Cliente:
  • Nome: Giovanni Bianchi
  • Email: giovanni.bianchi@email.com
  • Telefono: +39 987 654 3210

📦 Prodotti:
  1. Olio Extra Vergine 1L x5 - €90.00
  2. Olio Biologico 500ml x3 - €45.00

📍 Indirizzo di spedizione:
Via Milano 45, Roma, RM

💰 Totale:
  • Subtotale: €135.00
  • Spedizione: €8.00
  • TOTALE: €143.00

🔗 Visualizza preventivo nel pannello admin
```

**I link sono cliccabili** e ti portano direttamente alla pagina di dettaglio nel pannello amministrativo!

## ❓ Troubleshooting

### Non ricevo notifiche

1. Verifica che le variabili d'ambiente siano configurate correttamente
2. Assicurati di aver avviato una conversazione con il tuo bot (cerca il bot e premi "Start")
3. Controlla i log del server per eventuali errori
4. Se usi multipli CHAT_ID, verifica che siano separati da virgola senza spazi extra

### Solo alcuni utenti ricevono le notifiche (Multi-utente)

1. Controlla i log del server: vedrai messaggi tipo `⚠️ Notifica Telegram inviata a 2/3 utenti`
2. Ogni utente deve aver premuto "Start" sul bot su Telegram
3. Verifica che i CHAT_ID nel `.env` siano corretti

### Errore "Chat not found"

- Devi prima avviare una conversazione con il bot su Telegram prima di poter ricevere messaggi
- Ogni persona nel team deve fare questo passaggio

### Errore "Unauthorized"

- Verifica che il token del bot sia corretto
- Il token potrebbe essere stato rigenerato, in tal caso usa il nuovo token da BotFather

## 🔒 Sicurezza

- **NON condividere** il token del bot con nessuno
- **NON committare** il file `.env` nel repository Git
- Aggiungi `.env` al file `.gitignore`

## 📚 Riferimenti

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [BotFather Commands](https://core.telegram.org/bots#botfather)

---

✅ Una volta configurato, riceverai automaticamente una notifica Telegram per ogni nuovo ordine completato!
