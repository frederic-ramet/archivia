# Plan de Test Complet - Archivia
## Basé sur la Collection Opale

Version: 1.0
Date: 2025-11-17
Auteur: Claude (AI Test Engineer)

---

## 📋 Objectifs du Plan de Test

Ce plan de test vise à valider toutes les fonctionnalités d'Archivia en utilisant des données réalistes issues de la Collection Opale (255 photos d'archives familiales couvrant 1920-2020).

### Critères de Qualité
- **Couverture de code**: > 80%
- **Tests passants**: 100%
- **Performance**: Temps de réponse API < 500ms
- **Sécurité**: Validation des permissions et sanitization
- **Accessibilité**: Conformité WCAG 2.1 niveau AA

---

## 🎯 Périmètre des Tests

### 1. Tests d'API REST

#### 1.1 Gestion des Projets (`/api/projects`)
- [x] **POST** `/api/projects` - Création projet Opale
  - Validation des champs requis (name, slug)
  - Validation du format slug (lowercase, hyphens)
  - Configuration des features (ocr, annotations, stories, etc.)
  - Métadonnées enrichies (institution, curator, période, thèmes)
  - Branding personnalisé (couleurs, hero, footer)

- [x] **GET** `/api/projects` - Liste des projets
  - Pagination (page, limit)
  - Filtres (status, isPublic, search)
  - Tri par date de création/modification

- [x] **GET** `/api/projects/:id` - Détails d'un projet
  - Récupération des métadonnées complètes
  - Vérification des permissions d'accès

- [x] **PUT** `/api/projects/:id` - Modification d'un projet
  - Mise à jour partielle (description, config, branding)
  - Changement de statut (draft → active → archived)
  - Validation des permissions (owner uniquement)

- [x] **DELETE** `/api/projects/:id` - Suppression d'un projet
  - Cascade sur documents, entités, relations
  - Nettoyage des fichiers uploadés
  - Vérification des permissions (owner uniquement)

#### 1.2 Gestion des Membres (`/api/projects/:id/members`)
- [ ] **GET** `/api/projects/:id/members` - Liste des membres
  - Rôles: owner, editor, viewer
  - Métadonnées utilisateur

- [ ] **POST** `/api/projects/:id/members` - Ajout d'un membre
  - Validation du rôle
  - Vérification owner uniquement

- [ ] **DELETE** `/api/projects/:id/members?memberId=` - Retrait d'un membre
  - Impossible de retirer le dernier owner
  - Vérification permissions

#### 1.3 Gestion des Documents (`/api/documents`)
- [x] **POST** `/api/documents` - Création d'un document
  - Types: image, manuscript, artifact, audio, video
  - Métadonnées: title, period, category, tags
  - Contexte historique
  - Position dans la collection

- [x] **GET** `/api/documents?projectId=` - Liste des documents
  - Filtres (type, category, period)
  - Recherche full-text
  - Pagination

- [x] **GET** `/api/documents/:id` - Détails d'un document
  - Métadonnées complètes
  - Transcription si disponible
  - Entités liées

- [x] **PUT** `/api/documents/:id` - Modification d'un document
  - Mise à jour métadonnées
  - Changement de statut transcription
  - Tags et catégories

- [x] **DELETE** `/api/documents/:id` - Suppression d'un document
  - Suppression fichiers (original + thumbnail)
  - Cascade sur annotations
  - Mise à jour graphe d'entités

#### 1.4 Upload de Fichiers (`/api/upload`)
- [ ] **POST** `/api/upload` - Upload fichier
  - Formats supportés: jpg, png, tiff, pdf
  - Génération miniature automatique (Sharp)
  - Validation taille maximale (10MB)
  - Path sécurisé (pas de traversal)

#### 1.5 OCR et Extraction d'Entités
- [ ] **POST** `/api/documents/:id/ocr` - OCR Claude Vision
  - Transcription automatique d'images
  - Extraction de texte manuscrit/imprimé
  - Gestion statut (pending → processing → completed)

- [ ] **POST** `/api/documents/:id/extract-entities` - Extraction IA
  - Détection personnes (Marcel, Jeanne, etc.)
  - Détection lieux (Maison familiale, Paris, Normandie)
  - Détection événements (Mariage 1925, Noël 1955)
  - Détection objets (Voile de mariée, Arbre de Noël)
  - Détection concepts (Traditions familiales, Générations)
  - Scores de confiance
  - Normalisation des noms

#### 1.6 Annotations (`/api/documents/:id/annotations`)
- [ ] **POST** - Création d'annotation
  - Types: note, correction, hotspot, region
  - Coordonnées (x, y, width, height)
  - Lien vers entités
  - Statut (draft, published)

- [ ] **GET** - Liste des annotations d'un document
  - Filtres par type
  - Tri par position

- [ ] **PUT** - Modification d'annotation
- [ ] **DELETE** - Suppression d'annotation

#### 1.7 Graphe d'Entités (`/api/projects/:id/entities`)
- [ ] **GET** - Récupération du graphe
  - Entités (person, place, event, object, concept)
  - Relations (married_to, lives_in, participant_in)
  - Weights pour force-directed layout
  - Filtres par type d'entité

#### 1.8 Export (`/api/projects/:id/export`)
- [ ] **POST** - Export HTML statique
  - Génération site autonome avec JSZip
  - Inclusion des assets (images, styles)
  - Navigation responsive
  - Mode hors-ligne (Service Worker)

#### 1.9 Génération d'Histoire (`/api/projects/:id/story`)
- [ ] **POST** - Génération narrative IA
  - 3 styles: narrative, descriptive, analytical
  - 3 longueurs: short (500 mots), medium (1500), long (3000)
  - Utilisation des entités et relations
  - Prompt engineering optimisé

#### 1.10 Recherche Sémantique (`/api/search`)
- [ ] **GET** `/api/search?q=mariage` - Recherche
  - Full-text sur documents
  - Full-text sur entités
  - Scores de pertinence
  - Tri par relevance
  - Résultats mixtes (docs + entities)

#### 1.11 Analytics (`/api/analytics`)
- [ ] **GET** - Dashboard admin
  - Statistiques globales (projets, documents, users)
  - Métriques d'utilisation
  - Activité récente
  - Réservé admin uniquement

#### 1.12 Authentification (`/api/auth`)
- [ ] **POST** `/api/auth/signin` - Connexion NextAuth
  - Credentials provider
  - Validation email/password
  - Génération session

- [ ] **GET** `/api/auth/session` - Session courante
  - User info (id, email, role)

- [ ] **POST** `/api/auth/signout` - Déconnexion

---

### 2. Tests de Services

#### 2.1 Service d'Upload
- [ ] Génération miniatures (Sharp)
- [ ] Validation formats acceptés
- [ ] Gestion erreurs d'upload
- [ ] Nettoyage fichiers temporaires

#### 2.2 Service OCR
- [ ] Intégration Claude Vision API
- [ ] Gestion rate limits
- [ ] Retry logic
- [ ] Parsing des réponses

#### 2.3 Service d'Extraction d'Entités
- [ ] Parsing de la réponse Claude
- [ ] Normalisation des noms (slug)
- [ ] Déduplication d'entités
- [ ] Création des relations

#### 2.4 Service de Recherche
- [ ] Indexation full-text
- [ ] Calcul de scores de pertinence
- [ ] Highlighting des résultats
- [ ] Performance sur large dataset

---

### 3. Tests de Base de Données

#### 3.1 Schéma et Migrations
- [x] Création des tables (Drizzle ORM)
- [x] Relations (foreign keys, cascade)
- [x] Index pour performance
- [x] Contraintes d'unicité (slug)

#### 3.2 Seed Data - Collection Opale
- [ ] Création projet Opale complet
- [ ] Insertion 10 documents avec métadonnées
- [ ] Création 5 entités (Marcel, Jeanne, Maison, Mariage, Traditions)
- [ ] Création 3 relations (married_to, lives_in, participant_in)
- [ ] Ajout 2 annotations (hotspot, note)

#### 3.3 Queries et Performance
- [ ] Requêtes paginées efficaces
- [ ] Filtrage multi-critères
- [ ] Joins optimisés
- [ ] Mesure des temps de requête

---

### 4. Tests de Validation

#### 4.1 Validation Zod (shared-types)
- [x] createProjectSchema
- [x] updateProjectSchema
- [x] projectQuerySchema
- [x] createDocumentSchema
- [x] updateDocumentSchema
- [x] documentQuerySchema
- [ ] annotationSchema
- [ ] entitySchema
- [ ] relationshipSchema

#### 4.2 Validation de Sécurité
- [x] Prévention SQL injection
- [x] Prévention path traversal
- [x] Sanitization des inputs
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Content Security Policy

---

### 5. Tests End-to-End (Scénario Opale)

#### Scénario 1: Création complète d'un projet Opale
1. Connexion admin
2. Création projet "Collection Opale"
3. Configuration features (ocr, stories, ontology)
4. Upload de 10 photos historiques
5. Ajout métadonnées pour chaque photo
6. Lancement OCR sur photos avec texte
7. Extraction d'entités automatique
8. Vérification graphe d'entités
9. Ajout annotations manuelles (hotspots)
10. Génération histoire narrative
11. Export HTML statique
12. Validation du site exporté

#### Scénario 2: Collaboration multi-utilisateurs
1. Owner crée projet
2. Owner invite curator (editor)
3. Curator ajoute documents
4. Curator crée annotations
5. Owner change config
6. Owner invite viewer (lecture seule)
7. Viewer tente modification (refusé)
8. Owner retire curator
9. Validation des permissions

#### Scénario 3: Recherche et découverte
1. Recherche "mariage" → trouve doc + entité
2. Recherche "Normandie" → trouve vacances
3. Recherche "Marcel" → trouve personne + docs liés
4. Navigation dans graphe d'entités
5. Filtrage par période (1920-1950)
6. Filtrage par catégorie (Cérémonie)

#### Scénario 4: Workflow OCR et Entités
1. Upload photo de mariage
2. OCR détecte texte au dos ("Mariage Marcel et Jeanne, 1925")
3. Extraction entités trouve Marcel, Jeanne, événement
4. Création automatique relations
5. Validation manuelle et correction
6. Enrichissement avec annotations

---

### 6. Tests de Performance

#### 6.1 Benchmarks API
- [ ] GET /api/projects (100 projets) < 200ms
- [ ] GET /api/documents (1000 docs) < 500ms
- [ ] POST /api/upload (5MB image) < 3s
- [ ] POST /api/documents/:id/ocr < 5s
- [ ] GET /api/search (large index) < 300ms

#### 6.2 Charge et Scalabilité
- [ ] 10 requêtes simultanées
- [ ] 50 requêtes simultanées
- [ ] 100 utilisateurs concurrents
- [ ] Upload simultané de 5 fichiers

---

### 7. Tests d'Accessibilité

- [ ] Contraste des couleurs (WCAG AA)
- [ ] Navigation au clavier
- [ ] Screen reader compatibility
- [ ] ARIA labels
- [ ] Focus management

---

### 8. Tests de Compatibilité

#### 8.1 Navigateurs
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (iOS Safari, Chrome Android)

#### 8.2 Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 📊 Métriques de Qualité

### Couverture de Code
```
├── API Routes: > 90%
├── Services: > 85%
├── Database: > 80%
├── Validation: > 95%
└── Global: > 80%
```

### Performances Cibles
```
├── API Response Time (p95): < 500ms
├── Page Load Time: < 2s
├── Time to Interactive: < 3s
└── Lighthouse Score: > 90
```

### Fiabilité
```
├── Tests Passed: 100%
├── Critical Bugs: 0
├── High Priority Bugs: 0
└── Code Quality (ESLint): 0 errors
```

---

## 🛠️ Outils de Test

- **Framework**: Vitest
- **API Testing**: Supertest / fetch API
- **Database**: SQLite in-memory
- **Mocking**: vi.mock (Vitest)
- **Coverage**: c8 (intégré Vitest)
- **E2E**: Playwright (optionnel)
- **Performance**: Apache Bench / k6

---

## 📝 Checklist de Validation

### Pré-Tests
- [x] Dépendances installées (`pnpm install`)
- [ ] Database migrée (`pnpm db:migrate`)
- [ ] Seed data Opale chargé (`pnpm test:opale`)
- [ ] Variables d'environnement configurées

### Exécution
- [ ] Tests unitaires (`pnpm test`)
- [ ] Tests d'intégration API
- [ ] Tests E2E (scénarios Opale)
- [ ] Tests de performance
- [ ] Analyse de couverture

### Post-Tests
- [ ] Bugs documentés
- [ ] Bugs critiques corrigés
- [ ] Rapport de qualité généré
- [ ] Documentation mise à jour

---

## 📈 Livrables

1. **Suite de tests automatisés** (`apps/web/tests/`)
   - `opale-integration.test.ts` - Tests E2E Collection Opale
   - `api-complete.test.ts` - Tous les endpoints API
   - `services.test.ts` - Services (upload, OCR, entities)
   - `security.test.ts` - Tests de sécurité

2. **Documentation**
   - `TEST_PLAN.md` (ce fichier)
   - `TEST_EXECUTION_GUIDE.md` - Guide d'exécution
   - `TEST_REPORT.md` - Rapport de qualité

3. **Données de test**
   - `packages/database/src/test-opale.ts` (existant)
   - Scripts de génération de données

4. **Rapport final**
   - Métriques de couverture
   - Liste des bugs trouvés/corrigés
   - Recommandations d'amélioration
   - Certification de qualité

---

## 🔄 Maintenance

- Exécuter les tests avant chaque commit
- Exécuter la suite complète avant chaque release
- Mettre à jour les tests lors de nouvelles features
- Réviser le plan de test trimestriellement

---

**Date de dernière mise à jour**: 2025-11-17
**Statut**: ✅ Plan approuvé - Prêt pour exécution
