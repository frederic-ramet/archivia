import { NextRequest } from "next/server";
import { db, documents, entities, projects } from "@archivia/database";
import { eq, like, or, and, sql } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-utils";

interface SearchResult {
  type: "document" | "entity";
  id: string;
  title: string;
  projectId: string;
  projectName?: string;
  snippet?: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

// GET /api/search?q=query&projectId=optional
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const projectId = searchParams.get("projectId");
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (!query || query.trim().length < 2) {
    return errorResponse("Query must be at least 2 characters", 400);
  }

  try {
    const results: SearchResult[] = [];
    const searchTerm = `%${query.toLowerCase()}%`;

    // Search in documents
    let docsQuery = db
      .select({
        id: documents.id,
        title: documents.title,
        projectId: documents.projectId,
        transcription: documents.transcription,
        category: documents.category,
        tags: documents.tags,
      })
      .from(documents);

    if (projectId) {
      docsQuery = docsQuery.where(
        and(
          eq(documents.projectId, projectId),
          or(
            like(sql`lower(${documents.title})`, searchTerm),
            like(sql`lower(${documents.transcription})`, searchTerm),
            like(sql`lower(${documents.category})`, searchTerm)
          )
        )
      ) as typeof docsQuery;
    } else {
      docsQuery = docsQuery.where(
        or(
          like(sql`lower(${documents.title})`, searchTerm),
          like(sql`lower(${documents.transcription})`, searchTerm),
          like(sql`lower(${documents.category})`, searchTerm)
        )
      ) as typeof docsQuery;
    }

    const docResults = await docsQuery.limit(limit);

    // Get project names
    const projectIds = Array.from(new Set(docResults.map((d) => d.projectId)));
    const projectsData = projectIds.length > 0
      ? await db
          .select({ id: projects.id, name: projects.name })
          .from(projects)
      : [];
    const projectMap = new Map(projectsData.map((p) => [p.id, p.name]));

    // Process document results
    for (const doc of docResults) {
      let relevance = 0;
      let snippet = "";

      // Calculate relevance and extract snippet
      const lowerQuery = query.toLowerCase();
      const titleMatch = doc.title.toLowerCase().includes(lowerQuery);
      const transcriptionMatch = doc.transcription?.toLowerCase().includes(lowerQuery);

      if (titleMatch) {
        relevance += 10;
        snippet = doc.title;
      }

      if (transcriptionMatch && doc.transcription) {
        relevance += 5;
        // Extract snippet around the match
        const idx = doc.transcription.toLowerCase().indexOf(lowerQuery);
        const start = Math.max(0, idx - 50);
        const end = Math.min(doc.transcription.length, idx + query.length + 50);
        snippet = (start > 0 ? "..." : "") +
          doc.transcription.substring(start, end) +
          (end < doc.transcription.length ? "..." : "");
      }

      results.push({
        type: "document",
        id: doc.id,
        title: doc.title,
        projectId: doc.projectId,
        projectName: projectMap.get(doc.projectId),
        snippet,
        relevance,
        metadata: {
          category: doc.category,
          tags: doc.tags,
        },
      });
    }

    // Search in entities
    let entitiesQuery = db
      .select({
        id: entities.id,
        name: entities.name,
        type: entities.type,
        projectId: entities.projectId,
        description: entities.description,
        aliases: entities.aliases,
      })
      .from(entities);

    if (projectId) {
      entitiesQuery = entitiesQuery.where(
        and(
          eq(entities.projectId, projectId),
          or(
            like(sql`lower(${entities.name})`, searchTerm),
            like(sql`lower(${entities.description})`, searchTerm),
            like(sql`lower(${entities.normalizedName})`, searchTerm)
          )
        )
      ) as typeof entitiesQuery;
    } else {
      entitiesQuery = entitiesQuery.where(
        or(
          like(sql`lower(${entities.name})`, searchTerm),
          like(sql`lower(${entities.description})`, searchTerm),
          like(sql`lower(${entities.normalizedName})`, searchTerm)
        )
      ) as typeof entitiesQuery;
    }

    const entityResults = await entitiesQuery.limit(limit);

    // Process entity results
    for (const entity of entityResults) {
      let relevance = 0;
      const lowerQuery = query.toLowerCase();

      if (entity.name.toLowerCase().includes(lowerQuery)) {
        relevance += 8;
      }

      if (entity.description?.toLowerCase().includes(lowerQuery)) {
        relevance += 3;
      }

      results.push({
        type: "entity",
        id: entity.id,
        title: entity.name,
        projectId: entity.projectId,
        projectName: projectMap.get(entity.projectId),
        snippet: entity.description || "",
        relevance,
        metadata: {
          entityType: entity.type,
          aliases: entity.aliases,
        },
      });
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return successResponse({
      query,
      results: results.slice(0, limit),
      total: results.length,
    });
  } catch (err) {
    console.error("Search error:", err);
    return errorResponse("Search failed", 500);
  }
}
