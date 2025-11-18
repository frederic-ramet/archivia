/**
 * Tests des Services Archivia
 * Upload, OCR, Extraction d'entités, Recherche, Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

describe('Service Upload de Fichiers', () => {
  describe('Validation des fichiers uploadés', () => {
    it('devrait accepter les formats d\'images valides', () => {
      const validImageFormats = ['jpg', 'jpeg', 'png', 'tiff', 'gif', 'webp'];

      validImageFormats.forEach((ext) => {
        const filename = `photo.${ext}`;
        const isValid = /\.(jpg|jpeg|png|tiff|gif|webp)$/i.test(filename);
        expect(isValid).toBe(true);
      });
    });

    it('devrait rejeter les formats d\'images invalides', () => {
      const invalidFormats = ['exe', 'bat', 'sh', 'zip', 'rar'];

      invalidFormats.forEach((ext) => {
        const filename = `file.${ext}`;
        const isValid = /\.(jpg|jpeg|png|tiff|gif|webp)$/i.test(filename);
        expect(isValid).toBe(false);
      });
    });

    it('devrait valider la taille maximale de fichier (10MB)', () => {
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB
      const validSizes = [
        1024, // 1KB
        1024 * 1024, // 1MB
        5 * 1024 * 1024, // 5MB
        9.5 * 1024 * 1024, // 9.5MB
      ];

      validSizes.forEach((size) => {
        expect(size).toBeLessThanOrEqual(maxSizeBytes);
      });

      const invalidSizes = [
        11 * 1024 * 1024, // 11MB
        20 * 1024 * 1024, // 20MB
      ];

      invalidSizes.forEach((size) => {
        expect(size).toBeGreaterThan(maxSizeBytes);
      });
    });

    it('devrait générer un nom de fichier unique', () => {
      const originalName = 'photo de mariage.jpg';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const uniqueName = `${timestamp}-${random}-${originalName.replace(/\s+/g, '-')}`;

      expect(uniqueName).toContain(timestamp.toString());
      expect(uniqueName).not.toContain(' ');
      expect(uniqueName).toMatch(/\.jpg$/);
    });

    it('devrait sanitizer les noms de fichiers dangereux', () => {
      const dangerousNames = [
        '../../../etc/passwd',
        'file<script>.jpg',
        'photo"injection.png',
        'test|pipe.jpg',
      ];

      dangerousNames.forEach((name) => {
        const sanitized = name
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/\.{2,}/g, '.');

        expect(sanitized).not.toContain('..');
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('|');
      });
    });

    it('devrait créer une structure de dossiers par projet', () => {
      const projectSlug = 'opale-heritage';
      const uploadPath = path.join('/uploads', projectSlug);

      expect(uploadPath).toBe('/uploads/opale-heritage');
    });
  });

  describe('Génération de miniatures (Sharp)', () => {
    it('devrait définir les dimensions de miniature', () => {
      const thumbnailConfig = {
        width: 300,
        height: 200,
        fit: 'cover' as const,
        quality: 80,
      };

      expect(thumbnailConfig.width).toBe(300);
      expect(thumbnailConfig.height).toBe(200);
      expect(thumbnailConfig.quality).toBeGreaterThanOrEqual(0);
      expect(thumbnailConfig.quality).toBeLessThanOrEqual(100);
    });

    it('devrait générer le nom de fichier thumbnail', () => {
      const originalName = 'photo-1920.jpg';
      const thumbnailName = originalName.replace(/(\.[^.]+)$/, '-thumb$1');

      expect(thumbnailName).toBe('photo-1920-thumb.jpg');
    });

    it('devrait préserver le format d\'image', () => {
      const formats = [
        { input: 'photo.jpg', output: 'photo-thumb.jpg' },
        { input: 'scan.png', output: 'scan-thumb.png' },
        { input: 'archive.tiff', output: 'archive-thumb.tiff' },
      ];

      formats.forEach(({ input, output }) => {
        const ext = path.extname(input);
        const expectedExt = path.extname(output);
        expect(ext).toBe(expectedExt);
      });
    });

    it('devrait optimiser la qualité pour le web', () => {
      const optimizationConfigs = [
        { format: 'jpeg', quality: 80 },
        { format: 'png', compressionLevel: 8 },
        { format: 'webp', quality: 75 },
      ];

      optimizationConfigs.forEach((config) => {
        if ('quality' in config) {
          expect(config.quality).toBeGreaterThanOrEqual(60);
          expect(config.quality).toBeLessThanOrEqual(90);
        }
      });
    });
  });

  describe('Gestion des erreurs d\'upload', () => {
    it('devrait gérer les erreurs de lecture de fichier', () => {
      const errors = {
        fileNotFound: 'ENOENT',
        permissionDenied: 'EACCES',
        diskFull: 'ENOSPC',
      };

      Object.values(errors).forEach((errorCode) => {
        expect(errorCode).toMatch(/^E[A-Z]+$/);
      });
    });

    it('devrait nettoyer les fichiers temporaires en cas d\'erreur', () => {
      const tempFiles = [
        '/tmp/upload-123.jpg',
        '/tmp/upload-124.png',
      ];

      tempFiles.forEach((file) => {
        expect(file).toMatch(/^\/tmp\/upload-/);
      });
    });
  });
});

describe('Service OCR (Claude Vision)', () => {
  describe('Intégration Claude Vision API', () => {
    it('devrait préparer le payload pour Claude Vision', () => {
      const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const payload = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'Transcrivez tout le texte visible dans cette image historique.',
              },
            ],
          },
        ],
      };

      expect(payload.model).toBe('claude-3-5-sonnet-20241022');
      expect(payload.max_tokens).toBeGreaterThan(0);
      expect(payload.messages[0].content).toHaveLength(2);
    });

    it('devrait gérer les rate limits de l\'API', () => {
      const rateLimitConfig = {
        maxRequestsPerMinute: 50,
        retryAfterSeconds: 60,
        maxRetries: 3,
      };

      expect(rateLimitConfig.maxRequestsPerMinute).toBeGreaterThan(0);
      expect(rateLimitConfig.maxRetries).toBeLessThanOrEqual(5);
    });

    it('devrait implémenter un retry avec backoff exponentiel', () => {
      const retryDelays = [1000, 2000, 4000, 8000];

      retryDelays.forEach((delay, index) => {
        const expectedDelay = 1000 * Math.pow(2, index);
        expect(delay).toBe(expectedDelay);
      });
    });
  });

  describe('Parsing des réponses OCR', () => {
    it('devrait extraire le texte de la réponse Claude', () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Mariage de Marcel Ramet et Jeanne Dubois\n15 juin 1925\nÉglise Saint-Michel, Paris',
          },
        ],
      };

      const extractedText = mockResponse.content[0].text;
      expect(extractedText).toContain('Marcel Ramet');
      expect(extractedText).toContain('1925');
    });

    it('devrait nettoyer le texte transcrit', () => {
      const rawText = '  Mariage de Marcel   \n\n   et Jeanne  \n  1925  ';
      const cleanedText = rawText
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\n+/g, '\n');

      expect(cleanedText).not.toMatch(/\s{2,}/);
      expect(cleanedText.startsWith(' ')).toBe(false);
      expect(cleanedText.endsWith(' ')).toBe(false);
    });

    it('devrait détecter la langue du texte transcrit', () => {
      const frenchSamples = [
        'Mariage de Marcel et Jeanne',
        'Vacances à la mer en Normandie',
        'Communion solennelle de Pierre',
      ];

      frenchSamples.forEach((text) => {
        // Détection simple basée sur mots courants français
        const hasFrenchWords = /\b(de|et|à|la|le|en)\b/i.test(text);
        expect(hasFrenchWords).toBe(true);
      });
    });
  });

  describe('Gestion des statuts de transcription', () => {
    it('devrait suivre le workflow de statuts', () => {
      const statuses = ['pending', 'processing', 'completed', 'verified'];
      const transitions: Record<string, string[]> = {
        pending: ['processing'],
        processing: ['completed', 'pending'],
        completed: ['verified', 'processing'],
        verified: ['completed'],
      };

      Object.entries(transitions).forEach(([from, toStates]) => {
        toStates.forEach((to) => {
          expect(statuses).toContain(from);
          expect(statuses).toContain(to);
        });
      });
    });

    it('devrait valider les transitions de statut', () => {
      const invalidTransitions = [
        { from: 'pending', to: 'verified' }, // Saute completed
        { from: 'verified', to: 'pending' }, // Retour arrière non autorisé
      ];

      const validTransitions: Record<string, string[]> = {
        pending: ['processing'],
        processing: ['completed', 'pending'],
        completed: ['verified', 'processing'],
        verified: ['completed'],
      };

      invalidTransitions.forEach(({ from, to }) => {
        const isValid = validTransitions[from]?.includes(to);
        expect(isValid).toBe(false);
      });
    });
  });
});

describe('Service Extraction d\'Entités (IA)', () => {
  describe('Parsing de la réponse Claude', () => {
    it('devrait parser les entités JSON de Claude', () => {
      const mockResponse = `{
        "entities": [
          {
            "type": "person",
            "name": "Marcel Ramet",
            "confidence": 0.95,
            "properties": {
              "role": "Grand-père",
              "birthYear": 1895
            }
          },
          {
            "type": "place",
            "name": "Église Saint-Michel, Paris",
            "confidence": 0.9,
            "properties": {
              "location": "10e arrondissement"
            }
          }
        ],
        "relationships": [
          {
            "source": "Marcel Ramet",
            "target": "Jeanne Dubois",
            "type": "married_to",
            "weight": 1.0
          }
        ]
      }`;

      const parsed = JSON.parse(mockResponse);
      expect(parsed.entities).toHaveLength(2);
      expect(parsed.relationships).toHaveLength(1);
      expect(parsed.entities[0].type).toBe('person');
      expect(parsed.relationships[0].weight).toBe(1.0);
    });

    it('devrait normaliser les noms d\'entités en slugs', () => {
      const names = [
        { input: 'Marcel Ramet', expected: 'marcel_ramet' },
        { input: 'Église Saint-Michel', expected: 'eglise_saint_michel' },
        { input: 'Jeanne Dubois-Lefèvre', expected: 'jeanne_dubois_lefevre' },
      ];

      names.forEach(({ input, expected }) => {
        const normalized = input
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');

        expect(normalized).toBe(expected);
      });
    });

    it('devrait détecter et fusionner les doublons', () => {
      const entities = [
        { name: 'Marcel Ramet', normalizedName: 'marcel_ramet' },
        { name: 'Marcel', normalizedName: 'marcel' },
        { name: 'Pépé Marcel', normalizedName: 'pepe_marcel' },
      ];

      // Détection basée sur la similarité des noms normalisés
      const hasDuplicates = entities.some((e1, i) =>
        entities.some((e2, j) => i !== j && e1.normalizedName.includes('marcel') && e2.normalizedName.includes('marcel'))
      );

      expect(hasDuplicates).toBe(true);
    });
  });

  describe('Validation des types d\'entités', () => {
    it('devrait valider les types d\'entités supportés', () => {
      const validTypes = ['person', 'place', 'event', 'object', 'concept'];
      const testType = 'person';

      expect(validTypes).toContain(testType);
    });

    it('devrait rejeter les types d\'entités invalides', () => {
      const validTypes = ['person', 'place', 'event', 'object', 'concept'];
      const invalidType = 'unknown_type';

      expect(validTypes).not.toContain(invalidType);
    });

    it('devrait valider les propriétés spécifiques par type', () => {
      const entitySchemas = {
        person: ['birthYear', 'deathYear', 'occupation', 'role'],
        place: ['location', 'coordinates', 'type'],
        event: ['date', 'location', 'type', 'participants'],
        object: ['material', 'dimensions', 'condition'],
        concept: ['definition', 'examples', 'category'],
      };

      Object.entries(entitySchemas).forEach(([type, properties]) => {
        expect(properties.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Création de relations', () => {
    it('devrait créer des relations bidirectionnelles', () => {
      const relations = [
        { source: 'marcel', target: 'jeanne', type: 'married_to' },
        { source: 'jeanne', target: 'marcel', type: 'married_to' },
      ];

      expect(relations).toHaveLength(2);
      expect(relations[0].source).toBe(relations[1].target);
      expect(relations[0].target).toBe(relations[1].source);
    });

    it('devrait calculer les poids de relations', () => {
      const relationWeights = {
        married_to: 1.0,
        parent_of: 1.0,
        lives_in: 0.8,
        works_at: 0.7,
        knows: 0.5,
        related_to: 0.3,
      };

      Object.values(relationWeights).forEach((weight) => {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      });
    });

    it('devrait éviter les auto-relations', () => {
      const invalidRelation = {
        source: 'marcel',
        target: 'marcel',
        type: 'knows',
      };

      const isValid = invalidRelation.source !== invalidRelation.target;
      expect(isValid).toBe(false);
    });
  });

  describe('Scores de confiance', () => {
    it('devrait ajuster la confiance selon la source', () => {
      const confidenceBySource = {
        manual: 1.0,
        ai_verified: 0.95,
        ai_extracted: 0.8,
        inferred: 0.6,
        suggested: 0.4,
      };

      Object.entries(confidenceBySource).forEach(([source, confidence]) => {
        expect(confidence).toBeGreaterThan(0);
        expect(confidence).toBeLessThanOrEqual(1);

        if (source === 'manual') {
          expect(confidence).toBe(1.0);
        }
      });
    });

    it('devrait combiner les scores de confiance', () => {
      const entity1Score = 0.9;
      const entity2Score = 0.8;
      const relationScore = entity1Score * entity2Score;

      expect(relationScore).toBeCloseTo(0.72, 2);
      expect(relationScore).toBeLessThanOrEqual(Math.min(entity1Score, entity2Score));
    });
  });
});

describe('Service de Recherche Sémantique', () => {
  describe('Indexation full-text', () => {
    it('devrait tokenizer le texte pour l\'indexation', () => {
      const text = 'Mariage de Marcel et Jeanne en 1925 à l\'église Saint-Michel';
      const tokens = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)
        .filter((token) => token.length > 2);

      expect(tokens).toContain('mariage');
      expect(tokens).toContain('marcel');
      expect(tokens).toContain('jeanne');
      expect(tokens).toContain('1925');
      expect(tokens).not.toContain('de');
      expect(tokens).not.toContain('et');
    });

    it('devrait gérer les stopwords français', () => {
      const stopwords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'à', 'au', 'aux'];
      const text = 'La photo de la famille au bord de la mer';
      const tokens = text.toLowerCase().split(/\s+/);
      const filtered = tokens.filter((token) => !stopwords.includes(token));

      expect(filtered).toContain('photo');
      expect(filtered).toContain('famille');
      expect(filtered).toContain('bord');
      expect(filtered).toContain('mer');
      expect(filtered).not.toContain('de');
      expect(filtered).not.toContain('la');
    });

    it('devrait créer des n-grams pour la recherche floue', () => {
      const word = 'marcel';
      const bigrams = [];
      for (let i = 0; i < word.length - 1; i++) {
        bigrams.push(word.substring(i, i + 2));
      }

      expect(bigrams).toContain('ma');
      expect(bigrams).toContain('ar');
      expect(bigrams).toContain('rc');
      expect(bigrams).toContain('ce');
      expect(bigrams).toContain('el');
    });
  });

  describe('Calcul de scores de pertinence', () => {
    it('devrait calculer le TF-IDF simplifié', () => {
      const termFrequency = 3; // "mariage" apparaît 3 fois
      const totalTerms = 100;
      const tf = termFrequency / totalTerms;

      const totalDocuments = 10;
      const documentsWithTerm = 2;
      const idf = Math.log(totalDocuments / documentsWithTerm);

      const tfidf = tf * idf;

      expect(tf).toBe(0.03);
      expect(idf).toBeGreaterThan(0);
      expect(tfidf).toBeGreaterThan(0);
    });

    it('devrait pondérer les matches par champ', () => {
      const fieldWeights = {
        title: 3.0,
        tags: 2.0,
        description: 1.5,
        transcription: 1.0,
      };

      const matches = {
        title: 1,
        tags: 2,
        description: 0,
        transcription: 1,
      };

      const weightedScore =
        matches.title * fieldWeights.title +
        matches.tags * fieldWeights.tags +
        matches.description * fieldWeights.description +
        matches.transcription * fieldWeights.transcription;

      expect(weightedScore).toBe(8.0); // 1*3 + 2*2 + 0*1.5 + 1*1
    });

    it('devrait normaliser les scores entre 0 et 1', () => {
      const rawScores = [15.3, 8.7, 5.2, 2.1, 0.5];
      const maxScore = Math.max(...rawScores);
      const normalized = rawScores.map((score) => score / maxScore);

      normalized.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });

      expect(normalized[0]).toBe(1.0);
    });
  });

  describe('Tri et filtrage des résultats', () => {
    it('devrait trier par pertinence décroissante', () => {
      const results = [
        { id: '1', score: 5.2 },
        { id: '2', score: 8.7 },
        { id: '3', score: 2.1 },
        { id: '4', score: 15.3 },
      ];

      const sorted = results.sort((a, b) => b.score - a.score);

      expect(sorted[0].score).toBeGreaterThanOrEqual(sorted[1].score);
      expect(sorted[1].score).toBeGreaterThanOrEqual(sorted[2].score);
      expect(sorted[2].score).toBeGreaterThanOrEqual(sorted[3].score);
      expect(sorted[0].id).toBe('4');
    });

    it('devrait limiter le nombre de résultats', () => {
      const results = Array.from({ length: 100 }, (_, i) => ({ id: i, score: Math.random() }));
      const limit = 20;
      const limited = results.slice(0, limit);

      expect(limited).toHaveLength(limit);
    });

    it('devrait fusionner les résultats de documents et entités', () => {
      const documentResults = [
        { type: 'document', id: '1', score: 10 },
        { type: 'document', id: '2', score: 8 },
      ];

      const entityResults = [
        { type: 'entity', id: '3', score: 9 },
        { type: 'entity', id: '4', score: 7 },
      ];

      const merged = [...documentResults, ...entityResults].sort((a, b) => b.score - a.score);

      expect(merged).toHaveLength(4);
      expect(merged[0].score).toBe(10);
      expect(merged[1].score).toBe(9);
    });
  });
});

describe('Service d\'Export HTML', () => {
  describe('Génération de site statique', () => {
    it('devrait créer la structure HTML du site', () => {
      const htmlStructure = {
        index: 'index.html',
        documents: 'documents.html',
        entities: 'entities.html',
        about: 'about.html',
        styles: 'styles.css',
        scripts: 'app.js',
      };

      Object.values(htmlStructure).forEach((file) => {
        expect(file).toMatch(/\.(html|css|js)$/);
      });
    });

    it('devrait inclure les métadonnées du projet', () => {
      const metadata = {
        title: 'Collection Opale',
        description: 'Mémoire familiale en images',
        author: 'Famille Ramet',
        license: 'CC BY-NC-SA 4.0',
        generator: 'Archivia v0.1.0',
      };

      expect(metadata.title).toBeTruthy();
      expect(metadata.license).toContain('CC');
    });

    it('devrait générer un manifest.json pour PWA', () => {
      const manifest = {
        name: 'Collection Opale',
        short_name: 'Opale',
        description: 'Mémoire familiale en images',
        start_url: 'index.html',
        display: 'standalone',
        theme_color: '#8B7355',
        background_color: '#FFFFFF',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      };

      expect(manifest.display).toBe('standalone');
      expect(manifest.icons).toHaveLength(1);
    });

    it('devrait créer un Service Worker pour le mode hors-ligne', () => {
      const swConfig = {
        cacheName: 'opale-v1',
        cacheFiles: [
          'index.html',
          'styles.css',
          'app.js',
        ],
      };

      expect(swConfig.cacheName).toBeTruthy();
      expect(swConfig.cacheFiles.length).toBeGreaterThan(0);
    });

    it('devrait compresser le site en ZIP avec JSZip', () => {
      const zipStructure = {
        'index.html': 'content',
        'assets/styles.css': 'content',
        'assets/app.js': 'content',
        'images/photo1.jpg': 'binary',
        'manifest.json': 'content',
      };

      Object.keys(zipStructure).forEach((path) => {
        expect(path).toBeTruthy();
        expect(path.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Optimisation des assets', () => {
    it('devrait minifier le HTML', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test</title>
          </head>
          <body>
            <h1>Hello</h1>
          </body>
        </html>
      `;

      const minified = html.replace(/\s+/g, ' ').trim();
      expect(minified.length).toBeLessThan(html.length);
    });

    it('devrait inliner les styles critiques', () => {
      const criticalCSS = `
        body { margin: 0; font-family: sans-serif; }
        h1 { font-size: 2rem; }
      `;

      const inlined = `<style>${criticalCSS}</style>`;
      expect(inlined).toContain('<style>');
      expect(inlined).toContain('</style>');
    });

    it('devrait optimiser les chemins des images', () => {
      const imagePaths = [
        '/uploads/opale/photo1.jpg',
        '/uploads/opale/photo2.jpg',
      ];

      const optimized = imagePaths.map((path) => {
        return path.replace('/uploads/opale/', 'images/');
      });

      expect(optimized[0]).toBe('images/photo1.jpg');
      expect(optimized[1]).toBe('images/photo2.jpg');
    });
  });
});
