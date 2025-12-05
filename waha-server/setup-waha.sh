#!/bin/bash

###############################################################################
# Script Setup Automatico WAHA per Olio Galia
#
# Questo script installa e configura WAHA (WhatsApp HTTP API) su un server
# Ubuntu/Debian con Docker e Docker Compose.
#
# Uso:
#   chmod +x setup-waha.sh
#   ./setup-waha.sh
###############################################################################

set -e  # Exit on error

echo "======================================"
echo "  WAHA Setup per Olio Galia"
echo "======================================"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 1. Verifica sistema operativo
print_info "Verifico sistema operativo..."
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_error "Questo script funziona solo su Linux (Ubuntu/Debian)"
    exit 1
fi
print_success "Sistema operativo supportato"

# 2. Aggiorna sistema
print_info "Aggiorno pacchetti sistema..."
sudo apt-get update -qq
print_success "Pacchetti aggiornati"

# 3. Installa Docker se non presente
if ! command -v docker &> /dev/null; then
    print_info "Docker non trovato. Installo Docker..."

    # Installa prerequisiti
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    # Aggiungi Docker GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Setup repository Docker
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Installa Docker Engine
    sudo apt-get update -qq
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Aggiungi utente corrente al gruppo docker
    sudo usermod -aG docker $USER

    print_success "Docker installato con successo"
else
    print_success "Docker già installato"
fi

# 4. Verifica Docker Compose
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose non trovato"
    exit 1
fi
print_success "Docker Compose disponibile"

# 5. Crea directory per WAHA
WAHA_DIR="$HOME/waha-oliogalia"
print_info "Creo directory $WAHA_DIR..."
mkdir -p "$WAHA_DIR"
cd "$WAHA_DIR"
print_success "Directory creata"

# 6. Scarica docker-compose.yml se non esiste
if [ ! -f "docker-compose.yml" ]; then
    print_info "Creo docker-compose.yml..."

    cat > docker-compose.yml << 'EOF'
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
      - WAHA_PRINT_QR=True
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
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
EOF
    print_success "docker-compose.yml creato"
else
    print_success "docker-compose.yml già esistente"
fi

# 7. Avvia WAHA
print_info "Avvio WAHA container..."
docker compose pull
docker compose up -d
print_success "WAHA avviato"

# 8. Attendi che WAHA sia pronto
print_info "Attendo che WAHA sia pronto (30 secondi)..."
sleep 30

# 9. Verifica stato
if docker ps | grep -q "waha-oliogalia"; then
    print_success "WAHA è in esecuzione!"
else
    print_error "WAHA non è in esecuzione. Verifica i log con: docker compose logs"
    exit 1
fi

# 10. Configura firewall (UFW)
if command -v ufw &> /dev/null; then
    print_info "Configuro firewall UFW..."
    sudo ufw allow 3000/tcp comment "WAHA HTTP API"
    print_success "Firewall configurato"
fi

# 11. Istruzioni finali
echo ""
echo "======================================"
echo "  ✓ Setup Completato!"
echo "======================================"
echo ""
print_info "WAHA è accessibile su: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
print_info "Prossimi passi:"
echo "  1. Visita http://your-server-ip:3000/dashboard"
echo "  2. Crea una nuova sessione (es. 'olio-galia')"
echo "  3. Scansiona il QR code con WhatsApp Business"
echo "  4. Configura l'URL WAHA nel tuo .env di Next.js:"
echo "     WAHA_API_URL=http://your-server-ip:3000"
echo "     WAHA_SESSION=olio-galia"
echo ""
print_info "Comandi utili:"
echo "  - Visualizza logs: docker compose logs -f"
echo "  - Ferma WAHA: docker compose stop"
echo "  - Avvia WAHA: docker compose start"
echo "  - Riavvia WAHA: docker compose restart"
echo "  - Rimuovi WAHA: docker compose down"
echo ""
print_success "Installazione completata! 🎉"
