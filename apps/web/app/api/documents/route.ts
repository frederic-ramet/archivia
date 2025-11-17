import { NextRequest } from "next/server";
import { db, documents, projects } from "@archivia/database";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  createDocumentSchema,
  documentQuerySchema,
} from "@archivia/shared-types";
import {
  successResponse,
  errorResponse,
  parseBody,
  parseSearchParams,
} from "@/lib/api-utils";

// GET /api/documents - List documents with pagination and filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = parseSearchParams(searchParams, documentQuerySchema);

  if ("error" in parsed) {
    return parsed.error;
  }

  const { page, limit, projectId, type, transcriptionStatus, category } =
    parsed.data;

  try {
    // Build conditions
    const conditions = [];

    if (projectId) {
      conditions.push(eq(documents.projectId, projectId));
    }

    if (type) {
      conditions.push(eq(documents.type, type));
    }

    if (transcriptionStatus) {
      conditions.push(eq(documents.transcriptionStatus, transcriptionStatus));
    }

    if (category) {
      conditions.push(eq(documents.category, category));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    // Get paginated results
    const offset = (page - 1) * limit;
    const results = await db
      .select()
      .from(documents)
      .where(whereClause)
      .orderBy(desc(documents.createdAt))
      .limit(limit)
      .offset(offset);

    return successResponse({
      items: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Failed to fetch documents:", err);
    return errorResponse("Failed to fetch documents", 500);
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, createDocumentSchema);

  if ("error" in parsed) {
    return parsed.error;
  }

  const input = parsed.data;

  try {
    // Verify project exists
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .limit(1);

    if (!project) {
      return errorResponse(
        `Project with id '${input.projectId}' not found`,
        404
      );
    }

    // Get next position if not specified
    let position = input.position;
    if (position === undefined) {
      const maxPositionResult = await db
        .select({ maxPos: sql<number>`MAX(position)` })
        .from(documents)
        .where(eq(documents.projectId, input.projectId));

      const maxPos = maxPositionResult[0]?.maxPos ?? -1;
      position = maxPos + 1;
    }

    // Create document
    const documentData = {
      projectId: input.projectId,
      type: input.type,
      title: input.title,
      filePath: input.filePath,
      thumbnailPath: input.thumbnailPath,
      transcription: input.transcription,
      transcriptionStatus: input.transcriptionStatus,
      category: input.category,
      period: input.period,
      tags: input.tags,
      metadata: input.physicalMetadata ?? {},
      historicalContext: input.historicalContext,
      position,
    };

    const [created] = await db
      .insert(documents)
      .values(documentData)
      .returning();

    return successResponse(created, "Document created successfully", 201);
  } catch (err) {
    console.error("Failed to create document:", err);
    return errorResponse("Failed to create document", 500);
  }
}
