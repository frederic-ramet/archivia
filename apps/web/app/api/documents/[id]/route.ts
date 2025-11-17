import { NextRequest } from "next/server";
import { db, documents } from "@archivia/database";
import { eq } from "drizzle-orm";
import { updateDocumentSchema } from "@archivia/shared-types";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id] - Get a single document
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  try {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!document) {
      return errorResponse(`Document with id '${id}' not found`, 404);
    }

    return successResponse(document);
  } catch (err) {
    console.error("Failed to fetch document:", err);
    return errorResponse("Failed to fetch document", 500);
  }
}

// PUT /api/documents/[id] - Update a document
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const parsed = await parseBody(request, updateDocumentSchema);

  if ("error" in parsed) {
    return parsed.error;
  }

  const input = parsed.data;

  try {
    // Check if document exists
    const [existing] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!existing) {
      return errorResponse(`Document with id '${id}' not found`, 404);
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.type !== undefined) updateData.type = input.type;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.filePath !== undefined) updateData.filePath = input.filePath;
    if (input.thumbnailPath !== undefined)
      updateData.thumbnailPath = input.thumbnailPath;
    if (input.transcription !== undefined)
      updateData.transcription = input.transcription;
    if (input.transcriptionStatus !== undefined)
      updateData.transcriptionStatus = input.transcriptionStatus;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.period !== undefined) updateData.period = input.period;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.historicalContext !== undefined)
      updateData.historicalContext = input.historicalContext;
    if (input.position !== undefined) updateData.position = input.position;

    // Merge physical metadata into metadata field
    if (input.physicalMetadata !== undefined) {
      updateData.metadata = {
        ...(existing.metadata ?? {}),
        ...input.physicalMetadata,
      };
    }

    const [updated] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();

    return successResponse(updated, "Document updated successfully");
  } catch (err) {
    console.error("Failed to update document:", err);
    return errorResponse("Failed to update document", 500);
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  try {
    const [existing] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!existing) {
      return errorResponse(`Document with id '${id}' not found`, 404);
    }

    await db.delete(documents).where(eq(documents.id, id));

    return successResponse({ id }, "Document deleted successfully");
  } catch (err) {
    console.error("Failed to delete document:", err);
    return errorResponse("Failed to delete document", 500);
  }
}
