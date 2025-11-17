import { NextRequest } from "next/server";
import { db, documents } from "@archivia/database";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-utils";
import {
  extractEntities,
  isEntityExtractionAvailable,
} from "@/lib/entity-extraction";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/documents/[id]/extract-entities - Extract entities from document
export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    // Check if extraction is available
    const available = await isEntityExtractionAvailable();
    if (!available) {
      return errorResponse(
        "Entity extraction not configured. Please add your Anthropic API key in Admin Settings.",
        503
      );
    }

    // Get document
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!document) {
      return errorResponse(`Document with id '${id}' not found`, 404);
    }

    // Check if document has transcription
    if (!document.transcription || document.transcription.trim() === "") {
      return errorResponse(
        "Document has no transcription. Please run OCR first.",
        400
      );
    }

    // Perform entity extraction
    const result = await extractEntities(
      document.transcription,
      document.projectId
    );

    // Update document metadata
    await db
      .update(documents)
      .set({
        metadata: {
          ...(document.metadata as Record<string, unknown>),
          entityExtraction: result.metadata,
          entitiesCount: result.entities.length,
          relationshipsCount: result.relationships.length,
        },
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, id));

    return successResponse(
      {
        entities: result.entities,
        relationships: result.relationships,
        metadata: result.metadata,
      },
      `Extracted ${result.entities.length} entities and ${result.relationships.length} relationships`
    );
  } catch (err) {
    console.error("Entity extraction error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Entity extraction failed";
    return errorResponse(errorMessage, 500);
  }
}
