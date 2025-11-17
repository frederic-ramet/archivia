# Archivia - Plateforme de Préservation du Patrimoine

Archivia est une plateforme moderne de numérisation, analyse et valorisation du patrimoine culturel. Elle combine OCR, analyse sémantique et génération AI pour créer des expériences interactives autour des archives historiques.

## Fonctionnalités

- **Gestion multi-projets** : Créez et gérez plusieurs collections patrimoniales
- **Upload de documents** : Drag & drop avec preview et métadonnées
- **OCR intelligent** : Transcription automatique des manuscrits (à venir)
- **Ontologie progressive** : Construction automatique du graphe de connaissances (à venir)
- **Récits narratifs** : Création d'histoires guidées (à venir)
- **Export statique** : Génération de sites HTML autonomes (à venir)

## Prérequis

- **Node.js** 18.0 ou supérieur
- **pnpm** 8.0 ou supérieur
- **Outils de compilation** (pour better-sqlite3) :
  - Linux : `build-essential python3`
  - macOS : `xcode-select --install`
  - Windows : `windows-build-tools`

## Installation Rapide

```bash
# Cloner le repository
git clone https://github.com/frederic-ramet/archivia.git
cd archivia

# Lancer l'installation automatique
./install.sh

# Démarrer le serveur de développement
pnpm dev
```

## Installation Manuelle

### 1. Installer les dépendances

```bash
# Installer pnpm si nécessaire
npm install -g pnpm

# Installer toutes les dépendances
pnpm install
```

### 2. Configurer l'environnement

```bash
# Créer le fichier .env
cp .env.example .env  # ou créer manuellement

# Créer les répertoires nécessaires
mkdir -p packages/database/data
mkdir -p apps/web/public/uploads
```

### 3. Initialiser la base de données

```bash
# Générer les migrations
pnpm db:generate

# Optionnel : peupler avec des données de test
pnpm db:seed
```

### 4. Vérifier l'installation

```bash
# Vérifier TypeScript
pnpm type-check

# Vérifier ESLint
pnpm lint
```

### 5. Démarrer le développement

```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

## Structure du Projet

```
archivia/
├── apps/
│   └── web/                    # Application Next.js 14
│       ├── app/                # App Router (pages + API)
│       │   ├── api/            # Routes API REST
│       │   │   ├── projects/   # CRUD projets
│       │   │   ├── documents/  # CRUD documents
│       │   │   └── upload/     # Upload fichiers
│       │   ├── projects/       # Pages projets
│       │   └── page.tsx        # Page d'accueil
│       ├── components/         # Composants React
│       ├── lib/                # Utilitaires
│       └── public/             # Assets statiques
│           └── uploads/        # Fichiers uploadés
├── packages/
│   ├── database/               # Drizzle ORM + SQLite
│   │   ├── src/
│   │   │   ├── schema.ts       # Schéma des tables
│   │   │   ├── index.ts        # Connexion DB
│   │   │   ├── migrate.ts      # Script migration
│   │   │   └── seed.ts         # Données de test
│   │   └── drizzle/            # Fichiers de migration
│   └── shared-types/           # Types TypeScript partagés
│       └── src/
│           ├── index.ts        # Interfaces principales
│           └── api.ts          # Schémas Zod
├── install.sh                  # Script d'installation
├── package.json                # Configuration racine
└── pnpm-workspace.yaml         # Configuration monorepo
```

## Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Démarrer le serveur de développement |
| `pnpm build` | Compiler pour la production |
| `pnpm start` | Démarrer le serveur de production |
| `pnpm lint` | Vérifier le code avec ESLint |
| `pnpm type-check` | Vérifier les types TypeScript |
| `pnpm clean` | Nettoyer les builds |
| `pnpm db:generate` | Générer les migrations Drizzle |
| `pnpm db:migrate` | Appliquer les migrations |
| `pnpm db:seed` | Peupler la base avec des données de test |

## Technologies Utilisées

- **Frontend** : Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Drizzle ORM
- **Base de données** : SQLite (better-sqlite3)
- **Validation** : Zod
- **Monorepo** : pnpm workspaces

## API REST

### Projets

- `GET /api/projects` - Lister les projets (pagination, filtres)
- `POST /api/projects` - Créer un projet
- `GET /api/projects/:id` - Détails d'un projet
- `PUT /api/projects/:id` - Modifier un projet
- `DELETE /api/projects/:id` - Supprimer un projet

### Documents

- `GET /api/documents` - Lister les documents (filtres par projet)
- `POST /api/documents` - Créer un document
- `GET /api/documents/:id` - Détails d'un document
- `PUT /api/documents/:id` - Modifier un document
- `DELETE /api/documents/:id` - Supprimer un document

### Upload

- `POST /api/upload` - Upload d'un fichier
- `PUT /api/upload` - Upload multiple (batch)

## Configuration

### Variables d'Environnement

```bash
# Base de données
DATABASE_URL=./packages/database/data/archivia.db

# Environnement
NODE_ENV=development

# Future : Services AI
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
```

### Personnalisation du Thème

Les couleurs heritage sont définies dans `apps/web/tailwind.config.ts` :

```typescript
colors: {
  heritage: {
    50: "#FDF8F3",   // Fond clair
    100: "#F5E6D3",  // Accent léger
    200: "#E8D5C4",  // Bordures
    500: "#A67B5B",  // Principal
    600: "#8B6544",  // Hover
    700: "#704F32",  // Texte sombre
    900: "#3A2A1F",  // Navigation
  },
}
```

## Développement

### Ajouter une nouvelle fonctionnalité

1. Créer les types dans `packages/shared-types/src/`
2. Ajouter le schéma DB dans `packages/database/src/schema.ts`
3. Créer les routes API dans `apps/web/app/api/`
4. Créer les composants UI dans `apps/web/components/`
5. Vérifier avec `pnpm type-check` et `pnpm lint`

### Conventions de Code

- TypeScript strict mode activé
- Validation Zod pour tous les inputs API
- Composants React fonctionnels avec hooks
- Tailwind CSS pour le styling (pas de CSS personnalisé)

## Contribution

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'feat: add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Licence

MIT - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

**Frédéric Ramet** - Conception et développement

---

*Archivia - Préserver le passé, enrichir le futur.*
