import { NextRequest, NextResponse } from "next/server";
import { db, documents, annotations } from "@archivia/database";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id]/annotations - Get all annotations for a document
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    // Get document to verify it exists
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // Get all annotations for this document
    const documentAnnotations = await db
      .select()
      .from(annotations)
      .where(eq(annotations.documentId, id))
      .orderBy(annotations.createdAt);

    return NextResponse.json({
      success: true,
      data: documentAnnotations,
    });
  } catch (err) {
    console.error("Failed to fetch annotations:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch annotations",
      },
      { status: 500 }
    );
  }
}

// POST /api/documents/[id]/annotations - Create a new annotation
export async function POST(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  try {
    // Get document to verify it exists
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { type, content, x, y, width, height, metadata, status } = body;

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { success: false, error: "Type is required" },
        { status: 400 }
      );
    }

    // Create annotation
    const [newAnnotation] = await db
      .insert(annotations)
      .values({
        documentId: id,
        userId: session.user.id,
        type: type as "note" | "correction" | "hotspot" | "region",
        content: content || null,
        x: x || null,
        y: y || null,
        width: width || null,
        height: height || null,
        metadata: metadata || {},
        status: status || "draft",
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newAnnotation,
      message: "Annotation created successfully",
    });
  } catch (err) {
    console.error("Failed to create annotation:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create annotation",
      },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id]/annotations - Update annotation (via body.annotationId)
export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { annotationId, type, content, x, y, width, height, metadata, status } = body;

    if (!annotationId) {
      return NextResponse.json(
        { success: false, error: "Annotation ID is required" },
        { status: 400 }
      );
    }

    // Verify annotation belongs to this document
    const [existingAnnotation] = await db
      .select()
      .from(annotations)
      .where(
        and(
          eq(annotations.id, annotationId),
          eq(annotations.documentId, id)
        )
      )
      .limit(1);

    if (!existingAnnotation) {
      return NextResponse.json(
        { success: false, error: "Annotation not found" },
        { status: 404 }
      );
    }

    // Update annotation
    const [updatedAnnotation] = await db
      .update(annotations)
      .set({
        type: type || existingAnnotation.type,
        content: content !== undefined ? content : existingAnnotation.content,
        x: x !== undefined ? x : existingAnnotation.x,
        y: y !== undefined ? y : existingAnnotation.y,
        width: width !== undefined ? width : existingAnnotation.width,
        height: height !== undefined ? height : existingAnnotation.height,
        metadata: metadata || existingAnnotation.metadata,
        status: status || existingAnnotation.status,
      })
      .where(eq(annotations.id, annotationId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedAnnotation,
      message: "Annotation updated successfully",
    });
  } catch (err) {
    console.error("Failed to update annotation:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update annotation",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id]/annotations - Delete annotation (via body.annotationId)
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { annotationId } = body;

    if (!annotationId) {
      return NextResponse.json(
        { success: false, error: "Annotation ID is required" },
        { status: 400 }
      );
    }

    // Verify annotation belongs to this document
    const [existingAnnotation] = await db
      .select()
      .from(annotations)
      .where(
        and(
          eq(annotations.id, annotationId),
          eq(annotations.documentId, id)
        )
      )
      .limit(1);

    if (!existingAnnotation) {
      return NextResponse.json(
        { success: false, error: "Annotation not found" },
        { status: 404 }
      );
    }

    // Delete annotation
    await db.delete(annotations).where(eq(annotations.id, annotationId));

    return NextResponse.json({
      success: true,
      message: "Annotation deleted successfully",
    });
  } catch (err) {
    console.error("Failed to delete annotation:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete annotation",
      },
      { status: 500 }
    );
  }
}
