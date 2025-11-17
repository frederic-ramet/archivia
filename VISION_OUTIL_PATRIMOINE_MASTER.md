# Vision : Plateforme Patrimoniale Unifiée

## Executive Summary

Ce document définit la vision d'une **plateforme open-source de numérisation, analyse et valorisation du patrimoine** combinant le meilleur des projets Journal de Guerre (OCR + analyse sémantique) et Opale (présentation interactive + PWA). L'objectif est de créer un outil générique, extensible et performant pour tout projet de préservation patrimoniale.

**Nom proposé** : `Archivia` - Archive Interactive et Visuelle avec Intelligence Artificielle

---

## 1. Synthèse Comparative

### 1.1 Forces à Combiner

| Capacité | Journal de Guerre | Opale | Solution Master |
|----------|------------------|-------|-----------------|
| **OCR Manuscrit** | ✅ Multi-provider (Ollama/Claude) | ❌ | ✅ Intégré + amélioré |
| **Ontologie** | ✅ Extraction automatique | ⚠️ Partiel | ✅ Complet + éditable |
| **Recherche sémantique** | ✅ Embeddings | ⚠️ Full-text basique | ✅ Hybride vectoriel |
| **Frontend moderne** | ❌ EJS SSR | ✅ Next.js 14 + React | ✅ Next.js 15 + React 19 |
| **TypeScript** | ❌ JavaScript | ✅ Strict mode | ✅ Strict + schemas Zod |
| **PWA** | ❌ | ✅ Complet | ✅ Offline-first |
| **Hotspots** | ❌ | ✅ 35KB composant | ✅ + éditeur visuel |
| **Mode narratif** | ❌ | ✅ Stories | ✅ + génération IA |
| **Timeline** | ❌ | ✅ Interactive | ✅ + filtres avancés |
| **Annotations** | ❌ | ❌ | ✅ Collaboratives |
| **API REST** | ⚠️ Basique | ❌ | ✅ Complète + GraphQL |
| **Multi-corpus** | ❌ Mono-projet | ❌ Mono-projet | ✅ Multi-tenant |
| **Export** | ❌ | ❌ | ✅ PDF, JSON-LD, BibTeX |

### 1.2 Architecture Cible

```
ARCHIVIA PLATFORM
├── 🎯 CORE ENGINE (Backend)
│   ├── API REST/GraphQL
│   ├── Base de données relationnelle + vectorielle
│   ├── Service OCR multi-provider
│   ├── Service ontologie/NLP
│   └── Service recherche hybride
│
├── 🖥️ STUDIO (Interface d'édition)
│   ├── Import de documents
│   ├── Éditeur d'annotations
│   ├── Créateur de hotspots
│   ├── Gestionnaire d'ontologie
│   └── Générateur de contenus IA
│
├── 📱 VIEWER (Interface publique)
│   ├── Galerie interactive
│   ├── Mode histoire immersif
│   ├── Recherche sémantique
│   ├── Timeline & cartes
│   └── PWA offline
│
└── 🔌 EXTENSIONS
    ├── Plugins d'import (TIFF, PDF, etc.)
    ├── Connecteurs IA (Ollama, Claude, GPT)
    ├── Exports (PDF, IIIF, JSON-LD)
    └── Intégrations (Notion, Airtable)
```

---

## 2. Spécifications Techniques Détaillées

### 2.1 Stack Technologique Recommandé

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Framework** | Next.js 15 (App Router) | SSR/SSG/ISR + Edge Runtime |
| **UI** | React 19 + Server Components | Performance maximale |
| **Typage** | TypeScript 5.4+ strict | Robustesse code |
| **Validation** | Zod | Schemas runtime + types |
| **State** | Zustand + React Query | Léger + cache intelligent |
| **Styling** | Tailwind CSS 4.0 | Design system cohérent |
| **Animation** | Framer Motion 12 | UX fluide |
| **Base données** | PostgreSQL + pgvector | Relationnel + vectoriel |
| **ORM** | Drizzle ORM | Type-safe, performant |
| **Auth** | NextAuth.js v5 | Multi-provider |
| **Storage** | S3/R2 | Images haute résolution |
| **Cache** | Redis | Session + requêtes |
| **Search** | Meilisearch | Full-text rapide |
| **Vectors** | pgvector | Embeddings sémantiques |
| **Queue** | BullMQ | Jobs asynchrones (OCR) |
| **OCR** | Tesseract + Claude/Ollama | Multi-engine |
| **NLP** | spaCy + sentence-transformers | FR/EN support |
| **PWA** | Workbox | Service Worker avancé |
| **Deploy** | Vercel/Railway + Docker | Scalable |

### 2.2 Structure du Projet

```
archivia/
├── apps/
│   ├── web/                    # Application principale Next.js
│   │   ├── app/
│   │   │   ├── (auth)/         # Routes authentifiées
│   │   │   │   ├── studio/     # Interface d'édition
│   │   │   │   └── dashboard/  # Tableau de bord
│   │   │   ├── (public)/       # Routes publiques
│   │   │   │   ├── gallery/    # Galerie interactive
│   │   │   │   ├── story/      # Mode narratif
│   │   │   │   ├── search/     # Recherche avancée
│   │   │   │   ├── timeline/   # Frise chronologique
│   │   │   │   └── map/        # Visualisation géo
│   │   │   ├── api/            # API Routes
│   │   │   │   ├── documents/
│   │   │   │   ├── annotations/
│   │   │   │   ├── ontology/
│   │   │   │   ├── search/
│   │   │   │   └── ai/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # Composants de base
│   │   │   ├── gallery/        # Galerie
│   │   │   ├── editor/         # Éditeurs
│   │   │   ├── annotations/    # Annotations
│   │   │   ├── ontology/       # Graphe
│   │   │   └── story/          # Narratif
│   │   ├── lib/
│   │   │   ├── db/             # Drizzle schemas
│   │   │   ├── ai/             # Services IA
│   │   │   ├── search/         # Moteur recherche
│   │   │   └── utils/
│   │   └── hooks/              # React hooks custom
│   │
│   └── workers/                # Services background
│       ├── ocr-worker/         # Extraction texte
│       ├── embedding-worker/   # Génération vecteurs
│       └── export-worker/      # Génération exports
│
├── packages/
│   ├── database/               # Schemas Drizzle partagés
│   ├── ai-services/            # Abstraction providers IA
│   ├── ontology-engine/        # Moteur ontologique
│   ├── search-engine/          # Moteur recherche hybride
│   └── shared-types/           # Types TypeScript partagés
│
├── scripts/
│   ├── seed-db.ts              # Données initiales
│   ├── migrate.ts              # Migrations DB
│   └── import-legacy.ts        # Import depuis anciens projets
│
└── docs/
    ├── api/                    # Documentation API
    ├── guides/                 # Tutoriels utilisateurs
    └── architecture/           # Documentation technique
```

### 2.3 Schéma de Base de Données

```sql
-- Core entities
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'image', 'manuscript', 'printed', 'mixed'
  title VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  -- Champs hérités de Journal de Guerre
  transcription TEXT,
  transcription_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'verified'
  transcription_provider VARCHAR(50), -- 'ollama', 'claude', 'manual'
  -- Champs hérités d'Opale
  category VARCHAR(100),
  period VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  historical_context TEXT,
  -- Recherche
  search_vector tsvector,
  embedding vector(384), -- sentence-transformers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_search ON documents USING gin(search_vector);
CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops);

-- Annotations (nouveau)
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'note', 'correction', 'hotspot', 'region'
  content TEXT,
  -- Coordonnées pour hotspots/régions
  x DECIMAL,
  y DECIMAL,
  width DECIMAL,
  height DECIMAL,
  -- Métadonnées
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ontologie (hérité de Journal de Guerre, amélioré)
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- 'person', 'place', 'concept', 'object', 'event'
  name VARCHAR(255) NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  description TEXT,
  properties JSONB DEFAULT '{}',
  embedding vector(384),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE entity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  target_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  relation_type VARCHAR(100) NOT NULL, -- 'is_part_of', 'created_by', 'located_in', etc.
  properties JSONB DEFAULT '{}',
  weight DECIMAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_entities (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  mention_count INTEGER DEFAULT 1,
  confidence DECIMAL DEFAULT 1.0,
  contexts JSONB DEFAULT '[]', -- positions dans le texte
  PRIMARY KEY (document_id, entity_id)
);

-- Hotspots (hérité d'Opale)
CREATE TABLE hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id),
  x DECIMAL NOT NULL,
  y DECIMAL NOT NULL,
  radius DECIMAL DEFAULT 5,
  label VARCHAR(255),
  color VARCHAR(20) DEFAULT '#3B82F6',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hotspot_relations (
  hotspot_id UUID REFERENCES hotspots(id) ON DELETE CASCADE,
  related_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  similarity_score DECIMAL DEFAULT 0.5,
  relation_type VARCHAR(100),
  PRIMARY KEY (hotspot_id, related_document_id)
);

-- Contextes historiques (hérité d'Opale)
CREATE TABLE historical_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  period_start DATE,
  period_end DATE,
  description TEXT,
  content JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories/Narratifs (hérité d'Opale)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_id UUID REFERENCES documents(id),
  content JSONB DEFAULT '[]', -- Séquence d'éléments
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utilisateurs et permissions
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'viewer', -- 'admin', 'editor', 'contributor', 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'viewer',
  PRIMARY KEY (project_id, user_id)
);

-- Jobs asynchrones (OCR, embeddings, exports)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL, -- 'ocr', 'embedding', 'export', 'entity_extraction'
  status VARCHAR(50) DEFAULT 'pending',
  payload JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

### 2.4 API REST Specification

```typescript
// Types principaux (packages/shared-types)
import { z } from 'zod';

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  type: z.enum(['image', 'manuscript', 'printed', 'mixed']),
  title: z.string().min(1),
  filePath: z.string(),
  thumbnailPath: z.string().optional(),
  transcription: z.string().optional(),
  transcriptionStatus: z.enum(['pending', 'processing', 'completed', 'verified']),
  category: z.string().optional(),
  period: z.string().optional(),
  tags: z.array(z.string()),
  historicalContext: z.string().optional(),
  metadata: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AnnotationSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['note', 'correction', 'hotspot', 'region']),
  content: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  metadata: z.record(z.unknown()),
  status: z.enum(['draft', 'published', 'archived']),
  createdAt: z.date(),
});

export const SearchQuerySchema = z.object({
  query: z.string().min(1),
  projectId: z.string().uuid().optional(),
  filters: z.object({
    types: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    periods: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.date().optional(),
      end: z.date().optional(),
    }).optional(),
  }).optional(),
  mode: z.enum(['text', 'semantic', 'hybrid']).default('hybrid'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// API Endpoints (apps/web/app/api/)

// Documents
GET    /api/projects/:projectId/documents
POST   /api/projects/:projectId/documents
GET    /api/documents/:id
PUT    /api/documents/:id
DELETE /api/documents/:id
POST   /api/documents/:id/transcribe      // Lancer OCR
POST   /api/documents/:id/generate-embedding
GET    /api/documents/:id/similar

// Annotations
GET    /api/documents/:id/annotations
POST   /api/documents/:id/annotations
PUT    /api/annotations/:id
DELETE /api/annotations/:id

// Hotspots
GET    /api/documents/:id/hotspots
POST   /api/documents/:id/hotspots
PUT    /api/hotspots/:id
DELETE /api/hotspots/:id
GET    /api/hotspots/:id/related

// Ontologie
GET    /api/projects/:projectId/entities
POST   /api/projects/:projectId/entities
GET    /api/entities/:id
PUT    /api/entities/:id
DELETE /api/entities/:id
GET    /api/entities/:id/relationships
POST   /api/entities/:id/relationships
GET    /api/documents/:id/entities        // Entités mentionnées
POST   /api/documents/:id/extract-entities // NLP automatique

// Recherche
POST   /api/search                        // Recherche hybride
GET    /api/search/suggestions            // Auto-complete
POST   /api/search/semantic               // Requête vectorielle pure

// Stories
GET    /api/projects/:projectId/stories
POST   /api/projects/:projectId/stories
GET    /api/stories/:id
PUT    /api/stories/:id
DELETE /api/stories/:id
POST   /api/stories/:id/generate          // Génération IA

// Export
POST   /api/export/pdf
POST   /api/export/json-ld
POST   /api/export/bibtex
POST   /api/export/iiif

// AI Services
POST   /api/ai/transcribe                 // OCR single
POST   /api/ai/transcribe-batch           // OCR batch
POST   /api/ai/describe-image             // Description visuelle
POST   /api/ai/extract-entities           // NER
POST   /api/ai/generate-story             // Narratif automatique
POST   /api/ai/suggest-hotspots           // Détection zones intérêt
```

---

## 3. Fonctionnalités Détaillées

### 3.1 Module OCR/Transcription (de Journal de Guerre)

**Améliorations proposées** :

```typescript
// packages/ai-services/src/ocr.ts
import { z } from 'zod';

export const OCRConfigSchema = z.object({
  provider: z.enum(['tesseract', 'ollama', 'claude', 'google-vision']),
  model: z.string().optional(),
  language: z.enum(['fra', 'eng', 'deu', 'auto']).default('fra'),
  mode: z.enum(['printed', 'handwritten', 'mixed']).default('mixed'),
  preprocessing: z.object({
    deskew: z.boolean().default(true),
    denoise: z.boolean().default(true),
    binarize: z.boolean().default(false),
    splitQuadrants: z.boolean().default(false), // Hérité de Journal de Guerre
  }).default({}),
  postprocessing: z.object({
    spellcheck: z.boolean().default(true),
    deduplicate: z.boolean().default(true),
    structureDetection: z.boolean().default(true), // Paragraphes, listes
  }).default({}),
});

export interface OCRService {
  transcribe(imagePath: string, config: OCRConfig): Promise<TranscriptionResult>;
  transcribeBatch(imagePaths: string[], config: OCRConfig): Promise<TranscriptionResult[]>;
  estimateCost(imagePaths: string[], provider: string): Promise<CostEstimate>;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
  metadata: {
    provider: string;
    duration: number;
    cost?: number;
  };
}

export interface TextBlock {
  text: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  type: 'paragraph' | 'line' | 'word';
}
```

**Workflow OCR** :

1. Upload document → Queue job
2. Preprocessing (deskew, denoise, split si nécessaire)
3. Envoi au provider (Tesseract local / Claude cloud)
4. Post-processing (correction, structure)
5. Extraction d'entités automatique
6. Génération embeddings
7. Indexation recherche
8. Notification utilisateur

### 3.2 Module Galerie Interactive (de Opale)

**Composant Gallery enrichi** :

```typescript
// apps/web/components/gallery/Gallery.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { DocumentCard } from './DocumentCard';
import { FilterPanel } from './FilterPanel';
import { SearchBar } from './SearchBar';
import { ViewToggle } from './ViewToggle';

interface GalleryProps {
  projectId: string;
  initialFilters?: FilterOptions;
}

export function Gallery({ projectId, initialFilters }: GalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {});
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>('masonry');
  const [searchMode, setSearchMode] = useState<'text' | 'semantic' | 'hybrid'>('hybrid');

  const debouncedQuery = useDebounce(searchQuery, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['documents', projectId, debouncedQuery, filters, searchMode],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: debouncedQuery,
          projectId,
          filters,
          mode: searchMode,
          limit: 20,
          offset: pageParam,
        }),
      });
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.documents.length < 20) return undefined;
      return pages.length * 20;
    },
    initialPageParam: 0,
  });

  const documents = useMemo(() =>
    data?.pages.flatMap(page => page.documents) || [],
    [data]
  );

  // Intersection Observer pour infinite scroll
  const observerRef = useInfiniteScrollObserver(fetchNextPage, hasNextPage);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Panneau de filtres */}
      <aside className="w-full lg:w-64 shrink-0">
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          projectId={projectId}
        />
      </aside>

      {/* Zone principale */}
      <main className="flex-1">
        {/* Barre de recherche */}
        <div className="mb-6 flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Recherche sémantique..."
          />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <SearchModeToggle mode={searchMode} onChange={setSearchMode} />
        </div>

        {/* Résultats */}
        <AnimatePresence mode="popLayout">
          <motion.div
            className={cn(
              viewMode === 'masonry' && 'columns-1 md:columns-2 lg:columns-3 gap-4',
              viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4',
              viewMode === 'list' && 'flex flex-col gap-2'
            )}
          >
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <DocumentCard
                  document={doc}
                  viewMode={viewMode}
                  onAnnotate={() => openAnnotationEditor(doc)}
                  onViewHotspots={() => openStoryMode(doc)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Infinite scroll trigger */}
        <div ref={observerRef} className="h-10 mt-4">
          {isFetchingNextPage && <Spinner />}
        </div>
      </main>
    </div>
  );
}
```

### 3.3 Module Annotations Collaboratives (NOUVEAU)

```typescript
// apps/web/components/annotations/AnnotationEditor.tsx
'use client';

import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import { motion } from 'framer-motion';
import { useAnnotations } from '@/hooks/useAnnotations';

interface AnnotationEditorProps {
  document: Document;
  onSave: (annotations: Annotation[]) => void;
}

export function AnnotationEditor({ document, onSave }: AnnotationEditorProps) {
  const [tool, setTool] = useState<'select' | 'region' | 'hotspot' | 'note'>('select');
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const stageRef = useRef(null);

  const { annotations, addAnnotation, updateAnnotation, deleteAnnotation } = useAnnotations(document.id);

  const handleStageClick = (e: any) => {
    if (tool === 'select') return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const scale = stage.scaleX();

    if (tool === 'hotspot') {
      addAnnotation({
        type: 'hotspot',
        x: pos.x / scale,
        y: pos.y / scale,
        content: '',
        metadata: { color: '#3B82F6' },
      });
    } else if (tool === 'region') {
      // Démarrer le tracé de région
      startRegionDraw(pos);
    } else if (tool === 'note') {
      addAnnotation({
        type: 'note',
        x: pos.x / scale,
        y: pos.y / scale,
        content: '',
        metadata: {},
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      <aside className="w-16 bg-gray-100 p-2 flex flex-col gap-2">
        <ToolButton icon="cursor" tool="select" current={tool} onClick={setTool} />
        <ToolButton icon="circle" tool="hotspot" current={tool} onClick={setTool} />
        <ToolButton icon="square" tool="region" current={tool} onClick={setTool} />
        <ToolButton icon="sticky-note" tool="note" current={tool} onClick={setTool} />
      </aside>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <Stage
          ref={stageRef}
          width={window.innerWidth - 400}
          height={window.innerHeight}
          onClick={handleStageClick}
          draggable={tool === 'select'}
        >
          <Layer>
            {/* Image de fond */}
            <KonvaImage src={document.filePath} />

            {/* Annotations */}
            {annotations.map((annotation) => (
              <AnnotationShape
                key={annotation.id}
                annotation={annotation}
                isSelected={selectedAnnotation === annotation.id}
                onSelect={() => setSelectedAnnotation(annotation.id)}
                onChange={(updates) => updateAnnotation(annotation.id, updates)}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* Panneau de propriétés */}
      <aside className="w-80 bg-white border-l p-4">
        {selectedAnnotation ? (
          <AnnotationProperties
            annotation={annotations.find(a => a.id === selectedAnnotation)!}
            onUpdate={(updates) => updateAnnotation(selectedAnnotation, updates)}
            onDelete={() => deleteAnnotation(selectedAnnotation)}
            onLinkEntity={(entityId) => linkAnnotationToEntity(selectedAnnotation, entityId)}
          />
        ) : (
          <div className="text-gray-500">
            Sélectionnez une annotation ou créez-en une nouvelle
          </div>
        )}
      </aside>
    </div>
  );
}
```

### 3.4 Module Ontologie/Graphe (de Journal de Guerre, amélioré)

```typescript
// packages/ontology-engine/src/extractor.ts
import { OpenAI } from 'openai';
import nlp from 'compromise';
import { pipeline } from '@xenova/transformers';

export class OntologyExtractor {
  private nerPipeline: any;
  private llmClient: OpenAI;

  async initialize() {
    // Pipeline NER local (sentence-transformers)
    this.nerPipeline = await pipeline('ner', 'Xenova/bert-base-NER');
  }

  async extractEntities(text: string): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];

    // 1. NER avec modèle local
    const nerResults = await this.nerPipeline(text);
    for (const result of nerResults) {
      entities.push({
        text: result.word,
        type: this.mapNERType(result.entity),
        start: result.start,
        end: result.end,
        confidence: result.score,
      });
    }

    // 2. Extraction linguistique (compromise.js)
    const doc = nlp(text);

    // Personnes
    doc.people().forEach((person) => {
      entities.push({
        text: person.text(),
        type: 'person',
        confidence: 0.8,
      });
    });

    // Lieux
    doc.places().forEach((place) => {
      entities.push({
        text: place.text(),
        type: 'place',
        confidence: 0.8,
      });
    });

    // Dates
    doc.dates().forEach((date) => {
      entities.push({
        text: date.text(),
        type: 'date',
        confidence: 0.9,
      });
    });

    // 3. Déduplication et consolidation
    return this.consolidateEntities(entities);
  }

  async extractRelationships(
    text: string,
    entities: Entity[]
  ): Promise<EntityRelationship[]> {
    // Utilisation LLM pour extraction de relations complexes
    const prompt = `
      Texte: "${text}"

      Entités identifiées: ${entities.map(e => `${e.name} (${e.type})`).join(', ')}

      Extrais les relations sémantiques entre ces entités sous forme de triplets (sujet, relation, objet).
      Relations possibles: is_part_of, created_by, located_in, occurred_at, related_to, similar_to

      Format JSON:
      [
        { "source": "...", "relation": "...", "target": "...", "confidence": 0.9 }
      ]
    `;

    const response = await this.llmClient.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async buildKnowledgeGraph(
    documents: Document[]
  ): Promise<KnowledgeGraph> {
    const graph: KnowledgeGraph = {
      nodes: [],
      edges: [],
    };

    for (const doc of documents) {
      if (!doc.transcription) continue;

      // Extraction d'entités
      const extractedEntities = await this.extractEntities(doc.transcription);

      // Ajout au graphe avec références documents
      for (const entity of extractedEntities) {
        const existingNode = graph.nodes.find(
          n => n.name === entity.text && n.type === entity.type
        );

        if (existingNode) {
          existingNode.documentRefs.push(doc.id);
          existingNode.mentionCount++;
        } else {
          graph.nodes.push({
            id: generateId(),
            name: entity.text,
            type: entity.type,
            documentRefs: [doc.id],
            mentionCount: 1,
          });
        }
      }

      // Extraction de relations
      const relationships = await this.extractRelationships(
        doc.transcription,
        graph.nodes
      );

      graph.edges.push(...relationships.map(r => ({
        ...r,
        documentRef: doc.id,
      })));
    }

    return graph;
  }
}
```

### 3.5 Module Recherche Hybride (NOUVEAU - combinant les deux)

```typescript
// packages/search-engine/src/hybrid-search.ts
import { MeiliSearch } from 'meilisearch';
import { PostgresClient } from './postgres';

export class HybridSearchEngine {
  private meilisearch: MeiliSearch;
  private postgres: PostgresClient;

  async search(query: SearchQuery): Promise<SearchResults> {
    const { query: searchText, mode, filters, limit, offset } = query;

    if (mode === 'text') {
      return this.textSearch(searchText, filters, limit, offset);
    } else if (mode === 'semantic') {
      return this.semanticSearch(searchText, filters, limit, offset);
    } else {
      // Hybrid: combine les deux avec pondération
      return this.hybridSearch(searchText, filters, limit, offset);
    }
  }

  private async textSearch(
    query: string,
    filters: FilterOptions,
    limit: number,
    offset: number
  ): Promise<SearchResults> {
    // Meilisearch pour recherche full-text rapide
    const results = await this.meilisearch.index('documents').search(query, {
      limit,
      offset,
      filter: this.buildMeilisearchFilters(filters),
      attributesToSearchOn: ['title', 'transcription', 'tags', 'historicalContext'],
    });

    return {
      documents: results.hits,
      total: results.estimatedTotalHits,
      processingTime: results.processingTimeMs,
    };
  }

  private async semanticSearch(
    query: string,
    filters: FilterOptions,
    limit: number,
    offset: number
  ): Promise<SearchResults> {
    // Génération embedding de la requête
    const queryEmbedding = await this.generateEmbedding(query);

    // Recherche vectorielle avec pgvector
    const sql = `
      SELECT
        d.*,
        1 - (d.embedding <=> $1) as similarity
      FROM documents d
      WHERE d.project_id = $2
        ${this.buildSQLFilters(filters)}
      ORDER BY d.embedding <=> $1
      LIMIT $3 OFFSET $4
    `;

    const results = await this.postgres.query(sql, [
      queryEmbedding,
      filters.projectId,
      limit,
      offset,
    ]);

    return {
      documents: results.rows,
      total: results.rowCount,
      processingTime: results.duration,
    };
  }

  private async hybridSearch(
    query: string,
    filters: FilterOptions,
    limit: number,
    offset: number
  ): Promise<SearchResults> {
    // Recherches parallèles
    const [textResults, semanticResults] = await Promise.all([
      this.textSearch(query, filters, limit * 2, 0),
      this.semanticSearch(query, filters, limit * 2, 0),
    ]);

    // Reciprocal Rank Fusion (RRF)
    const k = 60; // Constante RRF
    const scores = new Map<string, number>();

    textResults.documents.forEach((doc, index) => {
      const score = 1 / (k + index + 1);
      scores.set(doc.id, (scores.get(doc.id) || 0) + score * 0.4);
    });

    semanticResults.documents.forEach((doc, index) => {
      const score = 1 / (k + index + 1);
      scores.set(doc.id, (scores.get(doc.id) || 0) + score * 0.6);
    });

    // Tri par score fusionné
    const sortedIds = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(offset, offset + limit)
      .map(([id]) => id);

    // Récupération des documents complets
    const documents = await this.getDocumentsByIds(sortedIds);

    return {
      documents,
      total: scores.size,
      processingTime: Date.now(),
    };
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // sentence-transformers multilingual
    const response = await fetch('/api/ai/embed', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return response.json();
  }
}
```

### 3.6 Module Export (NOUVEAU)

```typescript
// apps/workers/export-worker/src/exporters.ts

export class PDFExporter {
  async exportProject(projectId: string, options: PDFOptions): Promise<Buffer> {
    const project = await getProject(projectId);
    const documents = await getProjectDocuments(projectId);

    const pdfDoc = await PDFDocument.create();

    // Page de titre
    const titlePage = pdfDoc.addPage();
    titlePage.drawText(project.name, { size: 24, font: 'Times-Bold' });

    // Table des matières
    const tocPage = pdfDoc.addPage();
    // ...

    // Pages de documents
    for (const doc of documents) {
      const page = pdfDoc.addPage();

      // Image
      const image = await pdfDoc.embedJpg(await readFile(doc.filePath));
      page.drawImage(image, { x: 50, y: 400, width: 500 });

      // Transcription
      if (doc.transcription) {
        page.drawText(doc.transcription, { x: 50, y: 350, size: 10 });
      }

      // Métadonnées
      page.drawText(`Catégorie: ${doc.category}`, { x: 50, y: 100 });
      page.drawText(`Période: ${doc.period}`, { x: 50, y: 85 });

      // Annotations
      const annotations = await getDocumentAnnotations(doc.id);
      // ...
    }

    return pdfDoc.save();
  }
}

export class JSONLDExporter {
  async exportProject(projectId: string): Promise<object> {
    const project = await getProject(projectId);
    const documents = await getProjectDocuments(projectId);
    const entities = await getProjectEntities(projectId);

    return {
      '@context': 'https://schema.org',
      '@type': 'Collection',
      name: project.name,
      description: project.description,
      hasPart: documents.map(doc => ({
        '@type': doc.type === 'image' ? 'Photograph' : 'DigitalDocument',
        '@id': `${BASE_URL}/documents/${doc.id}`,
        name: doc.title,
        dateCreated: doc.period,
        description: doc.historicalContext,
        keywords: doc.tags,
        // Linked Open Data
        about: entities
          .filter(e => doc.entityIds.includes(e.id))
          .map(e => ({
            '@type': this.mapEntityType(e.type),
            name: e.name,
          })),
      })),
    };
  }
}

export class IIIFExporter {
  // Export compatible IIIF pour interopérabilité muséale
  async exportManifest(projectId: string): Promise<IIIFManifest> {
    // ...
  }
}
```

---

## 4. Interface Utilisateur

### 4.1 Personas et Parcours

| Persona | Besoin Principal | Parcours Type |
|---------|-----------------|---------------|
| **Chercheur** | Analyser et annoter | Upload → OCR → Annotations → Export académique |
| **Conservateur** | Préserver et documenter | Import → Métadonnées → Ontologie → Publication |
| **Grand public** | Découvrir et explorer | Galerie → Stories → Timeline → Partage |
| **Contributeur** | Enrichir collectivement | Connexion → Transcription → Validation → Hotspots |

### 4.2 Écrans Principaux

1. **Dashboard** - Vue d'ensemble du projet
2. **Galerie** - Navigation et recherche des documents
3. **Studio d'annotation** - Éditeur visuel riche
4. **Mode histoire** - Exploration narrative immersive
5. **Timeline** - Frise chronologique interactive
6. **Carte** - Visualisation géographique
7. **Graphe d'ontologie** - Exploration des relations
8. **Recherche avancée** - Filtres et requêtes complexes
9. **Exports** - Génération de rapports et données
10. **Administration** - Gestion utilisateurs et projets

### 4.3 Design System

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Palette inspirée d'Opale
        heritage: {
          50: '#FDF8F3',   // Crème très léger
          100: '#F5EBE0',
          200: '#E8D5C4',
          300: '#D4B896',
          400: '#C19A6B',
          500: '#A67B5B',  // Couleur principale
          600: '#8B6347',
          700: '#704F39',
          800: '#553D2E',
          900: '#3A2A1F',  // Brun très foncé
        },
        accent: {
          500: '#3B82F6',  // Bleu pour actions
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

---

## 5. Roadmap d'Implémentation

### Phase 1 : Fondations (4-6 semaines)

- [ ] Setup monorepo (pnpm workspaces)
- [ ] Configuration Next.js 15 + TypeScript strict
- [ ] Schema base de données PostgreSQL + pgvector
- [ ] Authentification NextAuth.js
- [ ] API REST de base (CRUD documents)
- [ ] Upload et stockage fichiers (S3/R2)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Déploiement initial (Vercel/Railway)

### Phase 2 : OCR et Transcription (3-4 semaines)

- [ ] Service OCR multi-provider
- [ ] Queue jobs asynchrones (BullMQ)
- [ ] Interface upload batch
- [ ] Préprocessing images
- [ ] Postprocessing transcriptions
- [ ] Validation et corrections
- [ ] Dashboard de suivi jobs

### Phase 3 : Galerie Interactive (3-4 semaines)

- [ ] Composant Gallery avec filtres
- [ ] Recherche full-text (Meilisearch)
- [ ] Lazy loading et infinite scroll
- [ ] Mode plein écran avec zoom
- [ ] Responsive design
- [ ] Animations Framer Motion

### Phase 4 : Recherche Sémantique (3-4 semaines)

- [ ] Service génération embeddings
- [ ] Index vectoriel pgvector
- [ ] API recherche hybride
- [ ] Interface recherche avancée
- [ ] Suggestions automatiques
- [ ] Filtres complexes

### Phase 5 : Annotations et Hotspots (4-5 semaines)

- [ ] Éditeur visuel Konva.js
- [ ] Types d'annotations (note, région, hotspot)
- [ ] Sauvegarde temps réel
- [ ] Liaison avec entités
- [ ] Permissions collaboratives
- [ ] Historique des modifications

### Phase 6 : Ontologie et NLP (3-4 semaines)

- [ ] Service extraction entités (NER)
- [ ] Graphe de relations
- [ ] Interface d'édition ontologie
- [ ] Visualisation graphe (D3.js ou Sigma.js)
- [ ] Requêtes sur le graphe
- [ ] Export RDF/OWL

### Phase 7 : Mode Narratif (3-4 semaines)

- [ ] Composant StoryMode
- [ ] Carrousels d'images liées
- [ ] Panneaux d'information
- [ ] Création de stories
- [ ] Génération assistée par IA
- [ ] Publication et partage

### Phase 8 : PWA et Offline (2-3 semaines)

- [ ] Service Worker (Workbox)
- [ ] Manifest PWA
- [ ] Stratégies de cache
- [ ] Synchronisation offline
- [ ] Installation native
- [ ] Tests performance

### Phase 9 : Exports et Intégrations (3-4 semaines)

- [ ] Export PDF structuré
- [ ] Export JSON-LD (Linked Data)
- [ ] Export BibTeX
- [ ] Export IIIF manifest
- [ ] API publique documentée
- [ ] Webhooks

### Phase 10 : Polish et Documentation (2-3 semaines)

- [ ] Tests E2E (Playwright)
- [ ] Optimisation performance
- [ ] Accessibilité (WCAG 2.1)
- [ ] Documentation utilisateur
- [ ] Documentation API
- [ ] Guides de contribution

**Durée totale estimée : 30-41 semaines (7-10 mois)**

---

## 6. Considérations Techniques

### 6.1 Performance

- **SSG pour pages statiques** : Pré-génération au build
- **ISR pour contenu dynamique** : Revalidation incrémentale
- **Edge caching** : CDN Vercel/Cloudflare
- **Lazy loading** : Images et composants
- **Code splitting** : Bundles optimisés
- **Service Worker** : Cache offline intelligent

### 6.2 Scalabilité

- **Base de données** : PostgreSQL avec read replicas
- **Stockage** : S3/R2 avec CDN
- **Jobs** : Redis + BullMQ (horizontal scaling)
- **Recherche** : Meilisearch cluster
- **API** : Edge functions serverless

### 6.3 Sécurité

- **Authentification** : OAuth 2.0 (Google, GitHub)
- **Autorisation** : RBAC (Admin, Editor, Contributor, Viewer)
- **Validation** : Zod schemas côté client et serveur
- **Upload** : Validation MIME types, taille max, antivirus
- **API** : Rate limiting, CORS, CSRF protection
- **Données** : Chiffrement at-rest et in-transit

### 6.4 Monitoring

- **APM** : Vercel Analytics / New Relic
- **Logs** : Structured logging (Pino)
- **Errors** : Sentry integration
- **Métriques** : Custom dashboards
- **Alerting** : Slack/Discord notifications

---

## 7. Budget et Ressources

### 7.1 Équipe Idéale

| Rôle | Temps | Compétences Clés |
|------|-------|-----------------|
| **Lead Dev Full-Stack** | 100% | Next.js, TypeScript, PostgreSQL, AI |
| **Frontend Developer** | 80% | React, Tailwind, Framer Motion, Konva |
| **Backend Developer** | 80% | Node.js, PostgreSQL, Redis, BullMQ |
| **ML/NLP Engineer** | 50% | Python, sentence-transformers, NER |
| **UX/UI Designer** | 50% | Figma, Design System, Accessibility |
| **DevOps** | 30% | Docker, CI/CD, Monitoring |

### 7.2 Infrastructure Mensuelle

| Service | Coût Estimé |
|---------|-------------|
| Vercel Pro | ~$20/mois |
| PostgreSQL (Supabase/Railway) | ~$25/mois |
| Redis (Upstash) | ~$10/mois |
| S3 Storage (R2) | ~$15/mois |
| Meilisearch Cloud | ~$29/mois |
| AI APIs (Claude/OpenAI) | ~$50-200/mois |
| **Total** | **~$150-300/mois** |

### 7.3 Coûts IA par Opération

| Opération | Provider | Coût Estimé |
|-----------|----------|-------------|
| OCR 1 page | Ollama (local) | $0 |
| OCR 1 page | Claude Vision | ~$0.02 |
| Embedding 1 doc | Local | $0 |
| NER extraction | Local | $0 |
| Story generation | GPT-4 | ~$0.10 |

---

## 8. Conclusion

Cette vision d'**Archivia** combine les forces complémentaires des deux projets existants :

**De Journal de Guerre** :
- Pipeline OCR robuste multi-provider
- Extraction d'ontologie automatisée
- Recherche sémantique par embeddings
- Documentation méthodologique exemplaire

**D'Opale** :
- Architecture Next.js moderne et performante
- Galerie interactive avec animations fluides
- Mode narratif avec hotspots innovants
- PWA offline-first complète

**Innovations ajoutées** :
- Annotations collaboratives visuelles
- Recherche hybride (texte + vectorielle)
- Multi-projets et multi-tenant
- Exports académiques (PDF, JSON-LD, BibTeX, IIIF)
- Génération de contenu assistée par IA
- API REST complète pour intégrations

Le résultat sera une **plateforme open-source de référence** pour la numérisation, l'analyse et la valorisation du patrimoine culturel, combinant le meilleur des technologies modernes avec une expérience utilisateur immersive et accessible.

---

*Document de vision rédigé le 17 novembre 2025*
*Version 1.0*
