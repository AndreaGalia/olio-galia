# Oracle Cloud Free Tier - Setup WAHA per Olio Galia

Guida completa per deployare WAHA su Oracle Cloud Free Tier (gratis per sempre).

## Vantaggi Oracle Cloud Free Tier

- ✅ **Completamente gratuito per sempre** (non scade mai)
- ✅ VM con 1GB RAM + 1 CPU ARM o AMD
- ✅ 10GB storage + 10TB bandwidth/mese
- ✅ WAHA sempre attivo 24/7
- ✅ Nessuna limitazione di uptime
- ✅ Sessioni WhatsApp persistenti (non devi riscansionare QR)

---

## FASE 1: Creazione Account Oracle Cloud (5 minuti)

### Passo 1: Registrati

1. Vai su **https://www.oracle.com/cloud/free/**
2. Clicca **Start for free** o **Sign up**
3. Compila il form:
   - **Country**: Italy
   - **Email**: Il tuo email
   - **Nome e Cognome**
4. Clicca **Verify my email**
5. Controlla la tua email e clicca sul link di verifica

### Passo 2: Completa Registrazione

Dopo aver verificato l'email:

1. Scegli **Cloud Account Name** (es. `oliogalia` o il tuo nome)
2. Scegli **Home Region**:
   - **Germany Central (Frankfurt)** - Più vicino all'Italia
   - Oppure **UK South (London)**
   - ⚠️ **IMPORTANTE**: Non puoi cambiare region dopo!
3. Clicca **Continue**

### Passo 3: Verifica Account

Oracle richiede carta di credito per verifica (NON addebita):

1. Inserisci i dati della carta
2. Vedrai un'autorizzazione di €0-1 (poi rilasciata)
3. Inserisci indirizzo di fatturazione
4. Accetta i termini
5. Clicca **Start my free trial**

⏱️ L'account sarà attivo in 1-2 minuti.

---

## FASE 2: Creazione VM (Compute Instance) (5 minuti)

### Passo 1: Accedi alla Console

1. Login su **https://cloud.oracle.com**
2. Vedrai la **OCI Console** (dashboard)

### Passo 2: Crea una VM

1. Menu hamburger (☰) in alto a sinistra
2. **Compute** → **Instances**
3. Clicca **Create Instance**

### Passo 3: Configura la VM

**Nome:**
```
waha-oliogalia
```

**Placement:**
- Lascia default (Availability Domain)

**Image and Shape:**

1. Clicca **Change Image**
   - Seleziona **Canonical Ubuntu** (22.04 o 24.04)
   - Clicca **Select Image**

2. Clicca **Change Shape**
   - Seleziona **VM.Standard.E2.1.Micro** (Always Free eligible)
   - Specs: 1 core AMD EPYC, 1GB RAM, 0.48 Gbps network
   - Clicca **Select Shape**

**Networking:**

- Lascia **Create new virtual cloud network** (default)
- Nome VCN: Lascia default o metti `waha-vcn`
- ✅ **Assign a public IPv4 address** - Deve essere spuntato!

**Add SSH keys:**

⚠️ **IMPORTANTE**: Devi scegliere come accedere alla VM.

**Opzione A - Genera chiavi (più facile):**
1. Seleziona **Generate a key pair for me**
2. Clicca **Save Private Key** - Scarica il file `.key`
3. Clicca **Save Public Key** - Scarica anche questo
4. **Salva questi file in un posto sicuro!**

**Opzione B - Usa le tue chiavi SSH:**
1. Se hai già chiavi SSH, seleziona **Upload public key files**
2. Carica la tua chiave pubblica

**Boot Volume:**
- Lascia default (50GB è sufficiente)

### Passo 4: Crea la VM

1. Clicca **Create** (in fondo alla pagina)
2. La VM inizierà a provisioning (arancione)
3. Dopo 1-2 minuti diventerà **RUNNING** (verde)

### Passo 5: Annota l'IP Pubblico

1. Nella pagina Instance Details, trovi:
   ```
   Public IP address: 123.456.789.10
   ```
2. **Copialo** - Ti servirà per connetterti

---

## FASE 3: Configurazione Firewall Oracle (3 minuti)

Oracle blocca tutto il traffico in entrata per default. Devi aprire la porta 3000 per WAHA.

### Passo 1: Apri Security List

1. Sulla pagina della tua VM, scorri fino a **Primary VNIC**
2. Clicca sul nome della **Subnet** (es. `subnet-xxxxxx`)
3. Nella nuova pagina, clicca su **Default Security List for vcn-xxxxx**

### Passo 2: Aggiungi Regola Ingress per WAHA

1. Clicca **Add Ingress Rules**
2. Compila:
   ```
   Source Type: CIDR
   Source CIDR: 0.0.0.0/0
   IP Protocol: TCP
   Source Port Range: (lascia vuoto)
   Destination Port Range: 3000
   Description: WAHA HTTP API
   ```
3. Clicca **Add Ingress Rules**

### Passo 3: Verifica Regola SSH (dovrebbe esserci già)

Verifica che ci sia una regola per porta 22. Se non c'è:

1. Clicca **Add Ingress Rules**
2. Compila:
   ```
   Source CIDR: 0.0.0.0/0
   IP Protocol: TCP
   Destination Port Range: 22
   Description: SSH Access
   ```
3. Clicca **Add Ingress Rules**

---

## FASE 4: Connettiti alla VM via SSH (2 minuti)

### Su Windows (PowerShell o CMD):

1. Apri PowerShell o CMD
2. Vai nella cartella dove hai salvato la chiave privata:
   ```powershell
   cd C:\Users\TuoNome\Downloads
   ```

3. Cambia i permessi della chiave (solo la prima volta):
   ```powershell
   icacls ssh-key-*.key /inheritance:r
   icacls ssh-key-*.key /grant:r "%USERNAME%:R"
   ```

4. Connettiti:
   ```bash
   ssh -i ssh-key-2024-12-04.key ubuntu@123.456.789.10
   ```
   (Sostituisci `123.456.789.10` con il TUO IP pubblico)

5. Quando chiede "Are you sure?", scrivi `yes`

✅ Dovresti essere dentro la VM!

### Su Linux/Mac:

```bash
chmod 600 ~/Downloads/ssh-key-*.key
ssh -i ~/Downloads/ssh-key-*.key ubuntu@123.456.789.10
```

---

## FASE 5: Setup WAHA sulla VM (5 minuti)

Ora sei dentro la VM Ubuntu. Procedi con l'installazione:

### Passo 1: Aggiorna il Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### Passo 2: Installa Docker

```bash
# Installa prerequisiti
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Aggiungi Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Aggiungi repository Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installa Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Avvia Docker
sudo systemctl start docker
sudo systemctl enable docker

# Aggiungi utente al gruppo docker
sudo usermod -aG docker ubuntu

# Applica il gruppo (o fai logout/login)
newgrp docker

# Verifica installazione
docker --version
docker compose version
```

### Passo 3: Crea Cartella per WAHA

```bash
mkdir -p ~/waha-oliogalia
cd ~/waha-oliogalia
```

### Passo 4: Crea docker-compose.yml

```bash
nano docker-compose.yml
```

Incolla questo contenuto:

```yaml
version: '3.8'

services:
  waha:
    image: devlikeapro/waha:latest
    container_name: waha-oliogalia
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - waha-sessions:/app/sessions
      - waha-media:/app/.sessions
    environment:
      - WAHA_LOG_LEVEL=info
      - WAHA_PRINT_QR=true
      - WAHA_APPS_ENABLED=false
    networks:
      - waha-network

volumes:
  waha-sessions:
    driver: local
  waha-media:
    driver: local

networks:
  waha-network:
    driver: bridge
```

**Salva il file:**
- Premi `Ctrl + X`
- Premi `Y` (yes)
- Premi `Enter`

### Passo 5: Avvia WAHA

```bash
docker compose up -d
```

Vedrai:
```
[+] Running 4/4
 ✔ Network waha-oliogalia_waha-network  Created
 ✔ Volume "waha-oliogalia_waha-sessions"  Created
 ✔ Volume "waha-oliogalia_waha-media"  Created
 ✔ Container waha-oliogalia  Started
```

### Passo 6: Verifica che WAHA sia Running

```bash
docker ps
```

Dovresti vedere:
```
CONTAINER ID   IMAGE                       STATUS         PORTS
abc123def456   devlikeapro/waha:latest    Up 30 seconds  0.0.0.0:3000->3000/tcp
```

### Passo 7: Visualizza i Logs (per vedere il QR Code)

```bash
docker compose logs -f waha
```

Vedrai il QR code ASCII nei log dopo ~30 secondi!

**Per uscire dai logs:** Premi `Ctrl + C`

---

## FASE 6: Configura Firewall sulla VM (1 minuto)

Ubuntu potrebbe avere UFW (firewall) attivo:

```bash
# Verifica se UFW è attivo
sudo ufw status

# Se è attivo, apri la porta 3000
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
```

Se UFW è inattivo, non serve fare nulla.

---

## FASE 7: Accedi alla Dashboard WAHA (2 minuti)

### Dal tuo PC, apri il browser:

```
http://123.456.789.10:3000/dashboard
```

(Sostituisci con il TUO IP pubblico)

Dovresti vedere la **Dashboard di WAHA**! 🎉

---

## FASE 8: Connetti WhatsApp (2 minuti)

### Nella Dashboard:

1. Clicca su **"Start"** sulla sessione `default` (o crea nuova sessione)
2. Vedrai un **QR Code grande**

### Sul Telefono:

1. Apri **WhatsApp Business**
2. Menu → **Dispositivi collegati**
3. **Collega un dispositivo**
4. Scansiona il QR code

✅ Dopo 5-10 secondi, vedrai **Status: WORKING**!

---

## FASE 9: Configura Olio Galia (2 minuti)

### Nel pannello admin di Olio Galia:

1. Vai su `/admin/settings`
2. **Abilita WhatsApp** (toggle ON)
3. **URL API WAHA:**
   ```
   http://123.456.789.10:3000
   ```
   (usa il TUO IP pubblico)

4. **Nome Sessione:**
   ```
   default
   ```

5. Clicca **"Verifica Stato"** → Dovrebbe mostrare ✅ Connesso

6. **Invia messaggio di test** al tuo numero

7. Clicca **"Salva Impostazioni"**

---

## 🎉 COMPLETATO!

Ora hai:
- ✅ Oracle Cloud VM gratuita (per sempre!)
- ✅ WAHA installato e funzionante 24/7
- ✅ WhatsApp collegato
- ✅ Olio Galia configurato per inviare messaggi automatici
- ✅ Sessioni WhatsApp persistenti (non devi riscansionare QR)

---

## 🔧 Comandi Utili

### SSH nella VM

```bash
ssh -i path/to/ssh-key.key ubuntu@123.456.789.10
```

### Gestione WAHA

```bash
# Entra nella cartella WAHA
cd ~/waha-oliogalia

# Visualizza logs in tempo reale
docker compose logs -f waha

# Ferma WAHA
docker compose stop

# Avvia WAHA
docker compose start

# Riavvia WAHA
docker compose restart

# Aggiorna WAHA all'ultima versione
docker compose pull
docker compose up -d

# Verifica stato container
docker ps

# Rimuovi tutto (ATTENZIONE: perdi le sessioni!)
docker compose down -v
```

### Gestione VM

```bash
# Verifica spazio disco
df -h

# Verifica uso RAM
free -h

# Verifica processi
top

# Riavvia VM (dalla console Oracle o via SSH)
sudo reboot
```

---

## 🌐 Setup Dominio (Opzionale)

Se vuoi usare un dominio invece dell'IP:

### Passo 1: Configura DNS

1. Compra un dominio (o usa uno esistente)
2. Crea un record DNS A:
   ```
   Tipo: A
   Nome: waha
   Valore: 123.456.789.10
   TTL: 3600
   ```

3. Aspetta propagazione DNS (5-30 minuti)

### Passo 2: Testa il Dominio

```bash
# Verifica che il dominio punti all'IP corretto
nslookup waha.tuodominio.com
```

### Passo 3: Usa il Dominio in Olio Galia

Nel pannello admin, usa:
```
http://waha.tuodominio.com:3000
```

### (Opzionale) Setup HTTPS con Let's Encrypt

Se vuoi HTTPS (consigliato per produzione):

1. Installa Nginx sulla VM
2. Configura reverse proxy per WAHA
3. Installa Certbot per SSL gratuito
4. Usa `https://waha.tuodominio.com` (porta 443)

Guida completa: https://certbot.eff.org/

---

## 🐛 Troubleshooting

### Non riesco a connettermi via SSH

**Problema:** `Connection refused` o `Permission denied`

**Soluzioni:**
1. Verifica che l'IP pubblico sia corretto
2. Verifica che la chiave SSH sia corretta
3. Verifica permessi chiave:
   ```bash
   chmod 600 path/to/key.key
   ```
4. Prova con username `ubuntu` (non `root`)

### Non riesco ad accedere a http://IP:3000

**Problema:** Timeout o connessione rifiutata

**Soluzioni:**
1. Verifica che WAHA sia running: `docker ps`
2. Verifica firewall Oracle (Security List - porta 3000 aperta)
3. Verifica UFW sulla VM: `sudo ufw status`
4. Verifica logs WAHA: `docker compose logs waha`

### WAHA continua a crashare

**Problema:** Container si riavvia continuamente

**Soluzioni:**
1. Verifica logs: `docker compose logs waha`
2. Verifica RAM disponibile: `free -h`
3. Se poca RAM, prova a usare shape ARM (E2.1.Micro ARM ha più RAM)
4. Riavvia container: `docker compose restart`

### QR Code non appare

**Problema:** Nei logs non vedo il QR code

**Soluzioni:**
1. Aspetta 60 secondi dopo l'avvio
2. Verifica variabile `WAHA_PRINT_QR=true`
3. Accedi alla dashboard web: `http://IP:3000/dashboard`
4. Crea una nuova sessione manualmente dalla dashboard

### WhatsApp si disconnette spesso

**Problema:** Devo riscansionare QR frequentemente

**Soluzioni:**
1. Verifica che i volumi siano persistenti: `docker volume ls`
2. Non fare `docker compose down -v` (cancella volumi)
3. Usa solo `docker compose restart` per riavviare
4. Verifica che WhatsApp Business sia aggiornato sul telefono

---

## 📚 Risorse Utili

- **WAHA Documentazione**: https://waha.devlike.pro/
- **Oracle Cloud Docs**: https://docs.oracle.com/en-us/iaas/
- **Docker Docs**: https://docs.docker.com/
- **Olio Galia - WAHA Integration**: Vedi `WAHA_INTEGRATION.md` nella root del progetto

---

## 💰 Costi

**Oracle Cloud Free Tier:**
- ✅ **0€/mese per sempre**
- Include: 1 VM, 10GB storage, 10TB bandwidth/mese
- Non richiede upgrade, non scade mai

**Confronto con alternative:**
- Render: $0 (ma si addormenta) o $7/mese
- Railway: $5/mese minimo
- DigitalOcean: $6/mese
- Contabo: €4/mese

**Oracle Cloud = Miglior rapporto qualità/prezzo (gratis!)** 🎉

---

## 🔐 Sicurezza

### Consigli di Sicurezza

1. **Cambia porta SSH (opzionale):**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Cambia Port 22 → Port 2222
   sudo systemctl restart sshd
   ```

2. **Disabilita login root:**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # PermitRootLogin no
   sudo systemctl restart sshd
   ```

3. **Abilita firewall:**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 3000/tcp
   ```

4. **Aggiungi API Key a WAHA (produzione):**

   Nel `docker-compose.yml`:
   ```yaml
   environment:
     - WAHA_API_KEY=il-tuo-secret-super-sicuro-123
     - WAHA_API_KEY_PLAIN=il-tuo-secret-super-sicuro-123
   ```

   Poi aggiorna `wahaService.ts` per includere l'API key negli header.

5. **Backup regolari:**
   ```bash
   # Backup volumi Docker
   docker run --rm -v waha-oliogalia_waha-sessions:/data -v $(pwd):/backup ubuntu tar czf /backup/waha-backup.tar.gz /data
   ```

---

**Setup completato! Buon lavoro con Olio Galia! 🚀**
