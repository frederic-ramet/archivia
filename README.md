# Archivia

**Plateforme de numérisation, analyse et valorisation du patrimoine culturel**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Quick Start

```bash
# Installation automatique
./install.sh

# Ou manuel
pnpm install
cp .env.example apps/web/.env
pnpm db:push
pnpm dev
```

Accédez à http://localhost:3000

## 📚 Documentation

- [Guide Utilisateur](docs/GUIDE_UTILISATEUR.md) - Comment utiliser Archivia
- [Documentation Technique](docs/TECHNICAL_README.md) - Architecture et développement
- [Aide en ligne](http://localhost:3000/help) - Documentation interactive dans l'app

### Documentation Avancée

Consultez le dossier [docs/legacy/](docs/legacy/) pour :
- Plans d'implémentation détaillés
- Rapports de tests
- Analyses techniques des projets de référence (Opale, Journal de Guerre)

## ✨ Fonctionnalités

### 📖 Gestion de Documents
- Upload et organisation de documents
- Galerie interactive avec filtres et recherche
- Visionneuse côte à côte (image + texte)
- Zoom et navigation au clavier

### 🤖 Intelligence Artificielle
- **OCR** : Extraction de texte (manuscrit et imprimé) via Claude Vision
- **Entités** : Extraction automatique de personnes, lieux, événements
- **Graphe de connaissances** : Visualisation interactive D3.js
- **Génération d'histoires** : Narratifs générés par IA

### ✏️ Annotations
- Annotations collaboratives (Konva.js)
- Formes : rectangles, cercles, zones de surbrillance
- Notes et hotspots narratifs
- Persistance en base de données

### 🔍 Recherche
- Recherche globale en temps réel
- Full-text sur documents et transcriptions
- Recherche d'entités
- Filtres par catégorie, période, tags

### 🌐 Export & PWA
- Export HTML statique (déployable sur GitHub Pages)
- Progressive Web App (installable, mode hors ligne)
- Service Worker pour cache des images
- Bilingue FR/EN

## 🏗️ Architecture

```
archivia/
├── apps/web/              # Application Next.js principale
│   ├── app/               # Routes et API (App Router)
│   ├── components/        # Composants React
│   └── lib/               # Services et utilitaires
├── packages/
│   ├── database/          # Drizzle ORM + schéma
│   └── shared-types/      # Types TypeScript partagés
└── docs/                  # Documentation
```

## 🛠️ Stack Technique

- **Frontend** : Next.js 14, React 18, TypeScript
- **Styling** : Tailwind CSS
- **Database** : LibSQL (Turso) avec Drizzle ORM
- **Auth** : NextAuth.js
- **AI** : Anthropic Claude (Vision, Haiku, Sonnet)
- **Visualisation** : D3.js, Konva.js, Framer Motion
- **PWA** : Service Workers, Web Manifest

## 🧪 Tests

```bash
# Tests unitaires et d'intégration
pnpm test

# Tests E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## 📦 Commandes Utiles

```bash
# Développement
pnpm dev                # Démarrer le serveur de dev
pnpm build             # Build de production
pnpm start             # Démarrer en production

# Base de données
pnpm db:push           # Appliquer le schéma
pnpm db:studio         # Interface Drizzle Studio
pnpm db:migrate        # Créer une migration

# Qualité
pnpm lint              # Linter
pnpm type-check        # Vérification TypeScript
pnpm format            # Formater le code
```

## 🤝 Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) (à venir)

## 📄 Licence

MIT License - voir [LICENSE](LICENSE)

## 🙏 Crédits

Archivia s'inspire de deux projets de référence :
- **Opale** : Galerie interactive, PWA, mode histoire
- **Journal de Guerre** : Extraction d'ontologie, graphe de connaissances

Voir [docs/legacy/](docs/legacy/) pour les analyses détaillées.

---

**Développé avec ❤️ pour la préservation du patrimoine culturel**
