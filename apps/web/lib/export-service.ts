import { db, projects, documents, entities, entityRelationships } from "@archivia/database";
import { eq } from "drizzle-orm";
import { existsSync } from "fs";
import path from "path";
import JSZip from "jszip";

interface ExportOptions {
  includeImages?: boolean;
  includeTranscriptions?: boolean;
  includeEntities?: boolean;
}

interface ProjectData {
  project: typeof projects.$inferSelect;
  documents: (typeof documents.$inferSelect)[];
  entities: (typeof entities.$inferSelect)[];
  relationships: (typeof entityRelationships.$inferSelect)[];
}

/**
 * Fetch all project data for export
 */
async function fetchProjectData(projectId: string): Promise<ProjectData> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  const projectDocuments = await db
    .select()
    .from(documents)
    .where(eq(documents.projectId, projectId));

  const projectEntities = await db
    .select()
    .from(entities)
    .where(eq(entities.projectId, projectId));

  const entityIds = new Set(projectEntities.map((e) => e.id));
  const allRelationships = await db.select().from(entityRelationships);
  const projectRelationships = allRelationships.filter(
    (r) => entityIds.has(r.sourceId) && entityIds.has(r.targetId)
  );

  return {
    project,
    documents: projectDocuments,
    entities: projectEntities,
    relationships: projectRelationships,
  };
}

/**
 * Generate HTML for the index page
 */
function generateIndexHTML(data: ProjectData): string {
  const { project, documents: docs } = data;
  const branding = project.branding as Record<string, string>;
  const metadata = project.metadata as Record<string, unknown>;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - Archivia Export</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header { background: ${branding.primaryColor || '#7c3aed'}; color: white; padding: 2rem 0; margin-bottom: 2rem; }
    header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    header p { opacity: 0.9; }
    .meta { background: white; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .meta dt { font-weight: 600; color: #6b7280; font-size: 0.875rem; }
    .meta dd { margin-bottom: 0.75rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .card { background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s; }
    .card:hover { transform: translateY(-2px); }
    .card img { width: 100%; height: 200px; object-fit: cover; }
    .card-body { padding: 1rem; }
    .card-title { font-weight: 600; margin-bottom: 0.5rem; }
    .card-meta { font-size: 0.875rem; color: #6b7280; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-gray { background: #f3f4f6; color: #4b5563; }
    a { color: ${branding.primaryColor || '#7c3aed'}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.875rem; text-align: center; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${project.name}</h1>
      <p>${project.description || ''}</p>
    </div>
  </header>

  <main class="container">
    <section class="meta">
      <dl>
        ${metadata.institution ? `<dt>Institution</dt><dd>${metadata.institution}</dd>` : ''}
        ${metadata.curator ? `<dt>Conservateur</dt><dd>${metadata.curator}</dd>` : ''}
        ${metadata.periodStart ? `<dt>Période</dt><dd>${metadata.periodStart}${metadata.periodEnd ? ` - ${metadata.periodEnd}` : ''}</dd>` : ''}
        <dt>Documents</dt><dd>${docs.length}</dd>
        <dt>Entités</dt><dd>${data.entities.length}</dd>
      </dl>
    </section>

    <h2 style="margin-bottom: 1rem;">Documents</h2>
    <div class="grid">
      ${docs.map((doc) => `
        <div class="card">
          ${doc.thumbnailPath ? `<img src="images/${path.basename(doc.thumbnailPath)}" alt="${doc.title}">` : '<div style="height:200px;background:#e5e7eb;"></div>'}
          <div class="card-body">
            <div class="card-title">${doc.title}</div>
            <div class="card-meta">
              <span class="badge badge-gray">${doc.type}</span>
              ${doc.transcription ? `<a href="documents/${doc.id}.html">Voir la transcription</a>` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    ${data.entities.length > 0 ? `
    <h2 style="margin: 2rem 0 1rem;">Entités (${data.entities.length})</h2>
    <div style="background: white; padding: 1.5rem; border-radius: 0.5rem;">
      ${['person', 'place', 'event', 'object', 'concept'].map((type) => {
        const typeEntities = data.entities.filter((e) => e.type === type);
        if (typeEntities.length === 0) return '';
        return `
          <h3 style="margin-bottom: 0.5rem; color: #4b5563;">${type === 'person' ? 'Personnes' : type === 'place' ? 'Lieux' : type === 'event' ? 'Événements' : type === 'object' ? 'Objets' : 'Concepts'}</h3>
          <ul style="margin-bottom: 1rem; padding-left: 1.5rem;">
            ${typeEntities.map((e) => `<li>${e.name}${e.description ? ` - ${e.description}` : ''}</li>`).join('')}
          </ul>
        `;
      }).join('')}
    </div>
    ` : ''}
  </main>

  <footer class="container">
    <p>${branding.footerText || `Export généré par Archivia - ${new Date().toLocaleDateString('fr-FR')}`}</p>
  </footer>
</body>
</html>`;
}

/**
 * Generate HTML for a document page
 */
function generateDocumentHTML(doc: typeof documents.$inferSelect, projectName: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title} - ${projectName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    header { margin-bottom: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .back { color: #6b7280; text-decoration: none; display: inline-block; margin-bottom: 1rem; }
    .back:hover { color: #1f2937; }
    .image { background: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .image img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
    .transcription { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .transcription h2 { margin-bottom: 1rem; color: #4b5563; }
    .transcription pre { white-space: pre-wrap; font-family: Georgia, serif; line-height: 1.8; }
    .meta { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; margin-right: 0.5rem; background: #e0e7ff; color: #3730a3; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a href="../index.html" class="back">&larr; Retour à l'index</a>
      <h1>${doc.title}</h1>
      <div>
        ${(doc.tags as string[]).map((tag) => `<span class="badge">${tag}</span>`).join('')}
      </div>
    </header>

    ${doc.filePath ? `
    <section class="image">
      <img src="../images/${path.basename(doc.filePath)}" alt="${doc.title}">
    </section>
    ` : ''}

    ${doc.transcription ? `
    <section class="transcription">
      <h2>Transcription</h2>
      <pre>${doc.transcription}</pre>
    </section>
    ` : ''}

    <div class="meta">
      <p><strong>Type:</strong> ${doc.type}</p>
      ${doc.category ? `<p><strong>Catégorie:</strong> ${doc.category}</p>` : ''}
      ${doc.period ? `<p><strong>Période:</strong> ${doc.period}</p>` : ''}
      ${doc.historicalContext ? `<p><strong>Contexte historique:</strong> ${doc.historicalContext}</p>` : ''}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Export project to static HTML as a ZIP file
 */
export async function exportProjectToHTML(
  projectId: string,
  options: ExportOptions = {}
): Promise<Buffer> {
  const opts = {
    includeImages: true,
    includeTranscriptions: true,
    includeEntities: true,
    ...options,
  };

  const data = await fetchProjectData(projectId);
  const zip = new JSZip();

  // Add index.html
  zip.file("index.html", generateIndexHTML(data));

  // Add document pages
  if (opts.includeTranscriptions) {
    const docsFolder = zip.folder("documents");
    for (const doc of data.documents) {
      if (doc.transcription) {
        docsFolder?.file(
          `${doc.id}.html`,
          generateDocumentHTML(doc, data.project.name)
        );
      }
    }
  }

  // Add images
  if (opts.includeImages) {
    const imagesFolder = zip.folder("images");
    for (const doc of data.documents) {
      // Add original file
      if (doc.filePath) {
        const srcPath = path.join(process.cwd(), "public", doc.filePath);
        if (existsSync(srcPath)) {
          const { readFile } = await import("fs/promises");
          const imageData = await readFile(srcPath);
          imagesFolder?.file(path.basename(doc.filePath), imageData);
        }
      }
      // Add thumbnail
      if (doc.thumbnailPath && doc.thumbnailPath !== doc.filePath) {
        const thumbPath = path.join(process.cwd(), "public", doc.thumbnailPath);
        if (existsSync(thumbPath)) {
          const { readFile } = await import("fs/promises");
          const thumbData = await readFile(thumbPath);
          imagesFolder?.file(path.basename(doc.thumbnailPath), thumbData);
        }
      }
    }
  }

  // Generate ZIP
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return zipBuffer;
}

/**
 * Get export metadata
 */
export async function getExportMetadata(projectId: string) {
  const data = await fetchProjectData(projectId);

  return {
    projectName: data.project.name,
    documentCount: data.documents.length,
    entityCount: data.entities.length,
    relationshipCount: data.relationships.length,
    estimatedSize: data.documents.length * 500 * 1024, // Rough estimate: 500KB per document
  };
}
