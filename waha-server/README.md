# 📱 WAHA Server Setup - Olio Galia

Guida completa per il deployment di WAHA (WhatsApp HTTP API) su server per il progetto Olio Galia.

## 📋 Requisiti

- **Server**: VPS Ubuntu 22.04 LTS o Debian 11+
- **RAM**: Minimo 1GB (consigliato 2GB)
- **Storage**: 10GB disponibili
- **Porte**: Porta 3000 aperta (HTTP)
- **Numero WhatsApp**: Business o personale per collegare WAHA

## 🚀 Installazione Rapida

### Metodo 1: Script Automatico (Consigliato)

```bash
# 1. Scarica lo script
curl -O https://raw.githubusercontent.com/your-repo/setup-waha.sh

# 2. Dai permessi di esecuzione
chmod +x setup-waha.sh

# 3. Esegui lo script
./setup-waha.sh
```

Lo script automaticamente:
- Installa Docker e Docker Compose
- Configura WAHA
- Avvia il container
- Configura il firewall

### Metodo 2: Installazione Manuale

#### Passo 1: Installa Docker

```bash
# Aggiorna pacchetti
sudo apt update && sudo apt upgrade -y

# Installa Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Aggiungi utente al gruppo docker
sudo usermod -aG docker $USER

# Ricarica sessione
newgrp docker
```

#### Passo 2: Crea directory e file

```bash
# Crea directory
mkdir -p ~/waha-oliogalia
cd ~/waha-oliogalia

# Copia il file docker-compose.yml in questa directory
# (Puoi usare il file incluso in questa cartella)
```

#### Passo 3: Avvia WAHA

```bash
# Pull dell'immagine Docker
docker compose pull

# Avvia il container
docker compose up -d

# Verifica che sia in esecuzione
docker ps
```

## 🔗 Connessione WhatsApp

### 1. Accedi alla Dashboard

Apri nel browser:
```
http://your-server-ip:3000
```

### 2. Crea Sessione

1. Vai su `/api/sessions` nella dashboard
2. Clicca "Create Session"
3. Nome sessione: `olio-galia`
4. Clicca "Create"

### 3. Scansiona QR Code

1. Vai su `/api/sessions/olio-galia/qrcode`
2. Scansiona il QR code con WhatsApp:
   - Apri WhatsApp sul telefono
   - Vai su Impostazioni → Dispositivi collegati
   - Tocca "Collega un dispositivo"
   - Scansiona il QR code visualizzato

### 4. Verifica Connessione

```bash
# Controlla lo stato della sessione
curl http://your-server-ip:3000/api/sessions/olio-galia

# Risposta attesa:
{
  "name": "olio-galia",
  "status": "WORKING"
}
```

## ⚙️ Configurazione Next.js

### 1. Aggiungi Variabili Environment

Nel tuo progetto Next.js, aggiungi al file `.env.local` (o `.env.production`):

```env
# WAHA Configuration
WAHA_API_URL=http://your-server-ip:3000
WAHA_SESSION=olio-galia
```

Se WAHA è su server pubblico, usa HTTPS con reverse proxy (vedi sotto).

### 2. Inizializza Configurazione WhatsApp

Accedi al pannello admin di Olio Galia:

1. Vai su `/admin/settings`
2. Sezione "WhatsApp Notifications"
3. Abilita WhatsApp
4. Configura:
   - **API URL**: `http://your-server-ip:3000`
   - **Session**: `olio-galia`
5. Abilita le notifiche desiderate:
   - ✅ Conferma ordine
   - ✅ Aggiornamento spedizione
   - ✅ Conferma consegna
   - ✅ Richiesta recensione
6. Salva configurazione
7. Testa invio con il bottone "Test WhatsApp"

## 🔒 Sicurezza (Produzione)

### Reverse Proxy con Nginx + SSL

#### 1. Installa Nginx e Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

#### 2. Configura Nginx

Crea file `/etc/nginx/sites-available/waha`:

```nginx
server {
    listen 80;
    server_name waha.tuosito.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. Abilita e ottieni SSL

```bash
# Abilita configurazione
sudo ln -s /etc/nginx/sites-available/waha /etc/nginx/sites-enabled/

# Test configurazione
sudo nginx -t

# Riavvia Nginx
sudo systemctl reload nginx

# Ottieni certificato SSL gratuito
sudo certbot --nginx -d waha.tuosito.com
```

#### 4. Aggiorna .env con HTTPS

```env
WAHA_API_URL=https://waha.tuosito.com
```

## 📊 Monitoraggio

### Visualizza Logs

```bash
# Logs in tempo reale
docker compose logs -f

# Ultimi 100 log
docker compose logs --tail=100

# Logs di oggi
docker compose logs --since $(date +%Y-%m-%d)
```

### Verifica Stato

```bash
# Stato container
docker ps

# Statistiche risorse
docker stats waha-oliogalia

# Health check
curl http://localhost:3000/api/health
```

## 🛠️ Comandi Utili

### Gestione Container

```bash
# Avvia WAHA
docker compose start

# Ferma WAHA
docker compose stop

# Riavvia WAHA
docker compose restart

# Ferma e rimuovi (mantiene dati)
docker compose down

# Ferma e rimuovi tutto (CANCELLA DATI!)
docker compose down -v
```

### Backup Sessioni

```bash
# Backup volume sessioni
docker run --rm -v waha-sessions:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/waha-sessions-backup-$(date +%Y%m%d).tar.gz /data

# Restore backup
docker run --rm -v waha-sessions:/data -v $(pwd):/backup \
  ubuntu bash -c "cd /data && tar xzf /backup/waha-sessions-backup-YYYYMMDD.tar.gz --strip 1"
```

### Aggiornamento WAHA

```bash
cd ~/waha-oliogalia

# Pull nuova versione
docker compose pull

# Ricrea container con nuova immagine
docker compose up -d
```

## 🐛 Troubleshooting

### WAHA non si avvia

```bash
# Controlla logs per errori
docker compose logs

# Verifica porte disponibili
sudo netstat -tulpn | grep 3000

# Ricrea container
docker compose down
docker compose up -d
```

### QR Code non appare

```bash
# Verifica env WAHA_PRINT_QR
docker compose exec waha env | grep WAHA_PRINT_QR

# Controlla logs
docker compose logs | grep -i qr
```

### Sessione si disconnette

- WhatsApp chiuso sul telefono per più di 14 giorni
- Telefono senza internet prolungato
- Troppe sessioni collegate

**Soluzione**: Scansiona nuovamente il QR code.

### Messaggi non vengono inviati

```bash
# Test API manualmente
curl -X POST http://localhost:3000/api/sendText \
  -H "Content-Type: application/json" \
  -d '{
    "session": "olio-galia",
    "chatId": "393331234567@c.us",
    "text": "Test message"
  }'

# Verifica stato sessione
curl http://localhost:3000/api/sessions/olio-galia
```

## 📚 Risorse

- **WAHA Docs**: https://waha.devlike.pro/
- **GitHub**: https://github.com/devlikeapro/waha
- **API Reference**: https://waha.devlike.pro/docs/how-to/send-messages/

## 🆘 Supporto

Per problemi tecnici:
1. Controlla i logs: `docker compose logs`
2. Verifica stato sessione: `curl http://localhost:3000/api/sessions/olio-galia`
3. Consulta documentazione WAHA ufficiale
4. Apri issue su GitHub del progetto

---

**Note**: Questa configurazione è per ambiente di produzione. Per testing locale, puoi eseguire WAHA sulla tua macchina con `docker run -it -p 3000:3000 devlikeapro/waha`.
