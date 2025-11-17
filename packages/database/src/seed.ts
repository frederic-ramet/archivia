import { db, projects, documents } from "./index";

async function seed() {
  console.log("Seeding database...");

  // Create a sample project
  const [project] = await db
    .insert(projects)
    .values({
      name: "Journal de Guerre - Ramet Ernest",
      slug: "journal-de-guerre",
      description:
        "Journal de guerre d'Ernest Ramet, prisonnier de guerre à Munster en 1918",
      config: {
        features: {
          ocr: true,
          annotations: true,
          hotspots: false,
          stories: true,
          timeline: true,
          map: false,
          ontology: true,
          aiGeneration: true,
          publicReader: true,
          collaboration: true,
        },
        primaryLanguage: "fr",
        acceptedFormats: ["jpg", "png", "tiff"],
      },
      branding: {
        primaryColor: "#A67B5B",
        secondaryColor: "#E8D5C4",
        accentColor: "#3B82F6",
        heroTitle: "Journal de Guerre 1918",
        heroSubtitle: "Mémoires d'un prisonnier à Munster",
        footerText: "© 2025 - Famille Ramet",
      },
      metadata: {
        institution: "Archives Familiales Ramet",
        curator: "Frédéric Ramet",
        contributors: ["Claude AI", "Frédéric Ramet"],
        periodStart: "1911",
        periodEnd: "1918",
        themes: ["WWI", "Prisonnier de guerre", "Spiritualité"],
        license: "CC BY-NC-SA 4.0",
      },
      isPublic: true,
    })
    .returning();

  console.log(`Created project: ${project.name} (${project.id})`);

  // Create sample documents
  const sampleDocs = [
    {
      projectId: project.id,
      type: "manuscript" as const,
      title: "Page 1 - Définitions spirites",
      filePath: "/uploads/journal/page_001.jpg",
      thumbnailPath: "/uploads/journal/thumbs/page_001.jpg",
      category: "Entrée de journal",
      period: "Juin 1911",
      tags: ["spiritisme", "définitions", "manuscrit"],
      historicalContext:
        "Premières pages du carnet contenant des définitions spirites copiées par Ernest Ramet",
    },
    {
      projectId: project.id,
      type: "manuscript" as const,
      title: "Page 45 - Réflexions sur la foi",
      filePath: "/uploads/journal/page_045.jpg",
      thumbnailPath: "/uploads/journal/thumbs/page_045.jpg",
      transcription:
        "La foi est le fondement de notre espérance. Sans elle, l'homme est perdu dans les ténèbres...",
      transcriptionStatus: "verified" as const,
      category: "Réflexion spirituelle",
      period: "Août 1918",
      tags: ["foi", "spiritualité", "réflexion"],
      historicalContext:
        "Page écrite pendant sa captivité à Munster, montrant son évolution vers le christianisme",
    },
  ];

  for (const doc of sampleDocs) {
    const [created] = await db.insert(documents).values(doc).returning();
    console.log(`Created document: ${created.title} (${created.id})`);
  }

  console.log("Seeding completed!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
