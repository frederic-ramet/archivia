import { NextRequest } from "next/server";
import { db, projects } from "@archivia/database";
import { eq } from "drizzle-orm";
import { updateProjectSchema } from "@archivia/shared-types";
import { successResponse, errorResponse, parseBody } from "@/lib/api-utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Get a single project
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      return errorResponse(`Project with id '${id}' not found`, 404);
    }

    return successResponse(project);
  } catch (err) {
    console.error("Failed to fetch project:", err);
    return errorResponse("Failed to fetch project", 500);
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const parsed = await parseBody(request, updateProjectSchema);

  if ("error" in parsed) {
    return parsed.error;
  }

  const input = parsed.data;

  try {
    // Check if project exists
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) {
      return errorResponse(`Project with id '${id}' not found`, 404);
    }

    // Check slug uniqueness if changing
    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.slug, input.slug))
        .limit(1);

      if (slugConflict.length > 0) {
        return errorResponse(
          `Project with slug '${input.slug}' already exists`,
          409
        );
      }
    }

    // Build update data - merge with existing for nested objects
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;

    // Merge nested objects
    if (input.config !== undefined) {
      updateData.config = {
        ...existing.config,
        ...input.config,
        features: {
          ...(existing.config?.features ?? {}),
          ...(input.config?.features ?? {}),
        },
      };
    }

    if (input.branding !== undefined) {
      updateData.branding = {
        ...existing.branding,
        ...input.branding,
      };
    }

    if (input.metadata !== undefined) {
      updateData.metadata = {
        ...existing.metadata,
        ...input.metadata,
      };
    }

    const [updated] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    return successResponse(updated, "Project updated successfully");
  } catch (err) {
    console.error("Failed to update project:", err);
    return errorResponse("Failed to update project", 500);
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  try {
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) {
      return errorResponse(`Project with id '${id}' not found`, 404);
    }

    await db.delete(projects).where(eq(projects.id, id));

    return successResponse({ id }, "Project deleted successfully");
  } catch (err) {
    console.error("Failed to delete project:", err);
    return errorResponse("Failed to delete project", 500);
  }
}
