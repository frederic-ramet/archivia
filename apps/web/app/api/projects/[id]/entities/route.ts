import { NextRequest } from "next/server";
import { db, entities, entityRelationships, projects } from "@archivia/database";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id]/entities - Get all entities and relationships for a project
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    // Verify project exists
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      return errorResponse(`Project with id '${id}' not found`, 404);
    }

    // Get all entities for the project
    const projectEntities = await db
      .select()
      .from(entities)
      .where(eq(entities.projectId, id));

    // Get all relationships between these entities
    const entityIds = projectEntities.map((e) => e.id);

    const relationships = entityIds.length > 0
      ? await db
          .select()
          .from(entityRelationships)
      : [];

    // Filter relationships to only include those between project entities
    const entityIdSet = new Set(entityIds);
    const projectRelationships = relationships.filter(
      (r) => entityIdSet.has(r.sourceId) && entityIdSet.has(r.targetId)
    );

    // Build graph data structure
    const nodes = projectEntities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      aliases: entity.aliases,
      description: entity.description,
      properties: entity.properties,
    }));

    const edges = projectRelationships.map((rel) => ({
      id: rel.id,
      source: rel.sourceId,
      target: rel.targetId,
      relationType: rel.relationType,
      weight: rel.weight,
      properties: rel.properties,
    }));

    // Calculate statistics
    const stats = {
      totalEntities: nodes.length,
      byType: {
        person: nodes.filter((n) => n.type === "person").length,
        place: nodes.filter((n) => n.type === "place").length,
        event: nodes.filter((n) => n.type === "event").length,
        object: nodes.filter((n) => n.type === "object").length,
        concept: nodes.filter((n) => n.type === "concept").length,
      },
      totalRelationships: edges.length,
    };

    return successResponse({
      nodes,
      edges,
      stats,
    });
  } catch (err) {
    console.error("Failed to fetch entities:", err);
    return errorResponse("Failed to fetch entities", 500);
  }
}
