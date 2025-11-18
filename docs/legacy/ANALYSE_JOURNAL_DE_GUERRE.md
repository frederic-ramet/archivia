# Analyse Technique - Journal de Guerre

## Résumé Exécutif

**Projet** : Système de numérisation et d'analyse du journal de guerre d'Ernest Ramet (1918)
**URL** : https://github.com/frederic-ramet/journal_de_guerre
**Stack** : Node.js/Express + SQLite + Python (OCR)
**Version** : Production (100 commits)

---

## 1. Architecture Technique

### 1.1 Stack Technologique

| Composant | Technologie | Version | Rôle |
|-----------|------------|---------|------|
| **Backend** | Express.js | 4.18.2 | Serveur web et API REST |
| **Base de données** | SQLite (better-sqlite3) | 9.2.2 | Stockage relationnel persistant |
| **Templating** | EJS | 3.1.9 | Rendu côté serveur des vues |
| **Upload** | Multer | 1.4.5-lts.1 | Gestion des fichiers uploadés |
| **OCR/ML** | Python + Ollama/Claude | 3.8+ | Extraction de texte manuscrit |
| **Déploiement** | Vercel | - | Hébergement serverless |

### 1.2 Structure du Projet

```
journal_de_guerre/
├── server.js                 # Point d'entrée Express
├── package.json              # Dépendances Node.js
├── requirements.txt          # Dépendances Python
├── vercel.json              # Configuration déploiement
│
├── src/
│   ├── extract_text.py      # Extraction OCR (19KB)
│   ├── split_image.py       # Découpage d'images (3KB)
│   ├── routes/              # API endpoints
│   │   ├── index.js         # Routes racine
│   │   ├── journal.js       # CRUD journal
│   │   ├── archives.js      # Gestion archives
│   │   ├── etude.js         # Fonctionnalités d'étude
│   │   ├── api.js           # API REST (8.6KB)
│   │   └── ontology.js      # Graphe de connaissances (7.1KB)
│   ├── services/
│   │   └── ontology-extractor.js  # Extraction d'ontologie (11KB)
│   ├── views/               # Templates EJS
│   ├── public/              # Assets statiques
│   └── interface/           # Interface web
│
├── data/
│   └── journal.db           # Base SQLite (WAL mode)
│
├── jpg_extract/             # Images sources (JPEG)
├── jpg_web/                 # Images optimisées web
├── extracted_texts/         # Textes extraits par page
│
└── Documentation/
    ├── ANALYSE_COMPLETE_JOURNAL.md
    ├── knowledge_graph.md
    ├── transcriptions_ameliorees_batch[1-10].md
    ├── CORRECTIONS_TRANSCRIPTIONS.md
    └── synthese_journal.md
```

### 1.3 Configuration Serveur

```javascript
// Configuration clé de server.js
const app = express();
const db = new Database('data/journal.db', {
  fileMustExist: false
});

// Optimisation SQLite
db.pragma('journal_mode = WAL');  // Write-Ahead Logging

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('src/public'));
app.use('/images', express.static('jpg_web'));
app.set('view engine', 'ejs');

// Injection DB dans les requêtes
app.use((req, res, next) => {
  req.db = db;
  next();
});
```

---

## 2. Fonctionnalités Principales

### 2.1 Extraction de Texte Manuscrit (OCR)

**Pipeline de traitement** :

1. **Découpage d'image** (`split_image.py`)
   - Division en quadrants (top_left, top_right, bottom_left, bottom_right)
   - Amélioration de la lisibilité du texte incliné
   - Traitement par lots automatisé

2. **Extraction par IA** (`extract_text.py`)
   - Support multi-providers :
     - **Local** : Ollama + LLaVA (gratuit, offline)
     - **Cloud** : Claude Vision (payant, haute qualité)
   - Déduplication automatique des résultats
   - Consolidation dans un fichier unifié
   - Suivi des coûts API

**Commande type** :
```bash
python src/extract_text.py jpg/ --output extracted_journal.txt --model llava:latest
```

### 2.2 API REST

| Route | Description | Fonctionnalités |
|-------|-------------|-----------------|
| `/` | Page d'accueil | Navigation principale |
| `/journal` | Gestion du journal | CRUD entrées, pagination |
| `/archives` | Archives numériques | Consultation des pages numérisées |
| `/etude` | Outils d'étude | Analyse et recherche |
| `/api` | API REST (8.6KB) | Endpoints programmatiques |
| `/api/ontology` | Graphe sémantique | Extraction et requêtes ontologiques |

### 2.3 Graphe de Connaissances (Ontologie)

**Entités identifiées** :

| Catégorie | Nombre | Exemples |
|-----------|--------|----------|
| Personnes | 11 | Ramet Ernest, Dieu, Jésus-Christ |
| Concepts spirituels | 20 | Foi, Charité, Humilité, Patience |
| Lieux | 6 | Munster (Westphalie), Paradis |
| Objets | 5 | Le journal, images dévotionnelles |
| Dates | 16 | Juin 1911 - Août 1918 |

**Structure ontologique** :
```
ÊTRE_SUPRÊME
├── Dieu
├── Jésus-Christ
└── Saint-Esprit

ÊTRE_HUMAIN
├── Ramet Ernest (auteur, ~200 occurrences)
├── Homme (concept)
└── Prochain

COMPOSANTES_HUMAINES
├── Âme
├── Esprit
├── Cœur
└── Corps

VERTUS
├── Théologales (Foi, Espérance, Charité)
└── Cardinales (Humilité, Patience, Persévérance)

ESCHATOLOGIE
├── Salut
├── Vie Éternelle
└── Grâce Divine
```

**Relations sémantiques** (triplets) :
- `Homme --[REÇOIT]--> Grâce` via `Prière`
- `Foi --[MÈNE_À]--> Salut` via `Persévérance`
- `Bonne Action --[REQUIERT]--> [Foi, Charité, Humilité]`

### 2.4 Recherche Sémantique

- **Embeddings** : Sentence Transformers (modèle multilingue français)
- **Similarité** : Cosinus entre vecteurs sémantiques
- **Requêtes naturelles** : "Passages sur la foi", "Mentions de Munster"
- **Affichage contextuel** : Texte + image source correspondante

---

## 3. Forces Identifiées

### 3.1 Points Forts Techniques

1. **Pipeline OCR robuste**
   - Multi-provider (local/cloud)
   - Gestion des coûts
   - Déduplication automatique
   - Support manuscrit français

2. **Ontologie structurée**
   - Extraction automatique d'entités
   - Relations sémantiques typées
   - Hiérarchie conceptuelle claire
   - Service dédié (11KB de logique)

3. **Architecture modulaire**
   - Séparation routes/services/vues
   - Base SQLite optimisée (WAL)
   - API REST bien structurée
   - Middleware d'injection DB

4. **Documentation complète**
   - 10 fichiers de transcription
   - Analyse méthodologique détaillée
   - Corrections et vérifications
   - Synthèse du journal

### 3.2 Points Forts Fonctionnels

1. **Préservation patrimoniale**
   - 103 pages numérisées
   - Transcriptions vérifiées et corrigées
   - Contexte historique documenté (POW WWI)
   - Images haute qualité préservées

2. **Analyse sémantique**
   - Graphe de connaissances interrogeable
   - Recherche par similarité
   - Extraction automatique de concepts
   - Suivi de l'évolution thématique

3. **Accessibilité**
   - Interface web moderne
   - Déploiement Vercel (serverless)
   - API pour intégrations tierces
   - Support offline (Ollama)

---

## 4. Limitations et Axes d'Amélioration

### 4.1 Limitations Techniques

| Aspect | Limitation | Impact |
|--------|-----------|--------|
| **Frontend** | Rendu serveur EJS (pas de SPA) | UX moins fluide |
| **État** | Pas de gestion d'état client | Rechargements fréquents |
| **Types** | JavaScript non typé | Bugs potentiels runtime |
| **SEO** | SSR basique sans métadonnées riches | Découvrabilité limitée |
| **PWA** | Pas de support offline | Non installable |
| **Performance** | Pas de lazy loading images | Temps de chargement longs |
| **Responsive** | Non mentionné | Expérience mobile incertaine |

### 4.2 Limitations Fonctionnelles

1. **Pas d'annotations interactives**
   - Impossible d'ajouter des notes sur les images
   - Pas de hotspots cliquables
   - Pas de zones d'intérêt marquées

2. **Collaboration limitée**
   - Pas de système de contributions
   - Pas de validation communautaire
   - Pas de versioning des transcriptions

3. **Export limité**
   - Pas d'export PDF structuré
   - Pas de génération de rapports
   - Pas de formats académiques (BibTeX, etc.)

4. **Visualisation basique**
   - Pas de timeline interactive
   - Pas de carte géographique
   - Pas de graphe visuel des relations

### 4.3 Recommandations

1. **Migrer vers Next.js** pour SSR + SPA hybride
2. **Ajouter TypeScript** pour la robustesse
3. **Implémenter PWA** avec cache offline
4. **Créer un éditeur d'annotations** visuel
5. **Ajouter des visualisations** (timeline, graphes, cartes)
6. **Généraliser l'architecture** pour d'autres corpus

---

## 5. Métriques du Projet

| Métrique | Valeur |
|----------|--------|
| Commits | 100 |
| Pages numérisées | 103 |
| Fichiers transcription | 10 batches |
| Entités ontologiques | 53+ |
| Routes API | 6 modules |
| Taille service ontologie | 11KB |
| Période couverte | 1911-1918 |

---

## 6. Conclusion

Le projet Journal de Guerre présente une **excellente fondation** pour la numérisation et l'analyse sémantique de documents patrimoniaux. Ses points forts sont :

- **OCR multi-provider** avec support manuscrit
- **Ontologie structurée** avec extraction automatique
- **Recherche sémantique** par embeddings
- **Documentation méthodologique** exemplaire

Les principales opportunités d'amélioration concernent :

- **Modernisation du frontend** (React/Next.js)
- **Ajout d'interactivité** (annotations, visualisations)
- **Support PWA** pour l'accessibilité offline
- **Généralisation** de l'architecture pour d'autres corpus

Ce projet constitue une base solide pour un outil patrimonial plus complet, particulièrement fort sur l'aspect **traitement et analyse sémantique du texte**.

---

*Analyse réalisée le 17 novembre 2025*
