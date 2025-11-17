import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@archivia/database";
import { eq } from "drizzle-orm";
import { errorResponse } from "@/lib/api-utils";
import { exportProjectToHTML, getExportMetadata } from "@/lib/export-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/export - Get export metadata
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const metadata = await getExportMetadata(id);
    return NextResponse.json({ success: true, data: metadata });
  } catch (err) {
    console.error("Export metadata error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to get export metadata";
    return errorResponse(errorMessage, 500);
  }
}

// POST /api/projects/[id]/export - Generate and download export
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    // Verify project exists
    const [project] = await db
      .select({ slug: projects.slug, name: projects.name })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      return errorResponse(`Project with id '${id}' not found`, 404);
    }

    // Parse options from body
    let options = {};
    try {
      const body = await request.json();
      options = body || {};
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Generate export
    const zipBuffer = await exportProjectToHTML(id, options);

    // Return as downloadable file
    const fileName = `${project.slug}-export-${Date.now()}.zip`;

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(zipBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to export project";
    return errorResponse(errorMessage, 500);
  }
}
