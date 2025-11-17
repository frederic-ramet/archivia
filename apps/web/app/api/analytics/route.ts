import { NextRequest } from "next/server";
import { db, projects, documents, entities, entityRelationships } from "@archivia/database";
import { eq, sql, desc } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { auth } from "@/lib/auth";

// GET /api/analytics - Get global analytics
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    // Only admin can see global analytics
    if ((session.user as { role?: string }).role !== "admin") {
      return errorResponse("Admin access required", 403);
    }

    // Get counts
    const [projectCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects);

    const [documentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents);

    const [entityCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(entities);

    const [relationshipCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(entityRelationships);

    // Documents by status
    const documentsByStatus = await db
      .select({
        status: documents.transcriptionStatus,
        count: sql<number>`count(*)`,
      })
      .from(documents)
      .groupBy(documents.transcriptionStatus);

    // Entities by type
    const entitiesByType = await db
      .select({
        type: entities.type,
        count: sql<number>`count(*)`,
      })
      .from(entities)
      .groupBy(entities.type);

    // Projects by status
    const projectsByStatus = await db
      .select({
        status: projects.status,
        count: sql<number>`count(*)`,
      })
      .from(projects)
      .groupBy(projects.status);

    // Recent documents (last 10)
    const recentDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        type: documents.type,
        status: documents.transcriptionStatus,
        createdAt: documents.createdAt,
        projectId: documents.projectId,
      })
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(10);

    // Storage estimate (count files)
    const storageStats = {
      totalDocuments: documentCount.count,
      withThumbnails: await db
        .select({ count: sql<number>`count(*)` })
        .from(documents)
        .where(sql`${documents.thumbnailPath} IS NOT NULL`)
        .then(([r]) => r.count),
      withOCR: await db
        .select({ count: sql<number>`count(*)` })
        .from(documents)
        .where(eq(documents.transcriptionStatus, "completed"))
        .then(([r]) => r.count),
    };

    return successResponse({
      summary: {
        totalProjects: projectCount.count,
        totalDocuments: documentCount.count,
        totalEntities: entityCount.count,
        totalRelationships: relationshipCount.count,
      },
      breakdown: {
        projectsByStatus: projectsByStatus.reduce(
          (acc, item) => ({ ...acc, [item.status]: item.count }),
          {}
        ),
        documentsByStatus: documentsByStatus.reduce(
          (acc, item) => ({ ...acc, [item.status]: item.count }),
          {}
        ),
        entitiesByType: entitiesByType.reduce(
          (acc, item) => ({ ...acc, [item.type]: item.count }),
          {}
        ),
      },
      storage: storageStats,
      recentActivity: recentDocuments,
    });
  } catch (err) {
    console.error("Failed to fetch analytics:", err);
    return errorResponse("Failed to fetch analytics", 500);
  }
}
