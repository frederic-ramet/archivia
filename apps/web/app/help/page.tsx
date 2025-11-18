import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation - Archivia',
  description: 'Documentation complète d\'Archivia',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-50 to-heritage-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-heritage-900 mb-4">
            📚 Documentation Archivia
          </h1>
          <p className="text-lg text-gray-700">
            Plateforme de Préservation et Valorisation du Patrimoine Culturel
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/"
              className="text-heritage-600 hover:text-heritage-700 underline"
            >
              ← Retour à l'accueil
            </Link>
            <Link
              href="/setup-wizard"
              className="text-heritage-600 hover:text-heritage-700 underline"
            >
              🔧 Wizard de configuration
            </Link>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-heritage-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            Démarrage Rapide
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="font-semibold text-lg">1. Installation</h3>
              <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
                <code>./install.sh</code>
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Le script installe automatiquement toutes les dépendances et configure l'environnement
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="font-semibold text-lg">2. Configuration</h3>
              <p className="text-gray-700 mt-2">
                Éditez <code className="bg-gray-100 px-2 py-1 rounded">apps/web/.env</code> pour :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                <li>Configurer le chemin de la base de données</li>
                <li>Ajouter votre clé API Anthropic (optionnel)</li>
                <li>Configurer l'authentification</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h3 className="font-semibold text-lg">3. Lancement</h3>
              <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
                <code>pnpm dev</code>
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                L'application sera disponible sur <strong>http://localhost:3000</strong>
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <h3 className="font-semibold text-lg">4. Connexion</h3>
              <div className="bg-yellow-50 p-3 rounded mt-2">
                <p className="font-mono text-sm">
                  Email: <strong>admin@archivia.local</strong><br />
                  Mot de passe: <strong>admin123</strong>
                </p>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Changez ce mot de passe après la première connexion !
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-heritage-900 mb-4">
            ✨ Fonctionnalités Principales
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-heritage-200 rounded-lg p-4">
              <h3 className="font-semibold text-heritage-700 mb-2">📁 Gestion de Projets</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Multi-projets avec métadonnées enrichies</li>
                <li>• Upload et organisation de documents</li>
                <li>• Permissions multi-utilisateurs</li>
                <li>• Branding personnalisé par projet</li>
              </ul>
            </div>

            <div className="border border-heritage-200 rounded-lg p-4">
              <h3 className="font-semibold text-heritage-700 mb-2">🤖 Intelligence Artificielle</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• OCR avec Claude Vision API</li>
                <li>• Extraction d'entités automatique</li>
                <li>• Génération de récits narratifs</li>
                <li>• Construction de graphes de connaissances</li>
              </ul>
            </div>

            <div className="border border-heritage-200 rounded-lg p-4">
              <h3 className="font-semibold text-heritage-700 mb-2">🔍 Recherche & Visualisation</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Recherche sémantique full-text</li>
                <li>• Graphe d'entités interactif (D3.js)</li>
                <li>• Timeline et cartographie</li>
                <li>• Dashboard analytics</li>
              </ul>
            </div>

            <div className="border border-heritage-200 rounded-lg p-4">
              <h3 className="font-semibold text-heritage-700 mb-2">💾 Export & Partage</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Export HTML statique (ZIP)</li>
                <li>• PWA avec mode hors-ligne</li>
                <li>• Internationalisation FR/EN</li>
                <li>• Annotations et hotspots</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Commandes Utiles */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-heritage-900 mb-4">
            ⌨️ Commandes Utiles
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-heritage-700 mb-2">Développement</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
                <div><code className="text-green-600">pnpm dev</code> - Démarrer le serveur de développement</div>
                <div><code className="text-green-600">pnpm build</code> - Compiler pour la production</div>
                <div><code className="text-green-600">pnpm start</code> - Démarrer le serveur de production</div>
                <div><code className="text-green-600">pnpm lint</code> - Vérifier le code avec ESLint</div>
                <div><code className="text-green-600">pnpm type-check</code> - Vérifier TypeScript</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-heritage-700 mb-2">Base de données</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
                <div><code className="text-blue-600">pnpm db:push</code> - Synchroniser le schéma</div>
                <div><code className="text-blue-600">pnpm db:generate</code> - Générer les migrations</div>
                <div><code className="text-blue-600">pnpm db:migrate</code> - Appliquer les migrations</div>
                <div><code className="text-blue-600">pnpm db:seed</code> - Créer des données de test</div>
                <div><code className="text-blue-600">pnpm test:opale</code> - Créer projet de test Opale</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-heritage-700 mb-2">Tests</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
                <div><code className="text-purple-600">pnpm test</code> - Lancer tous les tests (191 tests)</div>
                <div><code className="text-purple-600">pnpm test:watch</code> - Tests en mode watch</div>
                <div><code className="text-purple-600">pnpm test -- --coverage</code> - Tests avec couverture</div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Détaillée */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-heritage-900 mb-4">
            📖 Documentation Détaillée
          </h2>

          <div className="space-y-3">
            <a
              href="/README.md"
              target="_blank"
              className="block border border-heritage-200 rounded-lg p-4 hover:bg-heritage-50 transition"
            >
              <h3 className="font-semibold text-heritage-700">README.md</h3>
              <p className="text-sm text-gray-600">
                Documentation principale du projet avec installation, configuration et fonctionnalités
              </p>
            </a>

            <a
              href="/TEST_PLAN.md"
              target="_blank"
              className="block border border-heritage-200 rounded-lg p-4 hover:bg-heritage-50 transition"
            >
              <h3 className="font-semibold text-heritage-700">TEST_PLAN.md</h3>
              <p className="text-sm text-gray-600">
                Plan de test complet avec scénarios de la Collection Opale
              </p>
            </a>

            <a
              href="/TEST_EXECUTION_GUIDE.md"
              target="_blank"
              className="block border border-heritage-200 rounded-lg p-4 hover:bg-heritage-50 transition"
            >
              <h3 className="font-semibold text-heritage-700">TEST_EXECUTION_GUIDE.md</h3>
              <p className="text-sm text-gray-600">
                Guide d'exécution des tests avec exemples et troubleshooting
              </p>
            </a>

            <a
              href="/TEST_REPORT.md"
              target="_blank"
              className="block border border-heritage-200 rounded-lg p-4 hover:bg-heritage-50 transition"
            >
              <h3 className="font-semibold text-heritage-700">TEST_REPORT.md</h3>
              <p className="text-sm text-gray-600">
                Rapport de qualité des tests avec métriques (189/191 tests - 99%)
              </p>
            </a>
          </div>
        </div>

        {/* Architecture */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-heritage-900 mb-4">
            🏗️ Architecture Technique
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-heritage-700 mb-2">Stack Technologique</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-sm">Frontend</div>
                  <div className="text-xs text-gray-600 mt-1">Next.js 14, React 18, TypeScript, Tailwind CSS</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-sm">Backend</div>
                  <div className="text-xs text-gray-600 mt-1">Next.js API Routes, Drizzle ORM</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-sm">Database</div>
                  <div className="text-xs text-gray-600 mt-1">SQLite (libSQL)</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-sm">Auth</div>
                  <div className="text-xs text-gray-600 mt-1">NextAuth v5</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-sm">IA</div>
                  <div className="text-xs text-gray-600 mt-1">Claude API (Anthropic)</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-sm">Tests</div>
                  <div className="text-xs text-gray-600 mt-1">Vitest, 191 tests (99%)</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-heritage-700 mb-2">Structure du Projet</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
{`archivia/
├── apps/web/              # Application Next.js
│   ├── app/              # App Router (pages + API)
│   ├── components/       # Composants React
│   └── tests/            # Suite de tests
├── packages/
│   ├── database/         # Drizzle ORM + SQLite
│   └── shared-types/     # Types TypeScript partagés
├── TEST_PLAN.md          # Plan de test
├── TEST_EXECUTION_GUIDE.md
├── TEST_REPORT.md        # Rapport de qualité
└── install.sh            # Script d'installation`}
              </pre>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-r from-heritage-600 to-heritage-700 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            🎯 Besoin d'Aide ?
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <div className="font-semibold">Issues GitHub</div>
                <a
                  href="https://github.com/frederic-ramet/archivia/issues"
                  target="_blank"
                  className="text-heritage-100 hover:underline text-sm"
                >
                  github.com/frederic-ramet/archivia/issues
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <div className="font-semibold">Wizard de Configuration</div>
                <Link
                  href="/setup-wizard"
                  className="text-heritage-100 hover:underline text-sm"
                >
                  Accéder au wizard de configuration guidée
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <div className="font-semibold">Documentation Complète</div>
                <p className="text-sm text-heritage-100">
                  Consultez les fichiers README.md et TEST_*.md dans le dossier racine
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Archivia - Préserver le passé, enrichir le futur
          </p>
          <p className="text-xs mt-2">
            Version 0.1.0 | © {new Date().getFullYear()} Frédéric Ramet
          </p>
        </div>
      </div>
    </div>
  );
}
