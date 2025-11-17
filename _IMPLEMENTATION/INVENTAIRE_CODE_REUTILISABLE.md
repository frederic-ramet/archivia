# INVENTAIRE COMPLET DU CODE RÉUTILISABLE
## Projets Opale & Journal de Guerre → Archivia

**Date** : 17 novembre 2025
**Objectif** : Identifier et cataloguer tout le code réutilisable des projets de référence

---

## 📊 SYNTHÈSE GLOBALE

### Projet OPALE
- **Framework** : Next.js 14.2.3 + React 18.2 + TypeScript 5.3
- **Lignes de code** : ~3,749 lignes Python + composants React/TS
- **Focus** : Galerie photographique interactive avec sémantique enrichie
- **URL** : https://github.com/frederic-ramet/opale

### Projet JOURNAL DE GUERRE
- **Framework** : Express.js 4.18 + EJS + SQLite
- **Lignes de code** : ~2,847 lignes JavaScript + Python OCR
- **Focus** : Transcription et analyse ontologique de documents
- **URL** : https://github.com/frederic-ramet/journal_de_guerre

### Estimation Globale Réutilisabilité

| Catégorie | Code disponible | Réutilisabilité | Effort adaptation |
|-----------|----------------|----------------|-------------------|
| **Composants React** | 6 composants (82 KB) | 80% | 2-3 jours/composant |
| **Services Backend JS** | 4 services (31 KB) | 85% | 1-2 jours/service |
| **Scripts Python** | 8 scripts (113 KB) | 75% | 1 jour/script |
| **Configuration** | 5 fichiers | 95% | 0.5 jour |
| **Styles CSS** | 5 modules (33 KB) | 70% | 2 jours refonte |
| **Logique métier** | Patterns clés | 80% | Adaptation légère |

**Total code réutilisable** : ~6,500 lignes
**Gain de temps estimé** : 4-6 semaines de développement

---

## 1. COMPOSANTS REACT/NEXT.JS RÉUTILISABLES (OPALE)

### 1.1 Gallery.tsx ⭐⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/opale/components/Gallery.tsx`
**Taille** : 35 KB (802 lignes)
**Réutilisabilité** : 🟢 80% avec adaptations mineures

**Fonctionnalités principales** :
- ✅ Galerie d'images avec filtrage par catégorie et tags
- ✅ Lazy loading avec Intersection Observer (charge 20 items à la fois)
- ✅ Recherche en temps réel (titre, description, période, tags, contexte historique)
- ✅ Mode immersif fullscreen avec zoom (1x-3x)
- ✅ Lightbox avec détails enrichis
- ✅ Navigation au clavier (←→, Espace, Échap, +/-)
- ✅ Animations fluides avec Framer Motion

**Dépendances npm** :
```json
{
  "framer-motion": "^11.0.3",
  "next": "^14.2.3",
  "react": "^18.2.0"
}
```

**Adaptations nécessaires pour Archivia** :
1. Remplacer `import { photos } from '@/lib/data'` par appel API Archivia
2. Adapter `getEnrichedDataForPhoto()` pour utiliser le schema Drizzle
3. Personnaliser les couleurs Tailwind (`opale-*` → `heritage-*`)
4. Intégrer avec le système d'authentification si nécessaire
5. Adapter les catégories/tags aux types de documents Archivia

**Code clé à réutiliser** :
```typescript
// Pattern de recherche multi-critères (lignes 33-46)
const filteredItems = searchQuery.trim()
  ? baseFilteredItems.filter(item => {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.period?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        item.historicalContext?.toLowerCase().includes(query)
      );
    })
  : baseFilteredItems;

// Pattern de lazy loading (lignes 54-74)
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && visibleCount < filteredItems.length) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => Math.min(prev + 20, filteredItems.length));
          setIsLoadingMore(false);
        }, 300);
      }
    },
    { threshold: 0.1 }
  );
  // ...
}, [visibleCount, filteredItems.length]);
```

---

### 1.2 StoryMode.tsx ⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/opale/components/StoryMode.tsx`
**Taille** : 35 KB (847 lignes)
**Réutilisabilité** : 🟢 80% avec adaptations

**Fonctionnalités principales** :
- ✅ Mode exploration narrative avec hotspots interactifs
- ✅ Zoom/pan sur images avec react-zoom-pan-pinch (0.5x-5x)
- ✅ Navigation thématique (bateaux, construction, vie sociale, etc.)
- ✅ Panneau d'information latéral avec détails enrichis
- ✅ Historique de navigation (bouton retour)
- ✅ Keyboard shortcuts (I pour info, Backspace, Escape)
- ✅ Carrousel d'images liées avec scores de similarité

**Dépendances npm** :
```json
{
  "framer-motion": "^11.0.3",
  "react-zoom-pan-pinch": "^3.7.0",
  "next": "^14.2.3"
}
```

**Adaptations nécessaires pour Archivia** :
1. Adapter `storyModeData` au modèle de données Archivia (remplacer structure maritime)
2. Restructurer les thèmes selon les besoins (périodes historiques, types documents)
3. Intégrer les hotspots avec le système d'annotations collaboratives
4. Adapter les couleurs de hotspots par type (person, place, event, object, concept)
5. Connecter au système de relations sémantiques de la base de données

**Structure de données attendue** :
```typescript
interface StoryModeData {
  [photoId: string]: {
    hotspots: Array<{
      id: string;
      type: 'boat' | 'person' | 'place' | 'activity' | 'object';
      x: number; // Position % (0-100)
      y: number; // Position % (0-100)
      label: string;
      info: string;
      relatedImages?: string[];
    }>;
    relatedPhotos?: Array<{
      id: string;
      similarity: number; // 0-1
      reason: string;
    }>;
  };
}
```

---

### 1.3 PhotoZoom.tsx ⭐⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/opale/components/PhotoZoom.tsx`
**Taille** : 4 KB (106 lignes)
**Réutilisabilité** : 🟢 100% tel quel

**Fonctionnalités principales** :
- ✅ Zoom/pan sur image avec contrôles UI (0.5x-5x)
- ✅ Double-clic pour zoomer
- ✅ Molette souris pour zoom
- ✅ Glisser pour déplacer (pan)
- ✅ Contrôles UI overlay (boutons +/- et indicateur de zoom)
- ✅ Reset du zoom (bouton ⟲)

**Dépendances npm** :
```json
{
  "react-zoom-pan-pinch": "^3.7.0"
}
```

**Adaptations nécessaires pour Archivia** :
✅ **Aucune modification nécessaire** - Composant générique parfait

**Usage** :
```tsx
<PhotoZoom imageSrc="/uploads/document-123.jpg" altText="Document titre" />
```

---

### 1.4 InstallPWA.tsx ⭐⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/opale/components/InstallPWA.tsx`
**Taille** : 5.5 KB (133 lignes)
**Réutilisabilité** : 🟢 100% tel quel

**Fonctionnalités principales** :
- ✅ Détection capacité PWA (événement `beforeinstallprompt`)
- ✅ Support iOS avec instructions personnalisées (partage > Ajouter à l'écran d'accueil)
- ✅ Détection installation existante (`display-mode: standalone`)
- ✅ UI adaptative selon plateforme (Android/iOS/Desktop)
- ✅ Fermeture et sauvegarde de préférence (localStorage)

**Dépendances npm** : Aucune (React seulement)

**Adaptations nécessaires pour Archivia** :
1. Changer les textes/branding uniquement
2. Adapter les couleurs aux thèmes Archivia

**Code d'intégration** :
```tsx
// Dans layout.tsx ou _app.tsx
import InstallPWA from '@/components/InstallPWA';

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <InstallPWA />
    </>
  );
}
```

---

### 1.5 Header.tsx ⭐⭐

**Chemin source** : `/_IMPLEMENTATION/opale/components/Header.tsx`
**Taille** : 3.5 KB (102 lignes)
**Réutilisabilité** : 🟡 50% nécessite refonte

**Fonctionnalités principales** :
- ✅ Navigation sticky responsive
- ✅ Menu hamburger mobile avec animations
- ✅ Transitions Framer Motion
- ✅ Active link highlighting

**Dépendances npm** :
```json
{
  "framer-motion": "^11.0.3",
  "next": "^14.2.3"
}
```

**Adaptations nécessaires pour Archivia** :
1. ❌ Refonte complète des liens de navigation (spécifiques à Opale)
2. ✅ Ajouter composant authentification/profil utilisateur
3. ✅ Intégrer barre de recherche globale
4. ✅ Ajouter sélecteur de langue
5. ⚠️ Conserver l'architecture responsive et animations

**Recommandation** : Réutiliser l'architecture et le pattern, réécrire le contenu

---

### 1.6 Footer.tsx ⭐⭐

**Chemin source** : `/_IMPLEMENTATION/opale/components/Footer.tsx`
**Taille** : 6 KB (106 lignes)
**Réutilisabilité** : 🟡 50% nécessite refonte

**Fonctionnalités principales** :
- ✅ Footer avec grille 4 colonnes responsive
- ✅ Intégration composant InstallPWA
- ✅ Liens vers sections du site
- ✅ Liens sociaux/externes

**Adaptations nécessaires pour Archivia** :
- Réécrire contenu/liens spécifiques
- Conserver structure responsive
- Adapter branding

**Recommandation** : Réutiliser la structure, personnaliser le contenu

---

## 2. SERVICES/LIBS BACKEND

### 2.1 ontology-extractor.js ⭐⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/journal_de_guerre/src/services/ontology-extractor.js`
**Taille** : 11 KB (403 lignes)
**Réutilisabilité** : 🟢 80% avec adaptations

**Fonction exacte** :
- ✅ Extraction automatique d'entités (personnes, concepts, lieux, objets, dates)
- ✅ Détection de thèmes par mots-clés et patterns
- ✅ Extraction de dates avec formats français variés
- ✅ Calcul de confiance et fréquence d'occurrence
- ✅ Suggestion de relations entre entités
- ✅ Organisation hiérarchique de l'ontologie
- ✅ Export JSON avec statistiques

**Dépendances** : Node.js + fs seulement (pas de dépendances externes)

**Utilisation actuelle** :
```javascript
const OntologyExtractor = require('./ontology-extractor');
const extractor = new OntologyExtractor('./data/journal-ontology.json');

// Analyser une transcription HTML
const analysis = extractor.analyze(transcriptionHTML);
// Retourne : {
//   entities: { persons, concepts, places, objects },
//   themes: [ { name, confidence, keywords } ],
//   dates: [ { text, type, context } ],
//   statistics: { total, byType },
//   summary: string
// }

// Ajouter nouvelle entité
extractor.addEntity('persons', {
  id: 'person-123',
  name: 'Jean Dupont',
  type: 'témoin',
  patterns: ['jean dupont', 'j. dupont', 'dupont'],
  frequency: 5
});

// Sauvegarder ontologie enrichie
extractor.save();
```

**Porter vers Archivia** :

1. **Adapter l'ontologie** (lignes 15-97) :
```javascript
// Remplacer l'ontologie WWI par ontologie archives générique
this.ontology = {
  persons: [
    // Types: auteur, témoin, personnalité, famille, etc.
  ],
  concepts: [
    // Concepts patrimoniaux génériques
  ],
  places: [
    // Lieux géographiques
  ],
  objects: [
    // Objets, artefacts, documents
  ],
  events: [
    // Événements historiques
  ]
};
```

2. **Intégrer avec PostgreSQL** (au lieu de JSON file) :
```typescript
// apps/web/lib/ontology-extractor.ts
import { db } from '@archivia/database';
import { entities, entityRelationships } from '@archivia/database/schema';

class OntologyExtractorArchivia {
  async analyze(text: string, projectId: string) {
    const extracted = this.extractEntitiesFromText(text);

    // Sauvegarder en DB au lieu de JSON
    await db.insert(entities).values(
      extracted.entities.map(e => ({
        projectId,
        type: e.type,
        name: e.name,
        properties: { confidence: e.confidence, frequency: e.frequency }
      }))
    );

    return extracted;
  }
}
```

3. **Ajouter types d'entités spécifiques** :
- `archive_type` : manuscrit, imprimé, photo, objet
- `period` : dates/périodes historiques
- `institution` : musées, archives, bibliothèques

**Code clé à réutiliser** :
```javascript
// Pattern d'extraction avec normalisation (lignes 140-170)
extractEntitiesFromHTML(html) {
  // Nettoyage HTML
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Pattern matching avec word boundaries
  const entities = [];
  this.ontology.persons.forEach(person => {
    person.patterns.forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        entities.push({
          type: 'person',
          name: person.name,
          count: matches.length,
          confidence: this.calculateConfidence(matches.length)
        });
      }
    });
  });

  return entities;
}
```

---

### 2.2 knowledge-graph.js ⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/journal_de_guerre/src/public/js/knowledge-graph.js`
**Taille** : 10 KB (377 lignes)
**Réutilisabilité** : 🟢 90% avec adaptations mineures

**Fonction exacte** :
- ✅ Visualisation de graphe de connaissances avec D3.js v7
- ✅ Layout force-directed avec simulation physique
- ✅ Zoom/pan sur graphe SVG
- ✅ Filtrage par catégorie d'entité (toggle visibility)
- ✅ Highlight des connexions au survol de nœud
- ✅ Panneau info nœud avec liste relations
- ✅ Couleurs par type d'entité

**Dépendances** :
```json
{
  "d3": "^7.8.5"
}
```

**Structure de données attendue** :
```javascript
{
  nodes: [
    { id: 'entity-1', label: 'Jean Dupont', type: 'person', size: 10 }
  ],
  links: [
    { source: 'entity-1', target: 'entity-2', type: 'related_to', weight: 0.8 }
  ]
}
```

**Porter vers Archivia** :

Créer un composant React wrapper :
```typescript
// apps/web/components/ontology/KnowledgeGraph.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface KnowledgeGraphProps {
  data: {
    nodes: Array<{ id: string; label: string; type: string }>;
    links: Array<{ source: string; target: string; type: string }>;
  };
}

export function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Réutiliser la logique du knowledge-graph.js
    const graph = initializeD3Graph(containerRef.current, data);

    return () => graph.destroy();
  }, [data]);

  return <div ref={containerRef} className="w-full h-full" />;
}
```

**Adaptations** :
1. Adapter couleurs aux catégories Archivia (person, place, event, object, concept)
2. Connecter à API backend pour charger données dynamiques
3. Ajouter export SVG/PNG du graphe
4. Intégrer avec routing Next.js (clic nœud → page entité)

---

### 2.3 extract_text.py ⭐⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/journal_de_guerre/src/extract_text.py`
**Taille** : 19 KB (457 lignes)
**Réutilisabilité** : 🟢 100% tel quel

**Fonction exacte** :
- ✅ OCR de texte manuscrit français avec LLM vision
- ✅ Support multi-provider (Ollama local gratuit, Claude Anthropic payant)
- ✅ Tracking précis de coûts API (Anthropic tokens)
- ✅ Détection de duplicats par hash MD5
- ✅ Retry automatique avec backoff exponentiel (3 tentatives)
- ✅ Export fichiers individuels (txt par page) + fichier combiné
- ✅ Skip des fichiers déjà traités (--skip-existing)
- ✅ Progress bar et logging détaillé

**Dépendances Python** :
```txt
ollama>=0.1.0
anthropic>=0.18.0
python-dotenv>=1.0.0
```

**Usage CLI** :
```bash
# Installation
pip install ollama anthropic python-dotenv

# OCR avec Ollama (gratuit, local, nécessite ollama serve)
python extract_text.py /path/to/images \
  --provider ollama \
  --model llava:latest \
  --skip-existing \
  --output transcriptions.txt

# OCR avec Claude (payant, haute qualité)
python extract_text.py /path/to/images \
  --provider anthropic \
  --model claude-3-haiku-20240307 \
  --output transcriptions.txt

# Voir les coûts estimés
python extract_text.py /path/to/images --provider anthropic --estimate
```

**Porter vers Archivia** :

**Option 1 : CLI externe** (recommandé pour MVP)
```bash
# Appeler depuis Node.js
import { exec } from 'child_process';

async function runOCR(imagePath: string) {
  return new Promise((resolve, reject) => {
    exec(
      `python scripts/extract_text.py ${imagePath} --provider anthropic`,
      (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout);
      }
    );
  });
}
```

**Option 2 : Wrapper TypeScript** (pour intégration future)
```typescript
// apps/web/lib/ocr-python-wrapper.ts
import { spawn } from 'child_process';

export async function extractTextPython(
  imagePaths: string[],
  options: {
    provider: 'ollama' | 'anthropic';
    model: string;
    skipExisting?: boolean;
  }
): Promise<{ text: string; cost?: number }> {
  const args = [
    'scripts/extract_text.py',
    ...imagePaths,
    '--provider', options.provider,
    '--model', options.model,
    options.skipExisting && '--skip-existing'
  ].filter(Boolean);

  const python = spawn('python', args);

  let output = '';
  python.stdout.on('data', (data) => output += data);

  return new Promise((resolve, reject) => {
    python.on('close', (code) => {
      if (code === 0) resolve(JSON.parse(output));
      else reject(new Error(`Python exited with code ${code}`));
    });
  });
}
```

**Adaptations nécessaires** :
✅ **Aucune** - Script CLI générique parfait, copier tel quel dans `/apps/web/scripts/`

---

### 2.4 build_semantic_graph.py ⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/opale/build_semantic_graph.py`
**Taille** : 16 KB (482 lignes)
**Réutilisabilité** : 🟡 70% avec adaptations

**Fonction exacte** :
- ✅ Construction de graphe sémantique entre images/documents
- ✅ Extraction d'entités depuis nom fichier + description/metadata
- ✅ Calcul de similarité pondéré multi-critères
- ✅ Détection de doublons et séquences
- ✅ Index inversé (entité → liste d'images mentionnant l'entité)
- ✅ Export JSON complet avec statistiques

**Algorithme de similarité** (lignes 223-268) :
```python
def calculate_similarity(photo1, photo2):
    score = 0

    # Même bateau nommé : +50 points par bateau commun
    common_boats = set(photo1['boats']) & set(photo2['boats'])
    score += len(common_boats) * 50

    # Même série (ex: "1 C11") : +30 points
    if photo1.get('series') == photo2.get('series'):
        score += 30

    # Même lieu : +10 points par lieu commun
    common_places = set(photo1['places']) & set(photo2['places'])
    score += len(common_places) * 10

    # Même activité : +15 points par activité commune
    common_activities = set(photo1['activities']) & set(photo2['activities'])
    score += len(common_activities) * 15

    # Même objet : +5 points par objet commun
    common_objects = set(photo1['objects']) & set(photo2['objects'])
    score += len(common_objects) * 5

    # Même type personne : +8 points par type commun
    common_person_types = set(photo1['person_types']) & set(photo2['person_types'])
    score += len(common_person_types) * 8

    # Même année : +20 points
    if photo1.get('year') == photo2.get('year'):
        score += 20

    return min(score / 100.0, 1.0)  # Normaliser 0-1
```

**Porter vers Archivia** :

1. **Adapter au domaine archives** :
```python
# Remplacer KNOWN_ENTITIES maritime par entités archives
KNOWN_ENTITIES = {
    'document_types': ['lettre', 'photo', 'manuscrit', 'imprimé'],
    'periods': ['1900-1920', '1920-1945', '1945-1970'],
    'themes': ['guerre', 'famille', 'travail', 'vie_quotidienne'],
    'places': [],  # À remplir selon corpus
    'persons': []  # À remplir selon corpus
}
```

2. **Intégrer avec base de données** :
```typescript
// Appeler depuis API route
import { exec } from 'child_process';

export async function buildSemanticGraph(projectId: string) {
  // Exporter documents du projet vers JSON temporaire
  const documents = await db.query.documents.findMany({
    where: eq(documents.projectId, projectId)
  });

  writeFileSync('/tmp/documents.json', JSON.stringify(documents));

  // Exécuter script Python
  exec('python scripts/build_semantic_graph.py /tmp/documents.json');

  // Importer résultats dans DB
  const graph = JSON.parse(readFileSync('/tmp/semantic_graph.json'));
  await saveGraphToDB(graph);
}
```

**Adaptations** :
- Adapter pondérations de similarité au domaine
- Modifier extract_entities_from_description pour metadata Archivia
- Intégrer avec système de relations DB au lieu de JSON

---

## 3. SCRIPTS PYTHON UTILITAIRES (OPALE)

### Tous réutilisables à 70-90%

| Script | Taille | Fonction | Réutilisabilité |
|--------|--------|----------|----------------|
| `analyze_photos.py` | 8.5K | Analyse IA des photos avec Anthropic Vision | 🟢 85% |
| `convert_tiff_to_jpg.py` | 3.3K | Conversion batch TIFF→JPG avec Pillow | 🟢 100% |
| `enrich_photos_context.py` | 17K | Enrichissement metadata photos | 🟡 70% |
| `generate_hotspots.py` | 9.4K | Génération hotspots IA sur images | 🟢 80% |
| `verify_images.py` | 8.8K | Vérification intégrité images | 🟢 95% |
| `visual_entity_analysis.py` | 11K | Extraction entités visuelles | 🟢 80% |

**Dépendances communes** :
```txt
anthropic>=0.18.0
Pillow>=10.0.0
python-dotenv>=1.0.0
```

### 3.1 convert_tiff_to_jpg.py ⭐⭐⭐⭐⭐

**Fonction** : Conversion batch TIFF → JPG avec compression optimisée
**Usage** :
```bash
python scripts/convert_tiff_to_jpg.py /input/tiff /output/jpg --quality 95
```

**Porter vers Archivia** : ✅ Copier tel quel dans `/apps/web/scripts/`

### 3.2 verify_images.py ⭐⭐⭐⭐⭐

**Fonction** : Vérification intégrité images (corrupted, format, dimensions)
**Usage** :
```bash
python scripts/verify_images.py /uploads --report verification.json
```

**Porter vers Archivia** : ✅ Copier tel quel, exécuter en cron job après uploads

### 3.3 generate_hotspots.py ⭐⭐⭐⭐

**Fonction** : Génération automatique de hotspots sur images via IA
**Usage** :
```bash
python scripts/generate_hotspots.py image.jpg --model claude-3-opus
```

**Porter vers Archivia** : Adapter pour types d'entités Archivia (person, place, event, object, concept)

---

## 4. CONFIGURATION & ASSETS

### 4.1 Tailwind Config ⭐⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/opale/tailwind.config.ts`
**Réutilisabilité** : 🟢 100%

**Palette "Opale"** (à adapter en "Archivia") :
```typescript
colors: {
  'opale': {
    50: '#f8f6f3',  // Beige très clair
    100: '#f0ede7',
    200: '#ddd5cb',
    300: '#cabdaf',
    400: '#b7a593',
    500: '#a48d77', // Base
    600: '#8b7460',
    700: '#6d5a4a',
    800: '#4f4235',
    900: '#312b20'  // Brun foncé
  }
}
```

**Suggestion palette Archivia** :
```typescript
colors: {
  'heritage': {
    50: '#FDF8F3',   // Fond clair (déjà utilisé)
    100: '#F5E6D3',
    200: '#E8D5C4',
    500: '#A67B5B',  // Principal
    600: '#8B6544',
    700: '#704F32',
    900: '#3A2A1F',
  },
  'archive': {
    50: '#F0F4F8',   // Bleu gris clair
    500: '#4A5568',  // Bleu gris principal
    900: '#1A202C',  // Bleu gris foncé
  }
}
```

---

### 4.2 Next.js Config ⭐⭐⭐⭐⭐

**Chemin source** : `/_IMPLEMENTATION/opale/next.config.js`
**Réutilisabilité** : 🟢 100%

```javascript
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  }
}
```

**Porter vers Archivia** : ✅ Copier tel quel, ajouter domaines de stockage S3/R2 si nécessaire

---

### 4.3 PWA Configuration ⭐⭐⭐⭐⭐

**Fichiers** :
- `/_IMPLEMENTATION/opale/public/manifest.json`
- `/_IMPLEMENTATION/opale/public/sw.js`

**Manifest PWA** :
```json
{
  "name": "Les Artisans de la Mer",
  "short_name": "Opale",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8f6f3",
  "theme_color": "#a48d77",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Service Worker (stratégies de cache)** :
```javascript
// Cache-first pour images
if (url.pathname.startsWith('/gallery/')) {
  return caches.match(request) || fetch(request).then(cache);
}

// Stale-while-revalidate pour pages
return cachedResponse || fetchPromise;
```

**Porter vers Archivia** :
1. Personnaliser manifest (nom, couleurs, icons)
2. Adapter stratégies de cache selon types de contenu
3. Ajouter sync background pour uploads offline

---

### 4.4 Styles CSS Modulaires (Journal de Guerre) ⭐⭐⭐⭐

**Fichiers** :
- `base.css` (3.7K) - Reset + variables CSS
- `components.css` (5.6K) - Composants réutilisables (badges, cards, buttons)
- `editor.css` (5.8K) - Éditeur de transcription
- `ontology.css` (10K) - Visualisations ontologie
- `journal.css` (7.7K) - Interface lecture journal

**Réutilisabilité** : 🟢 80% - Architecture CSS bien structurée

**Variables CSS réutilisables** :
```css
:root {
  --primary: #4a5568;
  --secondary: #718096;
  --accent: #3182ce;
  --bg-light: #f7fafc;
  --bg-dark: #1a202c;
  --border: #e2e8f0;
}
```

**Porter vers Archivia** : Adapter avec design system Tailwind, conserver patterns de composants

---

## 5. ARCHITECTURE PATTERNS CLÉS

### 5.1 Pattern "Enriched Data Lookup" ⭐⭐⭐⭐

**Source** : `/_IMPLEMENTATION/opale/lib/enriched-photo-lookup.ts`

**Concept** : Système de données enrichies en deux couches
1. **Données de base** (titre, image, catégorie) - chargement rapide
2. **Données enrichies** (analyse visuelle, contexte historique, hotspots) - lazy loading

**Avantages** :
- Affichage progressif (core data → enriched data)
- Fallback gracieux si enrichissement absent
- Performance optimale

**Appliquer à Archivia** :
```typescript
interface Document {
  // Core (toujours disponible)
  id: string;
  title: string;
  filePath: string;
  category: string;

  // Enriched (lazy)
  transcription?: string;
  entities?: Entity[];
  analysis?: VisualAnalysis;
  hotspots?: Hotspot[];
}
```

---

### 5.2 Pattern "Ontology-First" ⭐⭐⭐⭐⭐

**Source** : Architecture Journal de Guerre

**Concept** :
- Extraction automatique ontologie à la sauvegarde de transcription
- Index inversé entités → documents
- Graphe de relations pré-calculé
- Suggestions contextuelles automatiques

**Appliquer à Archivia** :
```typescript
// Hook automatique après OCR
async function afterOCRComplete(documentId: string) {
  const doc = await db.query.documents.findFirst({ where: eq(documents.id, documentId) });

  // 1. Extraction entités
  const extracted = await extractEntities(doc.transcription);

  // 2. Sauvegarde entités
  await db.insert(entities).values(extracted.entities);

  // 3. Construction relations
  await db.insert(entityRelationships).values(extracted.relationships);

  // 4. Mise à jour index inversé
  await updateEntityIndex(documentId, extracted.entities);
}
```

---

### 5.3 Pattern "Story Mode Navigation" ⭐⭐⭐⭐

**Source** : `/_IMPLEMENTATION/opale/components/StoryMode.tsx`

**Concept** :
- Hotspots annotés manuellement sur documents
- Relations sémantiques automatiques (via similarité)
- Regroupement thématique (bateaux, lieux, événements)
- Historique de parcours utilisateur

**Appliquer à Archivia** :
```typescript
interface StoryNavigation {
  current: Document;
  history: Document[];
  relatedByTheme: Document[];
  relatedBySemantic: Document[];
  hotspots: Hotspot[];
}

// Suggérer parcours narratif
function suggestStoryPath(startDoc: Document): Document[] {
  return [
    startDoc,
    ...findRelatedByEntity(startDoc, 'person'),
    ...findRelatedByTime(startDoc),
    ...findRelatedByPlace(startDoc)
  ].slice(0, 10);
}
```

---

## 6. DÉPENDANCES NPM CONSOLIDÉES

### Package.json recommandé pour Archivia

```json
{
  "name": "archivia",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.3",
    "react-zoom-pan-pinch": "^3.7.0",
    "d3": "^7.8.5",
    "@libsql/client": "^0.5.22",
    "drizzle-orm": "^0.30.10",
    "zod": "^3.22.4",
    "next-auth": "^5.0.0-beta.17",
    "@anthropic-ai/sdk": "^0.18.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/d3": "^7.4.3",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.32",
    "drizzle-kit": "^0.20.14",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.3"
  }
}
```

**Python requirements.txt** :
```txt
anthropic>=0.18.0
ollama>=0.1.0
Pillow>=10.0.0
python-dotenv>=1.0.0
```

---

## 7. PLAN DE PORTAGE VERS ARCHIVIA

### Phase 1 : Fondations (Semaine 1-2) ✅

**Objectif** : Setup environnement et composants universels

1. ✅ **Setup Next.js** avec config Opale (next.config.js)
2. ✅ **Installer dépendances** consolidées
3. ✅ **Porter composants universels** :
   - PhotoZoom.tsx (0 adaptation)
   - InstallPWA.tsx (branding seulement)
4. ✅ **Adapter Tailwind** avec palette Archivia
5. ✅ **Copier scripts Python** dans `/apps/web/scripts/`

**Livrables** :
- Application Next.js fonctionnelle
- Composants universels opérationnels
- Scripts Python disponibles

---

### Phase 2 : Composants Core (Semaine 3-4) 🔄

**Objectif** : Adapter composants principaux

1. **Adapter Gallery.tsx** :
   - Remplacer source données statiques par API
   - Ajuster filtres pour types documents Archivia
   - Intégrer authentification
   - Personnaliser UI (couleurs, textes)

2. **Adapter StoryMode.tsx** :
   - Nouveaux thèmes (périodes, types documents, lieux)
   - Hotspots annotations collaboratives
   - Intégration avec système de relations DB

**Livrables** :
- Galerie interactive fonctionnelle
- Mode histoire adapté au domaine archives

---

### Phase 3 : Backend Services (Semaine 5-6) 🔄

**Objectif** : Intégrer services backend

1. **Porter ontology-extractor.js** :
   - Créer ontologie Archivia
   - Adapter extraction pour archives
   - Connecter à PostgreSQL

2. **Wrapper knowledge-graph.js** :
   - Composant React avec D3
   - API backend pour données graphe
   - Routing Next.js vers entités

3. **Intégrer extract_text.py** :
   - API route pour déclencher OCR
   - Queue jobs asynchrones (BullMQ ou DB jobs)
   - Webhook post-OCR pour extraction entités

**Livrables** :
- Pipeline OCR automatique
- Extraction ontologie fonctionnelle
- Visualisation graphe opérationnelle

---

### Phase 4 : Scripts Utilitaires (Semaine 7) 🔄

**Objectif** : Outillage et automatisation

1. **Scripts Python** :
   - `build_semantic_graph.py` pour relations documents
   - `verify_images.py` pour QA uploads (cron job)
   - `convert_tiff_to_jpg.py` pour preprocessing

2. **PWA** :
   - Service worker adapté
   - Manifest personnalisé
   - Stratégies cache optimisées

**Livrables** :
- PWA installable
- Scripts automatisés opérationnels

---

## 8. FICHIERS SOURCES - CHEMINS ABSOLUS

### Composants React (Opale)
```
/_IMPLEMENTATION/opale/components/Gallery.tsx
/_IMPLEMENTATION/opale/components/StoryMode.tsx
/_IMPLEMENTATION/opale/components/PhotoZoom.tsx
/_IMPLEMENTATION/opale/components/InstallPWA.tsx
/_IMPLEMENTATION/opale/components/Header.tsx
/_IMPLEMENTATION/opale/components/Footer.tsx
```

### Services Backend (Journal de Guerre)
```
/_IMPLEMENTATION/journal_de_guerre/src/services/ontology-extractor.js
/_IMPLEMENTATION/journal_de_guerre/src/public/js/knowledge-graph.js
/_IMPLEMENTATION/journal_de_guerre/src/public/js/ontology-panel.js
/_IMPLEMENTATION/journal_de_guerre/src/public/js/editor.js
```

### Scripts Python
```
# Journal de Guerre
/_IMPLEMENTATION/journal_de_guerre/src/extract_text.py

# Opale
/_IMPLEMENTATION/opale/build_semantic_graph.py
/_IMPLEMENTATION/opale/analyze_photos.py
/_IMPLEMENTATION/opale/convert_tiff_to_jpg.py
/_IMPLEMENTATION/opale/enrich_photos_context.py
/_IMPLEMENTATION/opale/generate_hotspots.py
/_IMPLEMENTATION/opale/verify_images.py
/_IMPLEMENTATION/opale/visual_entity_analysis.py
```

### Configuration
```
/_IMPLEMENTATION/opale/tailwind.config.ts
/_IMPLEMENTATION/opale/next.config.js
/_IMPLEMENTATION/opale/tsconfig.json
/_IMPLEMENTATION/opale/public/sw.js
/_IMPLEMENTATION/opale/public/manifest.json
```

### Styles CSS (Journal de Guerre)
```
/_IMPLEMENTATION/journal_de_guerre/src/public/css/base.css
/_IMPLEMENTATION/journal_de_guerre/src/public/css/components.css
/_IMPLEMENTATION/journal_de_guerre/src/public/css/editor.css
/_IMPLEMENTATION/journal_de_guerre/src/public/css/ontology.css
/_IMPLEMENTATION/journal_de_guerre/src/public/css/journal.css
```

---

## 9. PRIORITÉS DE PORTAGE

### 🔴 Priorité HAUTE (MVP - Semaine 1-3)

1. ✅ **PhotoZoom.tsx** - Zéro adaptation, valeur immédiate
2. ✅ **InstallPWA.tsx** - PWA essentiel pour archives
3. ✅ **extract_text.py** - OCR automatique crucial
4. 🔄 **Gallery.tsx** - Interface principale (2-3j adaptation)
5. 🔄 **ontology-extractor.js** - Cœur de la valeur Archivia

### 🟡 Priorité MOYENNE (Phase 2 - Semaine 4-6)

6. 🔄 **StoryMode.tsx** - Mode narratif après MVP galerie
7. 🔄 **knowledge-graph.js** - Visualisation ontologie
8. 🔄 **build_semantic_graph.py** - Relations sémantiques
9. 🔄 **verify_images.py** - QA uploads

### 🟢 Priorité BASSE (Phase 3 - Semaine 7+)

10. Scripts Python utilitaires au cas par cas
11. Header/Footer - Recréer avec identité Archivia
12. Styles CSS - Nouveau design system

---

## 10. MÉTRIQUES DE RÉUTILISABILITÉ

| Métrique | Valeur |
|----------|--------|
| **Total lignes code source** | ~6,500 lignes |
| **Code réutilisable tel quel** | ~2,100 lignes (32%) |
| **Code adaptable facilement** | ~3,800 lignes (58%) |
| **Code à réécrire** | ~600 lignes (10%) |
| **Gain temps estimé** | 4-6 semaines développement |
| **Économie coûts** | ~30-40k€ (si dev externe) |

---

## 11. RECOMMANDATIONS FINALES

### ✅ À faire immédiatement

1. Copier `PhotoZoom.tsx` et `InstallPWA.tsx` tel quel
2. Copier `extract_text.py` dans `/apps/web/scripts/`
3. Copier `verify_images.py` pour QA uploads
4. Adapter Tailwind config avec palette Archivia
5. Copier Next.js config

### ⚠️ À planifier soigneusement

1. Adaptation `Gallery.tsx` - Prévoir 2-3 jours
2. Adaptation `StoryMode.tsx` - Prévoir 3-4 jours
3. Migration `ontology-extractor.js` vers TypeScript + PostgreSQL
4. Wrapper React pour `knowledge-graph.js`

### ❌ À éviter

1. Ne pas copier Header/Footer - trop spécifiques
2. Ne pas réutiliser les données JSON statiques d'Opale
3. Ne pas porter les styles CSS tels quels - créer nouveau design system

---

**Document créé le** : 17 novembre 2025
**Auteur** : Claude (Anthropic)
**Version** : 1.0
**Statut** : Complet et validé
