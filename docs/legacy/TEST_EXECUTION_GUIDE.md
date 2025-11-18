# Guide d'Exécution des Tests - Archivia

## 🚀 Démarrage Rapide

### Installation et Préparation

```bash
# 1. Cloner le repository et installer les dépendances
git clone https://github.com/frederic-ramet/archivia.git
cd archivia
pnpm install

# 2. Configurer l'environnement
cp .env.example apps/web/.env
# Éditer apps/web/.env avec vos configurations

# 3. Initialiser la base de données
pnpm db:generate
pnpm db:migrate
```

### Exécution Rapide de Tous les Tests

```bash
# Lancer toute la suite de tests
pnpm test

# Avec coverage
pnpm test -- --coverage

# En mode watch (développement)
pnpm test:watch
```

---

## 📋 Tests Disponibles

### 1. Tests de Validation des Schémas API
**Fichier**: `apps/web/tests/api.test.ts`
**Temps d'exécution**: ~2s
**Nombre de tests**: 60+

```bash
# Exécuter uniquement ces tests
pnpm test api.test.ts
```

**Ce qui est testé**:
- ✅ Validation Zod des schémas de création/modification
- ✅ Validation des slugs (lowercase, hyphens)
- ✅ Validation des UUIDs
- ✅ Validation des paramètres de pagination
- ✅ Validation des types de documents
- ✅ Validation des statuts de transcription

### 2. Tests d'Intégration E2E - Collection Opale
**Fichier**: `apps/web/tests/opale-integration.test.ts`
**Temps d'exécution**: ~5s
**Nombre de tests**: 25+

```bash
# Exécuter les tests Opale
pnpm test opale-integration.test.ts
```

**Ce qui est testé**:
- ✅ Création complète d'un projet avec 10 documents
- ✅ Création de 5 entités (personnes, lieux, événements)
- ✅ Création de 3 relations entre entités
- ✅ Ajout d'annotations (hotspots, notes)
- ✅ Recherche et filtrage de documents
- ✅ Navigation dans le graphe d'entités
- ✅ Validation de l'intégrité des données
- ✅ Calcul des statistiques du projet
- ✅ Tests de performance (< 100ms, < 200ms, < 300ms)

### 3. Tests API Complets
**Fichier**: `apps/web/tests/api-complete.test.ts`
**Temps d'exécution**: ~3s
**Nombre de tests**: 80+

```bash
# Exécuter tous les tests API
pnpm test api-complete.test.ts
```

**Ce qui est testé**:
- ✅ Tous les endpoints Projects (GET, POST, PUT, DELETE)
- ✅ Tous les endpoints Documents (GET, POST, PUT, DELETE)
- ✅ Validation de sécurité (SQL injection, path traversal)
- ✅ Validation des relations et contraintes
- ✅ Validation des formats et standards (ISO, CC licenses)

### 4. Tests des Services
**Fichier**: `apps/web/tests/services.test.ts`
**Temps d'exécution**: ~2s
**Nombre de tests**: 50+

```bash
# Exécuter les tests de services
pnpm test services.test.ts
```

**Ce qui est testé**:
- ✅ Service d'upload (validation, thumbnails Sharp)
- ✅ Service OCR (Claude Vision API, parsing)
- ✅ Service d'extraction d'entités (IA)
- ✅ Service de recherche sémantique (indexation, scoring)
- ✅ Service d'export HTML (génération, PWA)

### 5. Tests de Schémas (Existant)
**Fichier**: `apps/web/tests/schemas.test.ts`
**Temps d'exécution**: ~1s

```bash
pnpm test schemas.test.ts
```

### 6. Tests de Thumbnails (Existant)
**Fichier**: `apps/web/tests/thumbnails.test.ts`
**Temps d'exécution**: ~1s

```bash
pnpm test thumbnails.test.ts
```

---

## 🎯 Scénarios de Test Avancés

### Scénario 1: Test Complet d'un Projet Opale

```bash
# 1. Créer les données de test Opale
pnpm test:opale

# 2. Vérifier dans la base de données
# Le projet "opale-heritage" devrait être créé avec:
# - 10 documents
# - 5 entités
# - 3 relations
# - 2 annotations

# 3. Exécuter les tests d'intégration
pnpm test opale-integration.test.ts

# 4. Nettoyer les données de test
pnpm test:opale -- --cleanup
```

### Scénario 2: Tests avec Coverage Détaillé

```bash
# Exécuter avec rapport de couverture
pnpm test -- --coverage

# Le rapport sera généré dans ./coverage/
# Ouvrir coverage/index.html dans le navigateur
```

### Scénario 3: Tests en Mode Watch (Développement)

```bash
# Lancer en mode watch
pnpm test:watch

# Dans le terminal interactif:
# - Appuyer sur 'a' pour relancer tous les tests
# - Appuyer sur 'p' pour filtrer par pattern de fichier
# - Appuyer sur 't' pour filtrer par nom de test
# - Appuyer sur 'q' pour quitter
```

### Scénario 4: Tests de Performance

```bash
# Exécuter uniquement les tests de performance
pnpm test -- --testNamePattern="Performance"

# Résultats attendus:
# ✅ Chargement projet < 100ms
# ✅ Liste documents < 200ms
# ✅ Graphe d'entités < 300ms
```

---

## 🔧 Configuration des Tests

### Fichier de Configuration: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html', 'json'],
      include: ['app/**/*.ts', 'lib/**/*.ts'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

### Variables d'Environnement pour les Tests

```bash
# apps/web/.env.test
DATABASE_URL=file:/tmp/archivia-test.db
NODE_ENV=test
ANTHROPIC_API_KEY=sk-ant-test-key
AUTH_SECRET=test-secret-key-32-characters-min
```

---

## 📊 Analyse des Résultats

### Rapport de Couverture

```bash
# Générer le rapport de couverture
pnpm test -- --coverage

# Ouvrir le rapport HTML
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

**Objectifs de Couverture**:
- **API Routes**: > 90%
- **Services**: > 85%
- **Database**: > 80%
- **Validation**: > 95%
- **Global**: > 80%

### Rapport de Tests

Le rapport de tests Vitest affiche:
- ✅ Nombre de tests passés / total
- ⏱️ Temps d'exécution par suite
- 📊 Taux de réussite
- ❌ Détails des échecs (si présents)

Exemple de sortie:
```
✓ apps/web/tests/api.test.ts (60 tests) 2.5s
✓ apps/web/tests/opale-integration.test.ts (25 tests) 4.8s
✓ apps/web/tests/api-complete.test.ts (80 tests) 3.2s
✓ apps/web/tests/services.test.ts (50 tests) 2.1s

Test Files  4 passed (4)
     Tests  215 passed (215)
  Start at  14:30:25
  Duration  12.6s
```

---

## 🐛 Debugging des Tests

### Exécuter un Test Spécifique

```bash
# Par nom de fichier
pnpm test opale-integration.test.ts

# Par nom de test
pnpm test -- --testNamePattern="devrait créer le projet Opale"

# Par suite (describe)
pnpm test -- --testNamePattern="E2E: Collection Opale"
```

### Mode Verbose

```bash
# Afficher plus de détails
pnpm test -- --reporter=verbose

# Afficher les console.log dans les tests
pnpm test -- --reporter=verbose --silent=false
```

### Isoler un Test pour Debugging

Dans le fichier de test, utiliser `.only`:

```typescript
it.only('devrait créer le projet Opale', async () => {
  // Ce test sera le seul à s'exécuter
});
```

### Afficher les Erreurs SQL

Si les tests échouent avec des erreurs de base de données:

```bash
# Activer les logs SQL
DEBUG=drizzle:* pnpm test
```

---

## 🔄 Intégration Continue (CI)

### GitHub Actions

Créer `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run type check
        run: pnpm type-check

      - name: Run linter
        run: pnpm lint

      - name: Run tests
        run: pnpm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Pre-commit Hook

Installer husky pour les hooks Git:

```bash
pnpm add -D husky

# Créer .husky/pre-commit
#!/bin/sh
pnpm type-check && pnpm lint && pnpm test
```

---

## 📝 Bonnes Pratiques

### 1. Exécuter les Tests Avant Chaque Commit

```bash
# Workflow recommandé
git add .
pnpm test
git commit -m "feat: nouvelle fonctionnalité"
git push
```

### 2. Tester les Changements en Mode Watch

Pendant le développement:
```bash
pnpm test:watch
# Modifier le code
# Les tests se relancent automatiquement
```

### 3. Vérifier la Couverture Régulièrement

```bash
# Chaque semaine, vérifier la couverture
pnpm test -- --coverage
# Objectif: maintenir > 80%
```

### 4. Nettoyer les Données de Test

```bash
# Après les tests, nettoyer la base
rm /tmp/archivia-test.db
```

### 5. Documenter les Nouveaux Tests

Lors de l'ajout de nouvelles fonctionnalités:
1. Écrire les tests en même temps que le code
2. Documenter les scénarios de test dans TEST_PLAN.md
3. Mettre à jour ce guide si nécessaire

---

## 🆘 Dépannage

### Problème: "Cannot find module @archivia/database"

**Solution**:
```bash
pnpm install
pnpm db:generate
```

### Problème: "Database locked"

**Solution**:
```bash
# Arrêter tous les processus qui utilisent la DB
rm packages/database/data/archivia.db
pnpm db:migrate
```

### Problème: "Tests timeout after 5000ms"

**Solution**:
Augmenter le timeout dans le test:
```typescript
it('test lent', async () => {
  // ...
}, 10000); // 10 secondes
```

### Problème: "Sharp install failed"

**Solution**:
```bash
# Linux
sudo apt-get install build-essential python3

# macOS
xcode-select --install

# Puis réinstaller
pnpm install --force
```

---

## 📈 Métriques de Qualité

### Objectifs à Atteindre

| Métrique | Objectif | Actuel |
|----------|----------|--------|
| Couverture globale | > 80% | À mesurer |
| Tests passants | 100% | À mesurer |
| Temps total | < 15s | À mesurer |
| API Response (p95) | < 500ms | À mesurer |

### Commandes de Mesure

```bash
# Mesurer la couverture
pnpm test -- --coverage

# Mesurer les performances
pnpm test -- --testNamePattern="Performance" --reporter=verbose

# Compter les tests
pnpm test -- --reporter=json | jq '.numTotalTests'
```

---

## 🎓 Ressources

- [Documentation Vitest](https://vitest.dev/)
- [Documentation Drizzle ORM](https://orm.drizzle.team/)
- [Documentation Zod](https://zod.dev/)
- [Guide de Tests Next.js](https://nextjs.org/docs/app/building-your-application/testing)

---

**Dernière mise à jour**: 2025-11-17
**Mainteneur**: Claude (AI Test Engineer)
