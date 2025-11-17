#!/bin/bash

# Archivia - Script d'installation pour développeurs
# Ce script configure l'environnement de développement complet

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Vérifier la version de Node.js
check_node() {
    info "Vérification de Node.js..."

    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé. Veuillez installer Node.js 18+ depuis https://nodejs.org/"
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js 18+ requis. Version actuelle: $(node -v)"
    fi

    success "Node.js $(node -v) détecté"
}

# Vérifier pnpm
check_pnpm() {
    info "Vérification de pnpm..."

    if ! command -v pnpm &> /dev/null; then
        warning "pnpm n'est pas installé. Installation en cours..."
        npm install -g pnpm
        if [ $? -ne 0 ]; then
            error "Échec de l'installation de pnpm"
        fi
    fi

    success "pnpm $(pnpm -v) détecté"
}

# Installer les dépendances
install_dependencies() {
    info "Installation des dépendances (cela peut prendre quelques minutes)..."

    pnpm install

    if [ $? -ne 0 ]; then
        error "Échec de l'installation des dépendances"
    fi

    success "Dépendances installées avec succès"
}

# Compiler better-sqlite3 (module natif)
build_native_modules() {
    info "Compilation des modules natifs..."

    # Vérifier si les outils de compilation sont disponibles
    if ! command -v gcc &> /dev/null; then
        warning "gcc non trouvé. Les modules natifs peuvent ne pas fonctionner."
        warning "Sur Ubuntu/Debian: sudo apt-get install build-essential python3"
        warning "Sur macOS: xcode-select --install"
    fi

    # Reconstruire better-sqlite3 si nécessaire
    if [ -d "node_modules/better-sqlite3" ]; then
        cd node_modules/better-sqlite3
        if [ ! -f "build/Release/better_sqlite3.node" ]; then
            npm run build-release 2>/dev/null || warning "Module natif non compilé - fonctionnalités DB limitées"
        fi
        cd ../..
    fi
}

# Générer les migrations de base de données
setup_database() {
    info "Configuration de la base de données..."

    # Créer le répertoire data
    mkdir -p packages/database/data
    mkdir -p apps/web/public/uploads

    # Générer les migrations (si non existantes)
    if [ ! -d "packages/database/drizzle" ]; then
        info "Génération des migrations Drizzle..."
        pnpm db:generate 2>/dev/null || warning "Migrations non générées - vérifiez la configuration"
    fi

    success "Base de données configurée"
}

# Vérification TypeScript
check_typescript() {
    info "Vérification du code TypeScript..."

    cd apps/web
    npx tsc --noEmit

    if [ $? -ne 0 ]; then
        error "Erreurs TypeScript détectées"
    fi
    cd ../..

    success "Code TypeScript valide"
}

# Créer le fichier .env
create_env() {
    info "Configuration de l'environnement..."

    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Configuration Archivia
DATABASE_URL=./packages/database/data/archivia.db
NODE_ENV=development

# Configuration future pour les services AI
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here

# Configuration de stockage (futur)
# STORAGE_PATH=./public/uploads
# MAX_UPLOAD_SIZE=52428800
EOF
        success "Fichier .env créé"
    else
        warning "Fichier .env existe déjà"
    fi
}

# Afficher les informations de post-installation
post_install_info() {
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  Installation terminée avec succès !${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo "Commandes disponibles :"
    echo ""
    echo -e "  ${BLUE}pnpm dev${NC}          - Démarrer le serveur de développement"
    echo -e "  ${BLUE}pnpm build${NC}        - Compiler l'application pour la production"
    echo -e "  ${BLUE}pnpm start${NC}        - Démarrer le serveur de production"
    echo -e "  ${BLUE}pnpm lint${NC}         - Vérifier le code avec ESLint"
    echo -e "  ${BLUE}pnpm type-check${NC}   - Vérifier les types TypeScript"
    echo ""
    echo "Base de données :"
    echo ""
    echo -e "  ${BLUE}pnpm db:generate${NC}  - Générer les migrations"
    echo -e "  ${BLUE}pnpm db:migrate${NC}   - Appliquer les migrations"
    echo -e "  ${BLUE}pnpm db:seed${NC}      - Peupler avec des données de test"
    echo ""
    echo "Pour démarrer :"
    echo ""
    echo -e "  ${YELLOW}pnpm dev${NC}"
    echo ""
    echo -e "L'application sera disponible sur ${BLUE}http://localhost:3000${NC}"
    echo ""
}

# Script principal
main() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       ARCHIVIA - Installation Dev         ║${NC}"
    echo -e "${BLUE}║   Plateforme de Patrimoine Culturel       ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
    echo ""

    check_node
    check_pnpm
    install_dependencies
    build_native_modules
    setup_database
    create_env
    check_typescript
    post_install_info
}

# Exécuter le script principal
main
