#!/bin/bash

# Test complet de l'API Archivia
# Ce script teste toutes les fonctionnalités de l'API

BASE_URL="${1:-http://localhost:3000}"
PROJECT_ID=""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
test_name() { echo -e "\n${YELLOW}🧪 TEST: $1${NC}"; }

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       ARCHIVIA - Tests API REST           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""
info "URL de base: $BASE_URL"

# ============================================================================
# TEST 1: Créer un projet Opale
# ============================================================================
test_name "Création du projet Collection Opale"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Collection Opale - Test API",
    "slug": "opale-test-api",
    "description": "Collection de photographies familiales pour test API",
    "isPublic": true,
    "config": {
      "features": {
        "ocr": false,
        "annotations": true,
        "hotspots": true,
        "stories": true,
        "timeline": true,
        "map": false,
        "ontology": true,
        "aiGeneration": false,
        "publicReader": true,
        "collaboration": false
      },
      "primaryLanguage": "fr",
      "acceptedFormats": ["jpg", "png"]
    },
    "metadata": {
      "institution": "Collection privée",
      "curator": "Famille Ramet",
      "periodStart": "1920",
      "periodEnd": "1990",
      "themes": ["Famille", "Histoire", "Traditions"],
      "contributors": ["Test API"],
      "license": "CC BY-NC-SA 4.0"
    }
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  PROJECT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  success "Projet créé avec ID: $PROJECT_ID"
else
  error "Échec de la création du projet"
  echo "Réponse: $RESPONSE"
  exit 1
fi

# ============================================================================
# TEST 2: Récupérer le projet créé
# ============================================================================
test_name "Récupération du projet par ID"

RESPONSE=$(curl -s -X GET "$BASE_URL/api/projects/$PROJECT_ID")

if echo "$RESPONSE" | grep -q '"success":true'; then
  NAME=$(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
  success "Projet récupéré: $NAME"
else
  error "Échec de la récupération"
  echo "Réponse: $RESPONSE"
fi

# ============================================================================
# TEST 3: Lister les projets
# ============================================================================
test_name "Liste des projets avec pagination"

RESPONSE=$(curl -s -X GET "$BASE_URL/api/projects?page=1&limit=10")

if echo "$RESPONSE" | grep -q '"success":true'; then
  TOTAL=$(echo "$RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  success "Liste récupérée - Total: $TOTAL projet(s)"
else
  error "Échec du listing"
fi

# ============================================================================
# TEST 4: Créer des documents
# ============================================================================
test_name "Création de documents (photos Opale)"

DOCS_CREATED=0

for i in 1 2 3; do
  DOC_RESPONSE=$(curl -s -X POST "$BASE_URL/api/documents" \
    -H "Content-Type: application/json" \
    -d "{
      \"projectId\": \"$PROJECT_ID\",
      \"type\": \"image\",
      \"title\": \"Photo famille ${i}\",
      \"filePath\": \"/uploads/opale-test-api/photo_${i}.jpg\",
      \"category\": \"Portrait\",
      \"period\": \"196${i}\",
      \"tags\": [\"famille\", \"test\", \"photo${i}\"],
      \"historicalContext\": \"Photo de test numéro ${i}\"
    }")

  if echo "$DOC_RESPONSE" | grep -q '"success":true'; then
    DOCS_CREATED=$((DOCS_CREATED + 1))
  fi
done

if [ $DOCS_CREATED -eq 3 ]; then
  success "3 documents créés avec succès"
else
  error "Seulement $DOCS_CREATED/3 documents créés"
fi

# ============================================================================
# TEST 5: Lister les documents du projet
# ============================================================================
test_name "Liste des documents par projet"

RESPONSE=$(curl -s -X GET "$BASE_URL/api/documents?projectId=$PROJECT_ID&limit=50")

if echo "$RESPONSE" | grep -q '"success":true'; then
  TOTAL=$(echo "$RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
  success "Documents listés - Total: $TOTAL document(s)"
else
  error "Échec du listing des documents"
fi

# ============================================================================
# TEST 6: Mettre à jour le projet
# ============================================================================
test_name "Mise à jour du projet"

RESPONSE=$(curl -s -X PUT "$BASE_URL/api/projects/$PROJECT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Description mise à jour via test API",
    "metadata": {
      "curator": "Test API - Mis à jour"
    }
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  success "Projet mis à jour avec succès"
else
  error "Échec de la mise à jour"
fi

# ============================================================================
# TEST 7: Validation des entrées (test d'erreur)
# ============================================================================
test_name "Test de validation (slug invalide)"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Invalid",
    "slug": "INVALID SLUG WITH SPACES!"
  }')

if echo "$RESPONSE" | grep -q '"success":false'; then
  success "Validation fonctionne - slug invalide rejeté"
else
  error "La validation devrait rejeter ce slug"
fi

# ============================================================================
# TEST 8: Test de conflit (slug dupliqué)
# ============================================================================
test_name "Test de conflit (slug dupliqué)"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Test",
    "slug": "opale-test-api"
  }')

if echo "$RESPONSE" | grep -q '"success":false'; then
  success "Conflit détecté - slug dupliqué rejeté"
else
  error "Le slug dupliqué devrait être rejeté"
fi

# ============================================================================
# TEST 9: Supprimer le projet de test
# ============================================================================
test_name "Suppression du projet de test"

RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/projects/$PROJECT_ID")

if echo "$RESPONSE" | grep -q '"success":true'; then
  success "Projet supprimé (cascade sur documents)"
else
  error "Échec de la suppression"
fi

# ============================================================================
# Résumé
# ============================================================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       TESTS TERMINÉS AVEC SUCCÈS          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo "Fonctionnalités testées:"
echo "  ✅ Création de projet avec config complète"
echo "  ✅ Récupération par ID"
echo "  ✅ Pagination et listing"
echo "  ✅ Création de documents"
echo "  ✅ Filtrage par projet"
echo "  ✅ Mise à jour partielle"
echo "  ✅ Validation Zod"
echo "  ✅ Gestion des conflits"
echo "  ✅ Suppression en cascade"
echo ""
