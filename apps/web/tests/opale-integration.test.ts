/**
 * Tests d'intégration E2E - Collection Opale
 * Scénarios complets basés sur les données réelles de la collection familiale
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db, projects, documents, entities, entityRelationships, annotations } from '@archivia/database';
import { eq } from 'drizzle-orm';
import type { Project, Document, Entity } from '@archivia/shared-types';

describe('E2E: Collection Opale - Scénario Complet', () => {
  let testProjectId: string;
  let testDocuments: Document[] = [];
  let testEntities: Entity[] = [];

  beforeAll(async () => {
    // Nettoyage préalable
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, 'opale-heritage-test'))
      .limit(1);

    if (existingProject.length > 0) {
      await db.delete(projects).where(eq(projects.id, existingProject[0].id));
    }
  });

  afterAll(async () => {
    // Nettoyage après tests
    if (testProjectId) {
      await db.delete(projects).where(eq(projects.id, testProjectId));
    }
  });

  describe('Scénario 1: Création complète du projet Opale', () => {
    it('devrait créer le projet Opale avec configuration complète', async () => {
      const opaleProject = {
        name: 'Collection Opale - Héritage Familial (Test)',
        slug: 'opale-heritage-test',
        description: 'Collection de 255 photographies familiales couvrant plusieurs générations. Cette collection retrace l\'histoire d\'une famille française à travers ses moments importants : mariages, baptêmes, vacances, vie quotidienne.',
        config: {
          features: {
            ocr: false,
            annotations: true,
            hotspots: true,
            stories: true,
            timeline: true,
            map: true,
            ontology: true,
            aiGeneration: true,
            publicReader: true,
            collaboration: false,
          },
          primaryLanguage: 'fr',
          acceptedFormats: ['jpg', 'png', 'tiff'],
        },
        branding: {
          primaryColor: '#8B7355',
          secondaryColor: '#D4C5B0',
          accentColor: '#4A6741',
          heroTitle: 'Collection Opale',
          heroSubtitle: 'Mémoire familiale en images',
          footerText: 'Préservation du patrimoine familial',
        },
        metadata: {
          institution: 'Collection privée familiale',
          curator: 'Famille Ramet',
          contributors: ['Frédéric Ramet', 'Archives familiales'],
          periodStart: '1920',
          periodEnd: '2020',
          geographicScope: 'France, région parisienne',
          themes: [
            'Famille',
            'Vie quotidienne',
            'Traditions',
            'Générations',
            'Photographie amateur',
            'Histoire sociale',
          ],
          license: 'CC BY-NC-SA 4.0',
        },
        status: 'active' as const,
        isPublic: true,
      };

      const [createdProject] = await db
        .insert(projects)
        .values(opaleProject)
        .returning();

      expect(createdProject).toBeDefined();
      expect(createdProject.name).toBe(opaleProject.name);
      expect(createdProject.slug).toBe(opaleProject.slug);
      expect(createdProject.isPublic).toBe(true);
      expect(createdProject.status).toBe('active');
      expect(createdProject.config.features.ocr).toBe(false);
      expect(createdProject.config.features.ontology).toBe(true);
      expect(createdProject.branding.primaryColor).toBe('#8B7355');
      expect(createdProject.metadata.themes).toContain('Famille');

      testProjectId = createdProject.id;
    });

    it('devrait ajouter les 10 documents phares de la collection', async () => {
      const opaleDocuments = [
        {
          title: 'Portrait de famille - Années 1920',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C4.jpg',
          category: 'Portrait',
          period: '1920',
          tags: ['portrait', 'famille', 'années 20', 'noir et blanc'],
          historicalContext: 'Photo de famille formelle typique des années 1920. Les vêtements et la pose reflètent les conventions sociales de l\'époque.',
          metadata: {
            originalName: '1 C4.jpg',
            format: 'JPEG',
            estimatedDate: 'circa 1920',
            location: 'Studio photo, Paris',
            subjects: ['Grand-père paternel', 'Grand-mère paternelle'],
          },
        },
        {
          title: 'Mariage - Sortie de l\'église',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C8.jpg',
          category: 'Cérémonie',
          period: '1925',
          tags: ['mariage', 'église', 'célébration', 'tradition'],
          historicalContext: 'Mariage catholique traditionnel. Les mariés sortent de l\'église entourés de la famille et des invités.',
          metadata: {
            originalName: '1 C8.jpg',
            format: 'JPEG',
            estimatedDate: '1925',
            location: 'Église Saint-Michel, Paris',
            event: 'Mariage des grands-parents',
          },
        },
        {
          title: 'Vacances à la mer - Normandie',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C11.jpg',
          category: 'Vacances',
          period: '1935',
          tags: ['plage', 'vacances', 'été', 'Normandie', 'famille'],
          historicalContext: 'Les congés payés de 1936 ont démocratisé les vacances. Cette photo montre la famille profitant de la plage normande.',
          metadata: {
            originalName: '1 C11.jpg',
            format: 'JPEG',
            estimatedDate: '1935',
            location: 'Deauville, Normandie',
            subjects: ['Enfants', 'Parents'],
          },
        },
        {
          title: 'Communion solennelle',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C13.jpg',
          category: 'Cérémonie',
          period: '1938',
          tags: ['communion', 'religion', 'enfance', 'tradition'],
          historicalContext: 'Première communion, rite de passage important dans les familles catholiques françaises.',
          metadata: {
            originalName: '1 C13.jpg',
            format: 'JPEG',
            estimatedDate: '1938',
            location: 'Église paroissiale',
            subjects: ['Enfant en habit de communion'],
          },
        },
        {
          title: 'Jardin familial - Été',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C15.jpg',
          category: 'Vie quotidienne',
          period: '1950',
          tags: ['jardin', 'été', 'détente', 'après-guerre'],
          historicalContext: 'L\'après-guerre marque un retour à la vie normale. Le jardin devient un lieu de convivialité familiale.',
          metadata: {
            originalName: '1 C15.jpg',
            format: 'JPEG',
            estimatedDate: '1950',
            location: 'Maison familiale, banlieue parisienne',
          },
        },
        {
          title: 'Noël en famille',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C19.jpg',
          category: 'Fête',
          period: '1955',
          tags: ['Noël', 'fête', 'famille', 'traditions', 'cadeaux'],
          historicalContext: 'Célébration de Noël dans le salon familial. L\'arbre décoré et les cadeaux témoignent de la prospérité des Trente Glorieuses.',
          metadata: {
            originalName: '1 C19.jpg',
            format: 'JPEG',
            estimatedDate: '1955',
            location: 'Salon familial',
            event: 'Noël 1955',
          },
        },
        {
          title: 'Baptême du petit-fils',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C22.jpg',
          category: 'Cérémonie',
          period: '1965',
          tags: ['baptême', 'bébé', 'famille', 'génération'],
          historicalContext: 'Continuation des traditions familiales avec le baptême de la nouvelle génération.',
          metadata: {
            originalName: '1 C22.jpg',
            format: 'JPEG',
            estimatedDate: '1965',
            location: 'Église paroissiale',
            subjects: ['Bébé', 'Parrain', 'Marraine', 'Parents'],
          },
        },
        {
          title: 'Réunion de famille - Anniversaire',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C25.jpg',
          category: 'Fête',
          period: '1975',
          tags: ['anniversaire', 'famille', 'réunion', 'années 70'],
          historicalContext: 'Grande réunion familiale pour célébrer un anniversaire important. Mode et décoration typiques des années 1970.',
          metadata: {
            originalName: '1 C25.jpg',
            format: 'JPEG',
            estimatedDate: '1975',
            location: 'Maison familiale',
            event: '50 ans de mariage',
          },
        },
        {
          title: 'Vacances camping - Côte d\'Azur',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C29.jpg',
          category: 'Vacances',
          period: '1980',
          tags: ['camping', 'vacances', 'été', 'Côte d\'Azur'],
          historicalContext: 'Le camping devient un mode de vacances populaire. La famille découvre le sud de la France.',
          metadata: {
            originalName: '1 C29.jpg',
            format: 'JPEG',
            estimatedDate: '1980',
            location: 'Côte d\'Azur',
            subjects: ['Famille complète'],
          },
        },
        {
          title: 'Quatre générations réunies',
          type: 'image' as const,
          filePath: '/uploads/opale-heritage-test/1_C34.jpg',
          category: 'Portrait',
          period: '1990',
          tags: ['générations', 'famille', 'portrait', 'héritage'],
          historicalContext: 'Photo rare réunissant quatre générations de la famille. Témoignage de la continuité familiale.',
          metadata: {
            originalName: '1 C34.jpg',
            format: 'JPEG',
            estimatedDate: '1990',
            location: 'Maison familiale',
            subjects: ['Arrière-grand-mère', 'Grand-mère', 'Mère', 'Enfant'],
          },
        },
      ];

      for (let i = 0; i < opaleDocuments.length; i++) {
        const doc = opaleDocuments[i];
        const [created] = await db
          .insert(documents)
          .values({
            projectId: testProjectId,
            ...doc,
            position: i,
            transcriptionStatus: 'pending',
          })
          .returning();

        testDocuments.push(created);
      }

      expect(testDocuments).toHaveLength(10);
      expect(testDocuments[0].title).toBe('Portrait de famille - Années 1920');
      expect(testDocuments[1].period).toBe('1925');
      expect(testDocuments[2].category).toBe('Vacances');
      expect(testDocuments[9].tags).toContain('générations');
    });

    it('devrait créer les entités ontologiques de la collection', async () => {
      const opaleEntities = [
        {
          type: 'person' as const,
          name: 'Grand-père Marcel',
          normalizedName: 'marcel_ramet',
          description: 'Patriarche de la famille, né en 1895. Ouvrier qualifié.',
          aliases: ['Marcel', 'Pépé Marcel'],
          properties: {
            birthYear: 1895,
            deathYear: 1978,
            occupation: 'Ouvrier métallurgiste',
            role: 'Grand-père paternel',
          },
          confidence: 0.95,
          source: 'manual' as const,
        },
        {
          type: 'person' as const,
          name: 'Grand-mère Jeanne',
          normalizedName: 'jeanne_ramet',
          description: 'Épouse de Marcel, née en 1900. Mère au foyer.',
          aliases: ['Jeanne', 'Mémé Jeanne'],
          properties: {
            birthYear: 1900,
            deathYear: 1985,
            occupation: 'Mère au foyer',
            role: 'Grand-mère paternelle',
          },
          confidence: 0.95,
          source: 'manual' as const,
        },
        {
          type: 'place' as const,
          name: 'Maison familiale - Banlieue parisienne',
          normalizedName: 'maison_banlieue',
          description: 'Maison familiale acquise en 1948, lieu de nombreuses réunions.',
          aliases: ['La maison', 'Chez les grands-parents'],
          properties: {
            type: 'Maison individuelle',
            acquiredYear: 1948,
            features: ['Jardin', 'Salon', 'Cave'],
          },
          confidence: 0.9,
          source: 'manual' as const,
        },
        {
          type: 'event' as const,
          name: 'Mariage 1925',
          normalizedName: 'mariage_1925',
          description: 'Mariage de Marcel et Jeanne, fondation de la lignée familiale.',
          aliases: ['Le mariage des grands-parents'],
          properties: {
            date: '1925',
            location: 'Église Saint-Michel, Paris',
            type: 'Mariage religieux',
          },
          confidence: 1.0,
          source: 'manual' as const,
        },
        {
          type: 'concept' as const,
          name: 'Traditions familiales',
          normalizedName: 'traditions_familiales',
          description: 'Ensemble des rituels et coutumes transmis de génération en génération.',
          aliases: ['Traditions', 'Coutumes familiales'],
          properties: {
            examples: ['Repas dominicaux', 'Fêtes religieuses', 'Vacances estivales'],
          },
          confidence: 0.85,
          source: 'manual' as const,
        },
      ];

      for (const entity of opaleEntities) {
        const [created] = await db
          .insert(entities)
          .values({
            projectId: testProjectId,
            ...entity,
          })
          .returning();

        testEntities.push(created);
      }

      expect(testEntities).toHaveLength(5);
      expect(testEntities.filter((e) => e.type === 'person')).toHaveLength(2);
      expect(testEntities.filter((e) => e.type === 'place')).toHaveLength(1);
      expect(testEntities.filter((e) => e.type === 'event')).toHaveLength(1);
      expect(testEntities.filter((e) => e.type === 'concept')).toHaveLength(1);
      expect(testEntities[0].name).toBe('Grand-père Marcel');
      expect(testEntities[0].confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('devrait créer les relations entre entités', async () => {
      const marcel = testEntities.find((e) => e.normalizedName === 'marcel_ramet');
      const jeanne = testEntities.find((e) => e.normalizedName === 'jeanne_ramet');
      const mariage = testEntities.find((e) => e.normalizedName === 'mariage_1925');
      const maison = testEntities.find((e) => e.normalizedName === 'maison_banlieue');

      expect(marcel).toBeDefined();
      expect(jeanne).toBeDefined();
      expect(mariage).toBeDefined();
      expect(maison).toBeDefined();

      // Relation 1: Marcel married_to Jeanne
      const [relation1] = await db
        .insert(entityRelationships)
        .values({
          sourceId: marcel!.id,
          targetId: jeanne!.id,
          relationType: 'married_to',
          properties: { year: 1925 },
          weight: 1.0,
        })
        .returning();

      expect(relation1).toBeDefined();
      expect(relation1.relationType).toBe('married_to');
      expect(relation1.weight).toBe(1.0);

      // Relation 2: Marcel participant_in Mariage
      const [relation2] = await db
        .insert(entityRelationships)
        .values({
          sourceId: marcel!.id,
          targetId: mariage!.id,
          relationType: 'participant_in',
          properties: { role: 'groom' },
          weight: 1.0,
        })
        .returning();

      expect(relation2).toBeDefined();
      expect(relation2.properties.role).toBe('groom');

      // Relation 3: Marcel lives_in Maison
      const [relation3] = await db
        .insert(entityRelationships)
        .values({
          sourceId: marcel!.id,
          targetId: maison!.id,
          relationType: 'lives_in',
          properties: { since: 1948 },
          weight: 0.9,
        })
        .returning();

      expect(relation3).toBeDefined();
      expect(relation3.weight).toBe(0.9);

      // Vérifier qu'on peut récupérer les relations
      const allRelations = await db
        .select()
        .from(entityRelationships)
        .where(eq(entityRelationships.sourceId, marcel!.id));

      expect(allRelations).toHaveLength(3);
    });

    it('devrait ajouter des annotations sur les documents', async () => {
      const marcel = testEntities.find((e) => e.normalizedName === 'marcel_ramet');
      const portraitDoc = testDocuments[0]; // Portrait de famille
      const mariageDoc = testDocuments[1]; // Mariage

      // Annotation hotspot sur le portrait
      const [annotation1] = await db
        .insert(annotations)
        .values({
          documentId: portraitDoc.id,
          userId: 'system',
          type: 'hotspot',
          content: 'Grand-père Marcel à gauche, reconnaissable à sa moustache caractéristique.',
          x: 25,
          y: 40,
          width: 15,
          height: 30,
          metadata: { entityId: marcel?.id },
          status: 'published',
        })
        .returning();

      expect(annotation1).toBeDefined();
      expect(annotation1.type).toBe('hotspot');
      expect(annotation1.metadata.entityId).toBe(marcel?.id);

      // Annotation note sur le mariage
      const [annotation2] = await db
        .insert(annotations)
        .values({
          documentId: mariageDoc.id,
          userId: 'system',
          type: 'note',
          content: 'Le voile de Jeanne a été conservé et porté par trois générations.',
          x: 50,
          y: 30,
          metadata: { importance: 'high' },
          status: 'published',
        })
        .returning();

      expect(annotation2).toBeDefined();
      expect(annotation2.type).toBe('note');
      expect(annotation2.status).toBe('published');

      // Vérifier qu'on peut récupérer les annotations d'un document
      const portraitAnnotations = await db
        .select()
        .from(annotations)
        .where(eq(annotations.documentId, portraitDoc.id));

      expect(portraitAnnotations).toHaveLength(1);
      expect(portraitAnnotations[0].type).toBe('hotspot');
    });
  });

  describe('Scénario 2: Recherche et Navigation', () => {
    it('devrait rechercher des documents par tag', async () => {
      const mariageDocuments = testDocuments.filter((doc) =>
        doc.tags.includes('mariage')
      );

      expect(mariageDocuments.length).toBeGreaterThan(0);
      expect(mariageDocuments[0].title).toContain('Mariage');
    });

    it('devrait filtrer par catégorie', async () => {
      const ceremonieDocuments = testDocuments.filter(
        (doc) => doc.category === 'Cérémonie'
      );

      expect(ceremonieDocuments.length).toBeGreaterThanOrEqual(3);
      expect(ceremonieDocuments.map((d) => d.title)).toContain('Mariage - Sortie de l\'église');
    });

    it('devrait filtrer par période', async () => {
      const annees1920Documents = testDocuments.filter(
        (doc) => doc.period && doc.period >= '1920' && doc.period < '1930'
      );

      expect(annees1920Documents.length).toBeGreaterThan(0);
    });

    it('devrait trouver des entités par type', async () => {
      const personnes = testEntities.filter((e) => e.type === 'person');
      expect(personnes).toHaveLength(2);
      expect(personnes.map((p) => p.name)).toContain('Grand-père Marcel');
      expect(personnes.map((p) => p.name)).toContain('Grand-mère Jeanne');
    });
  });

  describe('Scénario 3: Validation de l\'intégrité des données', () => {
    it('devrait avoir un graphe d\'entités cohérent', async () => {
      const allRelations = await db.select().from(entityRelationships);

      // Toutes les relations doivent avoir un poids entre 0 et 1
      allRelations.forEach((rel) => {
        expect(rel.weight).toBeGreaterThanOrEqual(0);
        expect(rel.weight).toBeLessThanOrEqual(1);
      });

      // Les sources et cibles doivent être différentes
      allRelations.forEach((rel) => {
        expect(rel.sourceId).not.toBe(rel.targetId);
      });
    });

    it('devrait avoir des métadonnées complètes sur tous les documents', async () => {
      testDocuments.forEach((doc) => {
        expect(doc.title).toBeTruthy();
        expect(doc.type).toBeTruthy();
        expect(doc.filePath).toBeTruthy();
        expect(doc.category).toBeTruthy();
        expect(doc.period).toBeTruthy();
        expect(doc.tags).toBeInstanceOf(Array);
        expect(doc.tags.length).toBeGreaterThan(0);
        expect(doc.historicalContext).toBeTruthy();
        expect(doc.metadata).toBeTruthy();
      });
    });

    it('devrait avoir des entités avec des noms normalisés valides', async () => {
      testEntities.forEach((entity) => {
        // Note: Les champs confidence et source ne sont pas dans le schéma DB actuel
        expect(entity.normalizedName).toBeTruthy();
        expect(entity.normalizedName).toMatch(/^[a-z0-9_]+$/);
        expect(entity.name).toBeTruthy();
        expect(entity.type).toBeTruthy();
      });
    });

    it('devrait respecter les relations cascade', async () => {
      // Créer un projet temporaire pour tester la cascade
      const [tempProject] = await db
        .insert(projects)
        .values({
          name: 'Test Cascade',
          slug: 'test-cascade-opale',
        })
        .returning();

      const [tempDoc] = await db
        .insert(documents)
        .values({
          projectId: tempProject.id,
          title: 'Test Document',
          type: 'image',
          filePath: '/test.jpg',
          transcriptionStatus: 'pending',
        })
        .returning();

      // Supprimer le projet
      await db.delete(projects).where(eq(projects.id, tempProject.id));

      // Vérifier que le document a été supprimé en cascade
      const remainingDocs = await db
        .select()
        .from(documents)
        .where(eq(documents.id, tempDoc.id));

      expect(remainingDocs).toHaveLength(0);
    });
  });

  describe('Scénario 4: Statistiques et Analytics', () => {
    it('devrait calculer les statistiques du projet', async () => {
      const stats = {
        totalDocuments: testDocuments.length,
        totalEntities: testEntities.length,
        entitiesByType: {
          person: testEntities.filter((e) => e.type === 'person').length,
          place: testEntities.filter((e) => e.type === 'place').length,
          event: testEntities.filter((e) => e.type === 'event').length,
          concept: testEntities.filter((e) => e.type === 'concept').length,
        },
        periodCoverage: {
          start: Math.min(...testDocuments.map((d) => parseInt(d.period!))),
          end: Math.max(...testDocuments.map((d) => parseInt(d.period!))),
        },
        categories: Array.from(new Set(testDocuments.map((d) => d.category))),
      };

      expect(stats.totalDocuments).toBe(10);
      expect(stats.totalEntities).toBe(5);
      expect(stats.entitiesByType.person).toBe(2);
      expect(stats.periodCoverage.start).toBe(1920);
      expect(stats.periodCoverage.end).toBe(1990);
      expect(stats.categories).toContain('Portrait');
      expect(stats.categories).toContain('Cérémonie');
      expect(stats.categories).toContain('Vacances');
    });

    it('devrait identifier les documents les plus riches en métadonnées', async () => {
      const richestDocs = testDocuments
        .map((doc) => ({
          id: doc.id,
          title: doc.title,
          metadataScore: doc.tags.length + (doc.historicalContext ? 1 : 0) + Object.keys(doc.metadata).length,
        }))
        .sort((a, b) => b.metadataScore - a.metadataScore);

      expect(richestDocs[0].metadataScore).toBeGreaterThanOrEqual(5);
    });

    it('devrait identifier les entités les plus connectées', async () => {
      const marcel = testEntities.find((e) => e.normalizedName === 'marcel_ramet');

      const marcelRelations = await db
        .select()
        .from(entityRelationships)
        .where(eq(entityRelationships.sourceId, marcel!.id));

      // Marcel devrait être l'entité la plus connectée (3 relations)
      expect(marcelRelations.length).toBe(3);
    });
  });

  describe('Scénario 5: Validation de la qualité des données', () => {
    it('devrait avoir des slugs valides', () => {
      testDocuments.forEach((doc) => {
        // Les slugs dans les paths devraient être valides
        expect(doc.filePath).toMatch(/^\/uploads\/[a-z0-9-]+\/.+$/);
      });
    });

    it('devrait avoir des dates cohérentes', () => {
      testDocuments.forEach((doc) => {
        const period = parseInt(doc.period!);
        expect(period).toBeGreaterThanOrEqual(1920);
        expect(period).toBeLessThanOrEqual(2020);
      });
    });

    it('devrait avoir des entités avec descriptions significatives', () => {
      testEntities.forEach((entity) => {
        expect(entity.description).toBeTruthy();
        expect(entity.description.length).toBeGreaterThan(10);
      });
    });

    it('devrait avoir des tags pertinents', () => {
      testDocuments.forEach((doc) => {
        expect(doc.tags.length).toBeGreaterThanOrEqual(3);
        doc.tags.forEach((tag) => {
          expect(tag.length).toBeGreaterThan(2);
          expect(tag).toMatch(/^[a-zàâäéèêëïîôöùûüÿæœç0-9\s'-]+$/i);
        });
      });
    });
  });
});

describe('Performance: Collection Opale', () => {
  it('devrait charger le projet en moins de 100ms', async () => {
    const start = performance.now();

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, 'opale-heritage'))
      .limit(1);

    const duration = performance.now() - start;

    expect(project.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100);
  });

  it('devrait charger les documents paginés en moins de 200ms', async () => {
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, 'opale-heritage'))
      .limit(1);

    const start = performance.now();

    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, project[0].id))
      .limit(20);

    const duration = performance.now() - start;

    expect(docs.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(200);
  });

  it('devrait charger le graphe d\'entités en moins de 300ms', async () => {
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, 'opale-heritage'))
      .limit(1);

    const start = performance.now();

    const [entitiesData, relationsData] = await Promise.all([
      db.select().from(entities).where(eq(entities.projectId, project[0].id)),
      db.select().from(entityRelationships),
    ]);

    const duration = performance.now() - start;

    expect(entitiesData.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(300);
  });
});
