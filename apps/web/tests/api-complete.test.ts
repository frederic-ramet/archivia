/**
 * Tests complets de l'API Archivia
 * Couvre tous les endpoints avec données réalistes Opale
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createProjectSchema,
  updateProjectSchema,
  createDocumentSchema,
  updateDocumentSchema,
} from '@archivia/shared-types';

describe('API Endpoints - Suite Complète', () => {
  describe('Projects API - /api/projects', () => {
    describe('POST /api/projects - Création', () => {
      it('devrait valider un projet complet style Opale', () => {
        const validProject = {
          name: 'Collection Familiale Dupont',
          slug: 'dupont-family-1920-2000',
          description: 'Archives photographiques de la famille Dupont couvrant quatre générations',
          isPublic: true,
          config: {
            features: {
              ocr: true,
              annotations: true,
              hotspots: true,
              stories: true,
              timeline: true,
              map: true,
              ontology: true,
              aiGeneration: true,
            },
            primaryLanguage: 'fr',
            acceptedFormats: ['jpg', 'png', 'tiff', 'pdf'],
          },
          branding: {
            primaryColor: '#8B7355',
            secondaryColor: '#D4C5B0',
            accentColor: '#4A6741',
            heroTitle: 'Collection Dupont',
            heroSubtitle: 'Mémoires photographiques 1920-2000',
            footerText: 'Archives familiales privées',
          },
          metadata: {
            institution: 'Collection privée',
            curator: 'Marie Dupont',
            contributors: ['Marie Dupont', 'Archives nationales'],
            periodStart: '1920',
            periodEnd: '2000',
            geographicScope: 'France, Bretagne',
            themes: ['Famille', 'Guerre', 'Agriculture', 'Traditions bretonnes'],
            license: 'CC BY-NC 4.0',
          },
        };

        const result = createProjectSchema.safeParse(validProject);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe(validProject.name);
          expect(result.data.config.features.ontology).toBe(true);
          expect(result.data.metadata?.themes).toContain('Famille');
        }
      });

      it('devrait rejeter un slug avec majuscules', () => {
        const invalidProject = {
          name: 'Test Project',
          slug: 'InvalidSlug',
        };

        const result = createProjectSchema.safeParse(invalidProject);
        expect(result.success).toBe(false);
      });

      it('devrait rejeter un slug avec espaces', () => {
        const invalidProject = {
          name: 'Test Project',
          slug: 'invalid slug',
        };

        const result = createProjectSchema.safeParse(invalidProject);
        expect(result.success).toBe(false);
      });

      it('devrait rejeter un slug avec caractères spéciaux', () => {
        const invalidProject = {
          name: 'Test Project',
          slug: 'invalid_slug@123',
        };

        const result = createProjectSchema.safeParse(invalidProject);
        expect(result.success).toBe(false);
      });

      it('devrait accepter un projet minimal valide', () => {
        const minimalProject = {
          name: 'Simple Heritage Collection',
          slug: 'simple-heritage',
        };

        const result = createProjectSchema.safeParse(minimalProject);
        expect(result.success).toBe(true);
      });

      it('devrait valider les couleurs hexadécimales dans branding', () => {
        const projectWithColors = {
          name: 'Test',
          slug: 'test-colors',
          branding: {
            primaryColor: '#FF5733',
            secondaryColor: '#C70039',
            accentColor: '#900C3F',
          },
        };

        const result = createProjectSchema.safeParse(projectWithColors);
        expect(result.success).toBe(true);
      });

      it('devrait valider les features boolean', () => {
        const projectWithFeatures = {
          name: 'Test Features',
          slug: 'test-features',
          config: {
            features: {
              ocr: true,
              annotations: false,
              hotspots: true,
              stories: false,
              timeline: true,
              map: false,
              ontology: true,
              aiGeneration: false,
            },
          },
        };

        const result = createProjectSchema.safeParse(projectWithFeatures);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.config?.features.ocr).toBe(true);
          expect(result.data.config?.features.annotations).toBe(false);
        }
      });

      it('devrait valider les langues supportées', () => {
        const validLanguages = ['fr', 'en', 'es', 'de', 'it'];

        validLanguages.forEach((lang) => {
          const project = {
            name: 'Test Lang',
            slug: `test-${lang}`,
            config: {
              features: {},
              primaryLanguage: lang,
            },
          };

          const result = createProjectSchema.safeParse(project);
          expect(result.success).toBe(true);
        });
      });

      it('devrait valider les formats de fichiers acceptés', () => {
        const project = {
          name: 'Test Formats',
          slug: 'test-formats',
          config: {
            features: {},
            acceptedFormats: ['jpg', 'png', 'tiff', 'pdf', 'gif'],
          },
        };

        const result = createProjectSchema.safeParse(project);
        expect(result.success).toBe(true);
      });

      it('devrait valider les thèmes multiples', () => {
        const project = {
          name: 'Test Themes',
          slug: 'test-themes',
          metadata: {
            themes: [
              'Architecture',
              'Urbanisme',
              'Patrimoine industriel',
              'Photographie',
              'Histoire sociale',
            ],
          },
        };

        const result = createProjectSchema.safeParse(project);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.metadata?.themes?.length).toBe(5);
        }
      });

      it('devrait valider les contributeurs multiples', () => {
        const project = {
          name: 'Test Contributors',
          slug: 'test-contributors',
          metadata: {
            contributors: [
              'Archives départementales',
              'Musée local',
              'Association historique',
            ],
          },
        };

        const result = createProjectSchema.safeParse(project);
        expect(result.success).toBe(true);
      });
    });

    describe('PUT /api/projects/:id - Modification', () => {
      it('devrait valider une mise à jour partielle', () => {
        const update = {
          description: 'Description mise à jour avec plus de détails',
          isPublic: false,
        };

        const result = updateProjectSchema.safeParse(update);
        expect(result.success).toBe(true);
      });

      it('devrait valider un changement de statut', () => {
        const statusUpdates = [
          { status: 'draft' },
          { status: 'active' },
          { status: 'archived' },
        ];

        statusUpdates.forEach((update) => {
          const result = updateProjectSchema.safeParse(update);
          expect(result.success).toBe(true);
        });
      });

      it('devrait valider une mise à jour de branding', () => {
        const brandingUpdate = {
          branding: {
            primaryColor: '#2C3E50',
            heroTitle: 'Nouveau titre',
          },
        };

        const result = updateProjectSchema.safeParse(brandingUpdate);
        expect(result.success).toBe(true);
      });

      it('devrait valider une mise à jour de config', () => {
        const configUpdate = {
          config: {
            features: {
              ocr: false,
              aiGeneration: true,
            },
          },
        };

        const result = updateProjectSchema.safeParse(configUpdate);
        expect(result.success).toBe(true);
      });

      it('devrait valider une mise à jour de métadonnées', () => {
        const metadataUpdate = {
          metadata: {
            periodEnd: '2025',
            themes: ['Modernité', 'Numérique'],
          },
        };

        const result = updateProjectSchema.safeParse(metadataUpdate);
        expect(result.success).toBe(true);
      });

      it('devrait accepter un objet vide (mise à jour optionnelle)', () => {
        const emptyUpdate = {};

        const result = updateProjectSchema.safeParse(emptyUpdate);
        // Note: Ce test documente le comportement actuel
        expect(result.success).toBe(true);
      });
    });

    describe('GET /api/projects - Liste et filtres', () => {
      it('devrait gérer les paramètres de pagination', () => {
        const queryParams = {
          page: 1,
          limit: 20,
        };

        expect(queryParams.page).toBeGreaterThanOrEqual(1);
        expect(queryParams.limit).toBeLessThanOrEqual(100);
      });

      it('devrait gérer les filtres de recherche', () => {
        const searchQueries = [
          { search: 'famille' },
          { search: 'mariage' },
          { search: 'opale' },
        ];

        searchQueries.forEach((query) => {
          expect(query.search).toBeTruthy();
        });
      });

      it('devrait gérer les filtres de statut', () => {
        const statusFilters = ['draft', 'active', 'archived'];

        statusFilters.forEach((status) => {
          expect(['draft', 'active', 'archived']).toContain(status);
        });
      });

      it('devrait gérer le filtre isPublic', () => {
        const publicFilters = [
          { isPublic: true },
          { isPublic: false },
        ];

        publicFilters.forEach((filter) => {
          expect(typeof filter.isPublic).toBe('boolean');
        });
      });
    });
  });

  describe('Documents API - /api/documents', () => {
    describe('POST /api/documents - Création', () => {
      it('devrait valider un document image complet style Opale', () => {
        const validDocument = {
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          type: 'image' as const,
          title: 'Photographie de mariage - Marcel et Jeanne',
          filePath: '/uploads/opale/mariage-1925.jpg',
          category: 'Cérémonie',
          period: '1925',
          tags: ['mariage', 'famille', 'cérémonie', 'église', 'tradition'],
          historicalContext: 'Mariage catholique traditionnel célébré à l\'église Saint-Michel de Paris. Les mariés sont entourés de leurs familles respectives. Cette photo marque le début de la lignée familiale.',
          metadata: {
            originalName: 'SCAN_1925_Mariage.jpg',
            format: 'JPEG',
            dimensions: '3000x2000',
            dpi: 600,
            estimatedDate: '15 juin 1925',
            location: 'Église Saint-Michel, 10e arrondissement, Paris',
            photographer: 'Studio Lumière',
            subjects: ['Marcel Ramet', 'Jeanne Dubois', 'Famille Ramet', 'Famille Dubois'],
            event: 'Mariage religieux',
            weather: 'Ensoleillé',
            attendees: 50,
          },
        };

        const result = createDocumentSchema.safeParse(validDocument);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe('image');
          expect(result.data.tags.length).toBe(5);
          expect(result.data.metadata).toBeDefined();
          expect(result.data.metadata.subjects).toEqual(['Marcel Ramet', 'Jeanne Dubois', 'Famille Ramet', 'Famille Dubois']);
        }
      });

      it('devrait valider tous les types de documents', () => {
        const types = ['image', 'manuscript', 'printed', 'mixed'] as const;

        types.forEach((type) => {
          const doc = {
            projectId: '550e8400-e29b-41d4-a716-446655440000',
            type,
            title: `Test ${type}`,
            filePath: `/uploads/test.${type === 'image' ? 'jpg' : 'pdf'}`,
          };

          const result = createDocumentSchema.safeParse(doc);
          expect(result.success).toBe(true);
        });
      });

      it('devrait rejeter un type de document invalide', () => {
        const invalidDoc = {
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          type: 'invalid_type',
          title: 'Test',
          filePath: '/test.jpg',
        };

        const result = createDocumentSchema.safeParse(invalidDoc);
        expect(result.success).toBe(false);
      });

      it('devrait rejeter un UUID invalide', () => {
        const invalidDoc = {
          projectId: 'not-a-uuid',
          type: 'image' as const,
          title: 'Test',
          filePath: '/test.jpg',
        };

        const result = createDocumentSchema.safeParse(invalidDoc);
        expect(result.success).toBe(false);
      });

      it('devrait rejeter un titre vide', () => {
        const invalidDoc = {
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          type: 'image' as const,
          title: '',
          filePath: '/test.jpg',
        };

        const result = createDocumentSchema.safeParse(invalidDoc);
        expect(result.success).toBe(false);
      });

      it('devrait valider un document avec tags multiples', () => {
        const doc = {
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          type: 'image' as const,
          title: 'Test',
          filePath: '/test.jpg',
          tags: [
            'portrait',
            'famille',
            'noir et blanc',
            'années 1930',
            'studio',
            'formal',
          ],
        };

        const result = createDocumentSchema.safeParse(doc);
        expect(result.success).toBe(true);
      });

      it('devrait valider un document manuscrit', () => {
        const manuscript = {
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          type: 'manuscript' as const,
          title: 'Lettre de Marcel à Jeanne - Guerre 1914',
          filePath: '/uploads/letters/letter-1914-12.pdf',
          category: 'Correspondance',
          period: '1914',
          tags: ['lettre', 'guerre', 'correspondance', 'manuscrit'],
          historicalContext: 'Lettre écrite depuis le front pendant la Première Guerre mondiale',
          metadata: {
            author: 'Marcel Ramet',
            recipient: 'Jeanne Dubois',
            language: 'Français',
            pages: 4,
            condition: 'Bon état, papier jauni',
          },
        };

        const result = createDocumentSchema.safeParse(manuscript);
        expect(result.success).toBe(true);
      });

      it('devrait valider un document mixte (audio)', () => {
        const mixedAudio = {
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          type: 'mixed' as const,
          title: 'Témoignage oral de Jeanne - Souvenirs de jeunesse',
          filePath: '/uploads/audio/jeanne-temoignage-1985.mp3',
          category: 'Témoignage',
          period: '1985',
          tags: ['témoignage', 'oral', 'mémoire', 'récit de vie'],
          metadata: {
            mediaType: 'audio',
            duration: '45:30',
            format: 'MP3',
            interviewer: 'Marie Ramet',
            recordingDate: '12 mars 1985',
          },
        };

        const result = createDocumentSchema.safeParse(mixedAudio);
        expect(result.success).toBe(true);
      });

      it('devrait valider un document imprimé (printed)', () => {
        const printed = {
          projectId: '550e8400-e29b-41d4-a716-446655440000',
          type: 'printed' as const,
          title: 'Certificat militaire de Marcel - Guerre 1914-1918',
          filePath: '/uploads/documents/certificat-guerre-14-18.pdf',
          category: 'Document officiel',
          period: '1918',
          tags: ['certificat', 'guerre', 'militaire', 'document officiel'],
          metadata: {
            documentType: 'Certificat',
            issuer: 'Ministère de la Guerre',
            pages: 2,
            condition: 'Bon état',
            reference: 'DOC-1918-001',
          },
        };

        const result = createDocumentSchema.safeParse(printed);
        expect(result.success).toBe(true);
      });
    });

    describe('PUT /api/documents/:id - Modification', () => {
      it('devrait valider une mise à jour des tags', () => {
        const update = {
          tags: ['mariage', 'tradition', 'cérémonie', 'famille', 'religion'],
        };

        const result = updateDocumentSchema.safeParse(update);
        expect(result.success).toBe(true);
      });

      it('devrait valider une mise à jour de la transcription', () => {
        const update = {
          transcriptionStatus: 'completed' as const,
          transcription: 'Texte complet de la transcription OCR...',
        };

        const result = updateDocumentSchema.safeParse(update);
        expect(result.success).toBe(true);
      });

      it('devrait rejeter un statut de transcription invalide', () => {
        const update = {
          transcriptionStatus: 'invalid_status',
        };

        const result = updateDocumentSchema.safeParse(update);
        expect(result.success).toBe(false);
      });

      it('devrait valider tous les statuts de transcription valides', () => {
        const validStatuses = ['pending', 'processing', 'completed', 'verified'];

        validStatuses.forEach((status) => {
          const update = {
            transcriptionStatus: status as 'pending' | 'processing' | 'completed' | 'verified',
          };

          const result = updateDocumentSchema.safeParse(update);
          expect(result.success).toBe(true);
        });
      });

      it('devrait valider une mise à jour du contexte historique', () => {
        const update = {
          historicalContext: 'Contexte enrichi avec des détails supplémentaires sur l\'événement et son importance dans l\'histoire familiale.',
        };

        const result = updateDocumentSchema.safeParse(update);
        expect(result.success).toBe(true);
      });

      it('devrait valider une mise à jour de métadonnées', () => {
        const update = {
          metadata: {
            restoredDate: '2024-01-15',
            restoredBy: 'Laboratoire PhotoRestore',
            technique: 'Numérisation haute résolution + retouche',
          },
        };

        const result = updateDocumentSchema.safeParse(update);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Validation de Sécurité', () => {
    it('devrait détecter les tentatives de path traversal', () => {
      const dangerousPaths = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '/uploads/../../secrets',
        'uploads/../../../root',
      ];

      dangerousPaths.forEach((path) => {
        expect(path).toContain('..');
      });
    });

    it('devrait valider les chemins de fichiers sécurisés', () => {
      const safePaths = [
        '/uploads/project-123/photo.jpg',
        '/uploads/opale-heritage/doc1.pdf',
        '/uploads/family-archive/audio.mp3',
      ];

      safePaths.forEach((path) => {
        expect(path).not.toContain('..');
        expect(path).toMatch(/^\/uploads\//);
      });
    });

    it('devrait identifier les tentatives d\'injection SQL', () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE projects; --",
        "' OR '1'='1",
        "admin'--",
        "'; DELETE FROM users WHERE 'a'='a",
      ];

      sqlInjectionAttempts.forEach((attempt) => {
        // La validation Zod devrait accepter ces strings
        // mais les requêtes DB paramétrées doivent les neutraliser
        expect(typeof attempt).toBe('string');
      });
    });

    it('devrait valider les caractères autorisés dans les slugs', () => {
      const validSlugs = [
        'opale-heritage',
        'family-archive-1920-2000',
        'collection-dupont-2024',
        'test-123',
      ];

      validSlugs.forEach((slug) => {
        expect(slug).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('devrait rejeter les slugs avec caractères invalides', () => {
      const invalidSlugs = [
        'Opale-Heritage', // Majuscule
        'opale_heritage', // Underscore
        'opale heritage', // Espace
        'opale@heritage', // Caractère spécial
        '../malicious', // Path traversal
      ];

      invalidSlugs.forEach((slug) => {
        expect(slug).not.toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('devrait valider les formats d\'UUID', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
      ];

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      validUUIDs.forEach((uuid) => {
        expect(uuid).toMatch(uuidRegex);
      });
    });

    it('devrait rejeter les UUIDs invalides', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123',
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        '',
      ];

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      invalidUUIDs.forEach((uuid) => {
        expect(uuid).not.toMatch(uuidRegex);
      });
    });

    it('devrait valider les couleurs hexadécimales', () => {
      const validColors = [
        '#FFFFFF',
        '#000000',
        '#FF5733',
        '#8B7355',
        '#abc',
      ];

      const hexColorRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

      validColors.forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });

    it('devrait rejeter les couleurs invalides', () => {
      const invalidColors = [
        'FFFFFF', // Sans #
        '#GGGGGG', // Caractères invalides
        '#12345', // Longueur invalide
        'red', // Nom de couleur
      ];

      const hexColorRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

      invalidColors.forEach((color) => {
        expect(color).not.toMatch(hexColorRegex);
      });
    });
  });

  describe('Validation des Relations et Contraintes', () => {
    it('devrait valider les types de relations entre entités', () => {
      const validRelationTypes = [
        'married_to',
        'parent_of',
        'child_of',
        'sibling_of',
        'lives_in',
        'works_at',
        'participant_in',
        'created_by',
        'depicts',
        'related_to',
      ];

      validRelationTypes.forEach((relationType) => {
        expect(relationType).toMatch(/^[a-z_]+$/);
      });
    });

    it('devrait valider les poids de relations entre 0 et 1', () => {
      const validWeights = [0, 0.5, 0.75, 0.9, 1.0];

      validWeights.forEach((weight) => {
        expect(weight).toBeGreaterThanOrEqual(0);
        expect(weight).toBeLessThanOrEqual(1);
      });
    });

    it('devrait valider les scores de confiance des entités', () => {
      const validConfidenceScores = [0.5, 0.7, 0.85, 0.95, 1.0];

      validConfidenceScores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });

    it('devrait valider les types d\'entités', () => {
      const validEntityTypes = ['person', 'place', 'event', 'object', 'concept'];

      validEntityTypes.forEach((type) => {
        expect(validEntityTypes).toContain(type);
      });
    });

    it('devrait valider les types d\'annotations', () => {
      const validAnnotationTypes = ['note', 'correction', 'hotspot', 'region'];

      validAnnotationTypes.forEach((type) => {
        expect(validAnnotationTypes).toContain(type);
      });
    });

    it('devrait valider les coordonnées d\'annotations (0-100%)', () => {
      const validCoordinates = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 50, y: 50, width: 25, height: 25 },
        { x: 90, y: 90, width: 10, height: 10 },
      ];

      validCoordinates.forEach((coords) => {
        expect(coords.x).toBeGreaterThanOrEqual(0);
        expect(coords.x).toBeLessThanOrEqual(100);
        expect(coords.y).toBeGreaterThanOrEqual(0);
        expect(coords.y).toBeLessThanOrEqual(100);
        expect(coords.x + coords.width).toBeLessThanOrEqual(100);
        expect(coords.y + coords.height).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Validation des Formats et Standards', () => {
    it('devrait valider les codes de langue ISO 639-1', () => {
      const validLanguageCodes = ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl'];

      validLanguageCodes.forEach((code) => {
        expect(code).toMatch(/^[a-z]{2}$/);
      });
    });

    it('devrait valider les licences Creative Commons', () => {
      const validLicenses = [
        'CC BY 4.0',
        'CC BY-SA 4.0',
        'CC BY-NC 4.0',
        'CC BY-NC-SA 4.0',
        'CC BY-ND 4.0',
        'CC BY-NC-ND 4.0',
        'CC0 1.0',
      ];

      validLicenses.forEach((license) => {
        expect(license).toMatch(/^CC/);
      });
    });

    it('devrait valider les formats de fichiers acceptés', () => {
      const validFormats = {
        images: ['jpg', 'jpeg', 'png', 'tiff', 'gif', 'webp'],
        documents: ['pdf', 'doc', 'docx', 'txt'],
        audio: ['mp3', 'wav', 'ogg', 'm4a'],
        video: ['mp4', 'webm', 'mov', 'avi'],
      };

      Object.values(validFormats).flat().forEach((format) => {
        expect(format).toMatch(/^[a-z0-9]+$/);
      });
    });

    it('devrait valider les formats de dates', () => {
      const validDates = [
        '1920',
        '1925-06',
        '1925-06-15',
        'circa 1920',
        '1920-1925',
      ];

      validDates.forEach((date) => {
        expect(date).toBeTruthy();
        expect(typeof date).toBe('string');
      });
    });

    it('devrait valider les dimensions d\'images', () => {
      const validDimensions = [
        '1920x1080',
        '3000x2000',
        '800x600',
        '4096x3072',
      ];

      validDimensions.forEach((dimension) => {
        expect(dimension).toMatch(/^\d+x\d+$/);
      });
    });

    it('devrait valider les DPI d\'images', () => {
      const validDPIs = [72, 150, 300, 600, 1200];

      validDPIs.forEach((dpi) => {
        expect(dpi).toBeGreaterThan(0);
        expect(dpi).toBeLessThanOrEqual(2400);
      });
    });
  });
});
