import { NextRequest } from "next/server";
import { db, projects } from "@archivia/database";
import { eq, like, and, sql, desc } from "drizzle-orm";
import {
  createProjectSchema,
  projectQuerySchema,
} from "@archivia/shared-types";
import {
  successResponse,
  errorResponse,
  parseBody,
  parseSearchParams,
} from "@/lib/api-utils";

// GET /api/projects - List all projects with pagination and filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = parseSearchParams(searchParams, projectQuerySchema);

  if ("error" in parsed) {
    return parsed.error;
  }

  const { page, limit, search, status, isPublic } = parsed.data;

  try {
    // Build conditions
    const conditions = [];

    if (search) {
      conditions.push(like(projects.name, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(projects.status, status));
    }

    if (isPublic !== undefined) {
      conditions.push(eq(projects.isPublic, isPublic));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    // Get paginated results
    const offset = (page - 1) * limit;
    const results = await db
      .select()
      .from(projects)
      .where(whereClause)
      .orderBy(desc(projects.updatedAt))
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
    console.error("Failed to fetch projects:", err);
    return errorResponse("Failed to fetch projects", 500);
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, createProjectSchema);

  if ("error" in parsed) {
    return parsed.error;
  }

  const input = parsed.data;

  try {
    // Check if slug already exists
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, input.slug))
      .limit(1);

    if (existing.length > 0) {
      return errorResponse(`Project with slug '${input.slug}' already exists`, 409);
    }

    // Create project with defaults
    const projectData = {
      name: input.name,
      slug: input.slug,
      description: input.description,
      config: input.config ?? {
        features: {
          ocr: true,
          annotations: true,
          hotspots: false,
          stories: false,
          timeline: false,
          map: false,
          ontology: false,
          aiGeneration: false,
          publicReader: true,
          collaboration: false,
        },
        primaryLanguage: "fr",
        acceptedFormats: ["jpg", "png", "tiff"],
      },
      branding: input.branding ?? {
        primaryColor: "#A67B5B",
        secondaryColor: "#E8D5C4",
        accentColor: "#3B82F6",
        heroTitle: input.name,
        heroSubtitle: "",
        footerText: "",
      },
      metadata: input.metadata ?? {
        contributors: [],
        themes: [],
        license: "CC BY-NC-SA 4.0",
      },
      isPublic: input.isPublic ?? false,
      status: "draft" as const,
    };

    const [created] = await db
      .insert(projects)
      .values(projectData)
      .returning();

    return successResponse(created, "Project created successfully", 201);
  } catch (err) {
    console.error("Failed to create project:", err);
    return errorResponse("Failed to create project", 500);
  }
}
