# Analyse Technique - Opale (Les Artisans de la Mer)

## Résumé Exécutif

**Projet** : Galerie patrimoniale maritime interactive - Chantiers navals d'Étaples et Boulogne (1900-1935)
**URL** : https://github.com/frederic-ramet/opale
**Stack** : Next.js 14 + React 18 + TypeScript + Python (IA)
**Version** : 2.0.0 (131 commits, production)

---

## 1. Architecture Technique

### 1.1 Stack Technologique

| Composant | Technologie | Version | Rôle |
|-----------|------------|---------|------|
| **Framework** | Next.js | 14.2.3 | SSR/SSG + App Router |
| **UI** | React | 18.2.0 | Composants réactifs |
| **Typage** | TypeScript | 5.3.3 | Sécurité types (mode strict) |
| **Styling** | Tailwind CSS | 3.4.1 | Design system utilitaire |
| **Animation** | Framer Motion | 11.0.3 | Transitions fluides |
| **Zoom** | React Zoom Pan Pinch | 3.7.0 | Manipulation d'images |
| **IA Images** | Python + BLIP | - | Descriptions automatiques |
| **Déploiement** | Vercel | - | CDN + Edge Functions |

### 1.2 Structure du Projet

```
opale/
├── package.json              # Config Next.js + dépendances
├── tsconfig.json             # TypeScript strict mode
├── tailwind.config.ts        # Palette opale personnalisée
├── next.config.js            # Configuration Next.js
├── requirements.txt          # Dépendances Python
├── setup.sh                  # Script d'installation
│
├── app/                      # Next.js App Router (9 routes)
│   ├── layout.tsx            # Layout racine (4.5KB)
│   ├── page.tsx              # Homepage (10KB)
│   ├── globals.css           # Styles globaux
│   ├── register-sw.tsx       # Service Worker PWA
│   ├── sitemap.ts            # SEO dynamique
│   ├── explorer/             # Timeline interactive
│   ├── famille-lefevre/      # Généalogie industrielle
│   ├── lexique/              # Glossaire maritime (50+ termes)
│   ├── navires/              # Registre des navires (28+)
│   ├── photo/                # Galerie détail
│   ├── references/           # Sources et citations
│   └── story/                # Mode narratif immersif
│
├── components/               # Composants React
│   ├── Gallery.tsx           # Galerie principale (35KB)
│   ├── StoryMode.tsx         # Mode histoire (35.4KB)
│   ├── Header.tsx            # Navigation responsive
│   ├── Footer.tsx            # Pied de page
│   ├── PhotoZoom.tsx         # Zoom 0.5x-5x
│   └── InstallPWA.tsx        # Prompt installation PWA
│
├── lib/                      # Couche données
│   ├── data.ts               # Métadonnées 255 photos (96KB)
│   ├── storyModeData.ts      # Données narratives (415KB)
│   ├── contentIndex.ts       # Index de recherche (8KB)
│   ├── enriched-photo-lookup.ts  # Lookup enrichi (12KB)
│   ├── contexts/             # Contextes historiques (7 périodes)
│   ├── entities/             # Entités domaine
│   ├── relationships/        # Mappings relationnels
│   ├── types/                # Définitions TypeScript
│   ├── validation/           # Schémas de validation
│   └── enriched-photos/      # 17 fichiers enrichis
│
├── public/                   # Assets statiques
│   ├── gallery/              # 255 images JPEG optimisées
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service Worker
│   └── icons/                # Icons 72px-512px
│
├── Scripts Python/
│   ├── analyze_photos.py
│   ├── build_semantic_graph.py
│   ├── convert_tiff_to_jpg.py
│   ├── enrich_photos_context.py
│   ├── generate_complete_gallery.py
│   ├── generate_hotspots.py
│   ├── generate_image_descriptions.py
│   ├── verify_images.py
│   └── visual_entity_analysis.py
│
├── Données structurées/
│   ├── photos_enriched.json
│   ├── semantic_graph.json
│   ├── visual_entities.json
│   └── verification_results.json
│
└── Documentation/
    ├── spec_app.md           # Spécification complète
    ├── ANALYSE_PHOTOS.md
    ├── PHOTOS_CONTEXTUALISEES.md
    ├── VISION_SEMANTIQUE.md
    └── VERIFICATION_REPORT.md
```

### 1.3 Configuration TypeScript (Mode Strict)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 2. Fonctionnalités Principales

### 2.1 Galerie Interactive (Gallery.tsx - 35KB)

**Caractéristiques** :

- **Recherche full-text en temps réel**
  - Indexe : titres, descriptions, catégories, périodes, tags, contextes
  - Filtrage dynamique par catégories/tags
  - Relations intelligentes catégorie-tag

- **Affichage optimisé**
  - Lazy loading : 20 images initiales + 20 par scroll
  - Intersection Observer pour le chargement
  - Grille masonry responsive
  - Overlays de métadonnées au survol

- **Mode plein écran immersif**
  - Zoom 1x-3x avec contrôles visuels
  - Navigation clavier (←/→/Esc)
  - Affichage du pourcentage de zoom

**Données par photo** (255 items) :
```typescript
interface Photo {
  id: string;
  title: string;
  imagePath: string;
  category: string;        // 11 catégories
  period: string;
  tags: string[];          // 3-5 par photo
  description: string;
  historicalContext: string;
}
```

### 2.2 Mode Histoire (StoryMode.tsx - 35.4KB)

**Système de hotspots interactifs** :

- **Types de hotspots** (code couleur) :
  - 🚢 Bateaux (identifiés)
  - 👤 Personnes
  - 📍 Lieux
  - ⚙️ Activités
  - 🔧 Objets techniques

- **Fonctionnalités** :
  - Coordonnées X/Y sur l'image
  - Clic → carrousel d'images liées
  - Panneau coulissant avec métadonnées enrichies
  - Animation Framer Motion fluide
  - Scores de similarité entre images

**Structure des données** (storyModeData.ts - 415KB) :
```typescript
interface Hotspot {
  id: string;
  type: 'boat' | 'person' | 'place' | 'activity' | 'object';
  x: number;  // Position %
  y: number;
  label: string;
  relatedImages: string[];
  similarityScore: number;
}
```

### 2.3 Graphe Sémantique

**Construction** (`build_semantic_graph.py`) :

- **Entités nommées** :
  - 19 navires identifiés (Gabyvonne: 9 images, Médusa: 5, etc.)
  - Lieux indexés (Eau: 55 images, Bâtiment: 35, Quai: 23)
  - Personnes et dynasties (Lefèvre, Ramet)

- **Organisation sérielle** :
  - 18 séries distinctes
  - Code alphanumérique (1 C11, 2 C16)
  - Regroupement par albums photo originaux

- **Relations sémantiques** :
  - Navire partagé
  - Appartenance à une série
  - Activité commune
  - Proximité temporelle
  - Similarité visuelle (scores %)

**Taxonomie des activités** :

| Activité | Images | % |
|----------|--------|---|
| Rassemblements/cérémonies | 69 | 27% |
| Navigation | 59 | 23% |
| Construction navale | 45 | 18% |
| Travail | 19 | 7% |
| Portraits | 6 | 2% |

### 2.4 PWA (Progressive Web App)

**Service Worker** (stratégies de cache) :

```javascript
// sw.js - Stratégies différenciées
const strategies = {
  'gallery-images': 'cache-first',      // Priorité offline
  'static-pages': 'stale-while-revalidate', // Rapide + à jour
  'default': 'network-first'            // Dynamique avec fallback
};

// Assets pré-cachés
const precache = [
  '/',
  '/story',
  '/references',
  '/lexique',
  '/navires'
];
```

**Manifest PWA** :
```json
{
  "name": "Les Artisans de la Mer",
  "display": "standalone",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512" }
  ]
}
```

- Installation native Android/iOS
- Détection `beforeinstallprompt`
- Instructions plateforme-spécifiques
- Fonctionnement offline complet

### 2.5 Traitement d'Images par IA

**Pipeline Python** :

1. **Conversion TIFF→JPG** (`convert_tiff_to_jpg.py`)
   - Traitement récursif des répertoires
   - Conversion RGBA→RGB
   - Compression ~95% (45MB → 2MB)

2. **Descriptions IA** (`generate_image_descriptions.py`)
   - Modèle BLIP (Salesforce)
   - HuggingFace Transformers + PyTorch
   - 1-2s/image GPU, 5-10s CPU
   - Descriptions en langage naturel

3. **Analyse visuelle** (`visual_entity_analysis.py`)
   - Détection d'entités visuelles
   - Classification automatique
   - Extraction de caractéristiques

4. **Enrichissement contextuel** (`enrich_photos_context.py`)
   - Liaison avec contextes historiques
   - Ajout de métadonnées
   - Cross-référencement

### 2.6 SEO et Découvrabilité

**Structured Data** (JSON-LD) :
- WebSite
- ImageGallery
- Organization
- Person

**Optimisations** :
- Sitemap dynamique (racine + 255 routes photos + features)
- Open Graph meta tags
- Twitter Cards
- Métadonnées riches
- robots.txt configuré

---

## 3. Forces Identifiées

### 3.1 Points Forts Techniques

1. **Architecture moderne et robuste**
   - Next.js 14 avec App Router
   - TypeScript strict (0 any implicites)
   - Séparation claire des préoccupations
   - Composants réutilisables

2. **Performance exceptionnelle**
   - SSG pour 255+ routes statiques
   - Lazy loading intelligent
   - Optimisation images Next.js
   - Code splitting automatique
   - Cache PWA stratégique

3. **Expérience utilisateur immersive**
   - Animations Framer Motion fluides
   - Zoom 0.5x-5x interactif
   - Navigation clavier complète
   - Design responsive mobile-first

4. **Données enrichies massives**
   - 96KB de métadonnées photos
   - 415KB de données narratives
   - 17 fichiers d'enrichissement
   - Graphe sémantique structuré

5. **PWA complète**
   - Offline-first
   - Installation native
   - Cache intelligent
   - Sync en arrière-plan

### 3.2 Points Forts Fonctionnels

1. **Navigation multi-dimensionnelle**
   - Timeline interactive (1807-2011)
   - Carte géographique
   - Exploration par entités
   - Filtrage par série/activité/période

2. **Contenu patrimonial riche**
   - 255 photos historiques
   - 28+ navires documentés
   - 50+ termes de glossaire
   - Généalogie des familles (Lefèvre, Ramet)
   - 7 contextes historiques

3. **Mode narratif innovant**
   - Hotspots cliquables sur images
   - Stories thématiques
   - Carrousels d'images liées
   - Métadonnées contextuelles

4. **Outils d'analyse puissants**
   - Scripts Python spécialisés
   - IA pour descriptions
   - Graphes sémantiques
   - Vérification automatisée

---

## 4. Limitations et Axes d'Amélioration

### 4.1 Limitations Techniques

| Aspect | Limitation | Impact |
|--------|-----------|--------|
| **Base de données** | Données statiques (TypeScript) | Pas de CMS dynamique |
| **Backend** | Pas d'API REST | Intégrations limitées |
| **Authentification** | Absente | Pas de contributions |
| **Persistance** | Pas de stockage utilisateur | Collections non sauvegardées |
| **Recherche** | Client-side uniquement | Performance sur gros corpus |
| **OCR** | Non intégré | Pas d'extraction de texte |
| **Multilangue** | Français uniquement | Public international exclu |

### 4.2 Limitations Fonctionnelles

1. **Pas d'édition collaborative**
   - Impossible d'ajouter des annotations
   - Pas de corrections communautaires
   - Pas de versioning des métadonnées

2. **Recherche sémantique limitée**
   - Pas d'embeddings vectoriels
   - Recherche textuelle basique
   - Pas de NLP avancé

3. **Export restreint**
   - Pas d'export PDF
   - Pas de génération de rapports
   - Pas de formats académiques

4. **Analyse textuelle absente**
   - Pas d'OCR intégré
   - Pas d'extraction de texte manuscrit
   - Focus uniquement visuel

### 4.3 Recommandations

1. **Ajouter un backend** (API REST, base de données)
2. **Intégrer la recherche vectorielle** (embeddings)
3. **Permettre les contributions** (annotations, corrections)
4. **Ajouter l'OCR** pour documents textuels
5. **Internationaliser** (i18n)
6. **Créer un CMS** pour l'édition de contenu

---

## 5. Métriques du Projet

| Métrique | Valeur |
|----------|--------|
| Commits | 131 |
| Photos numériséees | 255 |
| Navires identifiés | 28+ |
| Termes glossaire | 50+ |
| Routes Next.js | 9+ modules |
| Taille Gallery.tsx | 35KB |
| Taille StoryMode.tsx | 35.4KB |
| Taille lib/data.ts | 96KB |
| Taille storyModeData | 415KB |
| Fichiers enrichissement | 17 |
| Contextes historiques | 7 |
| Période couverte | 1900-1935 |

---

## 6. Conclusion

Le projet Opale représente une **référence en matière de présentation interactive du patrimoine visuel**. Ses points forts majeurs sont :

- **Architecture Next.js 14 moderne** avec TypeScript strict
- **PWA complète** offline-first
- **Mode narratif innovant** avec hotspots interactifs
- **Données enrichies massives** (500KB+ de métadonnées)
- **Performance optimale** (SSG, lazy loading, cache)
- **UX immersive** (animations, zoom, navigation clavier)

Les principales opportunités d'amélioration concernent :

- **Ajout d'un backend** pour la persistance
- **Intégration OCR** pour les documents textuels
- **Recherche sémantique avancée** (embeddings)
- **Système de contribution** collaborative
- **Internationalisation** du contenu

Ce projet excelle dans la **présentation visuelle interactive** et constitue la base idéale pour l'aspect **consultation immersive** d'un outil patrimonial master.

---

*Analyse réalisée le 17 novembre 2025*
