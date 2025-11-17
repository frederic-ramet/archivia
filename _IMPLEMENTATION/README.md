# 📚 DOCUMENTATION D'IMPLÉMENTATION ARCHIVIA

**Date de création** : 17 novembre 2025
**Status** : ✅ Complet et prêt pour validation

---

## 📋 CONTENU DE CE DOSSIER

Ce dossier contient toute la documentation nécessaire pour implémenter Archivia en réutilisant le code des projets de référence **Opale** et **Journal de Guerre**.

### 📄 Documents de Spécification

| Document | Taille | Description | Priorité Lecture |
|----------|--------|-------------|------------------|
| **ARBORESCENCE_CIBLE.md** | 32 KB | Architecture complète d'Archivia | 🔴 LIRE EN PREMIER |
| **INVENTAIRE_CODE_REUTILISABLE.md** | 34 KB | Catalogue détaillé du code disponible | 🟡 Référence |
| **PLAN_MIGRATION_FEATURES.md** | 41 KB | Instructions étape par étape | 🟢 Guide pratique |

### 📁 Code Source de Référence

| Répertoire | Projet | Utilisation |
|------------|--------|-------------|
| `opale/` | Galerie patrimoniale maritime | Composants UI, PWA, Galerie |
| `journal_de_guerre/` | Journal de guerre WWI | OCR, Ontologie, Graphe |

---

## 🚀 ORDRE DE LECTURE RECOMMANDÉ

### 1️⃣ **ARBORESCENCE_CIBLE.md** (À LIRE EN PREMIER)

**Objectif** : Vue d'ensemble de l'architecture finale d'Archivia

**Contenu** :
- ✅ Arborescence complète des fichiers
- ✅ Liste des fonctionnalités majeures
- ✅ Routes et navigation
- ✅ Schéma de base de données
- ✅ Composants React à créer
- ✅ Services backend
- ✅ Checklist de validation

**À valider** :
- [ ] Structure des dossiers OK ?
- [ ] Routes `/projects`, `/gallery`, `/story` OK ?
- [ ] Espaces WORKSPACE / READER / INSIGHT clairs ?
- [ ] Schéma DB complet ?
- [ ] Technologies (Next.js 14, D3, Framer Motion) OK ?

---

### 2️⃣ **INVENTAIRE_CODE_REUTILISABLE.md** (Référence)

**Objectif** : Savoir exactement quel code copier d'Opale et Journal de Guerre

**Contenu** :
- ✅ Composants React avec % de réutilisabilité
- ✅ Services backend JavaScript
- ✅ Scripts Python
- ✅ Configuration (Tailwind, Next.js, PWA)
- ✅ Patterns d'architecture
- ✅ Chemins absolus de tous les fichiers sources

**Utilisation** :
- 📌 Référence rapide : "Où trouver Gallery.tsx ?"
- 📌 Estimation d'effort : "Combien de temps pour adapter StoryMode ?"
- 📌 Priorités : "Quoi copier en priorité ?"

**Composants clés à copier** :
```
⭐ PhotoZoom.tsx         → 100% réutilisable (0 adaptation)
⭐ InstallPWA.tsx        → 100% réutilisable (branding seulement)
⭐ extract_text.py       → 100% réutilisable (0 adaptation)
⭐ Gallery.tsx           → 80% réutilisable (2-3j adaptation)
⭐ StoryMode.tsx         → 80% réutilisable (3-4j adaptation)
⭐ ontology-extractor.js → 80% réutilisable (porter en TS)
⭐ knowledge-graph.js    → 90% réutilisable (wrapper React)
```

---

### 3️⃣ **PLAN_MIGRATION_FEATURES.md** (Guide Pratique)

**Objectif** : Instructions étape par étape pour implémenter chaque feature

**Contenu** :
- ✅ 8 features détaillées (Galerie, OCR, Ontologie, Visionneuse, etc.)
- ✅ Checklist par feature
- ✅ Code exact à copier/adapter
- ✅ Commandes bash
- ✅ Exemples de code TypeScript

**Utilisation** :
- 🛠️ Guide de développement
- 🛠️ Tutoriel pas-à-pas
- 🛠️ Exemples de code prêts à l'emploi

**Exemple** : Feature 1 - Galerie Interactive
1. Copier `Gallery.tsx` d'Opale
2. Installer `framer-motion`
3. Adapter les imports (ligne 3-5)
4. Adapter les types (ligne 10-20)
5. Adapter les catégories (ligne 45-60)
6. Tester avec `pnpm dev`

---

## 📊 RÉSUMÉ EXÉCUTIF

### Code Réutilisable Total

| Type | Quantité | Réutilisabilité | Gain Temps |
|------|----------|----------------|------------|
| **Composants React** | 6 fichiers (82 KB) | 80% | 1-2 semaines |
| **Services Backend** | 4 services (31 KB) | 85% | 1 semaine |
| **Scripts Python** | 8 scripts (113 KB) | 75% | 1 semaine |
| **Configuration** | 5 fichiers | 95% | 2 jours |
| **Total** | ~6,500 lignes | 80% | **4-6 semaines** |

### Priorités d'Implémentation

#### Phase 1 : Fondations (Semaine 1-2) 🔴 CRITIQUE
- [ ] Copier PhotoZoom.tsx (0 adaptation)
- [ ] Copier InstallPWA.tsx (branding)
- [ ] Copier extract_text.py (0 adaptation)
- [ ] Adapter Tailwind config (palette Archivia)
- [ ] Copier Next.js config

#### Phase 2 : Core (Semaine 3-4) 🔴 HAUTE
- [ ] Adapter Gallery.tsx (source données)
- [ ] Créer DocumentViewer.tsx (split view)
- [ ] Intégrer OCR pipeline (API route)
- [ ] Porter ontology-extractor.ts

#### Phase 3 : Intelligence (Semaine 5-6) 🟡 MOYENNE
- [ ] Wrapper KnowledgeGraph.tsx (D3.js)
- [ ] Adapter StoryMode.tsx (thèmes)
- [ ] Implémenter recherche sémantique

#### Phase 4 : Polish (Semaine 7+) 🟢 BASSE
- [ ] PWA offline complète
- [ ] Annotations collaboratives
- [ ] Tests et optimisations

---

## 🎯 POINTS DE DÉCISION REQUIS

### À Valider MAINTENANT

1. **Architecture des 3 espaces** :
   - WORKSPACE (`/projects/[id]`) - Edition
   - READER (`/gallery/[id]`) - Lecture publique
   - INSIGHT (`/projects/[id]/insights`) - Analyse
   - ✅ OK ou modifier ?

2. **Palette de couleurs** :
   - `heritage-*` (existant) : beige/marron patrimoine
   - Ou nouvelle palette ?

3. **Types d'entités ontologie** :
   - person, place, event, object, concept
   - ✅ OK ou ajouter types ?

4. **PWA offline** :
   - Implémenter dès Phase 1 ou plus tard ?

5. **Recherche vectorielle** :
   - Phase 1 (full-text) ou Phase 2 (embeddings) ?

### À Décider PLUS TARD

6. Multilangue FR/EN : Phase 1 ou 2 ?
7. Annotations temps réel (WebSockets) : Phase 3 ou 4 ?
8. Export IIIF : Prioritaire ou pas ?

---

## 🔍 QUICK START

### Si tu veux commencer MAINTENANT

```bash
# 1. Copier un composant universel (test rapide)
cp _IMPLEMENTATION/opale/components/PhotoZoom.tsx \
   apps/web/components/documents/PhotoZoom.tsx

# 2. Installer dépendances
cd apps/web
pnpm add react-zoom-pan-pinch@^3.7.0

# 3. Tester dans une page
# Créer apps/web/app/test/page.tsx
import PhotoZoom from '@/components/documents/PhotoZoom';

export default function TestPage() {
  return <PhotoZoom imageSrc="/uploads/test.jpg" altText="Test" />;
}

# 4. Vérifier
pnpm dev
# Ouvrir http://localhost:3000/test
```

### Si tu veux analyser d'abord

1. **Lire** `ARBORESCENCE_CIBLE.md` (30 min)
2. **Parcourir** `INVENTAIRE_CODE_REUTILISABLE.md` (20 min)
3. **Valider** l'architecture avec moi
4. **Suivre** `PLAN_MIGRATION_FEATURES.md` étape par étape

---

## 📞 PROCHAINES ÉTAPES

### Action Immédiate

1. **Lire ARBORESCENCE_CIBLE.md**
2. **Valider** :
   - Structure des espaces (WORKSPACE/READER/INSIGHT)
   - Routes principales
   - Schéma base de données
   - Technologies choisies

3. **Décider** :
   - Palette de couleurs finale
   - Types d'entités ontologie
   - Priorité PWA (Phase 1 ou 2 ?)
   - Priorité recherche vectorielle

### Après Validation

4. **Commencer Phase 1** :
   - Copier composants universels
   - Adapter configuration
   - Tester build

5. **Suivre PLAN_MIGRATION_FEATURES.md**
   - Feature par feature
   - Checklist à chaque étape

---

## 📚 STRUCTURE DES DOCUMENTS

### ARBORESCENCE_CIBLE.md (32 KB)

```
1. Vue d'ensemble
2. Arborescence complète (1000+ lignes)
3. Fonctionnalités par module
4. Routes et navigation
5. Base de données (schéma SQL)
6. Services et API
7. Composants React
8. Scripts et outils
9. Validation checklist
```

### INVENTAIRE_CODE_REUTILISABLE.md (34 KB)

```
1. Synthèse globale
2. Composants React (6 composants détaillés)
3. Services backend (4 services)
4. Scripts Python (8 scripts)
5. Configuration & assets
6. Architecture patterns
7. Plan de portage
8. Fichiers sources (chemins absolus)
9. Priorités
10. Métriques réutilisabilité
```

### PLAN_MIGRATION_FEATURES.md (41 KB)

```
1. Vue d'ensemble
2-9. 8 Features détaillées :
   - Galerie Interactive
   - OCR & Transcription
   - Extraction Ontologie
   - Visionneuse Documents
   - Mode Histoire
   - Graphe de Connaissances
   - PWA Offline
   - Recherche Sémantique
10. Scripts de maintenance
11. Checklist complète
```

---

## 🎓 LÉGENDE DES PRIORITÉS

| Symbole | Signification | Action |
|---------|---------------|--------|
| 🔴 | CRITIQUE / HAUTE | À faire en premier |
| 🟡 | MOYENNE | Après fondations |
| 🟢 | BASSE | Optionnel / Plus tard |
| ⭐ | CODE RÉUTILISABLE | À copier d'Opale/JdG |
| ✅ | EXISTANT | Déjà implémenté |
| 🔨 | À CRÉER | Nouveau composant |

---

## 📊 MÉTRIQUES FINALES

| Métrique | Valeur |
|----------|--------|
| **Documentation totale** | 107 KB (3 fichiers) |
| **Code analysé** | 2 projets (Opale + JdG) |
| **Composants catalogués** | 45+ composants |
| **Scripts identifiés** | 14 scripts |
| **Gain temps estimé** | 4-6 semaines |
| **Réutilisabilité moyenne** | 80% |

---

**🚀 Prêt à commencer ? Lis ARBORESCENCE_CIBLE.md et valide l'architecture !**

---

**Créé le** : 17 novembre 2025
**Par** : Claude (Anthropic)
**Pour** : Archivia - Plateforme Patrimoniale
