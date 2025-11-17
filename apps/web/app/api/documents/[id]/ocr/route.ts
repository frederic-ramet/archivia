import { NextRequest } from "next/server";
import { db, documents } from "@archivia/database";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { performOCR, isOCRAvailable } from "@/lib/ocr-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/documents/[id]/ocr - Perform OCR on a document
export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    // Check if OCR is available
    const available = await isOCRAvailable();
    if (!available) {
      return errorResponse(
        "OCR service not configured. Please add your Anthropic API key in Admin Settings.",
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

    // Check if document type supports OCR
    if (document.type === "printed" && !document.filePath.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return errorResponse(
        "OCR is only supported for image files (JPEG, PNG, WebP, GIF)",
        400
      );
    }

    // Update status to processing
    await db
      .update(documents)
      .set({
        transcriptionStatus: "processing",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, id));

    // Perform OCR
    const result = await performOCR(document.filePath);

    // Update document with transcription
    const [updated] = await db
      .update(documents)
      .set({
        transcription: result.text,
        transcriptionStatus: "completed",
        transcriptionProvider: "anthropic",
        metadata: {
          ...(document.metadata as Record<string, unknown>),
          ocrResult: result.metadata,
          ocrLanguage: result.language,
          ocrTimestamp: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, id))
      .returning();

    return successResponse(
      {
        document: updated,
        ocr: {
          textLength: result.text.length,
          language: result.language,
          ...result.metadata,
        },
      },
      "OCR completed successfully"
    );
  } catch (err) {
    console.error("OCR error:", err);

    // Reset status on error
    await db
      .update(documents)
      .set({
        transcriptionStatus: "pending",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, id));

    const errorMessage =
      err instanceof Error ? err.message : "OCR processing failed";
    return errorResponse(errorMessage, 500);
  }
}
