# PLAN DE MIGRATION DES FEATURES
## Opale & Journal de Guerre → Archivia

**Date** : 17 novembre 2025
**Objectif** : Instructions détaillées étape par étape pour porter les features clés vers Archivia

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Feature 1 : Galerie Interactive](#feature-1--galerie-interactive)
3. [Feature 2 : OCR & Transcription](#feature-2--ocr--transcription)
4. [Feature 3 : Extraction d'Ontologie](#feature-3--extraction-dontologie)
5. [Feature 4 : Visionneuse de Documents](#feature-4--visionneuse-de-documents)
6. [Feature 5 : Mode Histoire avec Hotspots](#feature-5--mode-histoire-avec-hotspots)
7. [Feature 6 : Graphe de Connaissances](#feature-6--graphe-de-connaissances)
8. [Feature 7 : PWA Offline](#feature-7--pwa-offline)
9. [Feature 8 : Recherche Sémantique](#feature-8--recherche-sémantique)
10. [Scripts de Maintenance](#scripts-de-maintenance)

---

## VUE D'ENSEMBLE

### Stratégie de Migration

```
Phase 1 (Semaine 1-2) : Fondations + Quick Wins
├── Composants universels (PhotoZoom, InstallPWA)
├── Scripts Python (extract_text.py, verify_images.py)
└── Configuration (Tailwind, Next.js)

Phase 2 (Semaine 3-4) : Composants Core
├── Galerie Interactive
├── Visionneuse Documents
└── OCR Integration

Phase 3 (Semaine 5-6) : Intelligence
├── Extraction Ontologie
├── Graphe de Connaissances
└── Recherche Sémantique

Phase 4 (Semaine 7+) : Expérience Avancée
├── Mode Histoire
├── PWA Offline
└── Polish & Optimisation
```

### Checklist Globale

- [ ] Phase 1 : Fondations
  - [ ] Copier PhotoZoom.tsx
  - [ ] Copier InstallPWA.tsx
  - [ ] Copier extract_text.py
  - [ ] Adapter Tailwind config
- [ ] Phase 2 : Core
  - [ ] Migrer Gallery.tsx
  - [ ] Créer DocumentViewer
  - [ ] Intégrer OCR pipeline
- [ ] Phase 3 : Intelligence
  - [ ] Porter ontology-extractor.js
  - [ ] Wrapper knowledge-graph.js
  - [ ] Implémenter recherche
- [ ] Phase 4 : Avancé
  - [ ] Adapter StoryMode.tsx
  - [ ] Configurer PWA
  - [ ] Tests & polish

---

## FEATURE 1 : GALERIE INTERACTIVE

**Source** : `/_IMPLEMENTATION/opale/components/Gallery.tsx`
**Destination** : `/apps/web/components/gallery/Gallery.tsx`
**Durée estimée** : 2-3 jours
**Priorité** : 🔴 HAUTE

### Étape 1.1 : Copier le fichier de base

```bash
# Créer le dossier
mkdir -p apps/web/components/gallery

# Copier le composant
cp _IMPLEMENTATION/opale/components/Gallery.tsx \
   apps/web/components/gallery/Gallery.tsx
```

### Étape 1.2 : Installer les dépendances

```bash
cd apps/web
pnpm add framer-motion@^11.0.3
```

### Étape 1.3 : Adapter les imports

**Fichier** : `apps/web/components/gallery/Gallery.tsx`

```typescript
// AVANT (Opale)
import { photos } from '@/lib/data';
import { getEnrichedDataForPhoto } from '@/lib/enriched-photo-lookup';

// APRÈS (Archivia)
import { useQuery } from '@tanstack/react-query';
import type { Document } from '@archivia/shared-types';

// Remplacer la source de données
function Gallery({ projectId }: { projectId: string }) {
  // AVANT
  // const [items, setItems] = useState(photos);

  // APRÈS
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => fetch(`/api/projects/${projectId}/documents`).then(r => r.json())
  });

  // Le reste du code reste identique
}
```

### Étape 1.4 : Adapter les types

**Fichier** : `apps/web/components/gallery/Gallery.tsx`

```typescript
// AVANT (Opale)
interface Photo {
  id: string;
  title: string;
  imagePath: string;
  category: string;
  period: string;
  tags: string[];
  description: string;
  historicalContext: string;
}

// APRÈS (Archivia) - Utiliser le type existant
import type { Document } from '@archivia/shared-types';

// Ajouter mapping si nécessaire
function mapDocumentToGalleryItem(doc: Document) {
  return {
    id: doc.id,
    title: doc.title,
    imagePath: doc.filePath,
    category: doc.category || 'Non catégorisé',
    period: doc.period || 'Date inconnue',
    tags: doc.tags,
    description: doc.description || '',
    historicalContext: doc.historicalContext || ''
  };
}
```

### Étape 1.5 : Adapter les catégories et filtres

**Fichier** : `apps/web/components/gallery/Gallery.tsx`

```typescript
// AVANT (Opale) - Catégories maritimes
const CATEGORIES = [
  'Bateaux',
  'Chantier naval',
  'Portraits',
  'Cérémonies',
  // ...
];

// APRÈS (Archivia) - Catégories archives génériques
const CATEGORIES = [
  'Manuscrit',
  'Photo',
  'Imprimé',
  'Objet',
  'Document administratif',
  'Correspondance',
  'Registre',
  // À adapter selon le projet
];

// Charger dynamiquement depuis l'API
const { data: categories } = useQuery({
  queryKey: ['categories', projectId],
  queryFn: () => fetch(`/api/projects/${projectId}/categories`).then(r => r.json())
});
```

### Étape 1.6 : Adapter les couleurs Tailwind

**Fichier** : `apps/web/components/gallery/Gallery.tsx`

Rechercher/Remplacer :
```typescript
// AVANT
bg-opale-500
text-opale-700
border-opale-300

// APRÈS
bg-heritage-500
text-heritage-700
border-heritage-300
```

### Étape 1.7 : Tester le composant

**Fichier** : `apps/web/app/projects/[id]/gallery/page.tsx`

```typescript
import Gallery from '@/components/gallery/Gallery';

export default function GalleryPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Galerie du projet</h1>
      <Gallery projectId={params.id} />
    </div>
  );
}
```

### Étape 1.8 : Vérifier les fonctionnalités

- [ ] Filtrage par catégorie fonctionne
- [ ] Recherche en temps réel fonctionne
- [ ] Lazy loading (20 items par scroll) fonctionne
- [ ] Mode fullscreen fonctionne
- [ ] Navigation clavier fonctionne
- [ ] Animations sont fluides

---

## FEATURE 2 : OCR & TRANSCRIPTION

**Source** : `/_IMPLEMENTATION/journal_de_guerre/src/extract_text.py`
**Destination** : `/apps/web/scripts/extract_text.py`
**Durée estimée** : 1 jour
**Priorité** : 🔴 HAUTE

### Étape 2.1 : Copier le script Python

```bash
# Créer le dossier scripts
mkdir -p apps/web/scripts

# Copier le script
cp _IMPLEMENTATION/journal_de_guerre/src/extract_text.py \
   apps/web/scripts/extract_text.py

# Copier tel quel - aucune modification nécessaire
```

### Étape 2.2 : Installer dépendances Python

```bash
cd apps/web/scripts

# Créer requirements.txt
cat > requirements.txt << EOF
anthropic>=0.18.0
ollama>=0.1.0
python-dotenv>=1.0.0
Pillow>=10.0.0
EOF

# Installer
pip install -r requirements.txt

# Ou avec venv (recommandé)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Étape 2.3 : Créer API Route pour OCR

**Fichier** : `apps/web/app/api/documents/[id]/ocr/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '@archivia/database';
import { documents } from '@archivia/database/schema';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1. Récupérer le document
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id)
  });

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // 2. Mettre à jour le statut
  await db.update(documents)
    .set({ transcriptionStatus: 'processing' })
    .where(eq(documents.id, id));

  try {
    // 3. Exécuter le script Python
    const imagePath = `./public${doc.filePath}`;
    const outputPath = `./public/transcriptions/${id}.txt`;

    const { stdout, stderr } = await execAsync(
      `python scripts/extract_text.py ${imagePath} \
       --provider anthropic \
       --model claude-3-haiku-20240307 \
       --output ${outputPath}`,
      { timeout: 120000 } // 2 minutes max
    );

    // 4. Lire le résultat
    const fs = require('fs').promises;
    const transcription = await fs.readFile(outputPath, 'utf-8');

    // 5. Sauvegarder en DB
    await db.update(documents)
      .set({
        transcription,
        transcriptionStatus: 'completed',
        transcriptionProvider: 'anthropic'
      })
      .where(eq(documents.id, id));

    // 6. Déclencher extraction d'entités (optionnel)
    await fetch(`/api/documents/${id}/extract-entities`, {
      method: 'POST'
    });

    return NextResponse.json({
      success: true,
      transcription,
      message: 'OCR completed successfully'
    });

  } catch (error) {
    console.error('OCR error:', error);

    await db.update(documents)
      .set({ transcriptionStatus: 'pending' })
      .where(eq(documents.id, id));

    return NextResponse.json(
      { error: 'OCR failed', details: error.message },
      { status: 500 }
    );
  }
}
```

### Étape 2.4 : Ajouter bouton OCR dans l'UI

**Fichier** : `apps/web/app/projects/[id]/page.tsx`

```typescript
async function handleOCR(documentId: string) {
  setIsProcessing(true);

  try {
    const response = await fetch(`/api/documents/${documentId}/ocr`, {
      method: 'POST'
    });

    const result = await response.json();

    if (result.success) {
      toast.success(`OCR terminé : ${result.transcription.length} caractères extraits`);
      // Recharger la liste des documents
      refetch();
    } else {
      toast.error(`Erreur OCR : ${result.error}`);
    }
  } catch (error) {
    toast.error('Erreur lors de l\'OCR');
  } finally {
    setIsProcessing(false);
  }
}

// Dans le rendu
<button
  onClick={() => handleOCR(doc.id)}
  disabled={doc.transcriptionStatus === 'processing'}
  className="btn btn-primary"
>
  {doc.transcriptionStatus === 'processing' ? 'OCR en cours...' : 'Lancer OCR'}
</button>
```

### Étape 2.5 : Tester l'OCR

```bash
# Test manuel du script
python apps/web/scripts/extract_text.py \
  apps/web/public/uploads/test-image.jpg \
  --provider anthropic \
  --model claude-3-haiku-20240307

# Vérifier que le fichier txt est créé
cat extracted_texts/test-image.txt
```

### Étape 2.6 : Checklist OCR

- [ ] Script Python s'exécute sans erreur
- [ ] API route `/api/documents/[id]/ocr` fonctionne
- [ ] Statut `transcriptionStatus` se met à jour
- [ ] Transcription est sauvegardée en DB
- [ ] UI affiche le bouton OCR
- [ ] Bouton se désactive pendant le traitement
- [ ] Toast de succès/erreur s'affiche

---

## FEATURE 3 : EXTRACTION D'ONTOLOGIE

**Source** : `/_IMPLEMENTATION/journal_de_guerre/src/services/ontology-extractor.js`
**Destination** : `/apps/web/lib/ontology-extractor.ts`
**Durée estimée** : 2 jours
**Priorité** : 🔴 HAUTE

### Étape 3.1 : Créer l'ontologie Archivia

**Fichier** : `apps/web/lib/ontologies/default-ontology.json`

```json
{
  "persons": [
    {
      "id": "person-generic",
      "name": "Personne",
      "type": "individu",
      "patterns": ["monsieur", "madame", "mademoiselle"]
    }
  ],
  "places": [
    {
      "id": "place-france",
      "name": "France",
      "type": "pays",
      "patterns": ["france", "français", "française"]
    }
  ],
  "concepts": [
    {
      "id": "concept-war",
      "name": "Guerre",
      "type": "conflit",
      "patterns": ["guerre", "conflit", "bataille", "combat"]
    },
    {
      "id": "concept-family",
      "name": "Famille",
      "type": "social",
      "patterns": ["famille", "parent", "enfant", "mariage"]
    }
  ],
  "objects": [
    {
      "id": "object-document",
      "name": "Document",
      "type": "archive",
      "patterns": ["lettre", "document", "registre", "manuscrit"]
    }
  ],
  "events": [
    {
      "id": "event-wedding",
      "name": "Mariage",
      "type": "cérémonie",
      "patterns": ["mariage", "noce", "épousailles"]
    }
  ]
}
```

### Étape 3.2 : Porter le service en TypeScript

**Fichier** : `apps/web/lib/ontology-extractor.ts`

```typescript
import fs from 'fs';
import path from 'path';
import { db } from '@archivia/database';
import { entities, entityRelationships, documentEntities } from '@archivia/database/schema';

interface Entity {
  id: string;
  name: string;
  type: string;
  patterns: string[];
}

interface Ontology {
  persons: Entity[];
  places: Entity[];
  concepts: Entity[];
  objects: Entity[];
  events: Entity[];
}

interface ExtractedEntity {
  type: string;
  name: string;
  count: number;
  confidence: number;
  contexts: string[];
}

export class OntologyExtractor {
  private ontology: Ontology;

  constructor(ontologyPath?: string) {
    const defaultPath = path.join(process.cwd(), 'lib/ontologies/default-ontology.json');
    const ontologyFile = ontologyPath || defaultPath;
    this.ontology = JSON.parse(fs.readFileSync(ontologyFile, 'utf-8'));
  }

  /**
   * Analyser un texte et extraire les entités
   */
  analyze(text: string): {
    entities: ExtractedEntity[];
    themes: string[];
    dates: Array<{ text: string; type: string }>;
    statistics: any;
  } {
    const normalizedText = this.normalizeText(text);
    const entities = this.extractEntities(normalizedText);
    const dates = this.extractDates(text);
    const themes = this.detectThemes(normalizedText);

    return {
      entities,
      themes,
      dates,
      statistics: {
        total: entities.length,
        byType: this.countByType(entities)
      }
    };
  }

  /**
   * Normaliser le texte (accents, casse, ponctuation)
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer accents
      .replace(/[^\w\s]/g, ' '); // Retirer ponctuation
  }

  /**
   * Extraire les entités par pattern matching
   */
  private extractEntities(text: string): ExtractedEntity[] {
    const extracted: ExtractedEntity[] = [];

    // Parcourir tous les types d'entités
    (['persons', 'places', 'concepts', 'objects', 'events'] as const).forEach(type => {
      this.ontology[type].forEach(entity => {
        entity.patterns.forEach(pattern => {
          const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
          const matches = text.match(regex);

          if (matches && matches.length > 0) {
            // Extraire contextes (50 chars avant/après)
            const contexts = this.extractContexts(text, pattern, 50);

            extracted.push({
              type: type.slice(0, -1), // persons → person
              name: entity.name,
              count: matches.length,
              confidence: this.calculateConfidence(matches.length),
              contexts
            });
          }
        });
      });
    });

    return extracted;
  }

  /**
   * Extraire contextes autour des mentions
   */
  private extractContexts(text: string, pattern: string, radius: number): string[] {
    const regex = new RegExp(`(.{0,${radius}}\\b${pattern}\\b.{0,${radius}})`, 'gi');
    const matches = text.match(regex) || [];
    return matches.slice(0, 3); // Max 3 contextes
  }

  /**
   * Calculer confiance basée sur fréquence
   */
  private calculateConfidence(count: number): number {
    if (count >= 10) return 1.0;
    if (count >= 5) return 0.8;
    if (count >= 3) return 0.6;
    if (count >= 2) return 0.4;
    return 0.2;
  }

  /**
   * Extraire les dates
   */
  private extractDates(text: string): Array<{ text: string; type: string }> {
    const dates: Array<{ text: string; type: string }> = [];

    // Format JJ/MM/AAAA ou JJ-MM-AAAA
    const dateRegex = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g;
    let match;
    while ((match = dateRegex.exec(text)) !== null) {
      dates.push({ text: match[0], type: 'date_complete' });
    }

    // Format années seules
    const yearRegex = /\b(19|20)\d{2}\b/g;
    while ((match = yearRegex.exec(text)) !== null) {
      dates.push({ text: match[0], type: 'year' });
    }

    return dates;
  }

  /**
   * Détecter thèmes par mots-clés
   */
  private detectThemes(text: string): string[] {
    const themes = [];

    if (/guerre|conflit|bataille/.test(text)) themes.push('Guerre');
    if (/famille|parent|enfant/.test(text)) themes.push('Famille');
    if (/travail|métier|profession/.test(text)) themes.push('Travail');
    if (/mariage|naissance|décès/.test(text)) themes.push('Événement de vie');

    return themes;
  }

  /**
   * Compter par type
   */
  private countByType(entities: ExtractedEntity[]): Record<string, number> {
    return entities.reduce((acc, entity) => {
      acc[entity.type] = (acc[entity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Sauvegarder les entités en base de données
   */
  async saveToDatabase(
    projectId: string,
    documentId: string,
    extracted: ExtractedEntity[]
  ): Promise<void> {
    for (const entity of extracted) {
      // 1. Insérer ou récupérer l'entité
      const [insertedEntity] = await db.insert(entities)
        .values({
          projectId,
          type: entity.type,
          name: entity.name,
          properties: {
            confidence: entity.confidence,
            contexts: entity.contexts
          }
        })
        .onConflictDoUpdate({
          target: [entities.projectId, entities.name],
          set: {
            properties: {
              confidence: entity.confidence,
              contexts: entity.contexts
            }
          }
        })
        .returning();

      // 2. Lier au document
      await db.insert(documentEntities)
        .values({
          documentId,
          entityId: insertedEntity.id,
          mentionCount: entity.count,
          confidence: entity.confidence,
          contexts: entity.contexts
        })
        .onConflictDoNothing();
    }
  }
}
```

### Étape 3.3 : Créer API Route

**Fichier** : `apps/web/app/api/documents/[id]/extract-entities/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@archivia/database';
import { documents } from '@archivia/database/schema';
import { eq } from 'drizzle-orm';
import { OntologyExtractor } from '@/lib/ontology-extractor';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1. Récupérer le document
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id)
  });

  if (!doc || !doc.transcription) {
    return NextResponse.json(
      { error: 'Document or transcription not found' },
      { status: 404 }
    );
  }

  try {
    // 2. Extraire entités
    const extractor = new OntologyExtractor();
    const analysis = extractor.analyze(doc.transcription);

    // 3. Sauvegarder en DB
    await extractor.saveToDatabase(
      doc.projectId,
      doc.id,
      analysis.entities
    );

    return NextResponse.json({
      success: true,
      entities: analysis.entities,
      themes: analysis.themes,
      dates: analysis.dates,
      statistics: analysis.statistics
    });

  } catch (error) {
    console.error('Entity extraction error:', error);
    return NextResponse.json(
      { error: 'Extraction failed', details: error.message },
      { status: 500 }
    );
  }
}
```

### Étape 3.4 : Checklist Extraction

- [ ] OntologyExtractor.ts compile sans erreur
- [ ] API route `/api/documents/[id]/extract-entities` fonctionne
- [ ] Entités sont sauvegardées en DB
- [ ] Relations document-entité créées
- [ ] Confiance calculée correctement
- [ ] Dates extraites correctement

---

## FEATURE 4 : VISIONNEUSE DE DOCUMENTS

**Source** : Combinaison `PhotoZoom.tsx` + pattern Opale
**Destination** : `/apps/web/components/documents/DocumentViewer.tsx`
**Durée estimée** : 1-2 jours
**Priorité** : 🔴 HAUTE

### Étape 4.1 : Copier PhotoZoom

```bash
cp _IMPLEMENTATION/opale/components/PhotoZoom.tsx \
   apps/web/components/documents/PhotoZoom.tsx
```

### Étape 4.2 : Créer DocumentViewer

**Fichier** : `apps/web/components/documents/DocumentViewer.tsx`

```typescript
'use client';

import { useState } from 'react';
import PhotoZoom from './PhotoZoom';
import type { Document } from '@archivia/shared-types';

interface DocumentViewerProps {
  document: Document;
  showTranscription?: boolean;
}

export default function DocumentViewer({
  document,
  showTranscription = true
}: DocumentViewerProps) {
  const [view, setView] = useState<'split' | 'image' | 'text'>('split');

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-2xl font-bold">{document.title}</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setView('split')}
            className={`btn ${view === 'split' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Vue côte à côte
          </button>
          <button
            onClick={() => setView('image')}
            className={`btn ${view === 'image' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Image seule
          </button>
          {showTranscription && document.transcription && (
            <button
              onClick={() => setView('text')}
              className={`btn ${view === 'text' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Texte seul
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Image */}
        {(view === 'split' || view === 'image') && (
          <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} border-r`}>
            <PhotoZoom
              imageSrc={document.filePath}
              altText={document.title}
            />
          </div>
        )}

        {/* Transcription */}
        {showTranscription && document.transcription && (view === 'split' || view === 'text') && (
          <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} p-6 overflow-y-auto`}>
            <div className="prose max-w-none">
              <h3>Transcription</h3>
              <p className="text-sm text-gray-600 mb-4">
                {document.transcription.length} caractères
                {document.transcriptionProvider && ` · ${document.transcriptionProvider}`}
              </p>
              <div className="whitespace-pre-wrap">{document.transcription}</div>
            </div>

            {/* Metadata */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">Métadonnées</h3>
              <dl className="grid grid-cols-2 gap-4">
                {document.category && (
                  <>
                    <dt className="font-medium">Catégorie</dt>
                    <dd>{document.category}</dd>
                  </>
                )}
                {document.period && (
                  <>
                    <dt className="font-medium">Période</dt>
                    <dd>{document.period}</dd>
                  </>
                )}
                {document.tags.length > 0 && (
                  <>
                    <dt className="font-medium">Tags</dt>
                    <dd className="flex gap-2 flex-wrap">
                      {document.tags.map(tag => (
                        <span key={tag} className="badge">{tag}</span>
                      ))}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Étape 4.3 : Créer la page de détail

**Fichier** : `apps/web/app/projects/[id]/documents/[docId]/page.tsx`

```typescript
import { db } from '@archivia/database';
import { documents } from '@archivia/database/schema';
import { eq } from 'drizzle-orm';
import DocumentViewer from '@/components/documents/DocumentViewer';
import { notFound } from 'next/navigation';

export default async function DocumentPage({
  params
}: {
  params: { id: string; docId: string }
}) {
  const document = await db.query.documents.findFirst({
    where: eq(documents.id, params.docId)
  });

  if (!document) {
    notFound();
  }

  return (
    <div className="h-screen flex flex-col">
      <DocumentViewer document={document} />
    </div>
  );
}
```

### Étape 4.4 : Checklist Visionneuse

- [ ] PhotoZoom fonctionne
- [ ] Vue split (image | texte) fonctionne
- [ ] Vue image seule fonctionne
- [ ] Vue texte seule fonctionne
- [ ] Transcription s'affiche correctement
- [ ] Métadonnées s'affichent
- [ ] Navigation vers la page fonctionne

---

## FEATURE 5 : MODE HISTOIRE AVEC HOTSPOTS

**Source** : `/_IMPLEMENTATION/opale/components/StoryMode.tsx`
**Destination** : `/apps/web/components/story/StoryMode.tsx`
**Durée estimée** : 3-4 jours
**Priorité** : 🟡 MOYENNE

### Étape 5.1 : Copier le composant

```bash
mkdir -p apps/web/components/story
cp _IMPLEMENTATION/opale/components/StoryMode.tsx \
   apps/web/components/story/StoryMode.tsx

# Installer dépendances
pnpm add react-zoom-pan-pinch@^3.7.0
```

### Étape 5.2 : Adapter les types de hotspots

**Fichier** : `apps/web/components/story/StoryMode.tsx`

```typescript
// AVANT (Opale)
type HotspotType = 'boat' | 'person' | 'place' | 'activity' | 'object';

// APRÈS (Archivia)
type HotspotType = 'person' | 'place' | 'event' | 'object' | 'concept';

// Couleurs par type
const HOTSPOT_COLORS = {
  person: '#3B82F6',   // Bleu
  place: '#10B981',    // Vert
  event: '#F59E0B',    // Orange
  object: '#8B5CF6',   // Violet
  concept: '#EC4899',  // Rose
};
```

### Étape 5.3 : Connecter aux annotations

**Fichier** : `apps/web/components/story/StoryMode.tsx`

```typescript
interface StoryModeProps {
  document: Document;
  hotspots?: Hotspot[];
}

function StoryMode({ document, hotspots = [] }: StoryModeProps) {
  // Charger hotspots depuis l'API si non fournis
  const { data: apiHotspots } = useQuery({
    queryKey: ['hotspots', document.id],
    queryFn: () => fetch(`/api/documents/${document.id}/hotspots`).then(r => r.json()),
    enabled: hotspots.length === 0
  });

  const allHotspots = hotspots.length > 0 ? hotspots : apiHotspots || [];

  // Reste du code identique à Opale
}
```

### Étape 5.4 : Checklist Mode Histoire

- [ ] Hotspots s'affichent sur l'image
- [ ] Clic sur hotspot ouvre panneau info
- [ ] Zoom/pan fonctionne
- [ ] Couleurs par type correctes
- [ ] Navigation entre documents liés fonctionne

---

## FEATURE 6 : GRAPHE DE CONNAISSANCES

**Source** : `/_IMPLEMENTATION/journal_de_guerre/src/public/js/knowledge-graph.js`
**Destination** : `/apps/web/components/ontology/KnowledgeGraph.tsx`
**Durée estimée** : 2 jours
**Priorité** : 🟡 MOYENNE

### Étape 6.1 : Installer D3.js

```bash
pnpm add d3@^7.8.5
pnpm add -D @types/d3
```

### Étape 6.2 : Créer wrapper React

**Fichier** : `apps/web/components/ontology/KnowledgeGraph.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  type: 'person' | 'place' | 'event' | 'object' | 'concept';
  size?: number;
}

interface Link {
  source: string;
  target: string;
  type: string;
  weight?: number;
}

interface KnowledgeGraphProps {
  nodes: Node[];
  links: Link[];
  onNodeClick?: (node: Node) => void;
}

export default function KnowledgeGraph({
  nodes,
  links,
  onNodeClick
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Copier la logique de knowledge-graph.js ici
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous
    svg.selectAll('*').remove();

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Dessiner liens
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', (d) => Math.sqrt(d.weight || 1));

    // Dessiner nœuds
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.size || 10)
      .attr('fill', (d) => getColorByType(d.type))
      .on('click', (event, d) => onNodeClick?.(d))
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d) => d.label)
      .attr('font-size', 12)
      .attr('dx', 15);

    // Update positions
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, onNodeClick]);

  function getColorByType(type: string) {
    const colors = {
      person: '#3B82F6',
      place: '#10B981',
      event: '#F59E0B',
      object: '#8B5CF6',
      concept: '#EC4899'
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  }

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ border: '1px solid #e5e7eb' }}
    />
  );
}
```

### Étape 6.3 : Créer API pour charger le graphe

**Fichier** : `apps/web/app/api/projects/[id]/graph/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@archivia/database';
import { entities, entityRelationships } from '@archivia/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Charger entités
  const allEntities = await db.query.entities.findMany({
    where: eq(entities.projectId, id)
  });

  // Charger relations
  const relations = await db.query.entityRelationships.findMany({
    where: eq(entityRelationships.projectId, id) // Ajouter ce champ si manquant
  });

  // Formater pour D3
  const nodes = allEntities.map(e => ({
    id: e.id,
    label: e.name,
    type: e.type,
    size: 10 // Ou calculer selon importance
  }));

  const links = relations.map(r => ({
    source: r.sourceId,
    target: r.targetId,
    type: r.relationType,
    weight: r.weight || 1
  }));

  return NextResponse.json({ nodes, links });
}
```

### Étape 6.4 : Checklist Graphe

- [ ] D3.js compile sans erreur
- [ ] Nœuds s'affichent
- [ ] Liens s'affichent
- [ ] Force simulation fonctionne
- [ ] Drag & drop des nœuds fonctionne
- [ ] Clic sur nœud déclenche callback
- [ ] Couleurs par type correctes

---

## FEATURE 7 : PWA OFFLINE

**Source** : `/_IMPLEMENTATION/opale/public/sw.js` + `manifest.json`
**Destination** : `/apps/web/public/`
**Durée estimée** : 1 jour
**Priorité** : 🟢 BASSE

### Étape 7.1 : Copier les fichiers PWA

```bash
# Copier Service Worker
cp _IMPLEMENTATION/opale/public/sw.js \
   apps/web/public/sw.js

# Copier Manifest
cp _IMPLEMENTATION/opale/public/manifest.json \
   apps/web/public/manifest.json
```

### Étape 7.2 : Personnaliser Manifest

**Fichier** : `apps/web/public/manifest.json`

```json
{
  "name": "Archivia - Plateforme Patrimoniale",
  "short_name": "Archivia",
  "description": "Préservation et valorisation du patrimoine culturel",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FDF8F3",
  "theme_color": "#A67B5B",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Étape 7.3 : Adapter Service Worker

**Fichier** : `apps/web/public/sw.js`

```javascript
const CACHE_NAME = 'archivia-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Images : cache-first
  if (url.pathname.startsWith('/uploads/') || url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // API : network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
    return;
  }

  // Pages : stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response.clone());
        });
        return response;
      });

      return cached || fetchPromise;
    })
  );
});
```

### Étape 7.4 : Enregistrer Service Worker

**Fichier** : `apps/web/app/layout.tsx`

```typescript
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered', reg))
        .catch((err) => console.error('SW registration failed', err));
    }
  }, []);

  return (
    <html>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Étape 7.5 : Ajouter InstallPWA

```bash
# Déjà copié en Phase 1
# Juste importer dans le layout

import InstallPWA from '@/components/InstallPWA';

<body>
  {children}
  <InstallPWA />
</body>
```

### Étape 7.6 : Checklist PWA

- [ ] Manifest est servi correctement
- [ ] Service Worker s'enregistre
- [ ] Images se cachent (offline)
- [ ] Pages se cachent
- [ ] Application installable (mobile/desktop)
- [ ] Fonctionne hors ligne

---

## FEATURE 8 : RECHERCHE SÉMANTIQUE

**Source** : Pattern combiné Opale (full-text) + future vectorielle
**Destination** : `/apps/web/app/api/search/route.ts`
**Durée estimée** : 2 jours
**Priorité** : 🟡 MOYENNE

### Étape 8.1 : Créer API de recherche

**Fichier** : `apps/web/app/api/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@archivia/database';
import { documents } from '@archivia/database/schema';
import { sql, or, like, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const projectId = searchParams.get('projectId');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!query.trim()) {
    return NextResponse.json({ documents: [], total: 0 });
  }

  // Recherche full-text basique
  const conditions = [
    like(documents.title, `%${query}%`),
    like(documents.transcription, `%${query}%`),
    like(documents.historicalContext, `%${query}%`)
  ];

  if (projectId) {
    conditions.push(eq(documents.projectId, projectId));
  }

  if (category) {
    conditions.push(eq(documents.category, category));
  }

  const results = await db.query.documents.findMany({
    where: or(...conditions),
    limit,
    offset
  });

  const total = results.length; // TODO: COUNT query

  return NextResponse.json({
    documents: results,
    total,
    query
  });
}
```

### Étape 8.2 : Créer composant de recherche

**Fichier** : `apps/web/components/search/SearchBar.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher dans les archives..."
        className="input input-bordered flex-1"
      />
      <button type="submit" className="btn btn-primary">
        Rechercher
      </button>
    </form>
  );
}
```

### Étape 8.3 : Créer page de résultats

**Fichier** : `apps/web/app/search/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => fetch(`/api/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
    enabled: !!query
  });

  if (!query) {
    return <div>Entrez une recherche</div>;
  }

  if (isLoading) {
    return <div>Recherche en cours...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">
        Résultats pour "{query}"
      </h1>

      <p className="text-gray-600 mb-8">
        {data.total} résultat(s) trouvé(s)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.documents.map((doc) => (
          <div key={doc.id} className="card">
            <img src={doc.filePath} alt={doc.title} />
            <h3>{doc.title}</h3>
            <p>{doc.description}</p>
            <a href={`/projects/${doc.projectId}/documents/${doc.id}`}>
              Voir le document
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Étape 8.4 : Checklist Recherche

- [ ] Recherche full-text fonctionne
- [ ] Résultats pertinents
- [ ] Filtres par catégorie fonctionnent
- [ ] Pagination fonctionne
- [ ] UI de recherche responsive

---

## SCRIPTS DE MAINTENANCE

### Script 1 : Vérification des images

**Copier tel quel** :
```bash
cp _IMPLEMENTATION/opale/verify_images.py \
   apps/web/scripts/verify_images.py
```

**Usage** :
```bash
python apps/web/scripts/verify_images.py \
  apps/web/public/uploads \
  --report verification_report.json
```

### Script 2 : Conversion TIFF→JPG

**Copier tel quel** :
```bash
cp _IMPLEMENTATION/opale/convert_tiff_to_jpg.py \
   apps/web/scripts/convert_tiff_to_jpg.py
```

**Usage** :
```bash
python apps/web/scripts/convert_tiff_to_jpg.py \
  /input/tiff \
  /output/jpg \
  --quality 95
```

---

## CHECKLIST COMPLÈTE

### Phase 1 : Fondations ✅
- [ ] PhotoZoom.tsx copié et fonctionne
- [ ] InstallPWA.tsx copié et fonctionne
- [ ] extract_text.py copié et testé
- [ ] Tailwind config adapté
- [ ] Next.js config copié

### Phase 2 : Core 🔄
- [ ] Gallery.tsx adapté
- [ ] DocumentViewer créé
- [ ] OCR pipeline intégré
- [ ] Visionneuse split (image|texte) fonctionne

### Phase 3 : Intelligence 🔄
- [ ] ontology-extractor.ts porté
- [ ] KnowledgeGraph.tsx créé
- [ ] API graphe fonctionne
- [ ] Extraction entités automatique

### Phase 4 : Avancé 🔄
- [ ] StoryMode.tsx adapté
- [ ] PWA configurée
- [ ] Service Worker actif
- [ ] Application installable

---

**FIN DU PLAN DE MIGRATION**

Date : 17 novembre 2025
Version : 1.0
Statut : Complet et prêt à exécuter
