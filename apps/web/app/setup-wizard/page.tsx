'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

interface StepStatus {
  database: boolean;
  anthropic: boolean;
  storage: boolean;
  admin: boolean;
}

export default function SetupWizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<StepStatus>({
    database: false,
    anthropic: false,
    storage: false,
    admin: false,
  });

  const steps = [
    {
      title: 'Configuration de la Base de Données',
      icon: '🗄️',
      key: 'database' as keyof StepStatus,
    },
    {
      title: 'Clé API Anthropic (Optionnel)',
      icon: '🤖',
      key: 'anthropic' as keyof StepStatus,
    },
    {
      title: 'Chemin de Stockage',
      icon: '💾',
      key: 'storage' as keyof StepStatus,
    },
    {
      title: 'Compte Administrateur',
      icon: '👤',
      key: 'admin' as keyof StepStatus,
    },
  ];

  const markComplete = (step: keyof StepStatus) => {
    setStatus({ ...status, [step]: true });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-50 to-heritage-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-heritage-900 mb-4">
            🔧 Wizard de Configuration Archivia
          </h1>
          <p className="text-lg text-gray-700">
            Configurez votre installation étape par étape
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/"
              className="text-heritage-600 hover:text-heritage-700 underline"
            >
              ← Retour à l'accueil
            </Link>
            <Link
              href="/help"
              className="text-heritage-600 hover:text-heritage-700 underline"
            >
              📚 Documentation
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                    index === currentStep
                      ? 'border-heritage-600 bg-heritage-100'
                      : status[step.key]
                      ? 'border-green-500 bg-green-100'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">{step.icon}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      status[step.key] ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-heritage-900">
              Étape {currentStep + 1} / {steps.length}
            </h2>
            <p className="text-gray-600">{steps[currentStep].title}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Step 0: Database */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-heritage-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">🗄️</span>
                Configuration de la Base de Données
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">Vérification Automatique</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    La base de données SQLite est configurée automatiquement lors de l'installation.
                  </p>
                  <p className="text-xs text-gray-600">
                    Emplacement par défaut: <code className="bg-white px-2 py-1 rounded">packages/database/data/archivia.db</code>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-heritage-700 mb-2">Configuration dans .env</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`# Fichier: apps/web/.env
DATABASE_URL="file:../../packages/database/data/archivia.db"`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold text-heritage-700 mb-2">Commandes de Vérification</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
                    <div>
                      <code className="text-blue-600">pnpm db:push</code> - Synchroniser le schéma
                    </div>
                    <div>
                      <code className="text-blue-600">pnpm db:generate</code> - Générer les migrations
                    </div>
                    <div>
                      <code className="text-blue-600">pnpm db:migrate</code> - Appliquer les migrations
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">✅ Données de Test</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Vous pouvez créer des données de test pour explorer l'application:
                  </p>
                  <div className="bg-white p-3 rounded font-mono text-sm">
                    <code className="text-green-600">pnpm db:seed</code> - Créer des données de test<br />
                    <code className="text-green-600">pnpm test:opale</code> - Créer projet Collection Opale
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">⚠️ Configuration Personnalisée</h3>
                  <p className="text-sm text-gray-700">
                    Si vous souhaitez utiliser un autre emplacement pour la base de données, modifiez la variable <code className="bg-white px-2 py-1 rounded">DATABASE_URL</code> dans <code className="bg-white px-2 py-1 rounded">apps/web/.env</code>
                  </p>
                </div>

                <button
                  onClick={() => {
                    markComplete('database');
                    nextStep();
                  }}
                  className="w-full bg-heritage-600 text-white py-3 rounded-lg hover:bg-heritage-700 transition font-semibold"
                >
                  ✓ Base de données configurée - Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Anthropic API */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-heritage-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">🤖</span>
                Clé API Anthropic (Optionnel)
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">Fonctionnalités IA</h3>
                  <p className="text-sm text-gray-700">
                    La clé API Anthropic est nécessaire pour activer les fonctionnalités d'intelligence artificielle:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                    <li>OCR automatique avec Claude Vision API</li>
                    <li>Extraction d'entités (personnes, lieux, événements)</li>
                    <li>Génération de récits narratifs</li>
                    <li>Construction de graphes de connaissances</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-heritage-700 mb-2">Comment obtenir une clé API?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>
                      Créez un compte sur{' '}
                      <a
                        href="https://console.anthropic.com"
                        target="_blank"
                        className="text-heritage-600 hover:underline"
                      >
                        console.anthropic.com
                      </a>
                    </li>
                    <li>Accédez à la section "API Keys"</li>
                    <li>Créez une nouvelle clé API</li>
                    <li>Copiez la clé (elle commence par "sk-ant-...")</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-heritage-700 mb-2">Configuration dans .env</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`# Fichier: apps/web/.env
ANTHROPIC_API_KEY="sk-ant-api03-..."  # Votre clé API ici`}
                  </pre>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">⚠️ Important - Sécurité</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Ne partagez jamais votre clé API publiquement</li>
                    <li>Le fichier .env est dans .gitignore (non versionné)</li>
                    <li>Utilisez des variables d'environnement en production</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">✅ Mode sans API</h3>
                  <p className="text-sm text-gray-700">
                    Vous pouvez utiliser Archivia sans clé API. Les fonctionnalités IA seront désactivées mais toutes les autres fonctionnalités resteront disponibles:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                    <li>Gestion de projets et documents</li>
                    <li>Upload et organisation de fichiers</li>
                    <li>Recherche et filtrage</li>
                    <li>Export HTML statique</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => {
                      markComplete('anthropic');
                      nextStep();
                    }}
                    className="flex-1 bg-heritage-600 text-white py-3 rounded-lg hover:bg-heritage-700 transition font-semibold"
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Storage */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-heritage-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">💾</span>
                Configuration du Stockage
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">Stockage des Fichiers</h3>
                  <p className="text-sm text-gray-700">
                    Archivia stocke les documents uploadés (images, manuscrits) dans un dossier dédié sur le serveur.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-heritage-700 mb-2">Configuration par défaut</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`# Fichier: apps/web/.env
UPLOAD_DIR="./uploads"  # Dossier relatif au projet
STORAGE_PATH="/var/archivia/data"  # Chemin absolu (production)`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold text-heritage-700 mb-2">Emplacement Recommandé</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="font-semibold text-sm mb-1">Développement</div>
                      <code className="text-xs bg-white px-2 py-1 rounded block">
                        apps/web/uploads/
                      </code>
                      <p className="text-xs text-gray-600 mt-1">
                        Créé automatiquement, dans .gitignore
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">Production</div>
                      <code className="text-xs bg-white px-2 py-1 rounded block">
                        /var/archivia/data/ ou /srv/archivia/uploads/
                      </code>
                      <p className="text-xs text-gray-600 mt-1">
                        Volume persistant, permissions appropriées
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">⚠️ Permissions Requises</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Assurez-vous que le serveur a les permissions d'écriture:
                  </p>
                  <pre className="bg-white p-3 rounded font-mono text-xs">
{`sudo mkdir -p /var/archivia/data
sudo chown -R $USER:$USER /var/archivia/data
chmod 755 /var/archivia/data`}
                  </pre>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">✅ Limites de Taille</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Vous pouvez configurer les limites de taille d'upload:
                  </p>
                  <pre className="bg-white p-3 rounded font-mono text-xs">
{`# apps/web/.env
MAX_FILE_SIZE=10485760  # 10MB par défaut
MAX_TOTAL_SIZE=104857600  # 100MB total par projet`}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => {
                      markComplete('storage');
                      nextStep();
                    }}
                    className="flex-1 bg-heritage-600 text-white py-3 rounded-lg hover:bg-heritage-700 transition font-semibold"
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Admin Account */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-heritage-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">👤</span>
                Compte Administrateur
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">Compte par Défaut</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Un compte administrateur est créé automatiquement lors de la première installation:
                  </p>
                  <div className="bg-white p-3 rounded">
                    <p className="font-mono text-sm">
                      Email: <strong className="text-heritage-600">admin@archivia.local</strong><br />
                      Mot de passe: <strong className="text-heritage-600">admin123</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2 text-red-700">🔒 IMPORTANT - Sécurité</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li className="font-bold">Changez ce mot de passe immédiatement après la première connexion!</li>
                    <li>Utilisez un mot de passe fort (12+ caractères, majuscules, chiffres, symboles)</li>
                    <li>Ne partagez jamais vos identifiants</li>
                    <li>Activez l'authentification à deux facteurs si disponible</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-heritage-700 mb-2">Première Connexion</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Démarrez le serveur: <code className="bg-gray-100 px-2 py-1 rounded">pnpm dev</code></li>
                    <li>Accédez à <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code></li>
                    <li>Connectez-vous avec les identifiants par défaut</li>
                    <li>Allez dans "Paramètres du compte"</li>
                    <li>Changez votre mot de passe</li>
                    <li>Mettez à jour votre profil (nom, email)</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold text-heritage-700 mb-2">Gestion des Utilisateurs</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    En tant qu'administrateur, vous pouvez:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Créer de nouveaux utilisateurs</li>
                    <li>Attribuer des rôles (Admin, Curator, Viewer)</li>
                    <li>Gérer les permissions par projet</li>
                    <li>Révoquer l'accès si nécessaire</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">✅ Configuration Terminée!</h3>
                  <p className="text-sm text-gray-700">
                    Vous avez terminé la configuration initiale d'Archivia. Vous pouvez maintenant:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                    <li>Démarrer le serveur de développement</li>
                    <li>Vous connecter avec le compte administrateur</li>
                    <li>Créer votre premier projet</li>
                    <li>Explorer la documentation</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => {
                      markComplete('admin');
                    }}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    ✓ Configuration Terminée
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completion Summary */}
        {Object.values(status).every((v) => v) && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">🎉</span>
              Configuration Terminée avec Succès!
            </h2>

            <div className="space-y-4">
              <p className="text-lg">
                Votre installation d'Archivia est maintenant prête à être utilisée.
              </p>

              <div className="bg-white/20 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Prochaines Étapes:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Démarrez le serveur: <code className="bg-white/20 px-2 py-1 rounded">pnpm dev</code></li>
                  <li>Accédez à l'application: <code className="bg-white/20 px-2 py-1 rounded">http://localhost:3000</code></li>
                  <li>Connectez-vous avec admin@archivia.local / admin123</li>
                  <li>Changez le mot de passe par défaut</li>
                  <li>Créez votre premier projet de patrimoine</li>
                </ol>
              </div>

              <div className="flex gap-4 mt-6">
                <Link
                  href="/"
                  className="flex-1 bg-white text-green-700 py-3 rounded-lg hover:bg-green-50 transition font-semibold text-center"
                >
                  🏠 Retour à l'accueil
                </Link>
                <Link
                  href="/help"
                  className="flex-1 bg-white/20 text-white py-3 rounded-lg hover:bg-white/30 transition font-semibold text-center"
                >
                  📚 Consulter la documentation
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-semibold text-heritage-700 mb-4">Ressources Utiles</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/help"
              className="border border-heritage-200 rounded-lg p-4 hover:bg-heritage-50 transition"
            >
              <h4 className="font-semibold text-heritage-700">📚 Documentation</h4>
              <p className="text-xs text-gray-600 mt-1">
                Guide complet d'utilisation
              </p>
            </a>
            <a
              href="/README.md"
              target="_blank"
              className="border border-heritage-200 rounded-lg p-4 hover:bg-heritage-50 transition"
            >
              <h4 className="font-semibold text-heritage-700">📖 README.md</h4>
              <p className="text-xs text-gray-600 mt-1">
                Documentation technique
              </p>
            </a>
            <a
              href="/TEST_EXECUTION_GUIDE.md"
              target="_blank"
              className="border border-heritage-200 rounded-lg p-4 hover:bg-heritage-50 transition"
            >
              <h4 className="font-semibold text-heritage-700">🧪 Guide de Tests</h4>
              <p className="text-xs text-gray-600 mt-1">
                Exécution des tests (191 tests)
              </p>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Besoin d'aide? Consultez la{' '}
            <Link href="/help" className="text-heritage-600 hover:underline">
              documentation
            </Link>{' '}
            ou ouvrez une{' '}
            <a
              href="https://github.com/frederic-ramet/archivia/issues"
              target="_blank"
              className="text-heritage-600 hover:underline"
            >
              issue sur GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
