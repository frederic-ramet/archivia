# Archivia - Documentation Technique

Ce document complète le README principal avec des informations techniques avancées pour les développeurs et administrateurs système.

## Table des Matières

- [Prérequis Détaillés](#prérequis-détaillés)
- [Configuration Avancée](#configuration-avancée)
- [Problèmes Connus et Solutions](#problèmes-connus-et-solutions)
- [Architecture Technique](#architecture-technique)
- [Tests et Qualité](#tests-et-qualité)
- [Déploiement](#déploiement)
- [Performance et Monitoring](#performance-et-monitoring)
- [Sécurité](#sécurité)

---

## Prérequis Détaillés

### Versions Testées

| Composant | Version Minimum | Version Recommandée |
|-----------|-----------------|---------------------|
| Node.js | 18.0 | 20.x LTS |
| pnpm | 8.0 | 10.x |
| drizzle-kit | 0.31.0 | 0.31.7+ |
| libSQL | 0.5.x | 0.5.22 |

### Dépendances Système (Linux)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential python3 python3-pip

# Pour Sharp (génération thumbnails)
sudo apt-get install -y libvips-dev
```

### Dépendances Système (macOS)

```bash
xcode-select --install
brew install vips
```

---

## Configuration Avancée

### Structure des Fichiers .env

**IMPORTANT** : Deux fichiers .env sont nécessaires pour un fonctionnement optimal :

```
archivia/
├── .env                      # Configuration pour scripts DB (packages/database)
└── apps/web/.env            # Configuration pour Next.js (apps/web)
```

### Configuration Racine (/.env)

```bash
# Base de données - Chemin RELATIF pour drizzle-kit
DATABASE_URL=file:./packages/database/data/archivia.db

# Optionnel - surcharge par seed scripts
ADMIN_EMAIL=admin@archivia.local
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrateur
```

### Configuration Web (/apps/web/.env)

```bash
# Base de données - Chemin ABSOLU requis pour Next.js
# IMPORTANT: Le chemin doit être absolu pour éviter les erreurs de connexion
DATABASE_URL=file:/chemin/absolu/vers/archivia/packages/database/data/archivia.db

# Environnement
NODE_ENV=development

# Configuration uploads
MAX_UPLOAD_SIZE=52428800  # 50MB en bytes
STORAGE_PATH=./public/uploads

# Authentification NextAuth (obligatoire)
# Générer avec: openssl rand -base64 32
AUTH_SECRET=votre-secret-32-caracteres-minimum

# Services AI (optionnel - configurable via UI admin)
# ANTHROPIC_API_KEY=sk-ant-api03-...
# OCR_PROVIDER=anthropic
# OCR_LANGUAGE=fra
```

### Génération du Secret Auth

```bash
# Méthode 1: OpenSSL
openssl rand -base64 32

# Méthode 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Problèmes Connus et Solutions

### 1. Erreur Edge Runtime avec libSQL

**Symptôme** :
```
Error [LibsqlError]: URL_SCHEME_NOT_SUPPORTED: The client that uses Web standard APIs
supports only "libsql:", "wss:", "ws:", "https:" and "http:" URLs, got "file:"
```

**Cause** : Le middleware Next.js s'exécute en Edge Runtime qui ne supporte pas les URLs `file:`.

**Solution** : Exclure les routes API du middleware matcher dans `apps/web/middleware.ts` :

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 2. Erreur de Connexion Base de Données

**Symptôme** :
```
Error: ConnectionFailed("Unable to open connection to local database ./data/archivia.db: 14")
```

**Cause** : Chemin relatif non résolu depuis le répertoire de travail de Next.js.

**Solution** : Utiliser un chemin ABSOLU dans `apps/web/.env` :

```bash
DATABASE_URL=file:/chemin/absolu/vers/archivia/packages/database/data/archivia.db
```

### 3. Erreur de Parsing README.md

**Symptôme** :
```
Module parse failed: Unexpected token (1:0)
> <p align="center">
```

**Cause** : Webpack essaie de bundler le README.md de @libsql/client.

**Solution** : Ajouter une règle webpack dans `apps/web/next.config.js` :

```javascript
webpack: (config, { isServer }) => {
  config.module.rules.push({
    test: /README\.md$/,
    type: "asset/resource",
    generator: { emit: false },
  });

  if (isServer) {
    config.externals = config.externals || [];
    config.externals.push("libsql");
  }

  return config;
},
```

### 4. drizzle-kit Incompatible

**Symptôme** :
```
Invalid input  Either "turso", "libsql", "better-sqlite" are available options for "--driver"
```

**Cause** : Version ancienne de drizzle-kit avec syntaxe obsolète.

**Solution** :
1. Mettre à jour drizzle-kit : `pnpm --filter @archivia/database add -D drizzle-kit@latest`
2. Utiliser la nouvelle syntaxe dans `drizzle.config.ts` :

```typescript
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",  // Pas "turso" ou "driver"
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:./data/archivia.db",
  },
});
```

3. Mettre à jour les scripts dans `package.json` :

```json
{
  "scripts": {
    "generate": "drizzle-kit generate",  // Pas generate:sqlite
    "push": "drizzle-kit push"           // Pas push:sqlite
  }
}
```

### 5. Authentification API Échoue

**Symptôme** :
```json
{"success": false, "error": "Unauthorized"}
```

**Cause** : Les routes POST/PUT/DELETE nécessitent une session NextAuth active.

**Solution** :
- Pour les tests : utiliser les scripts de seed qui insèrent directement en DB
- Pour la production : implémenter l'authentification côté client
- Pour le développement : créer des tokens de test

---

## Architecture Technique

### Flux de Données

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Next.js   │────▶│   libSQL    │
│  (Browser)  │     │  App Router │     │  (SQLite)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Claude API │
                    │  (Anthropic)│
                    └─────────────┘
```

### Couches Applicatives

1. **Présentation** : React Components + Tailwind CSS
2. **Application** : Next.js API Routes + Zod Validation
3. **Domaine** : Business Logic (OCR, Entity Extraction)
4. **Infrastructure** : Drizzle ORM + libSQL

### Schéma Base de Données

```sql
-- Tables principales (11 tables)
projects              -- Projets patrimoniaux
documents             -- Documents numérisés
entities              -- Entités ontologiques (personnes, lieux, etc.)
entity_relationships  -- Relations entre entités
annotations           -- Notes et hotspots sur documents
users                 -- Utilisateurs authentifiés
sessions              -- Sessions NextAuth
accounts              -- Comptes OAuth (NextAuth)
verification_tokens   -- Tokens de vérification (NextAuth)
project_members       -- Permissions par projet
app_config            -- Configuration globale (clés API, etc.)
```

---

## Tests et Qualité

### Exécution des Tests

```bash
# Tests unitaires (Vitest)
pnpm test

# Tests en mode watch
pnpm test:watch

# Vérification TypeScript
pnpm type-check

# Linting ESLint
pnpm lint

# Tous les checks
pnpm type-check && pnpm lint && pnpm test
```

### Structure des Tests

```
apps/web/tests/
├── schemas.test.ts      # Validation Zod (~30 tests)
├── thumbnails.test.ts   # Génération miniatures (~15 tests)
├── api.test.ts          # Tests API (~18 tests)
└── setup.ts             # Configuration Vitest
```

### Tests de Création de Projet

```bash
# Créer un projet de test complet (10 documents, 5 entités, 3 relations)
pnpm test:opale

# Nettoyer les données de test
pnpm test:opale:cleanup
```

### Test API Manuel

```bash
# Lister les projets
curl http://localhost:3000/api/projects | jq .

# Recherche sémantique
curl "http://localhost:3000/api/search?q=mariage" | jq .

# Graphe d'entités
curl http://localhost:3000/api/projects/{id}/entities | jq .
```

### Coverage Actuel

- **Validation** : Schémas Zod couverts à 100%
- **API Routes** : Non testé (recommandé : +50 tests)
- **Services IA** : Mocks uniquement
- **E2E** : Non implémenté

---

## Déploiement

### Préparation Production

```bash
# 1. Build
pnpm build

# 2. Vérifier les erreurs
pnpm type-check

# 3. Démarrer en production
pnpm start
```

### Variables d'Environnement Production

```bash
NODE_ENV=production
DATABASE_URL=libsql://your-db.turso.io  # Turso recommandé
DATABASE_AUTH_TOKEN=your-turso-token
AUTH_SECRET=production-secret-very-secure
NEXTAUTH_URL=https://votre-domaine.com
ANTHROPIC_API_KEY=sk-ant-...
```

### Migration vers Turso (Production)

1. Créer une base Turso : `turso db create archivia-prod`
2. Obtenir l'URL : `turso db show archivia-prod --url`
3. Créer un token : `turso db tokens create archivia-prod`
4. Mettre à jour DATABASE_URL et DATABASE_AUTH_TOKEN

### Docker (Recommandé)

```dockerfile
# Dockerfile à créer
FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
CMD ["pnpm", "start"]
```

---

## Performance et Monitoring

### Métriques Recommandées

- **Temps de réponse API** : < 200ms (P95)
- **Taille uploads** : 50MB max (configurable)
- **Requêtes DB** : Indexation sur projectId, slug
- **Cache** : Headers de cache pour assets statiques

### Optimisations Suggérées

1. **Rate Limiting** : Implémenter avec `express-rate-limit`
2. **Logging** : Ajouter `pino` ou `winston`
3. **APM** : New Relic, Datadog, ou OpenTelemetry
4. **CDN** : Servir les uploads via CloudFront/Cloudflare

### Logging Structuré (À Implémenter)

```typescript
// Exemple avec pino
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Usage
logger.info({ projectId, action: 'create' }, 'Project created');
logger.error({ error, userId }, 'Authentication failed');
```

---

## Sécurité

### Mesures Actuelles

- ✅ Authentification NextAuth avec JWT
- ✅ Validation Zod sur tous les inputs
- ✅ Sessions sécurisées (httpOnly cookies)
- ✅ Rôles utilisateur (admin, curator, viewer)
- ✅ Permissions par projet (owner, editor, viewer)

### Améliorations Recommandées

1. **Rate Limiting** : Prévenir les attaques DDoS
2. **CORS** : Configurer les origines autorisées
3. **CSP** : Content Security Policy headers
4. **CSRF** : Tokens anti-CSRF pour les formulaires
5. **Input Sanitization** : Nettoyage XSS supplémentaire
6. **Audit Log** : Journaliser les actions sensibles

### Bonnes Pratiques

```bash
# NE PAS committer
.env
.env.local
apps/web/.env
packages/database/data/*.db

# Fichiers sensibles dans .gitignore
*.db
*.db-journal
*.db-shm
*.db-wal
.env*
!.env.example
```

---

## Support et Contact

### Ressources

- **Issues GitHub** : Pour rapporter des bugs
- **Guide Utilisateur** : `docs/GUIDE_UTILISATEUR.md`
- **API Docs** : Section API REST du README principal

### Checklist Avant Signalement Bug

1. [ ] Version Node.js (18+ requis)
2. [ ] Fichiers .env créés et configurés
3. [ ] Base de données initialisée (`pnpm db:push`)
4. [ ] Cache nettoyé (`rm -rf apps/web/.next`)
5. [ ] Logs serveur consultés
6. [ ] Tests passent (`pnpm test`)

---

*Dernière mise à jour : 2025-11-17*
