# ARBORESCENCE CIBLE ARCHIVIA
## Structure complète du projet avec fonctionnalités majeures

**Date** : 17 novembre 2025
**Version** : 1.0 - Pour validation
**Objectif** : Définir l'architecture complète d'Archivia post-migration

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Arborescence complète](#arborescence-complète)
3. [Fonctionnalités par module](#fonctionnalités-par-module)
4. [Routes et navigation](#routes-et-navigation)
5. [Base de données](#base-de-données)
6. [Services et API](#services-et-api)
7. [Composants React](#composants-react)
8. [Scripts et outils](#scripts-et-outils)

---

## VUE D'ENSEMBLE

### Architecture 3 Tiers

```
┌──────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │  WORKSPACE │  │   READER   │  │  INSIGHT   │    │
│  │   (Edit)   │  │   (View)   │  │ (Analyze)  │    │
│  └────────────┘  └────────────┘  └────────────┘    │
└──────────────────────────────────────────────────────┘
                         ↓↑
┌──────────────────────────────────────────────────────┐
│                  API LAYER (Next.js)                 │
│  REST API · GraphQL (futur) · Webhooks              │
└──────────────────────────────────────────────────────┘
                         ↓↑
┌──────────────────────────────────────────────────────┐
│                BACKEND SERVICES                      │
│  OCR · Ontologie · Graphe · Recherche · PWA         │
└──────────────────────────────────────────────────────┘
                         ↓↑
┌──────────────────────────────────────────────────────┐
│              DATA LAYER (PostgreSQL)                 │
│  Documents · Entités · Relations · Users            │
└──────────────────────────────────────────────────────┘
```

### Espaces Fonctionnels

| Espace | Route Base | Utilisateurs | Fonctions Clés |
|--------|-----------|--------------|----------------|
| **WORKSPACE** | `/projects/[id]` | Éditeurs, Curateurs | Upload, OCR, Annotation, Enrichissement |
| **READER** | `/gallery/[id]` | Public, Viewers | Consultation, Navigation, Stories |
| **INSIGHT** | `/projects/[id]/insights` | Analystes, Chercheurs | Graphe, Q&A, Analytics |
| **ADMIN** | `/admin` | Administrateurs | Config, Users, Stats |

---

## ARBORESCENCE COMPLÈTE

```
archivia/
├── 📁 apps/
│   └── 📁 web/                          # Application Next.js principale
│       ├── 📁 app/                      # Next.js App Router
│       │   ├── 📄 layout.tsx            # Layout racine + PWA registration
│       │   ├── 📄 page.tsx              # Homepage publique
│       │   ├── 📄 globals.css           # Styles globaux Tailwind
│       │   │
│       │   ├── 📁 (auth)/               # Routes authentifiées
│       │   │   ├── 📁 projects/         # 🔧 WORKSPACE - Gestion projets
│       │   │   │   ├── 📄 page.tsx      # Liste projets (dashboard)
│       │   │   │   ├── 📄 new/          # Création projet
│       │   │   │   └── 📁 [id]/         # Détail projet
│       │   │   │       ├── 📄 page.tsx               # Vue projet (galerie documents)
│       │   │   │       ├── 📁 documents/
│       │   │   │       │   └── 📁 [docId]/
│       │   │   │       │       ├── 📄 page.tsx       # 📖 Visionneuse document (split view)
│       │   │   │       │       ├── 📁 edit/          # Édition métadonnées
│       │   │   │       │       └── 📁 annotate/      # Éditeur annotations + hotspots
│       │   │   │       ├── 📁 upload/                # Interface upload documents
│       │   │   │       ├── 📁 entities/              # 🧠 Graphe ontologie
│       │   │   │       ├── 📁 insights/              # 🧠 INSIGHT - Analytics
│       │   │   │       ├── 📁 story/                 # 📖 Mode histoire (edit)
│       │   │   │       ├── 📁 export/                # Export HTML statique
│       │   │   │       └── 📁 settings/              # Config projet
│       │   │   │
│       │   │   └── 📁 admin/            # Administration
│       │   │       ├── 📄 page.tsx      # Dashboard admin
│       │   │       ├── 📁 users/        # Gestion utilisateurs
│       │   │       ├── 📁 analytics/    # Statistiques globales
│       │   │       └── 📁 settings/     # Configuration globale (API keys, etc.)
│       │   │
│       │   ├── 📁 (public)/             # Routes publiques
│       │   │   ├── 📁 gallery/          # 📖 READER - Galerie publique
│       │   │   │   └── 📁 [projectId]/
│       │   │   │       ├── 📄 page.tsx              # Galerie interactive
│       │   │   │       └── 📁 [documentId]/
│       │   │   │           └── 📄 page.tsx          # Détail document (public)
│       │   │   │
│       │   │   ├── 📁 story/            # 📖 Mode narratif public
│       │   │   │   └── 📁 [projectId]/
│       │   │   │       └── 📄 page.tsx              # Stories thématiques
│       │   │   │
│       │   │   └── 📁 search/           # Recherche globale
│       │   │       └── 📄 page.tsx      # Page résultats
│       │   │
│       │   ├── 📁 api/                  # API REST
│       │   │   ├── 📁 projects/
│       │   │   │   ├── 📄 route.ts                  # GET/POST projects
│       │   │   │   └── 📁 [id]/
│       │   │   │       ├── 📄 route.ts              # GET/PUT/DELETE project
│       │   │   │       ├── 📁 documents/
│       │   │   │       │   └── 📄 route.ts          # GET/POST documents
│       │   │   │       ├── 📁 entities/
│       │   │   │       │   └── 📄 route.ts          # GET entities + graphe
│       │   │   │       ├── 📁 export/
│       │   │   │       │   └── 📄 route.ts          # POST export HTML
│       │   │   │       ├── 📁 story/
│       │   │   │       │   └── 📄 route.ts          # POST generate story
│       │   │   │       └── 📁 members/
│       │   │   │           └── 📄 route.ts          # GET/POST/DELETE members
│       │   │   │
│       │   │   ├── 📁 documents/
│       │   │   │   └── 📁 [id]/
│       │   │   │       ├── 📄 route.ts              # GET/PUT/DELETE document
│       │   │   │       ├── 📁 ocr/
│       │   │   │       │   └── 📄 route.ts          # POST OCR
│       │   │   │       ├── 📁 extract-entities/
│       │   │   │       │   └── 📄 route.ts          # POST extraction entités
│       │   │   │       ├── 📁 annotations/
│       │   │   │       │   └── 📄 route.ts          # GET/POST annotations
│       │   │   │       └── 📁 hotspots/
│       │   │   │           └── 📄 route.ts          # GET/POST hotspots
│       │   │   │
│       │   │   ├── 📁 upload/
│       │   │   │   └── 📄 route.ts                  # POST upload fichier
│       │   │   │
│       │   │   ├── 📁 search/
│       │   │   │   └── 📄 route.ts                  # GET recherche
│       │   │   │
│       │   │   ├── 📁 analytics/
│       │   │   │   └── 📄 route.ts                  # GET stats (admin)
│       │   │   │
│       │   │   └── 📁 auth/
│       │   │       └── 📁 [...nextauth]/
│       │   │           └── 📄 route.ts              # NextAuth handlers
│       │   │
│       │   └── 📄 middleware.ts         # Middleware auth + edge runtime
│       │
│       ├── 📁 components/               # Composants React
│       │   ├── 📁 ui/                   # Composants UI de base
│       │   │   ├── 📄 Button.tsx
│       │   │   ├── 📄 Card.tsx
│       │   │   ├── 📄 Modal.tsx
│       │   │   ├── 📄 Toast.tsx
│       │   │   └── 📄 Spinner.tsx
│       │   │
│       │   ├── 📁 layout/               # Composants layout
│       │   │   ├── 📄 Header.tsx        # Navigation principale
│       │   │   ├── 📄 Footer.tsx        # Pied de page
│       │   │   ├── 📄 Sidebar.tsx       # Sidebar projets
│       │   │   └── 📄 Breadcrumb.tsx
│       │   │
│       │   ├── 📁 gallery/              # 📖 Galerie interactive (Opale)
│       │   │   ├── 📄 Gallery.tsx       # ⭐ Composant principal galerie
│       │   │   ├── 📄 FilterPanel.tsx   # Filtres catégorie/tags/période
│       │   │   ├── 📄 SearchBar.tsx     # Recherche en temps réel
│       │   │   ├── 📄 DocumentCard.tsx  # Card document
│       │   │   └── 📄 ViewToggle.tsx    # Grid/List/Masonry
│       │   │
│       │   ├── 📁 documents/            # 📖 Visionneuse documents
│       │   │   ├── 📄 DocumentViewer.tsx        # ⭐ Split view image|texte
│       │   │   ├── 📄 PhotoZoom.tsx             # ⭐ Zoom/pan (Opale)
│       │   │   ├── 📄 TranscriptionPanel.tsx    # Panneau transcription
│       │   │   └── 📄 MetadataPanel.tsx         # Panneau métadonnées
│       │   │
│       │   ├── 📁 annotations/          # Annotations collaboratives
│       │   │   ├── 📄 AnnotationEditor.tsx      # Éditeur visuel (Konva.js)
│       │   │   ├── 📄 AnnotationList.tsx
│       │   │   ├── 📄 AnnotationShape.tsx
│       │   │   └── 📄 ToolbarAnnotation.tsx
│       │   │
│       │   ├── 📁 story/                # 📖 Mode histoire (Opale)
│       │   │   ├── 📄 StoryMode.tsx             # ⭐ Composant principal story
│       │   │   ├── 📄 HotspotLayer.tsx          # Layer hotspots
│       │   │   ├── 📄 InfoPanel.tsx             # Panneau info hotspot
│       │   │   ├── 📄 RelatedCarousel.tsx       # Carrousel images liées
│       │   │   └── 📄 ThemeNavigator.tsx        # Navigation thématique
│       │   │
│       │   ├── 📁 ontology/             # 🧠 Graphe de connaissances
│       │   │   ├── 📄 KnowledgeGraph.tsx        # ⭐ Visualisation D3.js
│       │   │   ├── 📄 EntityCard.tsx            # Card entité
│       │   │   ├── 📄 RelationshipList.tsx
│       │   │   └── 📄 FilterGraph.tsx
│       │   │
│       │   ├── 📁 upload/               # Upload documents
│       │   │   ├── 📄 UploadZone.tsx            # Drag & drop
│       │   │   ├── 📄 ProgressBar.tsx
│       │   │   └── 📄 FilePreview.tsx
│       │   │
│       │   ├── 📁 search/               # Recherche
│       │   │   ├── 📄 SearchInput.tsx
│       │   │   ├── 📄 SearchResults.tsx
│       │   │   └── 📄 SearchFilters.tsx
│       │   │
│       │   ├── 📁 admin/                # Administration
│       │   │   ├── 📄 Dashboard.tsx
│       │   │   ├── 📄 UserTable.tsx
│       │   │   └── 📄 StatsCards.tsx
│       │   │
│       │   └── 📁 pwa/                  # PWA
│       │       ├── 📄 InstallPWA.tsx            # ⭐ Prompt installation (Opale)
│       │       └── 📄 OfflineBanner.tsx
│       │
│       ├── 📁 lib/                      # Services et utilitaires
│       │   ├── 📁 services/
│       │   │   ├── 📄 ocr-service.ts            # ⭐ Service OCR (existant + Python)
│       │   │   ├── 📄 ontology-extractor.ts    # ⭐ Extraction ontologie (JdG)
│       │   │   ├── 📄 entity-extraction.ts      # ⭐ Service entités (existant)
│       │   │   ├── 📄 search-service.ts         # Recherche hybride
│       │   │   ├── 📄 export-service.ts         # Export HTML
│       │   │   └── 📄 story-generator.ts        # Génération histoires IA
│       │   │
│       │   ├── 📁 ontologies/           # Ontologies par domaine
│       │   │   ├── 📄 default-ontology.json     # Ontologie générique
│       │   │   ├── 📄 war-ontology.json         # WWI/WWII
│       │   │   └── 📄 family-ontology.json      # Archives familiales
│       │   │
│       │   ├── 📁 utils/
│       │   │   ├── 📄 auth.ts           # Helpers auth NextAuth
│       │   │   ├── 📄 file.ts           # Helpers fichiers
│       │   │   ├── 📄 image.ts          # Traitement images
│       │   │   └── 📄 validation.ts     # Validateurs Zod
│       │   │
│       │   └── 📁 hooks/                # React hooks custom
│       │       ├── 📄 useDocuments.ts
│       │       ├── 📄 useAnnotations.ts
│       │       ├── 📄 useOCR.ts
│       │       └── 📄 useDebounce.ts
│       │
│       ├── 📁 scripts/                  # Scripts Python utilitaires
│       │   ├── 📄 extract_text.py              # ⭐ OCR multi-provider (JdG)
│       │   ├── 📄 build_semantic_graph.py      # ⭐ Graphe sémantique (Opale)
│       │   ├── 📄 convert_tiff_to_jpg.py       # ⭐ Conversion batch (Opale)
│       │   ├── 📄 verify_images.py             # ⭐ QA images (Opale)
│       │   ├── 📄 generate_hotspots.py         # ⭐ Hotspots IA (Opale)
│       │   └── 📄 requirements.txt             # Dépendances Python
│       │
│       ├── 📁 public/                   # Assets statiques
│       │   ├── 📄 manifest.json                # ⭐ PWA Manifest (Opale)
│       │   ├── 📄 sw.js                        # ⭐ Service Worker (Opale)
│       │   ├── 📁 icons/                       # Icons PWA (72, 192, 512)
│       │   ├── 📁 uploads/                     # Documents uploadés
│       │   ├── 📁 thumbnails/                  # Miniatures
│       │   └── 📁 transcriptions/              # Fichiers transcription txt
│       │
│       ├── 📁 tests/                    # Tests
│       │   ├── 📄 api.test.ts
│       │   ├── 📄 schemas.test.ts
│       │   └── 📄 thumbnails.test.ts
│       │
│       ├── 📄 next.config.js            # ⭐ Config Next.js (Opale)
│       ├── 📄 tailwind.config.ts        # ⭐ Config Tailwind + palette (Opale)
│       ├── 📄 tsconfig.json
│       ├── 📄 package.json
│       ├── 📄 .env.example
│       └── 📄 vitest.config.ts
│
├── 📁 packages/                         # Packages partagés (monorepo)
│   ├── 📁 database/                     # Drizzle ORM + SQLite/PostgreSQL
│   │   ├── 📁 src/
│   │   │   ├── 📄 schema.ts             # Schéma complet des tables
│   │   │   ├── 📄 index.ts              # Connexion DB
│   │   │   ├── 📄 migrate.ts            # Script migration
│   │   │   └── 📄 seed.ts               # Données de test
│   │   ├── 📁 drizzle/                  # Migrations générées
│   │   ├── 📄 drizzle.config.ts
│   │   └── 📄 package.json
│   │
│   └── 📁 shared-types/                 # Types TypeScript partagés
│       ├── 📁 src/
│       │   ├── 📄 index.ts              # Types principaux
│       │   └── 📄 api.ts                # Schémas Zod API
│       └── 📄 package.json
│
├── 📁 _IMPLEMENTATION/                  # 📚 Documentation et sources
│   ├── 📁 opale/                        # Clone projet Opale
│   ├── 📁 journal_de_guerre/            # Clone projet Journal de Guerre
│   ├── 📄 INVENTAIRE_CODE_REUTILISABLE.md       # Inventaire complet
│   ├── 📄 PLAN_MIGRATION_FEATURES.md            # Instructions migration
│   └── 📄 ARBORESCENCE_CIBLE.md                 # Ce document
│
├── 📁 docs/                             # Documentation
│   ├── 📄 GUIDE_UTILISATEUR.md
│   ├── 📄 TECHNICAL_README.md
│   └── 📄 API.md
│
├── 📄 README.md
├── 📄 package.json                      # Config racine monorepo
├── 📄 pnpm-workspace.yaml
├── 📄 .gitignore
└── 📄 LICENSE
```

---

## FONCTIONNALITÉS PAR MODULE

### 🔧 WORKSPACE - Espace Travail

**Route** : `/projects/[id]`
**Utilisateurs** : Éditeurs, Curateurs, Admins

| Fonctionnalité | Composant/API | Source | Status |
|----------------|---------------|--------|--------|
| **Galerie documents** | `Gallery.tsx` | Opale | ⭐ À adapter |
| **Upload documents** | `UploadZone.tsx` | Nouveau | ✅ Existant |
| **OCR automatique** | `extract_text.py` | JdG | ⭐ À copier |
| **Visionneuse split** | `DocumentViewer.tsx` | Nouveau | 🔨 À créer |
| **Éditeur annotations** | `AnnotationEditor.tsx` | Nouveau | 🔨 À créer |
| **Éditeur hotspots** | `AnnotationEditor.tsx` | Nouveau | 🔨 À créer |
| **Extraction entités** | `ontology-extractor.ts` | JdG | ⭐ À porter |
| **Gestion membres** | API `/members` | Existant | ✅ Existant |
| **Export HTML** | `export-service.ts` | Existant | ✅ Existant |

### 📖 READER - Espace Lecture

**Route** : `/gallery/[projectId]`, `/story/[projectId]`
**Utilisateurs** : Public, Viewers

| Fonctionnalité | Composant/API | Source | Status |
|----------------|---------------|--------|--------|
| **Galerie publique** | `Gallery.tsx` | Opale | ⭐ À adapter |
| **Mode histoire** | `StoryMode.tsx` | Opale | ⭐ À adapter |
| **Hotspots interactifs** | `HotspotLayer.tsx` | Opale | ⭐ À adapter |
| **Zoom/pan images** | `PhotoZoom.tsx` | Opale | ⭐ Copier tel quel |
| **Carrousel images liées** | `RelatedCarousel.tsx` | Opale | ⭐ À adapter |
| **Navigation thématique** | `ThemeNavigator.tsx` | Opale | ⭐ À adapter |
| **PWA offline** | `sw.js` + `InstallPWA.tsx` | Opale | ⭐ Copier + adapter |
| **Recherche publique** | API `/search` | Nouveau | 🔨 À créer |

### 🧠 INSIGHT - Espace Compréhension

**Route** : `/projects/[id]/insights`
**Utilisateurs** : Analystes, Chercheurs

| Fonctionnalité | Composant/API | Source | Status |
|----------------|---------------|--------|--------|
| **Graphe de connaissances** | `KnowledgeGraph.tsx` | JdG | ⭐ À wrapper React |
| **Visualisation D3** | D3.js force layout | JdG | ⭐ À intégrer |
| **Explorer entités** | `EntityCard.tsx` | Nouveau | 🔨 À créer |
| **Relations sémantiques** | `RelationshipList.tsx` | Nouveau | 🔨 À créer |
| **Analytics projet** | API `/analytics` | Existant | ✅ Existant |
| **Génération histoires** | `story-generator.ts` | Existant | ✅ Existant |
| **Recherche sémantique** | API `/search` | Nouveau | 🔨 À créer |

### 🛠️ Scripts et Outils

| Script | Fonction | Source | Status |
|--------|----------|--------|--------|
| `extract_text.py` | OCR multi-provider (Ollama, Claude) | JdG | ⭐ Copier tel quel |
| `ontology-extractor.ts` | Extraction entités automatique | JdG | ⭐ Porter TS |
| `build_semantic_graph.py` | Construction graphe sémantique | Opale | ⭐ Adapter |
| `convert_tiff_to_jpg.py` | Conversion batch TIFF→JPG | Opale | ⭐ Copier tel quel |
| `verify_images.py` | QA intégrité images | Opale | ⭐ Copier tel quel |
| `generate_hotspots.py` | Génération hotspots IA | Opale | ⭐ Adapter |

---

## ROUTES ET NAVIGATION

### Routes Authentifiées

```
/projects                                   Liste des projets
  /new                                      Créer un projet
  /[id]                                     Détail projet (galerie)
    /upload                                 Upload documents
    /documents/[docId]                      Visionneuse document
      /edit                                 Édition métadonnées
      /annotate                             Annotations + hotspots
    /entities                               Graphe ontologie
    /insights                               Analytics avancées
    /story                                  Éditeur mode histoire
    /export                                 Export HTML
    /settings                               Configuration

/admin                                      Dashboard admin
  /users                                    Gestion utilisateurs
  /analytics                                Stats globales
  /settings                                 Config globale (API keys)
```

### Routes Publiques

```
/                                           Homepage
/gallery/[projectId]                        Galerie publique
  /[documentId]                             Document public
/story/[projectId]                          Mode narratif public
/search                                     Recherche globale
```

### API Routes

```
GET    /api/projects                        Liste projets
POST   /api/projects                        Créer projet
GET    /api/projects/[id]                   Détail projet
PUT    /api/projects/[id]                   Modifier projet
DELETE /api/projects/[id]                   Supprimer projet

GET    /api/projects/[id]/documents         Liste documents
POST   /api/projects/[id]/documents         Créer document

GET    /api/documents/[id]                  Détail document
PUT    /api/documents/[id]                  Modifier document
DELETE /api/documents/[id]                  Supprimer document
POST   /api/documents/[id]/ocr              Lancer OCR
POST   /api/documents/[id]/extract-entities Extraire entités

GET    /api/projects/[id]/entities          Liste entités + graphe
POST   /api/projects/[id]/story             Générer histoire
POST   /api/projects/[id]/export            Export HTML

POST   /api/upload                          Upload fichier
GET    /api/search                          Recherche
GET    /api/analytics                       Stats admin
```

---

## BASE DE DONNÉES

### Schéma des Tables

```sql
-- Projets
projects (
  id, name, slug, description, config,
  created_at, updated_at
)

-- Documents
documents (
  id, project_id, type, title, file_path, thumbnail_path,
  transcription, transcription_status, transcription_provider,
  category, period, tags[], historical_context,
  metadata, created_at, updated_at
)

-- Entités (Ontologie)
entities (
  id, project_id, type, name, aliases[],
  description, properties, created_at
)

-- Relations entre entités
entity_relationships (
  id, source_id, target_id,
  relation_type, properties, weight,
  created_at
)

-- Liens document-entité
document_entities (
  document_id, entity_id,
  mention_count, confidence, contexts[],
  PRIMARY KEY (document_id, entity_id)
)

-- Annotations
annotations (
  id, document_id, user_id,
  type, content, x, y, width, height,
  metadata, status, created_at
)

-- Hotspots
hotspots (
  id, document_id, entity_id,
  x, y, radius, label, color,
  metadata, created_at
)

-- Relations hotspot-documents
hotspot_relations (
  hotspot_id, related_document_id,
  similarity_score, relation_type,
  PRIMARY KEY (hotspot_id, related_document_id)
)

-- Utilisateurs
users (
  id, email, name, role,
  created_at
)

-- Membres de projet
project_members (
  project_id, user_id, role,
  PRIMARY KEY (project_id, user_id)
)

-- Configuration globale
app_config (
  key, value, description
)
```

---

## SERVICES ET API

### Services Backend

| Service | Fichier | Fonction | Provider |
|---------|---------|----------|----------|
| **OCR** | `ocr-service.ts` | Transcription documents | Claude Vision |
| **OCR Python** | `extract_text.py` | OCR multi-provider | Ollama/Claude |
| **Ontologie** | `ontology-extractor.ts` | Extraction entités | Local + LLM |
| **Entités** | `entity-extraction.ts` | Extraction + parsing | Claude |
| **Graphe** | `build_semantic_graph.py` | Relations sémantiques | Python |
| **Recherche** | `search-service.ts` | Full-text + sémantique | PostgreSQL |
| **Export** | `export-service.ts` | Génération HTML | JSZip |
| **Stories** | `story-generator.ts` | Narratif IA | Claude |

### APIs Externes

| API | Usage | Coût |
|-----|-------|------|
| **Anthropic Claude** | OCR Vision, Extraction entités, Stories | ~$0.02/page |
| **Ollama (local)** | OCR gratuit | Gratuit |
| **(Futur) OpenAI** | Embeddings vectoriels | ~$0.0001/1K tokens |

---

## COMPOSANTS REACT

### Composants Clés Réutilisés

| Composant | Source | Taille | Réutilisabilité | Adaptations |
|-----------|--------|--------|----------------|-------------|
| **Gallery.tsx** | Opale | 35 KB | 80% | Source données, catégories, couleurs |
| **StoryMode.tsx** | Opale | 35 KB | 80% | Thèmes, types hotspots, données |
| **PhotoZoom.tsx** | Opale | 4 KB | 100% | Aucune |
| **InstallPWA.tsx** | Opale | 5.5 KB | 100% | Branding |
| **KnowledgeGraph** | JdG | 10 KB (JS) | 90% | Wrapper React, types |

### Nouveaux Composants à Créer

| Composant | Fonction | Priorité |
|-----------|----------|----------|
| `DocumentViewer.tsx` | Split view image\|texte | 🔴 Haute |
| `AnnotationEditor.tsx` | Éditeur annotations visuel | 🟡 Moyenne |
| `SearchResults.tsx` | Affichage résultats recherche | 🟡 Moyenne |
| `EntityCard.tsx` | Card entité avec relations | 🟢 Basse |
| `RelationshipList.tsx` | Liste relations entité | 🟢 Basse |

---

## SCRIPTS ET OUTILS

### Scripts Python à Copier

```bash
# OCR multi-provider
scripts/extract_text.py              # ✅ Copier tel quel

# Graphe sémantique
scripts/build_semantic_graph.py      # ⚠️ Adapter ontologie

# Utilitaires images
scripts/convert_tiff_to_jpg.py       # ✅ Copier tel quel
scripts/verify_images.py             # ✅ Copier tel quel
scripts/generate_hotspots.py         # ⚠️ Adapter types
```

### Scripts Node.js à Créer

```bash
# Migration de données
scripts/import-opale.ts              # Import projet Opale
scripts/import-journal.ts            # Import Journal de Guerre

# Maintenance
scripts/cleanup-orphans.ts           # Nettoyage fichiers orphelins
scripts/rebuild-thumbnails.ts        # Régénération miniatures
scripts/reindex-search.ts            # Réindexation recherche
```

---

## VALIDATION CHECKLIST

### Phase 1 : Fondations ✅
- [ ] Arborescence créée
- [ ] Monorepo pnpm configuré
- [ ] Database package avec Drizzle
- [ ] Shared-types package créé
- [ ] Tailwind config avec palette Archivia

### Phase 2 : Composants Universels ⭐
- [ ] PhotoZoom.tsx copié → `/components/documents/`
- [ ] InstallPWA.tsx copié → `/components/pwa/`
- [ ] manifest.json + sw.js copiés → `/public/`
- [ ] extract_text.py copié → `/scripts/`
- [ ] verify_images.py copié → `/scripts/`
- [ ] convert_tiff_to_jpg.py copié → `/scripts/`

### Phase 3 : Composants Core ⭐
- [ ] Gallery.tsx adapté → `/components/gallery/`
- [ ] DocumentViewer.tsx créé → `/components/documents/`
- [ ] ontology-extractor.ts porté → `/lib/services/`
- [ ] KnowledgeGraph.tsx wrapper créé → `/components/ontology/`

### Phase 4 : Composants Avancés ⭐
- [ ] StoryMode.tsx adapté → `/components/story/`
- [ ] AnnotationEditor.tsx créé → `/components/annotations/`
- [ ] SearchResults.tsx créé → `/components/search/`

### Phase 5 : APIs et Routes
- [ ] Routes projets complètes
- [ ] Routes documents complètes
- [ ] Route OCR fonctionnelle
- [ ] Route extraction entités fonctionnelle
- [ ] Route graphe fonctionnelle
- [ ] Route recherche fonctionnelle

### Phase 6 : Tests et Validation
- [ ] Tests API passent
- [ ] Tests composants passent
- [ ] Type-check sans erreur
- [ ] Lint sans warning
- [ ] Build production OK
- [ ] PWA installable

---

## TECHNOLOGIES ET DÉPENDANCES

### Frontend

```json
{
  "next": "^14.2.3",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "framer-motion": "^11.0.3",
  "react-zoom-pan-pinch": "^3.7.0",
  "d3": "^7.8.5",
  "konva": "^9.2.0",
  "react-konva": "^18.2.10"
}
```

### Backend

```json
{
  "@libsql/client": "^0.5.22",
  "drizzle-orm": "^0.30.10",
  "next-auth": "^5.0.0-beta.17",
  "@anthropic-ai/sdk": "^0.18.0",
  "zod": "^3.22.4",
  "sharp": "^0.33.2",
  "jszip": "^3.10.1"
}
```

### Python

```txt
anthropic>=0.18.0
ollama>=0.1.0
Pillow>=10.0.0
python-dotenv>=1.0.0
```

---

## MÉTRIQUES PROJET

| Métrique | Valeur |
|----------|--------|
| **Routes Next.js** | ~30 routes |
| **Composants React** | ~45 composants |
| **API Endpoints** | ~25 endpoints |
| **Scripts Python** | 6 scripts |
| **Tables DB** | 11 tables |
| **Packages** | 2 packages (database, shared-types) |
| **Lignes code réutilisé** | ~6,500 lignes |
| **Gain temps estimé** | 4-6 semaines |

---

## NOTES FINALES

### Priorités d'Implémentation

1. **🔴 CRITIQUE** : DocumentViewer + OCR pipeline
2. **🔴 HAUTE** : Gallery + Ontologie
3. **🟡 MOYENNE** : StoryMode + Graphe
4. **🟢 BASSE** : Annotations + Recherche avancée

### Points de Décision Requis

1. ✅ **Palette de couleurs** : Valider `heritage-*` vs nouvelle palette
2. ✅ **Ontologie par défaut** : Valider entities types (person, place, event, object, concept)
3. ✅ **PWA stratégie** : Valider stratégies de cache (images, pages, API)
4. ❓ **Recherche vectorielle** : Implémenter maintenant ou plus tard ?
5. ❓ **Multilangue** : FR/EN dès le début ou Phase 2 ?

---

**FIN DE L'ARBORESCENCE CIBLE**

**Date** : 17 novembre 2025
**Version** : 1.0
**Statut** : ✅ Prêt pour validation
**Prochaine étape** : Validation puis début implémentation Phase 1
