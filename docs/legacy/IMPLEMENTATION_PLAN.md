# Plan d'Implémentation - Archivia

## Vue d'ensemble

Ce document détaille le plan d'implémentation par phases itératives de la plateforme Archivia, en commençant par les fondations et en ajoutant progressivement les fonctionnalités.

---

## Phase 1 : Setup Fondations (Semaine 1)

### 1.1 Initialisation du Monorepo
- [x] Créer la structure de dossiers
- [ ] Configurer pnpm workspaces
- [ ] Configurer TypeScript (strict mode)
- [ ] Configurer ESLint + Prettier
- [ ] Ajouter .gitignore complet

### 1.2 Application Next.js
- [ ] Initialiser Next.js 14 avec App Router
- [ ] Configurer Tailwind CSS
- [ ] Créer le layout de base
- [ ] Ajouter les polices (Inter, Georgia)
- [ ] Configurer les chemins d'alias (@/*)

### 1.3 Vérification
- [ ] `pnpm install` sans erreurs
- [ ] `pnpm build` compile
- [ ] `pnpm dev` démarre le serveur

---

## Phase 2 : Base de Données (Semaine 1-2)

### 2.1 Setup PostgreSQL
- [ ] Ajouter Drizzle ORM
- [ ] Créer la connexion DB
- [ ] Configurer les migrations

### 2.2 Schemas de base
- [ ] Table `projects`
- [ ] Table `documents`
- [ ] Table `users`
- [ ] Relations de base

### 2.3 Vérification
- [ ] Migrations s'appliquent
- [ ] Seed data fonctionne
- [ ] Requêtes de test OK

---

## Phase 3 : API REST Minimale (Semaine 2)

### 3.1 Endpoints Projets
- [ ] GET /api/projects
- [ ] POST /api/projects
- [ ] GET /api/projects/[id]
- [ ] PUT /api/projects/[id]
- [ ] DELETE /api/projects/[id]

### 3.2 Endpoints Documents
- [ ] GET /api/projects/[id]/documents
- [ ] POST /api/projects/[id]/documents
- [ ] GET /api/documents/[id]
- [ ] PUT /api/documents/[id]
- [ ] DELETE /api/documents/[id]

### 3.3 Vérification
- [ ] Tests API avec curl/Postman
- [ ] Validation Zod fonctionne
- [ ] Erreurs gérées proprement

---

## Phase 4 : Interface de Base (Semaine 2-3)

### 4.1 Pages Principales
- [ ] Page d'accueil
- [ ] Liste des projets (dashboard)
- [ ] Création de projet
- [ ] Vue projet (galerie basique)

### 4.2 Composants UI
- [ ] Header/Navigation
- [ ] Card de projet
- [ ] Card de document
- [ ] Formulaires de base

### 4.3 Vérification
- [ ] Navigation fluide
- [ ] Responsive design
- [ ] Pas d'erreurs console

---

## Phase 5 : Upload de Documents (Semaine 3)

### 5.1 Backend Upload
- [ ] Route upload avec multer/formidable
- [ ] Stockage fichiers (local d'abord)
- [ ] Génération de thumbnails
- [ ] Validation des types de fichiers

### 5.2 Frontend Upload
- [ ] Composant drag & drop
- [ ] Preview avant upload
- [ ] Barre de progression
- [ ] Gestion des erreurs

### 5.3 Vérification
- [ ] Upload JPG/PNG/TIFF fonctionne
- [ ] Thumbnails générés
- [ ] Métadonnées sauvegardées

---

## Phase 6 : Galerie Interactive (Semaine 3-4)

### 6.1 Composant Gallery
- [ ] Grille responsive
- [ ] Filtres par catégorie/tags
- [ ] Recherche textuelle
- [ ] Lazy loading

### 6.2 Visualisation Document
- [ ] Page de détail
- [ ] Zoom sur image
- [ ] Métadonnées affichées
- [ ] Navigation entre documents

### 6.3 Vérification
- [ ] Filtrage fonctionne
- [ ] Performances OK avec 100+ images
- [ ] Zoom fluide

---

## Phases Futures (à planifier après Phase 6)

### Phase 7 : Annotations et Hotspots
### Phase 8 : OCR et Transcriptions
### Phase 9 : Ontologie et Graphe
### Phase 10 : Recherche Sémantique
### Phase 11 : Mode Histoire (Stories)
### Phase 12 : Génération IA
### Phase 13 : Build HTML Statique
### Phase 14 : PWA et Offline
### Phase 15 : Authentification et Permissions

---

## Commandes de Développement

```bash
# Installation
pnpm install

# Développement
pnpm dev

# Build
pnpm build

# Tests
pnpm test

# Lint
pnpm lint

# Migrations DB
pnpm db:migrate

# Seed DB
pnpm db:seed
```

---

## Critères de Validation par Phase

Chaque phase doit satisfaire :

1. **Compilation** : `pnpm build` sans erreurs
2. **Lint** : `pnpm lint` sans warnings
3. **Tests** : Tests unitaires passent
4. **Fonctionnel** : Feature utilisable de bout en bout
5. **Commit** : Code versionné avec message descriptif

---

*Plan créé le 17 novembre 2025*
