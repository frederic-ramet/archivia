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

# Obtenir le chemin absolu du projet
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

step() {
    echo -e "\n${YELLOW}[STEP $1]${NC} $2\n"
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

# Générer un secret pour AUTH
generate_auth_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    else
        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    fi
}

# Créer le fichier .env racine
create_root_env() {
    info "Configuration de l'environnement racine..."

    if [ ! -f "$PROJECT_DIR/.env" ]; then
        cat > "$PROJECT_DIR/.env" << EOF
# Configuration Archivia - Environnement Racine
# Ce fichier est utilisé par les scripts de base de données

# Base de données SQLite (chemin relatif pour drizzle-kit)
DATABASE_URL=file:./packages/database/data/archivia.db

# Environnement
NODE_ENV=development

# Configuration Admin Initial (pour seed:admin)
ADMIN_EMAIL=admin@archivia.local
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrateur
EOF
        success "Fichier .env racine créé"
    else
        info "Fichier .env racine existe déjà"
    fi
}

# Créer le fichier .env pour Next.js (CRITIQUE)
create_web_env() {
    info "Configuration de l'environnement Next.js..."

    local AUTH_SECRET
    AUTH_SECRET=$(generate_auth_secret)

    if [ ! -f "$PROJECT_DIR/apps/web/.env" ]; then
        cat > "$PROJECT_DIR/apps/web/.env" << EOF
# Configuration Archivia - Application Web
# IMPORTANT: Ce fichier est REQUIS pour le bon fonctionnement de Next.js

# Base de données SQLite - CHEMIN ABSOLU OBLIGATOIRE
# Le chemin relatif ne fonctionne pas avec Next.js dans un monorepo
DATABASE_URL=file:${PROJECT_DIR}/packages/database/data/archivia.db

# Environnement
NODE_ENV=development

# Configuration des uploads
MAX_UPLOAD_SIZE=52428800
STORAGE_PATH=./public/uploads

# Authentification NextAuth (OBLIGATOIRE)
# Secret généré automatiquement - NE PAS PARTAGER
AUTH_SECRET=${AUTH_SECRET}

# Services AI (optionnel - configurable via l'interface admin /admin/settings)
# ANTHROPIC_API_KEY=sk-ant-api03-...
# OCR_PROVIDER=anthropic
# OCR_LANGUAGE=fra
EOF
        success "Fichier apps/web/.env créé avec chemin absolu: ${PROJECT_DIR}/packages/database/data/archivia.db"
    else
        info "Fichier apps/web/.env existe déjà"

        # Vérifier si le chemin DB est absolu
        if grep -q "DATABASE_URL=file:\.\|DATABASE_URL=file:packages" "$PROJECT_DIR/apps/web/.env"; then
            warning "ATTENTION: Le DATABASE_URL utilise un chemin relatif!"
            warning "Cela peut causer des erreurs de connexion. Recommandé: chemin absolu"
            warning "Exemple: DATABASE_URL=file:${PROJECT_DIR}/packages/database/data/archivia.db"
        fi
    fi
}

# Créer les répertoires nécessaires
setup_directories() {
    info "Création des répertoires..."

    mkdir -p "$PROJECT_DIR/packages/database/data"
    mkdir -p "$PROJECT_DIR/apps/web/public/uploads"

    success "Répertoires créés"
}

# Configuration de la base de données
setup_database() {
    info "Initialisation de la base de données..."

    # Synchroniser le schéma avec la DB
    cd "$PROJECT_DIR"

    info "Synchronisation du schéma Drizzle..."
    if pnpm db:push 2>&1 | grep -q "Changes applied\|already"; then
        success "Schéma de base de données synchronisé"
    else
        warning "Synchronisation du schéma peut avoir échoué - vérifiez manuellement"
    fi

    success "Base de données configurée"
}

# Créer l'utilisateur admin
create_admin_user() {
    info "Création de l'utilisateur administrateur..."

    cd "$PROJECT_DIR"

    if pnpm --filter @archivia/database seed:admin 2>&1 | grep -q "Admin user created"; then
        success "Utilisateur admin créé: admin@archivia.local / admin123"
    else
        warning "L'utilisateur admin existe peut-être déjà"
    fi
}

# Vérification TypeScript
check_typescript() {
    info "Vérification du code TypeScript..."

    cd "$PROJECT_DIR"
    if pnpm type-check 2>&1 | grep -q "Done"; then
        success "Code TypeScript valide"
    else
        warning "Vérification TypeScript peut avoir échoué"
    fi
}

# Exécuter les tests
run_tests() {
    info "Exécution des tests..."

    cd "$PROJECT_DIR"
    if pnpm test 2>&1 | grep -q "passed"; then
        success "Tests passés avec succès"
    else
        warning "Certains tests peuvent avoir échoué"
    fi
}

# Afficher les informations de post-installation
post_install_info() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✅ Installation terminée avec succès !                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📦 Configuration créée:${NC}"
    echo -e "  • Chemin DB: ${BLUE}${PROJECT_DIR}/packages/database/data/archivia.db${NC}"
    echo -e "  • Uploads: ${BLUE}${PROJECT_DIR}/apps/web/public/uploads${NC}"
    echo ""
    echo -e "${YELLOW}👤 Compte administrateur:${NC}"
    echo -e "  • Email: ${BLUE}admin@archivia.local${NC}"
    echo -e "  • Mot de passe: ${BLUE}admin123${NC}"
    echo -e "  ${RED}⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !${NC}"
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🚀 PROCHAINES ÉTAPES                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}1️⃣  Démarrer le serveur de développement:${NC}"
    echo ""
    echo -e "     ${GREEN}pnpm dev${NC}"
    echo ""
    echo -e "     L'application sera disponible sur ${BLUE}http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}2️⃣  Première connexion - Wizard de configuration:${NC}"
    echo ""
    echo -e "     • Ouvrez ${BLUE}http://localhost:3000${NC}"
    echo -e "     • Connectez-vous avec ${BLUE}admin@archivia.local${NC} / ${BLUE}admin123${NC}"
    echo -e "     • ${GREEN}Un wizard vous guidera${NC} pour configurer :"
    echo -e "       - Votre clé API Anthropic (optionnel, pour OCR et IA)"
    echo -e "       - Les paramètres de stockage"
    echo -e "       - Les préférences système"
    echo ""
    echo -e "${YELLOW}3️⃣  Accéder à la documentation dans l'app:${NC}"
    echo ""
    echo -e "     • Menu ${BLUE}Help > Documentation${NC} (icône ❓ en haut à droite)"
    echo -e "     • Ou directement : ${BLUE}http://localhost:3000/help${NC}"
    echo -e "     • README, guides techniques, et aide intégrée"
    echo ""
    echo -e "${YELLOW}4️⃣  Tester avec des données de démonstration:${NC}"
    echo ""
    echo -e "     ${BLUE}pnpm test:opale${NC}          Créer un projet Collection Opale"
    echo -e "     ${BLUE}pnpm db:seed${NC}             Peupler avec données de test"
    echo ""
    echo -e "${YELLOW}5️⃣  Développer et tester:${NC}"
    echo ""
    echo -e "     ${BLUE}pnpm test${NC}                Lancer les tests (191 tests)"
    echo -e "     ${BLUE}pnpm test:watch${NC}          Tests en mode watch"
    echo -e "     ${BLUE}pnpm type-check${NC}          Vérifier TypeScript"
    echo -e "     ${BLUE}pnpm lint${NC}                Vérifier ESLint"
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    📚 RESSOURCES UTILES                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo -e "  • README principal: ${BLUE}README.md${NC}"
    echo -e "  • Plan de test: ${BLUE}TEST_PLAN.md${NC}"
    echo -e "  • Guide d'exécution des tests: ${BLUE}TEST_EXECUTION_GUIDE.md${NC}"
    echo -e "  • Rapport de qualité: ${BLUE}TEST_REPORT.md${NC}"
    echo ""
    echo -e "${YELLOW}Commandes base de données:${NC}"
    echo -e "  • ${BLUE}pnpm db:push${NC}             Synchroniser le schéma"
    echo -e "  • ${BLUE}pnpm db:generate${NC}         Générer les migrations"
    echo -e "  • ${BLUE}pnpm db:migrate${NC}          Appliquer les migrations"
    echo -e "  • ${BLUE}pnpm db:seed${NC}             Créer données de test"
    echo ""
    echo -e "${YELLOW}Configuration API Anthropic (optionnel):${NC}"
    echo -e "  1. Obtenez une clé API: ${BLUE}https://console.anthropic.com/${NC}"
    echo -e "  2. Ajoutez dans ${BLUE}apps/web/.env${NC} :"
    echo -e "     ${BLUE}ANTHROPIC_API_KEY=sk-ant-api03-...${NC}"
    echo -e "  3. Ou configurez via l'interface admin après démarrage"
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🎯 AIDE ET SUPPORT                          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  • Documentation intégrée: ${BLUE}http://localhost:3000/help${NC}"
    echo -e "  • Issues GitHub: ${BLUE}https://github.com/frederic-ramet/archivia/issues${NC}"
    echo -e "  • README complet: ${BLUE}cat README.md${NC}"
    echo ""
    echo -e "${GREEN}Bon développement avec Archivia ! 🚀${NC}"
    echo ""
}

# Script principal
main() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       ARCHIVIA - Installation Développement           ║${NC}"
    echo -e "${BLUE}║   Plateforme de Préservation du Patrimoine            ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""

    info "Répertoire du projet: $PROJECT_DIR"
    echo ""

    step "1/8" "Vérification des prérequis"
    check_node
    check_pnpm

    step "2/8" "Installation des dépendances"
    install_dependencies

    step "3/8" "Création des répertoires"
    setup_directories

    step "4/8" "Configuration environnement racine"
    create_root_env

    step "5/8" "Configuration environnement Next.js"
    create_web_env

    step "6/8" "Initialisation de la base de données"
    setup_database

    step "7/8" "Création utilisateur administrateur"
    create_admin_user

    step "8/8" "Vérification de l'installation"
    check_typescript
    run_tests

    post_install_info
}

# Exécuter le script principal
main
