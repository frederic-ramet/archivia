// Script de test complet pour Archivia
// Crée un projet exemple basé sur la collection Opale avec 10 photos

import { db, projects, documents, entities, entityRelationships, annotations } from "../src/index";
import { eq } from "drizzle-orm";

// Données du projet Opale
const opaleProject = {
  name: "Collection Opale - Héritage Familial",
  slug: "opale-heritage",
  description: "Collection de 255 photographies familiales couvrant plusieurs générations. Cette collection retrace l'histoire d'une famille française à travers ses moments importants : mariages, baptêmes, vacances, vie quotidienne.",
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
    primaryLanguage: "fr",
    acceptedFormats: ["jpg", "png", "tiff"],
  },
  branding: {
    primaryColor: "#8B7355",
    secondaryColor: "#D4C5B0",
    accentColor: "#4A6741",
    heroTitle: "Collection Opale",
    heroSubtitle: "Mémoire familiale en images",
    footerText: "Préservation du patrimoine familial",
  },
  metadata: {
    institution: "Collection privée familiale",
    curator: "Famille Ramet",
    contributors: ["Frédéric Ramet", "Archives familiales"],
    periodStart: "1920",
    periodEnd: "2020",
    geographicScope: "France, région parisienne",
    themes: [
      "Famille",
      "Vie quotidienne",
      "Traditions",
      "Générations",
      "Photographie amateur",
      "Histoire sociale",
    ],
    license: "CC BY-NC-SA 4.0",
  },
  status: "active" as const,
  isPublic: true,
};

// 10 photos sélectionnées de la collection Opale avec métadonnées enrichies
const opaleDocuments = [
  {
    title: "Portrait de famille - Années 1920",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C4.jpg",
    category: "Portrait",
    period: "1920",
    tags: ["portrait", "famille", "années 20", "noir et blanc"],
    historicalContext: "Photo de famille formelle typique des années 1920. Les vêtements et la pose reflètent les conventions sociales de l'époque.",
    metadata: {
      originalName: "1 C4.jpg",
      format: "JPEG",
      estimatedDate: "circa 1920",
      location: "Studio photo, Paris",
      subjects: ["Grand-père paternel", "Grand-mère paternelle"],
    },
  },
  {
    title: "Mariage - Sortie de l'église",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C8.jpg",
    category: "Cérémonie",
    period: "1925",
    tags: ["mariage", "église", "célébration", "tradition"],
    historicalContext: "Mariage catholique traditionnel. Les mariés sortent de l'église entourés de la famille et des invités.",
    metadata: {
      originalName: "1 C8.jpg",
      format: "JPEG",
      estimatedDate: "1925",
      location: "Église Saint-Michel, Paris",
      event: "Mariage des grands-parents",
    },
  },
  {
    title: "Vacances à la mer - Normandie",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C11.jpg",
    category: "Vacances",
    period: "1935",
    tags: ["plage", "vacances", "été", "Normandie", "famille"],
    historicalContext: "Les congés payés de 1936 ont démocratisé les vacances. Cette photo montre la famille profitant de la plage normande.",
    metadata: {
      originalName: "1 C11.jpg",
      format: "JPEG",
      estimatedDate: "1935",
      location: "Deauville, Normandie",
      subjects: ["Enfants", "Parents"],
    },
  },
  {
    title: "Communion solennelle",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C13.jpg",
    category: "Cérémonie",
    period: "1938",
    tags: ["communion", "religion", "enfance", "tradition"],
    historicalContext: "Première communion, rite de passage important dans les familles catholiques françaises.",
    metadata: {
      originalName: "1 C13.jpg",
      format: "JPEG",
      estimatedDate: "1938",
      location: "Église paroissiale",
      subjects: ["Enfant en habit de communion"],
    },
  },
  {
    title: "Jardin familial - Été",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C15.jpg",
    category: "Vie quotidienne",
    period: "1950",
    tags: ["jardin", "été", "détente", "après-guerre"],
    historicalContext: "L'après-guerre marque un retour à la vie normale. Le jardin devient un lieu de convivialité familiale.",
    metadata: {
      originalName: "1 C15.jpg",
      format: "JPEG",
      estimatedDate: "1950",
      location: "Maison familiale, banlieue parisienne",
    },
  },
  {
    title: "Noël en famille",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C19.jpg",
    category: "Fête",
    period: "1955",
    tags: ["Noël", "fête", "famille", "traditions", "cadeaux"],
    historicalContext: "Célébration de Noël dans le salon familial. L'arbre décoré et les cadeaux témoignent de la prospérité des Trente Glorieuses.",
    metadata: {
      originalName: "1 C19.jpg",
      format: "JPEG",
      estimatedDate: "1955",
      location: "Salon familial",
      event: "Noël 1955",
    },
  },
  {
    title: "Baptême du petit-fils",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C22.jpg",
    category: "Cérémonie",
    period: "1965",
    tags: ["baptême", "bébé", "famille", "génération"],
    historicalContext: "Continuation des traditions familiales avec le baptême de la nouvelle génération.",
    metadata: {
      originalName: "1 C22.jpg",
      format: "JPEG",
      estimatedDate: "1965",
      location: "Église paroissiale",
      subjects: ["Bébé", "Parrain", "Marraine", "Parents"],
    },
  },
  {
    title: "Réunion de famille - Anniversaire",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C25.jpg",
    category: "Fête",
    period: "1975",
    tags: ["anniversaire", "famille", "réunion", "années 70"],
    historicalContext: "Grande réunion familiale pour célébrer un anniversaire important. Mode et décoration typiques des années 1970.",
    metadata: {
      originalName: "1 C25.jpg",
      format: "JPEG",
      estimatedDate: "1975",
      location: "Maison familiale",
      event: "50 ans de mariage",
    },
  },
  {
    title: "Vacances camping - Côte d'Azur",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C29.jpg",
    category: "Vacances",
    period: "1980",
    tags: ["camping", "vacances", "été", "Côte d'Azur"],
    historicalContext: "Le camping devient un mode de vacances populaire. La famille découvre le sud de la France.",
    metadata: {
      originalName: "1 C29.jpg",
      format: "JPEG",
      estimatedDate: "1980",
      location: "Côte d'Azur",
      subjects: ["Famille complète"],
    },
  },
  {
    title: "Quatre générations réunies",
    type: "image" as const,
    filePath: "/uploads/opale-heritage/1_C34.jpg",
    category: "Portrait",
    period: "1990",
    tags: ["générations", "famille", "portrait", "héritage"],
    historicalContext: "Photo rare réunissant quatre générations de la famille. Témoignage de la continuité familiale.",
    metadata: {
      originalName: "1 C34.jpg",
      format: "JPEG",
      estimatedDate: "1990",
      location: "Maison familiale",
      subjects: ["Arrière-grand-mère", "Grand-mère", "Mère", "Enfant"],
    },
  },
];

// Entités extraites de la collection
const opaleEntities = [
  {
    type: "person" as const,
    name: "Grand-père Marcel",
    normalizedName: "marcel_ramet",
    description: "Patriarche de la famille, né en 1895. Ouvrier qualifié.",
    aliases: ["Marcel", "Pépé Marcel"],
    properties: {
      birthYear: 1895,
      deathYear: 1978,
      occupation: "Ouvrier métallurgiste",
      role: "Grand-père paternel",
    },
    confidence: 0.95,
    source: "manual" as const,
  },
  {
    type: "person" as const,
    name: "Grand-mère Jeanne",
    normalizedName: "jeanne_ramet",
    description: "Épouse de Marcel, née en 1900. Mère au foyer.",
    aliases: ["Jeanne", "Mémé Jeanne"],
    properties: {
      birthYear: 1900,
      deathYear: 1985,
      occupation: "Mère au foyer",
      role: "Grand-mère paternelle",
    },
    confidence: 0.95,
    source: "manual" as const,
  },
  {
    type: "place" as const,
    name: "Maison familiale - Banlieue parisienne",
    normalizedName: "maison_banlieue",
    description: "Maison familiale acquise en 1948, lieu de nombreuses réunions.",
    aliases: ["La maison", "Chez les grands-parents"],
    properties: {
      type: "Maison individuelle",
      acquiredYear: 1948,
      features: ["Jardin", "Salon", "Cave"],
    },
    confidence: 0.9,
    source: "manual" as const,
  },
  {
    type: "event" as const,
    name: "Mariage 1925",
    normalizedName: "mariage_1925",
    description: "Mariage de Marcel et Jeanne, fondation de la lignée familiale.",
    aliases: ["Le mariage des grands-parents"],
    properties: {
      date: "1925",
      location: "Église Saint-Michel, Paris",
      type: "Mariage religieux",
    },
    confidence: 1.0,
    source: "manual" as const,
  },
  {
    type: "concept" as const,
    name: "Traditions familiales",
    normalizedName: "traditions_familiales",
    description: "Ensemble des rituels et coutumes transmis de génération en génération.",
    aliases: ["Traditions", "Coutumes familiales"],
    properties: {
      examples: ["Repas dominicaux", "Fêtes religieuses", "Vacances estivales"],
    },
    confidence: 0.85,
    source: "manual" as const,
  },
];

async function createTestProject() {
  console.log("🚀 Création du projet de test Opale...\n");

  try {
    // 1. Créer le projet
    console.log("📁 Création du projet...");
    const [project] = await db
      .insert(projects)
      .values(opaleProject)
      .returning();
    console.log(`   ✅ Projet créé: ${project.name} (ID: ${project.id})`);

    // 2. Ajouter les documents
    console.log("\n📸 Ajout des 10 photos de la collection...");
    const createdDocs = [];
    for (let i = 0; i < opaleDocuments.length; i++) {
      const doc = opaleDocuments[i];
      const [created] = await db
        .insert(documents)
        .values({
          projectId: project.id,
          ...doc,
          position: i,
          transcriptionStatus: "pending",
        })
        .returning();
      createdDocs.push(created);
      console.log(`   ✅ [${i + 1}/10] ${doc.title}`);
    }

    // 3. Créer les entités
    console.log("\n🏷️  Création des entités ontologiques...");
    const createdEntities = [];
    for (const entity of opaleEntities) {
      const [created] = await db
        .insert(entities)
        .values({
          projectId: project.id,
          ...entity,
        })
        .returning();
      createdEntities.push(created);
      console.log(`   ✅ ${entity.type}: ${entity.name}`);
    }

    // 4. Créer des relations entre entités
    console.log("\n🔗 Création des relations...");
    const marcel = createdEntities.find((e) => e.normalizedName === "marcel_ramet");
    const jeanne = createdEntities.find((e) => e.normalizedName === "jeanne_ramet");
    const mariage = createdEntities.find((e) => e.normalizedName === "mariage_1925");
    const maison = createdEntities.find((e) => e.normalizedName === "maison_banlieue");

    if (marcel && jeanne) {
      await db.insert(entityRelationships).values({
        sourceId: marcel.id,
        targetId: jeanne.id,
        relationType: "married_to",
        properties: { year: 1925 },
        weight: 1.0,
      });
      console.log("   ✅ Marcel <-> Jeanne (married_to)");
    }

    if (marcel && mariage) {
      await db.insert(entityRelationships).values({
        sourceId: marcel.id,
        targetId: mariage.id,
        relationType: "participant_in",
        properties: { role: "groom" },
        weight: 1.0,
      });
      console.log("   ✅ Marcel -> Mariage 1925 (participant_in)");
    }

    if (maison && marcel) {
      await db.insert(entityRelationships).values({
        sourceId: marcel.id,
        targetId: maison.id,
        relationType: "lives_in",
        properties: { since: 1948 },
        weight: 0.9,
      });
      console.log("   ✅ Marcel -> Maison (lives_in)");
    }

    // 5. Ajouter des annotations sur certains documents
    console.log("\n📝 Ajout d'annotations sur les documents...");

    // Annotation sur le portrait de famille
    const portraitDoc = createdDocs[0];
    await db.insert(annotations).values({
      documentId: portraitDoc.id,
      userId: "system",
      type: "hotspot",
      content: "Grand-père Marcel à gauche, reconnaissable à sa moustache caractéristique.",
      x: 25,
      y: 40,
      width: 15,
      height: 30,
      metadata: { entityId: marcel?.id },
      status: "published",
    });
    console.log("   ✅ Hotspot ajouté sur le portrait de famille");

    // Annotation sur le mariage
    const mariageDoc = createdDocs[1];
    await db.insert(annotations).values({
      documentId: mariageDoc.id,
      userId: "system",
      type: "note",
      content: "Le voile de Jeanne a été conservé et porté par trois générations.",
      x: 50,
      y: 30,
      metadata: { importance: "high" },
      status: "published",
    });
    console.log("   ✅ Note ajoutée sur la photo de mariage");

    // 6. Statistiques finales
    console.log("\n📊 Statistiques du projet de test:");
    console.log(`   - Projet: ${project.name}`);
    console.log(`   - ID: ${project.id}`);
    console.log(`   - Slug: ${project.slug}`);
    console.log(`   - Documents: ${createdDocs.length}`);
    console.log(`   - Entités: ${createdEntities.length}`);
    console.log(`   - Relations: 3`);
    console.log(`   - Annotations: 2`);
    console.log(`   - Statut: ${project.status}`);
    console.log(`   - Public: ${project.isPublic ? "Oui" : "Non"}`);

    // 7. Générer un résumé du contenu
    console.log("\n📖 Résumé généré de la collection:");
    console.log("   ════════════════════════════════════════");
    console.log("   La Collection Opale retrace l'histoire");
    console.log("   d'une famille française sur quatre");
    console.log("   générations (1920-1990). À travers 10");
    console.log("   photographies sélectionnées, nous");
    console.log("   découvrons les moments clés:");
    console.log("   - Portraits formels des années 1920");
    console.log("   - Cérémonies (mariage, communion, baptême)");
    console.log("   - Vacances (Normandie, Côte d'Azur)");
    console.log("   - Fêtes familiales (Noël, anniversaires)");
    console.log("   - La transmission intergénérationnelle");
    console.log("   ════════════════════════════════════════");

    console.log("\n✨ Projet de test créé avec succès!");
    console.log(`\n🌐 Pour visualiser: http://localhost:3000/projects/${project.id}`);

    return project;
  } catch (error) {
    console.error("❌ Erreur lors de la création:", error);
    throw error;
  }
}

// Fonction pour nettoyer les données de test
async function cleanupTestProject() {
  console.log("🧹 Nettoyage des données de test...");

  const testProject = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, "opale-heritage"))
    .limit(1);

  if (testProject.length > 0) {
    await db.delete(projects).where(eq(projects.id, testProject[0].id));
    console.log("   ✅ Projet de test supprimé (cascade sur documents, entités, etc.)");
  } else {
    console.log("   ℹ️  Aucun projet de test trouvé");
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes("--cleanup")) {
  cleanupTestProject()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  createTestProject()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
